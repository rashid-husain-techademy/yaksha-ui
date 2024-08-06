import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionReviewerChartOptions } from '@app/interface/chart';
import { Constants } from '@app/models/constants';
import { NavigationService } from '@app/service/common/navigation.service';
import { Result } from '@app/shared/core-interface/base';
import { ToastrService } from 'ngx-toastr';
import { DashboardDetailsResponseDto, SectionDto, SectionStatus, SkillStatus } from '../assessment-review';
import { AssessmentReviewService } from '../assessment-review.service';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-review-dashboard',
    templateUrl: './review-dashboard.component.html',
    styleUrls: ['./review-dashboard.component.scss']
})
export class ReviewDashboardComponent implements OnInit {
    public overallQuestionsChartOptions: Partial<QuestionReviewerChartOptions>;
    public beginnerQuestionsChartOptions: Partial<QuestionReviewerChartOptions>;
    public intermediateQuestionsChartOptions: Partial<QuestionReviewerChartOptions>;
    public advancedQuestionsChartOptions: Partial<QuestionReviewerChartOptions>;
    tenantAssessmentReviewId: number;
    constants = Constants;
    dashboardDetails: DashboardDetailsResponseDto;
    assessment: DashboardDetailsResponseDto;
    overallQuestionDetails: number[];
    beginnerQuestionDetails: number[];
    intermediateQuestionDetails: number[];
    advancedQuestionDetails: number[];
    chartLabel = [Constants.accepted, Constants.rejected, Constants.suggested, Constants.pending];
    noBeginnerLevelQuestions: boolean;
    noIntermediateLevelQuestions: boolean;
    noAdvancedLevelQuestions: boolean;
    noValidSignOffCriteria: boolean = false;
    singleDropdownSettings: MultiSelectDropdownSettings = {
        singleSelection: true,
        idField: 'assessmentSectionId',
        textField: 'sectionName',
        allowSearchFilter: true,
        closeDropDownOnSelection: true
    };
    chartColors = ['#a9dd31', '#fd0404', '#ffa500', '#6495ed'];
    chartResponsive = [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: "top"
            }
        }
    }];
    assessmentSectionStatus: SectionStatus[];
    assessmentId: number;
    selectedSection: SectionDto[] = [];
    assessmentSectionSkillStatus: SkillStatus[];
    selectSectionForm: FormGroup;
    isQuestionApproved: boolean = false;
    isSkillWiseApprovedQuestion: boolean = false;

    constructor(private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private assessmentReviewService: AssessmentReviewService,
        private toastrService: ToastrService,
        private navigationService: NavigationService) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['tenantAssessmentReviewId']) {
                this.tenantAssessmentReviewId = Number(atob(params['tenantAssessmentReviewId']));
            }
            if (params['assessmentId']) {
                this.assessmentId = Number(atob(params['assessmentId']));
            }
        });
        this.initSelectSectionForm();
        this.getDashboardDetails();
    }

    initSelectSectionForm(): void {
        this.selectSectionForm = this.formBuilder.group({
            selectedSection: ['']
        });
    }

    getDashboardDetails(): void {
        this.assessmentReviewService.getReviewDashboardDetails(this.tenantAssessmentReviewId).
            subscribe((res: Result<DashboardDetailsResponseDto>) => {
                if (res.success && res.result) {
                    this.assessment = res.result;
                    this.dashboardDetails = res.result;
                    this.noValidSignOffCriteria = this.assessment.acceptedQuestionsDetail.every(x => x.requiredAcceptedCount === 0);
                    this.overallQuestionDetails = [this.dashboardDetails.totalQuestionsDetails.accepted, this.dashboardDetails.totalQuestionsDetails.rejected,
                    this.dashboardDetails.totalQuestionsDetails.suggested, this.dashboardDetails.totalQuestionsDetails.pending];
                    this.beginnerQuestionDetails = [this.dashboardDetails.beginnerQuestionsDetails.accepted, this.dashboardDetails.beginnerQuestionsDetails.rejected,
                    this.dashboardDetails.beginnerQuestionsDetails.suggested, this.dashboardDetails.beginnerQuestionsDetails.pending];
                    this.intermediateQuestionDetails = [this.dashboardDetails.intermediateQuestionsDetails.accepted, this.dashboardDetails.intermediateQuestionsDetails.rejected,
                    this.dashboardDetails.intermediateQuestionsDetails.suggested, this.dashboardDetails.intermediateQuestionsDetails.pending];
                    this.advancedQuestionDetails = [this.dashboardDetails.advancedQuestionsDetails.accepted, this.dashboardDetails.advancedQuestionsDetails.rejected,
                    this.dashboardDetails.advancedQuestionsDetails.suggested, this.dashboardDetails.advancedQuestionsDetails.pending];
                    this.getSectionStatus(this.assessmentId);
                    this.setDashboardChartDetails();
                    this.setNoQuestionsFound();
                }
                else {
                    this.toastrService.error(this.constants.somethingWentWrong);
                }
            });
    }

    setDashboardChartDetails(): void {
        this.overallQuestionsChartOptions = {
            series: this.overallQuestionDetails,
            dataLabels: {
                enabled: true,
                formatter: function (val, opts?) {
                    return opts.w.globals.labels[opts.seriesIndex] + ":" + opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '10px'
                }
            },
            chart: { width: 380, type: "pie" },
            labels: this.chartLabel,
            responsive: this.chartResponsive,
            fill: {
                colors: this.chartColors,
            }
        };

        this.beginnerQuestionsChartOptions = {
            series: this.beginnerQuestionDetails,
            dataLabels: {
                enabled: true,
                formatter: function (val, opts?) {
                    return opts.w.globals.labels[opts.seriesIndex] + ":" + opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '10px'
                }
            },
            chart: { width: 380, type: "pie" },
            labels: this.chartLabel,
            responsive: this.chartResponsive,
            fill: {
                colors: this.chartColors,
            }
        };

        this.intermediateQuestionsChartOptions = {
            series: this.intermediateQuestionDetails,
            dataLabels: {
                enabled: true,
                formatter: function (val, opts?) {
                    return opts.w.globals.labels[opts.seriesIndex] + ":" + opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '10px'
                }
            },
            chart: { width: 380, type: "pie" },
            labels: this.chartLabel,
            responsive: this.chartResponsive,
            fill: {
                colors: this.chartColors,
            }
        };

        this.advancedQuestionsChartOptions = {
            series: this.advancedQuestionDetails,
            dataLabels: {
                enabled: true,
                formatter: function (val, opts?) {
                    return opts.w.globals.labels[opts.seriesIndex] + ":" + opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '10px'
                }
            },
            chart: { width: 380, type: "pie" },
            labels: this.chartLabel,
            responsive: this.chartResponsive,
            fill: {
                colors: this.chartColors,
            }
        };
    }

    setNoQuestionsFound(): void {
        this.noBeginnerLevelQuestions = this.assessment.beginnerQuestionsDetails.totalQuestions > 0 ? false : true;
        this.noIntermediateLevelQuestions = this.assessment.intermediateQuestionsDetails.totalQuestions > 0 ? false : true;
        this.noAdvancedLevelQuestions = this.assessment.advancedQuestionsDetails.totalQuestions > 0 ? false : true;
    }

    getProficiency(proficiencyId: number): string {
        if (proficiencyId === Constants.beginnerId)
            return '(' + Constants.beginner + ')';
        else if (proficiencyId === Constants.intermediateId)
            return '(' + Constants.intermediate + ')';
        else if (proficiencyId === Constants.advancedId)
            return '(' + Constants.advanced + ')';
        else
            return '';
    }

    back(): void {
        this.navigationService.goBack();
    }

    getSectionStatus(assessmentId: number) {
        this.assessmentReviewService.getSectionStatus(assessmentId).
            subscribe((res) => {
                if (res && res.result.length) {
                    this.isQuestionApproved = true;
                    this.assessmentSectionStatus = res.result;
                    this.skillReset();
                }
                else {
                    this.isQuestionApproved = false;
                }
            });
    }

    getskillsBySection(assessmentId: number, assessmentSectionId: number) {
        this.assessmentReviewService.getskillBySection(assessmentId, assessmentSectionId).
            subscribe((res) => {
                if (res && res.result.length) {
                    this.isSkillWiseApprovedQuestion = true;
                    this.assessmentSectionSkillStatus = res.result;
                }
                else {
                    this.isSkillWiseApprovedQuestion = false;
                }
            });
    }
    skillReset() {
        let data = {
            assessmentSectionId: this.assessmentSectionStatus[0].assessmentSectionId,
            sectionName: this.assessmentSectionStatus[0].sectionName,
        };
        this.selectedSection.push(data);
        this.selectSectionForm.get('selectedSection').patchValue(this.selectedSection);
        this.getskillsBySection(this.assessmentId, this.selectedSection[0].assessmentSectionId);
    }
}
