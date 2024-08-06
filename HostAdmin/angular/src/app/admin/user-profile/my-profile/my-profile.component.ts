import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Constants } from '@app/models/constants';
import { AppSessionService } from '@shared/session/app-session.service';
import { UserProfileService } from '../user-profile.service';
import { EvaluationResultJsonDto, PostAssessmentResult, SectionScore, TestCaseResultDto, UserAssessmentStatus } from '@app/test-taker/test-data';
import { Helper } from '@app/shared/helper';
import { ActivatedRoute, Router } from '@angular/router';
import { AIAdaptiveAssessmentRequest, AssessmentProgressInput, CatalogList, JobCompatiblityParentResult, JobCompatiblityRoleObject, RubrixFileZipInputDto, UserInput, UserProfilePageDto } from './my-profile';
import { MatAccordion } from '@angular/material/expansion';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { AssessmentType } from '@app/enums/assessment';
import { ProficiencyChartData } from '@app/test-taker/field';
import { proficiencyChartMetrics } from '@app/test-taker/post-assessment-page-view/post-assessment-page-view.component';
import { BaseChartDirective } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import html2pdf from 'html2pdf.js';
import { QuestionTypeId } from '@app/enums/question-bank-type';
import { ToastrService } from 'ngx-toastr';
import { SkillsScore } from '@app/my-assessments/my-assessments';
import { CampaignService } from '@app/admin/campaign/campaign.service';
import { CampaignAssessmentResults, CampaignInput, CampaignResult } from '@app/admin/campaign/campaign';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CatalogDataDto } from '@app/admin/catalog/catalog-details';
import { AIAdaptiveAssessmentResult } from '@app/admin/adaptive-assessment/adaptive-assessment';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})

export class MyProfileComponent implements OnInit, OnDestroy {
  pageSizes: number[] = [10, 20, 30];
  campaignPageSizes: number[] = [5, 10, 15];
  standardPageSize: number = 20;
  adaptivePageSize: number = 20;
  campaignPageSize: number = 5;
  maxSize: number = 10;
  allPageIndex: number = 1;
  allSkipCount: number = 0;
  allMaxResultCount: number = 20;
  allCampaignMaxResultCount: number = 5;
  allTotalCount: number = 0;
  standardPageIndex: number = 1;
  standardSkipCount: number = 0;
  standardMaxResultCount: number = 20;
  adaptivePageIndex: number = 1;
  adaptiveSkipCount: number = 0;
  adaptiveMaxResultCount: number = 20;
  campaignPageIndex: number = 1;
  campaignSkipCount: number = 0;
  campaignMaxResultCount: number = 5;
  user: UserProfilePageDto;
  labels: any[] = [];
  dataQuestionsAttempted: any[] = [];
  dataCorrectAnswers: any[] = [];
  labelForDataQuestionsAttempted: string = "";
  labelForDataCorrectAnswers: string = "";
  standardAssessmentResults: PostAssessmentResult[] = [];
  assessmentResult: PostAssessmentResult;
  adaptiveAssessmentResult: PostAssessmentResult;
  adaptiveAssessmentResults: PostAssessmentResult[] = [];
  campaignDataResults: CampaignResult;
  campaignDataResult: PostAssessmentResult;
  campaignAssessmentResults: PostAssessmentResult[] = [];
  constants = Constants;
  sections: SectionScore[] = [];
  skillChartLabels: string[] = [];
  questionChartLabels: string[] = [];
  lineChartLabels: string[] = [];
  input = new UserInput();
  editProfile: boolean = false;
  showSkillChart: boolean = false;
  showQuestionChart: boolean = false;
  showEdit: boolean = true;
  isCloudBased: boolean = true;
  userRole: string;
  userRoles = UserRoles;
  failedAssessmentMessageHandler: string[] = ['NaN', 'Infinity'];
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = 'function x() {\nconsole.log("Hello world!");\n}';

  //bar chart for Skills and Proficiencies Achieved Graph Begin
  skillChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    plugins: {
      datalabels: {
        color: 'white',
        font: {
          size: 12
        },
        formatter: (val) => {
          return val + '%';
        }
      }
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Skills',
          fontStyle: 'bold'
        },
        ticks: {
          beginAtZero: true
        },
        maxBarThickness: 40
      }],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Percentage',
            fontStyle: 'bold'
          },
          ticks: {
            beginAtZero: true
          },
        }]
    }
  };
  skillChartType: ChartType = 'bar';
  skillChartLegend = true;
  skillChartPlugins = [pluginDataLabels];

  //bar chart for Skills and Proficiencies Achieved Graph end
  //bar chart for Questions Attempted Vs Correct Answers begin
  questionChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Question Count',
          fontStyle: 'bold'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Skills',
          fontStyle: 'bold'
        },
        maxBarThickness: 40
      }]
    },
    plugins: {
      datalabels: {
        color: 'white',
        font: {
          size: 12
        }
      }
    },
  };
  questionChartType: ChartType = 'bar'; //horizontalBar
  questionChartLegend = true;
  questionChartPlugins = [pluginDataLabels];

  //bar chart for Questions Attempted Vs Correct Answers end

  lineChartOptions: ChartOptions
  skillChartData = [{ data: [], backgroundColor: '#11b62d', hoverBackgroundColor: '#11b62d', label: 'Beginner' }, { data: [], backgroundColor: '#0c87da', hoverBackgroundColor: '#0c87da', label: 'Intermediate' }, { data: [], backgroundColor: '#8c5dca', hoverBackgroundColor: '#8c5dca', label: 'Advanced' }];
  questionChartData = [{ data: [], backgroundColor: '#0c87da', hoverBackgroundColor: '#0c87da', label: 'Total Questions in Skill' }, { data: [], backgroundColor: '#0394fc', hoverBackgroundColor: '#0394fc', label: 'Total Questions Attempted in Skill' }, { data: [], backgroundColor: '#4fcdf3', hoverBackgroundColor: '#4fcdf3', label: 'Correct Answers' }];
  lineChartData = [{ data: [], label: '' }];
  beginnerQuestionsCount: number[] = [];
  intermediateQuestionsCount: number[] = [];
  advancedQuestionsCount: number[] = [];
  attemptedQuestionsCount: number[] = [];
  correctAnsweredQuestionsCount: number[] = [];
  totalQuestionCount: number[] = [];
  skillPercentages: number[] = [];
  lineBarData: any[] = [];
  viewUserProfile: boolean = false;
  testCasesResult: TestCaseResultDto[];
  @ViewChild('accordion') accordion: MatAccordion;
  @ViewChild('adaptiveAccordion') adaptiveAccordion: MatAccordion;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  isDownloadClick: boolean = false;
  isDownloadProfile: boolean = false;
  public proficiencyChartData: Array<ProficiencyChartData> = [{ x: 0, y: 'Nil', z: 'Nil' }];
  isSkillChartLoading: boolean = true;
  isQuestionChartLoading: boolean = true;
  emailAddress: string;
  catalogList: CatalogList;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'catalogName',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  isCatalogFilter: boolean = false;
  catalogId: number;
  selectCatalogForm: FormGroup;
  selectedCatalog: CatalogDataDto[] = [];
  view: any[] = [];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Role';
  showYAxisLabel = true;
  yAxisLabel = 'Score';
  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };
  barPadding = 20;
  //pie
  showLabels = true;
  jobCompatibilityChartResult: JobCompatiblityParentResult[] = [];
  aiAdaptiveAssessmentPage = { pagesizes: 20, pageIndex: 1, skipCount: 0, maxResultCount: 20, chartType: 'line' };
  aiAdaptiveAssessmentResult: AIAdaptiveAssessmentResult[] = [];
  aiAdaptiveAssessmentTotalCount;

  @ViewChild('standardAssessment') standardAssessment: ElementRef;
  @ViewChild('campaignAssessment') campaignAssessment: ElementRef;
  @ViewChild('adaptiveAssessment') adaptiveAssessment: ElementRef;
  @ViewChild('aiAdaptiveAssessment') aiAdaptiveAssessment: ElementRef;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private userProfileService: UserProfileService,
    public appSessionService: AppSessionService,
    public campaignService: CampaignService,
    public dataService: dataService,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private activateRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const element = document.querySelector('[data-id="zsalesiq"]');
    if (element)
      this.renderer.setStyle(element, 'display', 'none');
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = true;
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.viewUserProfile = true;
        let data = atob(params['id']).split('/');
        this.input.userId = parseInt(data[0]);
        this.input.tenantId = parseInt(data[1]);
        this.emailAddress = data[2];
      }
      else {
        this.input.userId = this.appSessionService.user.id;
        this.input.tenantId = this.appSessionService.tenantId;
        this.emailAddress = this.appSessionService.user.emailAddress;
        this.editProfile = true;
      }
    });
    this.initSelectCatalogForm();
    this.getUserSpecificCatalogs();
    this.getUserProfileInfo();

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
  }
  initSelectCatalogForm(): void {
    this.selectCatalogForm = this.formBuilder.group({
      selectedCatalog: ['']
    });
  }
  getUserSpecificCatalogs() {
    let data = {
      tenantId: this.input.tenantId,
      userId: this.input.userId
    };
    this.userProfileService.getUserSpecificCatalogs(data).subscribe(res => {
      if (res.result) {
        this.catalogList = res.result;
        this.resetInitialCatalog();
      }
    });
  }

  resetInitialCatalog() {
    let data: CatalogDataDto = {
      id: this.catalogList[0].id,
      catalogName: this.catalogList[0].catalogName,
    };
    this.selectedCatalog.push(data);
    this.selectCatalogForm.get('selectedCatalog').patchValue(this.selectedCatalog);
  }

  getCatalogAssessments(event: any) {
    this.isCatalogFilter = event.id === this.catalogList[0].id ? false : true;
    this.input.catalogId = event.id;
    this.resetChartData();
    this.getUserProfileInfo();
  }

  reset() {
    this.isCatalogFilter = false;
    this.input.catalogId = null;
    this.resetChartData();
    this.getUserProfileInfo();
    this.resetInitialCatalog();
  }

  resetChartData() {
    this.skillChartData = [{ data: [], backgroundColor: '#11b62d', hoverBackgroundColor: '#11b62d', label: 'Beginner' }, { data: [], backgroundColor: '#0c87da', hoverBackgroundColor: '#0c87da', label: 'Intermediate' }, { data: [], backgroundColor: '#8c5dca', hoverBackgroundColor: '#8c5dca', label: 'Advanced' }];
    this.questionChartData = [{ data: [], backgroundColor: '#0c87da', hoverBackgroundColor: '#0c87da', label: 'Total Questions in Skill' }, { data: [], backgroundColor: '#0394fc', hoverBackgroundColor: '#0394fc', label: 'Total Questions Attempted in Skill' }, { data: [], backgroundColor: '#4fcdf3', hoverBackgroundColor: '#4fcdf3', label: 'Correct Answers' }];
    this.questionChartLabels = [];
    this.attemptedQuestionsCount = [];
    this.correctAnsweredQuestionsCount = [];
    this.totalQuestionCount = [];
    this.skillChartLabels = [];
    this.beginnerQuestionsCount = [];
    this.intermediateQuestionsCount = [];
    this.advancedQuestionsCount = [];
    this.lineBarData = [];
  }
  getUserProfileInfo() {
    this.getUserAssessmentMetricsById();
    this.getSkillProficiencyMetrics();
    this.getSkillWiseMetrics();
    this.getCampaignResults(this.allSkipCount, this.allCampaignMaxResultCount);
    this.getAssessmentResults(this.allSkipCount, this.allMaxResultCount, AssessmentType.Assessment);
    // this.getAssessmentResults(this.allSkipCount, this.allMaxResultCount, AssessmentType.Adaptive); for Adaptive assessment
    this.getAIAdaptiveAssessmentResult(this.aiAdaptiveAssessmentPage);
  }

  getUserAssessmentMetricsById() {
    this.userProfileService.getUserAssessmentMetricsById(this.input).subscribe(res => {
      if (res) {
        this.user = res.result;
        this.user.averageAssessmentsScore = parseFloat(this.user.averageAssessmentsScore.toFixed(2));
      }
    },
      error => console.error(error));
  }

  getSkillWiseMetrics() {
    this.userProfileService.getSkillWiseMetrics(this.input).subscribe(res => {
      this.isQuestionChartLoading = false;
      if (res.result && res.result.length) {
        res.result.forEach(skillMetric => {
          this.questionChartLabels.push(skillMetric.skillName);
          this.attemptedQuestionsCount.push(skillMetric.attemptedQuestions);
          this.correctAnsweredQuestionsCount.push(skillMetric.correctAnswers);
          this.totalQuestionCount.push(skillMetric.totalQuestionCount);
          this.showQuestionChart = true;

          let data: any = {
            skillName: skillMetric.skillName,
            score: Math.floor(skillMetric.scorePercentage)
          };
          this.lineBarData.push(data);
        });
        this.lineBarData = this.lineBarData.sort(Helper.sortNumberDecending('score'));
        this.questionChartData[0].data = this.totalQuestionCount;
        this.questionChartData[1].data = this.attemptedQuestionsCount;
        this.questionChartData[2].data = this.correctAnsweredQuestionsCount;
      }
      else {
        this.isQuestionChartLoading = false;
        this.showQuestionChart = false;
      }
    }, error => {
      this.isQuestionChartLoading = false;
      console.error(error);
    });
  }

  getSkillProficiencyMetrics() {
    this.userProfileService.getSkillProficiencyMetrics(this.input).subscribe(res => {
      this.isSkillChartLoading = false;
      if (res.result && res.result.length) {
        res.result.forEach(skillProficiencyMetric => {
          let beginnerPercentage = skillProficiencyMetric.proficiencyPercentage.find(x => x.proficiencyId === this.constants.beginnerId)?.percentage;
          let intermediatePercentage = skillProficiencyMetric.proficiencyPercentage.find(x => x.proficiencyId === this.constants.intermediateId)?.percentage;
          let advancedPercentage = skillProficiencyMetric.proficiencyPercentage.find(x => x.proficiencyId === this.constants.advancedId)?.percentage;
          if (beginnerPercentage || intermediatePercentage || advancedPercentage) {
            this.skillChartLabels.push(skillProficiencyMetric.skillName);
            this.beginnerQuestionsCount.push(beginnerPercentage ? Math.floor(beginnerPercentage) : 0);
            this.intermediateQuestionsCount.push(intermediatePercentage ? Math.floor(intermediatePercentage) : 0);
            this.advancedQuestionsCount.push(advancedPercentage ? Math.floor(advancedPercentage) : 0);
            this.showSkillChart = true;
          }
        });
        this.skillChartData[0].data = this.beginnerQuestionsCount;
        this.skillChartData[1].data = this.intermediateQuestionsCount;
        this.skillChartData[2].data = this.advancedQuestionsCount;
      }
      else {
        this.isSkillChartLoading = false;
        this.showSkillChart = false;
      }
    }, error => {
      this.isSkillChartLoading = false;
      console.error(error);
    });
  }

  openCampaignAssessment(campaignIndex: number, assessment: CampaignAssessmentResults, j: number) {
    if (this.campaignDataResult !== null && this.campaignDataResult !== undefined) {
      if (this.campaignDataResult.assessmentScheduleId !== assessment.assessmentScheduleId)
        this.campaignDataResult = null;
      else {
        if (j !== null && j !== undefined) {
          setTimeout(() => {
            this.downloadReport(campaignIndex, this.constants.drive, j);
          }, 1000);
        }
        return;
      }
    }
    let data: AssessmentProgressInput;
    data = {
      assessmentScheduleId: assessment.assessmentScheduleId,
      userId: this.input.userId,
      tenantId: this.input.tenantId,
      isUserProfile: true,
      SkipCount: 0,
      MaxResultCount: 1,
      assessmentType: AssessmentType.Assessment,
    };
    this.userProfileService.getUserAssessments(data).subscribe(res => {
      if (res.result) {
        let campaign = this.campaignDataResults.campaignData[campaignIndex];
        let index = campaign.campaignAssessmentResults.findIndex(x => x.assessmentId === assessment.assessmentId && x.assessmentScheduleId === assessment.assessmentScheduleId);
        let postAssessmentResult = res.result[0];
        postAssessmentResult.assessmentName = assessment.assessmentName;
        postAssessmentResult.userAssessmentDurationString = Helper.secondsToHm(postAssessmentResult.userAssessmentDuration);
        postAssessmentResult.averageQuestionDurationString = Helper.secondsToHm(postAssessmentResult.averageQuestionDuration);
        postAssessmentResult.isAssessmentPassed = postAssessmentResult.userLatestAttemptStatus === UserAssessmentStatus.Passed ? true : false;
        postAssessmentResult.questionsSkipped = postAssessmentResult.assessmentTotalQuestions - postAssessmentResult.totalAnswered;
        postAssessmentResult.assessmentPercentage = Math.floor(postAssessmentResult.userEarnedPercentage);
        postAssessmentResult.remainingAttempts = postAssessmentResult.maxAttempts - postAssessmentResult.availedAttempts;
        let proficiencies = postAssessmentResult.assessmentProficiencies;
        postAssessmentResult.userLatestAttemptStatusString = UserAssessmentStatus[postAssessmentResult.userLatestAttemptStatus];
        let questionCount = JSON.parse(proficiencies);
        postAssessmentResult.totalBeginnerQuestions = 0;
        postAssessmentResult.correctBeginnerQuestions = 0;
        postAssessmentResult.totalIntermediateQuestions = 0;
        postAssessmentResult.correctIntermediateQuestions = 0;
        postAssessmentResult.totalAdvancedQuestions = 0;
        postAssessmentResult.correctAdvancedQuestions = 0;

        if (j !== null && j !== undefined)
          postAssessmentResult.isExpand = false;
        else
          postAssessmentResult.isExpand = true;

        questionCount?.forEach(element => {
          if (element.ProficiencyId === this.constants.beginnerId) {
            postAssessmentResult.totalBeginnerQuestions = element.TotalQuestions;
            postAssessmentResult.correctBeginnerQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.intermediateId) {
            postAssessmentResult.totalIntermediateQuestions = element.TotalQuestions;
            postAssessmentResult.correctIntermediateQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.advancedId) {
            postAssessmentResult.totalAdvancedQuestions = element.TotalQuestions;
            postAssessmentResult.correctAdvancedQuestions = element.TotalCorrect;
          }
        });
        this.sections = [];
        let sections = JSON.parse(postAssessmentResult.assessmentSections);
        let sectionPercentage = 0;
        sections?.forEach(section => {
          if (section.SectionName === sections[0].SectionName) {
            section.EarnedScorePercentage = Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
            section.ScorePercentage = 0;
          }
          else {
            sectionPercentage += Math.floor((section.TotalScore / postAssessmentResult.assessmentTotalScore) * 100);
            section.ScorePercentage = sectionPercentage;
            Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
            section.EarnedScorePercentage = Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
          }
          section.SectionPercentage = +(section.TotalScore / postAssessmentResult.assessmentTotalScore * 100).toFixed(1);
          section.SectionPercentage = section.SectionPercentage > 100 ? 100 : section.SectionPercentage;
          let data: SectionScore = {
            sectionName: section.SectionName,
            totalQuestions: section.TotalQuestions,
            totalCorrect: section.TotalCorrect,
            totalScore: section.TotalScore,
            userEarnedScore: section.UserEarnedScore,
            scorePercentage: section.ScorePercentage,
            earnedScorePercentage: section.EarnedScorePercentage,
            sectionPercentage: section.SectionPercentage
          };
          this.sections.push(data);
        });
        postAssessmentResult.sectionScore = this.sections;
        postAssessmentResult.skillScore = JSON.parse(postAssessmentResult.assessmentSkills);
        postAssessmentResult.skillScore.forEach(skill => {
          skill.EarnedScorePercentage = skill.EarnedScorePercentage ? Math.floor(skill.EarnedScorePercentage) : 0;
        });
        postAssessmentResult.skillScore.sort(Helper.sortNumberDecending<SkillsScore>('EarnedScorePercentage'));
        let color = postAssessmentResult.hideResultStatus ? '#57CD64' : postAssessmentResult.isAssessmentPassed ? '#57CD64' : '#F20A34';
        let label = postAssessmentResult.hideResultStatus ? '' : postAssessmentResult.isAssessmentPassed ? Constants.pass : Constants.notCleared;
        let resultScorePercentage = this.failedAssessmentMessageHandler.includes(postAssessmentResult.assessmentPercentage.toString()) ? 0 : postAssessmentResult.assessmentPercentage;
        postAssessmentResult.chartData = {
          series: [resultScorePercentage],
          chart: {
            type: "radialBar",
            width: 200,
            sparkline: {
              enabled: true
            }
          },
          plotOptions: {
            radialBar: {
              hollow: {
                size: "70%"
              },
              dataLabels: !postAssessmentResult.hideResultStatus ? {} : {
                show: true,
                value: {
                  show: true,
                  offsetY: -10,
                  fontSize: '15px',
                }
              }
            }
          },
          fill: {
            colors: [color]
          },
          labels: [label]
        };
        this.campaignDataResult = postAssessmentResult;
        this.mapCampaignTestCaseData();
        this.getRubrixFiles(this.campaignDataResult.assessmentScheduleId, campaignIndex, true);
        campaign.campaignAssessmentResults[index] = this.campaignDataResult;
        this.campaignDataResults.campaignData[campaignIndex] = campaign;

        if (j !== null && j !== undefined) {
          setTimeout(() => {
            this.downloadReport(campaignIndex, this.constants.drive, j);
          }, 1000);
        }
      }
    });

  }

  getCampaignResults(skipCount: number, maxResultCount: number): void {
    let data: CampaignInput;
    data = {
      userId: this.input.userId,
      tenantId: this.input.tenantId,
      SkipCount: skipCount,
      MaxResultCount: maxResultCount,
      catalogId: this.input.catalogId
    };
    this.campaignService.getUserCampaignResults(data).subscribe(res => {
      if (res.success) {
        this.campaignDataResults = res.result;

      }

    }, error => {
      this.toastrService.warning(Constants.unableToFetchTheAssessmentResult);
      console.error(error);
    });
  }

  getAssessmentResults(skipCount: number, maxResultCount: number, asssementType: number): void {
    let data: AssessmentProgressInput;
    data = {
      assessmentScheduleId: null,
      userId: this.input.userId,
      tenantId: this.input.tenantId,
      isUserProfile: true,
      SkipCount: skipCount,
      MaxResultCount: maxResultCount,
      assessmentType: asssementType,
      catalogId: this.input.catalogId,
    };
    asssementType === AssessmentType.Assessment ? this.standardAssessmentResults = [] : this.adaptiveAssessmentResults = [];
    this.userProfileService.getUserAssessmentsProgress(data).subscribe(res => {
      if (res.result) {
        let assessmentResults = res.result;
        assessmentResults.forEach(postAssessmentResult => {
          postAssessmentResult.isExpand = false;
          postAssessmentResult.userLatestAttemptStatusString = UserAssessmentStatus[postAssessmentResult.userLatestAttemptStatus];
          // Adaptive assessment
          if (postAssessmentResult.assessmentType === AssessmentType.Adaptive) {
            this.adaptiveAssessmentResults.push(postAssessmentResult);
          }
          else {
            this.standardAssessmentResults.push(postAssessmentResult);
          }
        });
        this.getSFAResult();
      }
    });
  }


  getAIAdaptiveAssessmentResult(pageDetails) {
    this.aiAdaptiveAssessmentResult = [];
    let data: AIAdaptiveAssessmentRequest = {
      userId: this.input.userId,
      skipCount: pageDetails.skipCount,
      maxResultCount: pageDetails.maxResultCount,
    };
    this.userProfileService.getUserAIAdaptiveAssessmentReports(data).subscribe((res) => {
      if (res?.success) {
        this.aiAdaptiveAssessmentTotalCount = res.result.totalCount;
        res.result?.aiAdaptiveAssessmentResult.forEach(obj => {
          if (obj) {
            obj.totalCorrect = obj.isResponseCorrect.filter(x => x === true).length;
            obj.totalIncorrect = obj.isResponseCorrect.filter(x => x === false).length;
            this.aiAdaptiveAssessmentResult.push(obj);
          }
        });
      }
    });
  }

  setChartAIDataSets(obj: AIAdaptiveAssessmentResult) {
    const estimatedTheta = [];
    const questionDifficulty = [];
    const labels = [];
    if (obj.estimatedTheta) {
      obj.estimatedTheta.forEach((val, index) => {
        estimatedTheta.push(+val);
        labels.push(index + 1);
      });
    }
    if (obj.administeredQuestionDifficulty) {
      obj.administeredQuestionDifficulty.forEach((val, index) => {
        questionDifficulty.push(+val);
      });
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Estimated Ability',
          borderColor: 'rgb(255, 99, 132)',
          fill: false,
          data: estimatedTheta
        },
        {
          label: 'Question Difficulty',
          borderColor: 'rgb(0, 0, 255)',
          fill: false,
          data: questionDifficulty
        },
        {
          label: 'Beginner (-6 to -3)',
          // borderColor: 'rgb(255, 0, 0)',
          fill: false
        },
        {
          label: 'Intermediate (-3 to -1)',
          // borderColor: 'rgb(255, 165, 0)',
          fill: false
        },
        {
          label: 'Advanced (-1 to 6)',
          // borderColor: 'rgb(0, 128, 0)',
          fill: false
        },
      ]
    };
  }

  changeStandardPage() {
    const targetElement = this.standardAssessment.nativeElement;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.standardSkipCount = (this.standardPageIndex - 1) * this.standardPageSize,
      this.standardMaxResultCount = this.standardPageSize,
      this.getAssessmentResults(this.standardSkipCount, this.standardMaxResultCount, AssessmentType.Assessment);
  }

  changeAdaptivePage() {
    const targetElement = this.adaptiveAssessment.nativeElement;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.adaptiveSkipCount = (this.adaptivePageIndex - 1) * this.adaptivePageSize,
      this.adaptiveMaxResultCount = this.adaptivePageSize,
      this.getAssessmentResults(this.adaptiveSkipCount, this.adaptiveMaxResultCount, AssessmentType.Adaptive);
  }

  changeAIAdaptivePage() {
    const targetElement = this.aiAdaptiveAssessment.nativeElement;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.aiAdaptiveAssessmentPage.skipCount = (this.aiAdaptiveAssessmentPage.pageIndex - 1) * this.aiAdaptiveAssessmentPage.pagesizes,
      this.aiAdaptiveAssessmentPage.maxResultCount = this.aiAdaptiveAssessmentPage.pagesizes,
      this.getAIAdaptiveAssessmentResult(this.aiAdaptiveAssessmentPage);
  }

  changeCampaignPage() {
    const targetElement = this.campaignAssessment.nativeElement;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.campaignSkipCount = (this.campaignPageIndex - 1) * this.campaignPageSize,
      this.campaignMaxResultCount = this.campaignPageSize,
      this.getCampaignResults(this.campaignSkipCount, this.campaignMaxResultCount);
  }

  changeStandardPageSize() {
    this.standardPageIndex = 1;
    this.changeStandardPage();
  }
  changeAdaptivePageSize() {
    this.adaptivePageIndex = 1;
    this.changeAdaptivePage();
  }
  changeAIAdaptivePageSize() {
    this.aiAdaptiveAssessmentPage.pageIndex = 1;
    this.changeAIAdaptivePage();
  }
  changeCampaignPageSize() {
    this.campaignPageIndex = 1;
    this.changeCampaignPage();
  }



  openStandardAssessment(item: PostAssessmentResult, i?: number) {
    // Download directly if assessment result is already expanded
    if (this.assessmentResult !== null && this.assessmentResult !== undefined) {
      if (this.assessmentResult.assessmentScheduleId !== item.assessmentScheduleId)
        this.assessmentResult = null;
      else {
        if (i !== null && i !== undefined) {
          setTimeout(() => {
            this.downloadReport(i, this.constants.standard);
          }, 1000);
        }
        return;
      }
    }
    let data: AssessmentProgressInput;
    data = {
      assessmentScheduleId: item.assessmentScheduleId,
      userId: this.input.userId,
      tenantId: this.input.tenantId,
      isUserProfile: true,
      SkipCount: 0,
      MaxResultCount: 1,
      assessmentType: AssessmentType.Assessment,
    };
    this.userProfileService.getUserAssessments(data).subscribe(res => {
      if (res.result) {
        let assessmentIndex = this.standardAssessmentResults.findIndex(x => x.assessmentId === item.assessmentId && x.assessmentScheduleId === item.assessmentScheduleId);
        let postAssessmentResult = res.result[0];
        postAssessmentResult.userAssessmentDurationString = Helper.secondsToHm(postAssessmentResult.userAssessmentDuration);
        postAssessmentResult.averageQuestionDurationString = Helper.secondsToHm(postAssessmentResult.averageQuestionDuration);
        postAssessmentResult.isAssessmentPassed = postAssessmentResult.userLatestAttemptStatus === UserAssessmentStatus.Passed ? true : false;
        postAssessmentResult.questionsSkipped = postAssessmentResult.assessmentTotalQuestions - postAssessmentResult.totalAnswered;
        postAssessmentResult.userEarnedPercentage = this.standardAssessmentResults[assessmentIndex].userEarnedPercentage;
        postAssessmentResult.assessmentPercentage = Math.floor(this.standardAssessmentResults[assessmentIndex].userEarnedPercentage);
        postAssessmentResult.remainingAttempts = postAssessmentResult.maxAttempts - postAssessmentResult.availedAttempts;
        let proficiencies = postAssessmentResult.assessmentProficiencies;
        postAssessmentResult.userLatestAttemptStatusString = UserAssessmentStatus[postAssessmentResult.userLatestAttemptStatus];
        let questionCount = JSON.parse(proficiencies);
        postAssessmentResult.totalBeginnerQuestions = 0;
        postAssessmentResult.correctBeginnerQuestions = 0;
        postAssessmentResult.totalIntermediateQuestions = 0;
        postAssessmentResult.correctIntermediateQuestions = 0;
        postAssessmentResult.totalAdvancedQuestions = 0;
        postAssessmentResult.correctAdvancedQuestions = 0;
        const roleAnalysisResult = JSON.parse(postAssessmentResult.roleAnalysisResult);
        // postAssessmentResult.mfaPlagiarismScanResult = postAssessmentResult.mfaPlagiarismScanResult === null ? null : JSON.parse(postAssessmentResult.mfaPlagiarismScanResult);
        if (roleAnalysisResult?.length > 0) {
          postAssessmentResult.jobCompatibilityResult = this.getRoleAnalysisResult(roleAnalysisResult, i);
        }

        if (i === null || i === undefined)
          postAssessmentResult.isExpand = true;

        questionCount?.forEach(element => {
          if (element.ProficiencyId === this.constants.beginnerId) {
            postAssessmentResult.totalBeginnerQuestions = element.TotalQuestions;
            postAssessmentResult.correctBeginnerQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.intermediateId) {
            postAssessmentResult.totalIntermediateQuestions = element.TotalQuestions;
            postAssessmentResult.correctIntermediateQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.advancedId) {
            postAssessmentResult.totalAdvancedQuestions = element.TotalQuestions;
            postAssessmentResult.correctAdvancedQuestions = element.TotalCorrect;
          }
        });
        this.sections = [];
        let sections = JSON.parse(postAssessmentResult.assessmentSections);
        let sectionPercentage = 0;
        sections?.forEach(section => {
          if (section.SectionName === sections[0].SectionName) {
            section.EarnedScorePercentage = Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
            section.ScorePercentage = 0;
          }
          else {
            sectionPercentage += Math.floor((section.TotalScore / postAssessmentResult.assessmentTotalScore) * 100);
            section.ScorePercentage = sectionPercentage;
            Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
            section.EarnedScorePercentage = Math.floor((section.UserEarnedScore / section.TotalScore) * 100);
          }
          section.SectionPercentage = +(section.TotalScore / postAssessmentResult.assessmentTotalScore * 100).toFixed(1);
          section.SectionPercentage = section.SectionPercentage > 100 ? 100 : section.SectionPercentage;
          let data: SectionScore = {
            sectionName: section.SectionName,
            totalQuestions: section.TotalQuestions,
            totalCorrect: section.TotalCorrect,
            totalScore: section.TotalScore,
            userEarnedScore: section.UserEarnedScore,
            scorePercentage: section.ScorePercentage,
            earnedScorePercentage: section.EarnedScorePercentage,
            sectionPercentage: section.SectionPercentage
          };
          this.sections.push(data);
        });
        postAssessmentResult.sectionScore = this.sections;
        postAssessmentResult.skillScore = JSON.parse(postAssessmentResult.assessmentSkills);
        postAssessmentResult.skillScore.forEach(skill => {
          skill.EarnedScorePercentage = skill.EarnedScorePercentage ? Math.floor(skill.EarnedScorePercentage) : 0;
        });
        postAssessmentResult.skillScore.sort(Helper.sortNumberDecending<SkillsScore>('EarnedScorePercentage'));
        let color = postAssessmentResult.hideResultStatus ? '#57CD64' : postAssessmentResult.isAssessmentPassed ? '#57CD64' : '#F20A34';
        let label = postAssessmentResult.hideResultStatus ? '' : postAssessmentResult.isAssessmentPassed ? Constants.pass : Constants.notCleared;
        let resultScorePercentage = this.failedAssessmentMessageHandler.includes(postAssessmentResult.assessmentPercentage.toString()) ? 0 : postAssessmentResult.assessmentPercentage;
        postAssessmentResult.chartData = {
          series: [resultScorePercentage],
          chart: {
            type: "radialBar",
            width: 200,
            sparkline: {
              enabled: true
            }
          },
          plotOptions: {
            radialBar: {
              hollow: {
                size: "70%"
              },
              dataLabels: !postAssessmentResult.hideResultStatus ? {} : {
                show: true,
                value: {
                  show: true,
                  offsetY: -10,
                  fontSize: '15px',
                }
              }
            }
          },
          fill: {
            colors: [color]
          },
          labels: [label]
        };


        this.assessmentResult = postAssessmentResult;
        this.mapTestCaseData();
        this.standardAssessmentResults[assessmentIndex] = this.assessmentResult;
        this.getRubrixFiles(this.assessmentResult.assessmentScheduleId);

        if (i !== null && i !== undefined) {
          setTimeout(() => {
            this.downloadReport(i, this.constants.standard);
          }, 1000);
        }
      }
    }, error => {
      this.toastrService.warning(Constants.unableToFetchTheAssessmentResult);
      console.error(error);
    });
  }

  openAdaptiveAssessment(item: PostAssessmentResult, i?: number) {
    // Download directly if assessment result is already expanded
    if (this.adaptiveAssessmentResult !== null && this.adaptiveAssessmentResult !== undefined) {
      if (this.adaptiveAssessmentResult.assessmentScheduleId !== item.assessmentScheduleId)
        this.adaptiveAssessmentResult = null;
      else {
        if (i !== null && i !== undefined) {
          setTimeout(() => {
            this.downloadReport(i, this.constants.adaptive);
          }, 1000);
        }
        return;
      }
    }

    let data: AssessmentProgressInput;
    data = {
      assessmentScheduleId: item.assessmentScheduleId,
      userId: this.input.userId,
      tenantId: this.input.tenantId,
      isUserProfile: true,
      SkipCount: 0,
      MaxResultCount: 1,
      assessmentType: AssessmentType.Adaptive,
    };
    this.userProfileService.getUserAssessments(data).subscribe(res => {
      if (res.result) {
        let assessmentIndex = this.adaptiveAssessmentResults.findIndex(x => x.assessmentId === item.assessmentId && x.assessmentScheduleId === item.assessmentScheduleId);
        let postAssessmentResult = res.result[0];
        postAssessmentResult.userAssessmentDurationString = Helper.secondsToHm(postAssessmentResult.userAssessmentDuration);
        postAssessmentResult.averageQuestionDurationString = Helper.secondsToHm(postAssessmentResult.averageQuestionDuration);
        postAssessmentResult.isAssessmentPassed = postAssessmentResult.userLatestAttemptStatus === UserAssessmentStatus.Passed ? true : false;
        postAssessmentResult.questionsSkipped = postAssessmentResult.assessmentTotalQuestions - postAssessmentResult.totalAnswered;
        postAssessmentResult.assessmentPercentage = Math.floor(this.adaptiveAssessmentResults[assessmentIndex]?.userEarnedPercentage);
        postAssessmentResult.remainingAttempts = postAssessmentResult.maxAttempts - postAssessmentResult.availedAttempts;
        let proficiencies = postAssessmentResult.assessmentProficiencies;
        postAssessmentResult.userLatestAttemptStatusString = UserAssessmentStatus[postAssessmentResult.userLatestAttemptStatus];
        let questionCount = JSON.parse(proficiencies);
        postAssessmentResult.totalBeginnerQuestions = 0;
        postAssessmentResult.correctBeginnerQuestions = 0;
        postAssessmentResult.totalIntermediateQuestions = 0;
        postAssessmentResult.correctIntermediateQuestions = 0;
        postAssessmentResult.totalAdvancedQuestions = 0;
        postAssessmentResult.correctAdvancedQuestions = 0;
        if (i !== null && i !== undefined)
          postAssessmentResult.isExpand = false;
        else
          postAssessmentResult.isExpand = true;

        questionCount?.forEach(element => {
          if (element.ProficiencyId === this.constants.beginnerId) {
            postAssessmentResult.totalBeginnerQuestions = element.TotalQuestions;
            postAssessmentResult.correctBeginnerQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.intermediateId) {
            postAssessmentResult.totalIntermediateQuestions = element.TotalQuestions;
            postAssessmentResult.correctIntermediateQuestions = element.TotalCorrect;
          }
          if (element.ProficiencyId === this.constants.advancedId) {
            postAssessmentResult.totalAdvancedQuestions = element.TotalQuestions;
            postAssessmentResult.correctAdvancedQuestions = element.TotalCorrect;
          }
        });
        if (postAssessmentResult.adaptiveAssessmentSectionResults) {
          const skillData = JSON.parse(postAssessmentResult.adaptiveAssessmentSectionResults);
          postAssessmentResult.adaptiveSkillResults = [];
          skillData?.forEach(objResult => {
            objResult.SectionRecentAttempts = JSON.parse(objResult.SectionRecentAttempts);
            objResult.SectionProficiencies = JSON.parse(objResult.SectionProficiencies);
            objResult.TotalSectionDuration = Helper.secondsToHm(objResult.TotalSectionDuration);
            objResult.AverageSectionQuestionDuration = Helper.secondsToHm(objResult.AverageSectionQuestionDuration);
            let proficiencyData = JSON.parse(objResult.ProficiencyJourney);
            let xdata: number;
            let ydata: string;
            let zdata: string;
            this.proficiencyChartData = [{ x: 0, y: 'Nil', z: 'Nil' }];

            proficiencyData.forEach((element) => {
              xdata = element.Point;
              ydata = element.ProficiencyName;
              zdata = element.Status;
              this.proficiencyChartData.push({
                x: xdata,
                y: ydata,
                z: zdata,
              });
            });
            objResult.ProficiencyChartMetrics = this.getProficiencyChartMetrics();
            postAssessmentResult.adaptiveSkillResults.push(objResult);
          });
          this.adaptiveAssessmentResult = postAssessmentResult;
        }

        this.adaptiveAssessmentResults[assessmentIndex] = this.adaptiveAssessmentResult;
        if (i !== null && i !== undefined) {
          setTimeout(() => {
            this.downloadReport(i, this.constants.adaptive);
          }, 1000);
        }
      }
    }, error => {
      this.toastrService.warning(Constants.unableToFetchTheAssessmentResult);
      console.error(error);
    });
  }

  getProficiencyChartMetrics(): proficiencyChartMetrics {
    return {
      resultChartData: [
        {
          data: this.proficiencyChartData,
          pointRadius: 5,
          pointHoverRadius: 5,
          label: '',
          fill: false,
          tension: 0,
          borderColor: 'gray',
          backgroundColor: 'gray',
          pointBackgroundColor: function (data) {
            var index = data.dataIndex;
            var value = data.dataset.data[index].z;
            return value === 'Passed' ? 'green' :
              value === 'Failed' ? '#c50000' :
                'gray';
          },
          pointBorderColor: function (data) {
            var index = data.dataIndex;
            var value = data.dataset.data[index].z;
            return value === 'Passed' ? 'green' :
              value === 'Failed' ? '#c50000' :
                'gray';
          }
        }
      ],
      resultChartLabels: ['Advanced', 'Intermediate', 'Beginner', 'Nil'],
      resultChartOptions: {
        layout: {
          padding: {
            right: 8,
          },
        },
        responsive: true,
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            ticks: {
              display: false,
            },
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            type: 'category',
            position: 'left'
          }]
        },
        plugins: {
          datalabels: {
            display: false,
          }
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              const datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].z || '';
              return datasetLabel;
            }
          }
        }
      },
      resultChartLegend: false,
    };
  }

  downloadProfile() {
    this.isDownloadClick = true;
    this.isDownloadProfile = true;
    this.showEdit = false;
    this.adaptiveAssessmentResults.forEach((item) => { item.isExpand = false; });
    this.standardAssessmentResults.forEach((item) => { item.isExpand = false; });
    setTimeout(() => {
      this.getPDF(this);
    }, 1000);
  }

  getPDF(_this) {
    this.isDownloadClick = true;
    html2pdf(document.querySelector("#contentToConvert"), {
      margin: 15,
      filename: `${this.constants.userProfile}_${this.emailAddress}_${new Date().getTime()}.pdf`,
      jsPDF: { format: 'b3', orientation: 'portrait' }
    });
    setTimeout(() => {
      this.isDownloadProfile = false;
    }, 500);
  }

  downloadReport(i: number, reportType: string, campaignAssessmentIndex: number = null) {
    this.isDownloadClick = true;
    this.isDownloadProfile = false;
    let divTag = reportType + i;
    if (campaignAssessmentIndex !== null && campaignAssessmentIndex !== undefined)
      divTag = divTag + campaignAssessmentIndex;
    html2pdf(document.querySelector("#" + divTag), {
      margin: 15,
      filename: `${this.constants.userAssessmentReport}_${this.emailAddress}_${new Date().getTime()}.pdf`,
      jsPDF: { format: 'b3', orientation: 'portrait' }
    });
  }

  downloadStandardReport(i: number, item: PostAssessmentResult) {
    this.openStandardAssessment(item, i);
  }

  downloadAdaptiveReport(i: number, item: PostAssessmentResult) {
    this.openAdaptiveAssessment(item, i);
  }

  downloadCampaignReport(i: number, assessment: CampaignAssessmentResults, j: number) {
    this.openCampaignAssessment(i, assessment, j);
  }

  getSFAResult() {
    this.userProfileService.getTestCasesResult(this.input).subscribe(res => {
      if (res.result) {
        this.testCasesResult = res.result;
      }
    });
  }

  mapTestCaseData() {
    this.input.AssessmentScheduleId = this.assessmentResult.assessmentScheduleId;
    var testCases = this.testCasesResult.filter(x => x.assessmentScheduleId === this.assessmentResult.assessmentScheduleId);
    this.assessmentResult.testCasesResult = testCases;
    var questions = testCases.map((x) => {
      return {
        "questionId": x.questionId,
        "question": x.questionText,
        "subSkill": x.subSkill,
        "plagiarismScore": x.plagiarismScore, "testCasesResults": []
      };
    });
    this.assessmentResult.questions = [...new Map(questions.map(item =>
      [item["questionId"], item])).values()];
    this.assessmentResult.questions.forEach((value) => {
      value.testCasesResults = this.assessmentResult.testCasesResult.filter(y => y.questionId === value.questionId);
    });
  }

  mapCampaignTestCaseData() {
    this.input.AssessmentScheduleId = this.campaignDataResult.assessmentScheduleId;
    var testCases = this.testCasesResult.filter(x => x.assessmentScheduleId === this.campaignDataResult.assessmentScheduleId);
    this.campaignDataResult.testCasesResult = testCases;
    var questions = testCases.map((x) => {
      return {
        "questionId": x.questionId, "question": x.questionText,
        "subSkill": x.subSkill, "plagiarismScore": x.plagiarismScore, "testCasesResults": []
      };
    });
    this.campaignDataResult.questions = [...new Map(questions.map(item =>
      [item["questionId"], item])).values()];
    this.campaignDataResult.questions.forEach((value) => {
      value.testCasesResults = this.campaignDataResult.testCasesResult.filter(y => y.questionId === value.questionId);
    });
  }

  convertToEvaluationResultJsonDto(data: string): EvaluationResultJsonDto {
    var evalutionResult = JSON.parse(data) as EvaluationResultJsonDto;
    return evalutionResult;
  }

  getMemoryUtilized(data: string) {
    if (data) {
      if (data !== null) {
        return this.convertToEvaluationResultJsonDto(data).MemoryUtilized + " kb";
      }
    }

    return "NA";
  }

  getTestCaseAnswer(data: string) {
    if (data) {
      if (data !== null) {
        return data;

      }

      return "NA";
    }
  }

  checkIsCloud(testCaseResults: any) {
    if (testCaseResults.questionTypeId === QuestionTypeId.CloudBased) {
      this.isCloudBased = true;
    } else {
      this.isCloudBased = false;
    }
  }

  getCpuTime(data: string) {
    if (data) {
      if (data !== null) {

        return this.convertToEvaluationResultJsonDto(data).CpuTime + " " + this.constants.s;
      }
    }
    return "NA";
  }

  ngOnDestroy() {
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = false;
  }

  getRubrixFiles(assessmentScheduleId, campaignIndex: number | null = null, isCampaign: boolean = false) {
    let userInput: UserInput = {
      userId: this.input.userId,
      AssessmentScheduleId: assessmentScheduleId,
      tenantId: 0,
      isUserProfile: true
    };

    this.userProfileService.GetCandidateRubrixFileUrl(userInput).subscribe(res => {
      if (res.result.isSuccess) {
        if (isCampaign) {
          let campaign = this.campaignDataResults.campaignData[campaignIndex];
          let assessmentIndex = campaign.campaignAssessmentResults.findIndex(x => x.assessmentScheduleId === assessmentScheduleId);
          this.campaignDataResults.campaignData[campaignIndex].campaignAssessmentResults[assessmentIndex].blobNames = res.result.message;
          return;
        }
        const index = this.standardAssessmentResults.findIndex(item => item.assessmentScheduleId === userInput.AssessmentScheduleId);
        this.standardAssessmentResults[index].blobNames = res.result.message;
      }
    },
      error => console.error(error));
  }

  getRubrixZipFiles(blobName: string[]) {

    let input: RubrixFileZipInputDto = {
      emailAddress: this.user.emailAddress,
      blobName: blobName
    };

    this.userProfileService.GetRubrixZipFileUrl(input).subscribe(res => {
      if (res.result.isSuccess) {
        window.location.href = res.result.message;
      }
    },
      error => console.error(error));
  }
  viewAnswers(userId: number, assessmentScheduleId: number) {
    var queryParam = btoa(userId + '/' + assessmentScheduleId);
    if (this.userRole === UserRoles[5]) {
      this.router.navigate(['view-result', queryParam], { relativeTo: this.activateRoute });
    }
    else
      this.router.navigate(['../view-result', queryParam], { relativeTo: this.activateRoute });
  }

  getRoleAnalysisResult(roleAnalysisResult, i: number) {
    const scoreMap = new Map<number, { name: string; value: number, description: string }>();
    for (const item of roleAnalysisResult) {
      const id = item.AssessmentScheduleRoleAnalysisMetadataId;
      const score = item.Score / 100;
      const name = item.RoleName;
      const description = item.Description;

      if (scoreMap.has(id)) {
        const existingData = scoreMap.get(id)!;
        scoreMap.set(id, { name: existingData.name, value: existingData.value + score, description: existingData.description });
      } else {
        scoreMap.set(id, { name, value: score, description });
      }
    }
    const roleResult: { id: number, name: string, value: number, description: string }[] = [];
    for (const [id, { name, value, description }] of scoreMap) {
      roleResult.push({ id, name, value, description });
    }
    const jobCompatibilityChartResult = roleResult;

    let highestScoreObj: JobCompatiblityRoleObject = { name: '', value: -Infinity };
    let lowestScoreObj: JobCompatiblityRoleObject = { name: '', value: Infinity };
    for (const item of jobCompatibilityChartResult) {
      if (item.value > highestScoreObj.value) {
        highestScoreObj = { name: item.name, value: item.value };
      }
      if (item.value < lowestScoreObj.value) {
        lowestScoreObj = { name: item.name, value: item.value };
      }
    }
    return {
      eligibleRole: highestScoreObj,
      notEligibleRole: lowestScoreObj,
      roleResult: jobCompatibilityChartResult,
      index: i
    };
  }

  openAIAdaptiveAssessment(aiAdaptiveAssessment: AIAdaptiveAssessmentResult, index: number, isDownload?: boolean) {
    const data = this.setChartAIDataSets(aiAdaptiveAssessment);
    let canvas = document.getElementById(`aiAdaptiveChart${index}`) as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      
      options: {
        responsive: true,
        legend: {
          labels: {
            fontColor: 'black',
            fontSize:12,
          }
        },
        elements: {
          point: {
            radius: 5
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: '',
              fontStyle: 'bold'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'QuestionIds',
              fontStyle: 'bold'
            }
          }]
        },
        plugins: {
          datalabels: {
            display: false // to hide the x and y coordinates
          },        
        },
      },
    });

    if (isDownload && index !== null && index !== undefined) {
      setTimeout(() => {
        this.downloadReport(index, this.constants.aiAdaptive);
      }, 2000);
    }
    return;
  }

  downloadAIAdaptiveReport(index, aiAdaptiveAssessmentReport) {
    const isDownload = true;
    this.openAIAdaptiveAssessment(aiAdaptiveAssessmentReport, index, isDownload);
  }

}
