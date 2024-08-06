import { Component, HostListener, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../models/constants';
import { PostAssessmentResult, ProficiencyChartData, ProgressFilter, SectionScore, SkillsScore } from '../field';
import { TestService } from '../test.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Helper } from '@app/shared/helper';
import { TestTerminationComponent } from '../test-termination/test-termination.component';
declare function stopcamera(): any;

import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions
} from 'ng-apexcharts';
import { UserAssessmentStatus } from '@app/enums/test';
import { CookieService } from 'ngx-cookie-service';
import { UtilsService } from 'abp-ng2-module';
import { dataService } from '@app/service/common/dataService';
import { AssessmentType } from '@app/enums/assessment';
import { HackathonLeaderBoard, HackathonLeaderBoardRequest } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { ToastrService } from 'ngx-toastr';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { finalize } from 'rxjs/operators';

export interface AssessmentResultChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
}
export interface proficiencyChartMetrics {
  resultChartData: Array<any>;
  resultChartLabels: Array<any>;
  resultChartOptions: any;
  resultChartLegend: boolean;
}

@Component({
  selector: 'app-post-assessment-page-view',
  templateUrl: './post-assessment-page-view.component.html',
  styleUrls: ['./post-assessment-page-view.component.scss']
})

export class PostAssessmentPageViewComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantId: number;
  userId: number;
  assessmentScheduleId: number;
  postAssessmentResult: PostAssessmentResult;
  skills: SkillsScore[];
  public proficiencyChartData: Array<ProficiencyChartData> = [];
  sections: SectionScore[];
  proficiencyChartMetrics: proficiencyChartMetrics;
  public assessmentResultChartOptions: Partial<AssessmentResultChartOptions>;
  isUserFailed: boolean;
  proctoringViolationMessage: string = '';
  isUserPassed: boolean;
  userAssessmentDuration: string;
  averageQuestionDuration: string;
  userName: string;
  surName: string;
  emailAddress: string;
  enableWheeboxProctoring: string;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  remainingAttempts: number = 0;
  userRole: string;
  authUser: boolean = false;
  showLeaderBoard: string;
  assessmentId: number;
  showLeaderBoardOnly: boolean = false;
  hackathonLeaderBoard: HackathonLeaderBoard;
  showAdaptive: boolean = false;
  sourceOfSchedule: string;
  isCustomThemeEnabled: boolean = false;
  isTenantLogoLoaded: boolean = false;
  campaignName: string;
  tenantName: string = location.pathname.split('/')[1];
  feedbackEnabled: boolean = false;
  timeUtilized: number;
  isABInBev: boolean = false;
  isInfosys: boolean = false;
  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(private testService: TestService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private _utilsService: UtilsService,
    private dataService: dataService,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private tenantService: TenantsService,
    injector: Injector) {
    super(injector);
    if (window.location !== window.parent.location) {
      // in iframe
    } else {
      window.location.hash = "no-back-button";
      window.location.hash = "Again-No-back-button";
      window.onhashchange = function () { window.location.hash = "no-back-button"; };
    }
  }

  ngOnInit(): void {
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = true;
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    this.sourceOfSchedule = localStorage.getItem(Constants.sourceOfSchedule);
    if (bool === "true")
      this.authUser = true;
    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const assessment = atob(params['assessment']).split('/');
        this.assessmentScheduleId = parseInt(assessment[0]);
        this.userId = parseInt(assessment[1]);
        this.tenantId = parseInt(assessment[2]);
        this.userName = assessment[5];
        this.surName = assessment[6];
        this.emailAddress = assessment[7];
        if (assessment.length === 8) {
          this.showLeaderBoard = assessment[3].toLowerCase();
          this.assessmentId = parseInt(assessment[4]);
          if (this.showLeaderBoard === Constants.trueLabel) {
            this.showLeaderBoardOnly = true;
          }
        }
        else {
          let isProctoringViolated = assessment[3];
          this.enableWheeboxProctoring = assessment[8];
          this.remainingAttempts = isNaN(parseInt(assessment[9])) ? 0 : parseInt(assessment[9]);
          if (isProctoringViolated === Constants.trueLabel) {
            this.proctoringViolationMessage = assessment[4];
            this.showTestTerminationModal();
          }
          let assessmentType = parseInt(assessment[10]);
          if (assessmentType === AssessmentType.Hackathon) {
            this.showLeaderBoard = 'true';
          }
          if (assessmentType === AssessmentType.Adaptive) {
            this.showAdaptive = true;
          }
          this.assessmentId = parseInt(assessment[11]);
          this.campaignName = assessment[12];
        }
        if (assessment.length === 14) {
          this.timeUtilized = parseInt(assessment[13])
        }
        this.getAssessmentResult();
        this.getFeedbackEnabled(this.assessmentScheduleId);
        this.getLeaderBoardDetails();
        if (this.tenantId) {
          this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
          this.isABInBev = this.dataService.checkCustomThemeForAbinBev(this.tenantId);
          this.isInfosys = this.dataService.checkTenantId(this.tenantId) === 'Infosys' ? true : false;
          this.tenantService.getTenantCustomizationSettings(this.tenantId).pipe(
            finalize(() => {
              this.isTenantLogoLoaded = true;
            })).subscribe(res => {
              if (res && res.result) {
                let customizationSettings = JSON.parse(res.result) as TenantCustomizationSettings;
                this.logoUrl = customizationSettings.TenantLogoUrl;
              }
            }, error => {
              console.error(error);
            });
        }
        else {
          this.isTenantLogoLoaded = true;
        }
      }
    });
  }

  showTestTerminationModal() {
    const modalRef = this.modalService.open(TestTerminationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.proctoringViolationMessage = this.proctoringViolationMessage;
  }

  getFeedbackEnabled(assessmentScheduleId: number) {
    this.testService.getFeedbackSetting(assessmentScheduleId).subscribe(res => {
      this.feedbackEnabled = res.result;
    })
  }

  getAssessmentResult() {
    let data: ProgressFilter = {
      tenantId: this.tenantId,
      userId: this.userId,
      assessmentScheduleId: this.assessmentScheduleId
    };
    // eslint-disable-next-line eqeqeq
    if (this.enableWheeboxProctoring == "true") {
      data.attemptId = parseInt(localStorage.getItem(Constants.attemptId));
      data.attemptNumber = parseInt(localStorage.getItem(Constants.attemptNumber));
    }
    this.testService.getPostAssessmentResults(data).subscribe(res => {
      if (this.showAdaptive) {
        res.result.adaptiveAssessmentSectionResults = JSON.parse(res.result.adaptiveAssessmentSectionResults);
        res.result = this.formAdaptiveAssessmentResultData(res.result);
      }
      this.postAssessmentResult = res.result;
      this.userAssessmentDuration = this.postAssessmentResult.userAssessmentDuration > 0 ? Helper.secondsToHm(this.postAssessmentResult.userAssessmentDuration) : Helper.secondsToHm(this.timeUtilized);
      this.averageQuestionDuration = Helper.secondsToHm(this.postAssessmentResult.averageQuestionDuration);
      this.isUserPassed = this.postAssessmentResult.userLatestAttemptStatus === UserAssessmentStatus.Passed ? true : false;
      this.postAssessmentResult.questionsSkipped = this.postAssessmentResult.assessmentTotalQuestions - this.postAssessmentResult.totalAnswered;
      this.postAssessmentResult.assessmentPercentage = Math.floor((this.postAssessmentResult.userEarnedScore / this.postAssessmentResult.assessmentTotalScore) * 100);
      this.postAssessmentResult.remainingAttempts = this.postAssessmentResult.maxAttempts - this.postAssessmentResult.availedAttempts;
      let proficiencies = this.postAssessmentResult.assessmentProficiencies;
      let questionCount = JSON.parse(proficiencies);
      this.postAssessmentResult.totalBeginnerQuestions = this.postAssessmentResult.correctBeginnerQuestions = 0;
      this.postAssessmentResult.totalIntermediateQuestions = this.postAssessmentResult.correctIntermediateQuestions = 0;
      this.postAssessmentResult.totalAdvancedQuestions = this.postAssessmentResult.correctAdvancedQuestions = 0;

      questionCount.forEach(element => {
        if (element.ProficiencyId === this.constants.beginnerId) {
          this.postAssessmentResult.totalBeginnerQuestions = element.TotalQuestions;
          this.postAssessmentResult.correctBeginnerQuestions = element.TotalCorrect;
        }
        if (element.ProficiencyId === this.constants.intermediateId) {
          this.postAssessmentResult.totalIntermediateQuestions = element.TotalQuestions;
          this.postAssessmentResult.correctIntermediateQuestions = element.TotalCorrect;
        }
        if (element.ProficiencyId === this.constants.advancedId) {
          this.postAssessmentResult.totalAdvancedQuestions = element.TotalQuestions;
          this.postAssessmentResult.correctAdvancedQuestions = element.TotalCorrect;
        }
      });

      if (res.result.sectionRecentAttempts) {
        let sectionRecentAttempts = this.postAssessmentResult.sectionRecentAttempts;
        let sectionRecentAttemptList = JSON.parse(sectionRecentAttempts);
        this.postAssessmentResult.beginnerPercentage = this.postAssessmentResult.intermediatePercentage = this.postAssessmentResult.advancedPercentage = 0;

        sectionRecentAttemptList.forEach(element => {
          if (element.ProficiencyId === this.constants.beginnerId) {
            this.postAssessmentResult.beginnerPercentage = element.ScorePercentage;
          }
          if (element.ProficiencyId === this.constants.intermediateId) {
            this.postAssessmentResult.intermediatePercentage = element.ScorePercentage;
          }
          if (element.ProficiencyId === this.constants.advancedId) {
            this.postAssessmentResult.advancedPercentage = element.ScorePercentage;
          }
        });
      }
      if (res.result.proficiencyJourney) {
        let proficiencyData = JSON.parse(res.result.proficiencyJourney);

        let xdata: number;
        let ydata: string;
        let zdata: string;

        let proficiencyMetaData = [{ x: 0, y: 'Nil', z: 'Nil' }];

        proficiencyData.forEach((element) => {
          xdata = element.Point;
          ydata = element.ProficiencyName;
          zdata = element.Status;

          proficiencyMetaData.push({
            x: xdata,
            y: ydata,
            z: zdata,
          });
        });
        this.proficiencyChartData = proficiencyMetaData.sort(((first, second) => 0 - (first.x > second.x ? -1 : 1)));

        this.proficiencyChart();
      }

      this.sections = JSON.parse(this.postAssessmentResult.assessmentSections);
      let sectionPercentage = 0;
      this.sections.forEach(element => {
        if (element.SectionName === this.sections[0].SectionName) {
          element.EarnedScorePercentage = Math.floor((element.UserEarnedScore / this.postAssessmentResult.assessmentTotalScore) * 100);
          element.ScorePercentage = 0;
        }
        else {
          sectionPercentage += Math.floor((element.TotalScore / this.postAssessmentResult.assessmentTotalScore) * 100);
          element.ScorePercentage = sectionPercentage;
          element.EarnedScorePercentage = Math.floor((element.UserEarnedScore / this.postAssessmentResult.assessmentTotalScore) * 100);
        }
        element.SectionPercentage = +(element.TotalScore / this.postAssessmentResult.assessmentTotalScore * 100).toFixed(1);
        element.SectionPercentage = element.SectionPercentage > 100 ? 100 : element.SectionPercentage;
      });
      this.skills = JSON.parse(this.postAssessmentResult.assessmentSkills);
      this.skills.forEach(skill => {
        skill.EarnedScorePercentage = skill.EarnedScorePercentage ? Math.floor(skill.EarnedScorePercentage) : 0;
      });
      this.skills.sort(Helper.sortNumberDecending<SkillsScore>('EarnedScorePercentage'));
      this.proficiencyChart();
      this.displayAssessmentResultChart();
      if (!this.authUser) {
        this.cookieService.delete(this.constants.abpAuthToken, "/");
      }
    });
  }

  proficiencyChart(): void {
    this.proficiencyChartMetrics = {
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
        maintainAspectRatio: false,
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

  displayAssessmentResultChart(): void {
    const color = this.postAssessmentResult.hideResultStatus ? '#57CD64' : this.isUserPassed ? '#57CD64' : '#F20A34';
    const label = this.postAssessmentResult.hideResultStatus ? '' : this.isUserPassed ? Constants.pass : Constants.notCleared;
    this.assessmentResultChartOptions = {
      series: [this.postAssessmentResult.assessmentPercentage],
      chart: {
        type: "radialBar",
        width: 250,
        sparkline: {
          enabled: true
        }
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "75%"
          },
          dataLabels: !this.postAssessmentResult.hideResultStatus ? {} : {
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
  }

  htmltoPDF() {
    if (this.showAdaptive && this.postAssessmentResult?.adaptiveAssessmentSectionResults?.length > 1) {
      let totalSkills = this.postAssessmentResult.adaptiveAssessmentSectionResults.length;
      html2canvas(document.querySelector("#contentToConvert")).then(canvas => {
        var pdf = new jsPDF('p', 'mm', [210, 210 * totalSkills]);
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, 'JPEG', 45, 10, 100, 200 * totalSkills);
        pdf.save(this.sourceOfSchedule === Constants.techademy ? `${this.constants.userReport}_${this.emailAddress}_${new Date().getTime()}.pdf` : `${this.constants.userAssessmentReport}_${this.emailAddress}_${new Date().getTime()}.pdf`);
      });
    } else {
      html2canvas(document.querySelector("#contentToConvert")).then(canvas => {
        var pdf = new jsPDF('p', 'mm', "a4");
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, 'JPEG', 35, 10, 150, 275);
        pdf.save(this.sourceOfSchedule === Constants.techademy ? `${this.constants.userReport}_${this.emailAddress}_${new Date().getTime()}.pdf` : `${this.constants.userAssessmentReport}_${this.emailAddress}_${new Date().getTime()}.pdf`);
      });
    }
  }

  navigateToRetryAttempt() {
    let queryParam = this.postAssessmentResult.assessmentScheduleIdNumber + '/' + this.tenantId + '/' + this.postAssessmentResult.userEmailAddress + '/' + '/true';
    queryParam = btoa(queryParam);
    this.router.navigate(['../../../../account/test-taker/pre-assessment', queryParam], { relativeTo: this.activatedRoute });
  }

  getLeaderBoardDetails() {
    let leaderBoardRequest: HackathonLeaderBoardRequest = {
      AssessmentId: this.assessmentId,
      AssessmentScheduleId: this.assessmentScheduleId,
      SkipCount: 0,
      MaxResultCount: 20
    };

    this.assessmentService.getLeaderBoardDetails(leaderBoardRequest).subscribe(res => {
      if (res && res.result) {
        this.hackathonLeaderBoard = res.result;
        if (res.result.leaderBoardDetails !== null) {
          this.hackathonLeaderBoard.leaderBoardDetails.forEach(item => {
            item['convertedDuration'] = Helper.secondsToHm(item.duration);
          });
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  formAdaptiveAssessmentResultData(res) {
    res.adaptiveAssessmentSectionResults.forEach((obj: any, index) => {
      res.adaptiveAssessmentSectionResults[index].ResultChartData = this.getResultChartData(obj.ProficiencyJourney);
      res.adaptiveAssessmentSectionResults[index].TotalSectionDuration = Helper.secondsToHm(res.adaptiveAssessmentSectionResults[index].TotalSectionDuration);
      res.adaptiveAssessmentSectionResults[index].AverageSectionQuestionDuration = Helper.secondsToHm(res.adaptiveAssessmentSectionResults[index].AverageSectionQuestionDuration);
      res.adaptiveAssessmentSectionResults[index].SectionProficiencies = JSON.parse(res.adaptiveAssessmentSectionResults[index].SectionProficiencies);
      res.adaptiveAssessmentSectionResults[index].SectionRecentAttempts = JSON.parse(res.adaptiveAssessmentSectionResults[index].SectionRecentAttempts);
    });
    return res;
  }

  getResultChartData(res: string) {
    const data = JSON.parse(res);
    let chartData;
    if (data) {
      let proficiencyData = data;
      let xdata: number;
      let ydata: string;
      let zdata: string;
      let proficiencyMetaData = [{ x: 0, y: 'Nil', z: 'Nil' }];

      proficiencyData.forEach((element) => {
        xdata = element.Point;
        ydata = element.ProficiencyName;
        zdata = element.Status;

        proficiencyMetaData.push({
          x: xdata,
          y: ydata,
          z: zdata,
        });
      });
      chartData = proficiencyMetaData.sort(((first, second) => 0 - (first.x > second.x ? -1 : 1)));
    }

    return [{
      data: chartData,
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
    }];
  }

  feedback() {
    window.open("https://forms.office.com/pages/responsepage.aspx?id=S3NAdWflw0aa0-yfueUBQGZ6FxP9XSxMgK7FFEwq13JUME8xQ0dNU0lCM1QxVkE0V1E4NDNDMExJUS4u&web=1&wdLOR=cEAED3980-5D24-46E0-BD54-956AB9974410");
  }

  ngOnDestroy() {
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = false;
  }
}
