import { GetAssessmentQuestions, GetPostEvaluationStatus, InsertOrUpdateUserAttemptQuestions, TestcasesResult, StackAssessmentEvaluationData, sectionDurationDto, bulkInsertSectionDto, UpdateAssessmentQuestionDuration, GetEditorCode, AutoSaveUserCodingQuestion, ProgressFilter, ProficiencyChartData, MarkAsEvaluationDto, GetCurrentQuestionAnswer } from './../field';
import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { TestService } from '../test.service';
import { UserAssessmentQuestionsDto, AssessmentSections, QuestionDetailDto } from '../field';
import { Constants } from '@app/models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionStatus, ScheduleResultType, ProctoringSetting, MarkedForReviewStatus } from '@app/enums/test';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CodingAssessmentComponent } from '../types/coding-assessment/coding-assessment.component';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { DOCUMENT } from '@angular/common';
import { InstructionsComponent } from '../instructions/instructions.component';
import { HintComponent } from '../hint/hint.component';
import { ExecutionConfig, ProctoringConfig, wheeboxProctoringConfig } from '../../admin/assessment/assessment';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '@app/admin/users/users.service';
import { UserDto } from '@app/admin/users/users';
import { AssessmentType, AdaptiveAssessmentType, UserAssessmentStatus, ProctoringResult, ProctorType, CampaignValidationErrors } from '@app/enums/assessment';
import { OverAllProctorStatus, ValidateAssessment } from 'account/pre-assessment/pre-assessment-details';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { ViolationLog } from '../test-data';
import { WheeboxComponent } from '../wheebox/wheebox.component';
import { UtilsService } from 'abp-ng2-module';
import { shuffle } from 'lodash';
import { Helper } from '@app/shared/helper';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { finalize } from 'rxjs/operators';
import { environment as env } from "../../../environments/environment";
import { ValidateCampaignRequestDto, ValidateCampaignResultDto } from '@app/admin/campaign/campaign';
import { CampaignService } from '@app/admin/campaign/campaign.service';
import { Formula } from "../formula";

declare function checkOverallProctoringStatus(): any;
declare function stopcamera(): any;
declare function stopCapture(): any;

declare function StartMonitoring(userVal, sButtonRequired, className): any;
declare function endExam();

export interface proficiencyChartMetrics {
  resultChartData: Array<any>;
  resultChartLabels: Array<any>;
  resultChartOptions: any;
  resultChartLegend: boolean;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class TestComponent implements OnInit, OnDestroy, AfterViewInit {
  currentTenantId: number = this.appSessionService.tenantId;
  currentUserId: number = this.appSessionService.userId;
  testDetails: any[] = [];
  assessmentDetails: UserAssessmentQuestionsDto;
  assessmentTestDetails: UserAssessmentQuestionsDto;
  assessmentSections: AssessmentSections[] = [];
  assessmentQuestions: QuestionDetailDto[] = [];
  assessmentScheduleIdNumber: string;
  users: UserDto;
  isSideDivShow: boolean = false;
  customArgs: string;
  constants = Constants;
  proctoringMessage: string;
  @ViewChild(DynamicFormComponent) dynamicForm: any;
  @ViewChild(CodingAssessmentComponent) questionDetails: QuestionDetailDto[];
  @ViewChild('testTaker') fs: ElementRef;
  @ViewChild(WheeboxComponent) wheeboxComponent: any;
  wheeboxProctoringConfig: wheeboxProctoringConfig;
  viewCalculator: boolean = false;
  isScientific: boolean = false;
  totalUnread: number = 0;
  totalAttempted: number = 0;
  totalMarkedForReview: number = 0;
  totalSkipped: number = 0;
  isFirstQuestion: boolean = false;
  isLastQuestion: boolean = false;
  activeClass: string = 'btn btn-info btn-sm border-circle m-10';
  infoClass: string = 'btn btn-info btn-sm m-0';
  statusClass: string;
  question_toggle: boolean = false;
  lastSavedTime: string;
  isEnableCalculator: boolean = false;
  config: CountdownConfig = { leftTime: 0, notify: [] };
  notify = '';
  markedForReviewStatus = MarkedForReviewStatus;
  scheduleDuration: number = 0;
  extraTimeDuration: number = 0;
  helper = Helper;
  cutOffTime: string;
  assessmentType = AssessmentType;
  adaptiveAssessmentType: any;
  adaptiveAssessmentTypes = AdaptiveAssessmentType;
  isAdaptiveAssessment: boolean = false;
  isSubmitAdaptiveAssessment: boolean = false;
  public proficiencyChartData: Array<ProficiencyChartData> = [];
  proficiencyChartMetrics: proficiencyChartMetrics;
  isSkillCompleted: boolean = false;
  @ViewChild('completedSkillProficiencyJourneyChart') skillProficiencyJourneyChart;
  skillProficiencyModal: any;
  skillProficiencyJourneyModalTitle: string = '';
  codeBasedQuestionAvailable: boolean = false;
  isInfosys: boolean = false;
  questionsStatus: any[] = [
    { "status": QuestionStatus.Unread, "count": 0, "class": "outline-secondary", "label": Constants.unread },
    { "status": QuestionStatus.Attempted, "count": 0, "class": "success", "label": Constants.attempted },
    { "status": QuestionStatus.MarkedForReview, "count": 0, "class": "warning", "label": Constants.forReview },
    { "status": QuestionStatus.Skipped, "count": 0, "class": "danger", "label": Constants.skipped }];

  currentQuestion: QuestionDetailDto;
  currentSectionName: string = '';
  questionsCount: number = 0;
  userAssessmentStatus = UserAssessmentStatus;

  assessmentScheduleId: number;
  assessmentId: number | null = null;
  isPreview: boolean = true;
  emailAddress: string;
  highlightTimer: boolean = false;
  blinkTimer: boolean = false;
  timeLeft10Min: number = 10 * 60;
  timeLeft5Min: number = 5 * 60;
  timeLeft2Min: number = 2 * 60;
  isNotified: boolean;
  configJson: string;
  executionConfig: ExecutionConfig;
  previousButtonClass: string = 'btn btn-info m-r-20 btn-sm';
  nextButtonClass: string = 'btn btn-success btn-sm';
  disabledClass: string = 'btn btn-secondary btn-sm m-r-20';
  stopSharingCount: number = 0;
  isSubmitDisabled: boolean = true;
  isVMBasedAssessment: boolean = false;
  currentSpeed: number;
  averageSpeed: number;
  speedMeasurements: number[] = [];
  speedInterval: any;
  elem: any;
  @ViewChild('terminationModal') templateRef: TemplateRef<any>;
  @ViewChild('confirmationModal') confirmTemplateRef: TemplateRef<any>;
  questionTotalDuration: number = 0;
  currentViolationCount: number = 0;
  proctoringConfig: ProctoringConfig;
  availedHintId: number[] = [];
  isSubmitted: boolean = false;
  isProctoringViolated: boolean = false;
  violatedProctoringSetting: ProctoringSetting;
  proctoringViolationMessage: string = '';
  blinkerInterval: NodeJS.Timeout;
  browserPrefixes = ['moz', 'ms', 'o', 'webkit'];
  testcases: TestcasesResult[];
  token: string;
  userRegisterData: string;
  interval: NodeJS.Timeout;
  @ViewChild('warningModal') warningModal: TemplateRef<any>;
  isWarningPopUpShown: boolean = false;
  warningMessage: string = Constants.pleaseEnableCameraAndMicrophoneAccessToResumeTheTest;
  isCameraDisabled: boolean = true;
  isProctoringStarted: boolean = false;
  currentSelectedSectionQuestions: QuestionDetailDto[] = [];
  currentSelectedSection: AssessmentSections;
  isStatusClicked: boolean = false;
  isStack: boolean;
  isCloud: boolean;
  isTestAvailable: boolean = false;
  remainingAttempts: number = 0;
  moveOtherQuestion: string;
  otherQuestion: any;
  violationLog: ViolationLog[] = [];
  proctoringStatusInterval: NodeJS.Timeout;
  terminateProctor: boolean = false;
  screenPause: boolean = false;
  authUser: boolean = false;
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  viewBySection: boolean;
  assessmentStopped: boolean = false;
  isProctorFirstCallBack: boolean = true;
  timeUtilized: number = 0;
  attempted: number = 0;
  skipped: number = 0;
  markedForReview: number = 0;
  isCollaborativeMember: boolean = false;
  sourceOfSchedule: string;
  isTabFocused: boolean = false;
  tenantName: string;
  aeyeCommunicationWSS: WebSocket;
  aeyeTestTakerId: string;
  aeyeExamId: string;
  isQuestionsLoading: boolean = false;
  isReload: boolean = false;
  isCustomThemeEnabled: boolean = false;
  campaignScheduleIdNumber: string;
  campaignName: string;
  isAdaptiveSectionSubmission: boolean = false;
  documentTitile: string = '';
  isCopyPasteEnabledForCoding: boolean = false;
  hasChatBotClass: boolean = false;
  elapsedTimeInSeconds: number = 0;
  thirtyMins: number = 1800;
  actualAssessmentDuration: number = 0;
  vmCookieRemainingTime: string;
  submitAssessmentVariable: boolean = false;
  isProctorEnabled: boolean;
  proctorType: number;
  isAssessmentInProgress: boolean = false;


  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private testService: TestService,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private cookieService: CookieService,
    private assessmentService: AssessmentService,
    private router: Router,
    private modalService: NgbModal,
    private appSessionService: AppSessionService,
    private dataService: dataService,
    private _utilsService: UtilsService,
    private userService: UserService,
    private renderer: Renderer2,
    private spinner: SpinnerVisibilityService,
    private campaignService: CampaignService,
    @Inject(DOCUMENT) private document: any) {
    // window.addEventListener('beforeunload', (event) => {
    //   this.onWindowClose();
    //   event.returnValue = true;
    // });
    if (window.location !== window.parent.location) {
      // in iframe
    } else {
      window.location.hash = "no-back-button";
      window.location.hash = "Again-No-back-button";
      window.onhashchange = function () { window.location.hash = "no-back-button"; };
    }
  }
  formula = new Formula("0");

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    let key = event.key.toString();
    let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
    if (digits.indexOf(key) != -1) {
      this.addSymbol(key, false);
    }
    if (event.keyCode == 8) {
      this.removeSymbol();
    }
    if (event.keyCode == 13) {
      this.calculate();
    }
    if (event.keyCode == 27) {
      this.clear();
    }
    let operations = ["+", "-", "*", "/"];
    if (operations.indexOf(key) != -1) {
      this.setOperation(key);
    }
    if (key == "%") {
      this.singleton("percent", -1);
    }
  }

  addBracket(value: string): void {
    this.formula.addBracket(value);
  }

  getFormula() {
    return this.formula.get();
  }

  clear(): any {
    return this.formula.clear();
  }

  setRadians(): boolean {
    let switcher = !this.getRadians();
    return this.formula.setRadians(switcher);
  }

  secondScreen(): boolean {
    let screen = !this.formula.secondScreen;
    this.formula.secondScreen = screen;
    return screen;
  }

  getScreen(): boolean {
    return this.formula.secondScreen;
  }

  getRadians(): boolean {
    return this.formula.radians;
  }

  sumToMemory() {
    this.formula.sumToMemory();
  }

  deductToMemory() {
    this.formula.deductToMemory();
  }

  clearMemory() {
    this.formula.clearMemory();
  }

  readMemory(): string {
    return this.formula.readMemory();
  }

  statusMemory(): boolean {
    return this.formula.in_memory;
  }

  valueMemory(): number {
    return this.formula.memory;
  }

  getOperand(): string {
    let o = this.formula.operation;
    if (o == "*") return "&#215;";
    return o;
  }

  resetOperand() {
    this.formula.operation = "";
  }

  singleton(operand: string, data: any): number {
    return this.formula.singleton(operand, data);
  }

  setOperation(operand: string): void {
    this.formula.setOperation(operand);
  }

  addSymbol(value: string, start: boolean = false): void {
    this.formula.addValue(value, start);
  }

  removeSymbol(): void {
    this.formula.removeSymbol();
  }

  calculate(): string {
    if (this.formula.is_operand == true || this.formula.stack.length < 2)
      return;
    this.formula.stack.push(this.formula.formula);
    let value = this.formula.calculate().toString();
    this.resetOperand();
    return value;
  }

  showCameraWarning(): void {
    this.modalService.open(this.warningModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    this.isWarningPopUpShown = true;
  }

  proficiencyChart(): void {
    this.proficiencyChartMetrics = {
      resultChartData: [
        {
          data: this.proficiencyChartData,
          pointRadius: 4,
          pointHoverRadius: 4,
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

  mapIdToProficiency(proficiencyId: number): string {
    let proficiencyLevelName: string;
    switch (proficiencyId) {
      case 1:
        proficiencyLevelName = Constants.beginner;
        break;
      case 2:
        proficiencyLevelName = Constants.intermediate;
        break;
      case 3:
        proficiencyLevelName = Constants.advanced;
        break;
    }
    return proficiencyLevelName;
  }

  resumeTest() {
    if (this.assessmentTestDetails.proctorType === ProctorType.Aeye)
      this.startAeyeProctoring();
    else {
      if (this.isWarningPopUpShown || this.isCameraDisabled) {
        this.isWarningPopUpShown = false;
        this.modalService.dismissAll(true);
        this.startWheeboxProctoring();
        setTimeout(() => {
          if (this.proctoringConfig && this.proctoringConfig.EnableFullScreenMode) {
            this.setProctoringMessage();
          }
        }, 3000);
      }
      this.isCameraDisabled = false;
    }
  }



  startTimer() {
    this.interval = setInterval(() => {
      let media = navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      media.then(() => {
        this.isCameraDisabled = false;
        this.resumeTest();
      })
        .catch(() => {
          if (!this.isWarningPopUpShown)
            this.showCameraWarning();
        });
    }, 2000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  resetPopup() {
    this.isWarningPopUpShown = !this.isWarningPopUpShown;
  }

  ngOnInit(): void {
    this.isInfosys = this.dataService.checkTenantId(this.currentTenantId) === 'Infosys' ? true : false;
    this.speedInterval = setInterval(() => {
      this.getInternetSpeed();
    }, 2000);
    if (localStorage.getItem(Constants.chatbot)) {
      if (!document.getElementById('chatbot') && !this.isInfosys) {
        let chatbotConfig = JSON.parse(localStorage.getItem(Constants.chatbot));

        if (!chatbotConfig.iscustomArgs && !chatbotConfig.isIrisIntegrated && !chatbotConfig.disableCaptcha) {
          const element = document.querySelector('[data-id="zsalesiq"]');
          if (element)
            this.renderer.setStyle(element, 'display', 'block');
          this.loadJsScript("assets/chatbot/chatbot-script.js");
        }

      }
    };
    if (localStorage.getItem(Constants.violationLog)) {
      this.violationLog = JSON.parse(localStorage.getItem(Constants.violationLog));
      this.stopSharingCount = this.violationLog.length;
    }
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    if (bool === "true")
      this.authUser = true;
    this.getUserDetails();
    this.dataService.customArgs.subscribe(data => {
      if (data)
        this.customArgs = data;
      else {
        this.customArgs = localStorage.getItem(Constants.customArgs);
      }
    });

    this.sourceOfSchedule = localStorage.getItem(Constants.sourceOfSchedule);

    this.dataService.ideLaunched.subscribe(data => {
      if (data) {
        this.launchIde();
      }
    });

    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const userAssessmentData = atob(params['assessment']).split('/');
        if (userAssessmentData.length > 1) {
          this.currentTenantId = parseInt(userAssessmentData[0]);
          this.assessmentScheduleIdNumber = userAssessmentData[1];
          this.emailAddress = userAssessmentData[2];
          this.tenantName = userAssessmentData[3];
          this.campaignScheduleIdNumber = userAssessmentData[4];
          this.campaignName = userAssessmentData[5] ? userAssessmentData[5] : '';
          this.isPreview = false;
        }
        else
          this.assessmentId = parseInt(userAssessmentData[0]);

        this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.currentTenantId);
        if (this.isPreview === false) {
          if (this.campaignScheduleIdNumber) {
            this.validateCampaign();
          } else {
            if (!this.isAssessmentInProgress)
              this.validateAssessment();
          }
        }
        else
          this.getTestDetails();
      }
      else {
        this.toastrService.error(Constants.anIssueOccuredPleaseContactTheAdministrator);
      }
    });

    // this.loadJdoodleJSScripts();
  }
  async getInternetSpeed() {
    try {
      const speed = await this.calculateInternetSpeed();
      this.currentSpeed = speed;
      this.speedMeasurements.push(speed);
      this.calculateAverageSpeed();
    } catch (error) {
      console.error(error);
    }
  }

  calculateAverageSpeed() {
    const totalSpeed = this.speedMeasurements.reduce((acc, val) => acc + val, 0);
    this.averageSpeed = totalSpeed / this.speedMeasurements.length;
  }

  async calculateInternetSpeed(): Promise<number> {
    return new Promise((resolve, reject) => {
      const nav: any = navigator;
      if (nav.connection && nav.connection.downlink) {
        resolve(nav.connection.downlink);
      } else {
        reject("Connection API not supported");
        this.currentSpeed = -1;
        this.averageSpeed = -1;
      }
    });
  }

  public loadJsScript(src: string): HTMLScriptElement {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.id = 'chatbot';
    this.renderer.appendChild(window.document.body, script);
    return script;
  }

  ngAfterViewInit(): void {
    this.dataService.countDown = this.countdown;
  }

  validateCampaign() {
    let data: ValidateCampaignRequestDto = {
      scheduleIdNumber: this.campaignScheduleIdNumber,
      tenantId: this.currentTenantId,
      emailAddress: this.emailAddress,
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber
    };
    this.campaignService.validateUserCampaign(data).subscribe(res => {
      if (res.success) {
        const campaignResult = res.result;
        if (!campaignResult.isAvailable) {
          this.handleErrorCode(campaignResult);
          return;
        }
        this.validateAssessment();
      }
    });
  }

  handleErrorCode(campaignResult: ValidateCampaignResultDto) {
    const errorCode = campaignResult.errorCode;
    let errorMessage = "";
    switch (errorCode) {
      case CampaignValidationErrors.LinkInActive:
        errorMessage = Constants.driveLinkIsCurrentlyInActivePleaseContactAdministrator;
        break;
      case CampaignValidationErrors.FirstLevelAlreadyTaken:
        errorMessage = Constants.driveFirstLevelIsAlreadyTakenPleaseLoginAndContinueNextLevel;
        break;
      case CampaignValidationErrors.AssessmentAlreadyTaken:
        errorMessage = Constants.youHaveAlreadyTakenThisDriveAssessment;
        break;
      case CampaignValidationErrors.CampaignAlreadyTaken:
        errorMessage = Constants.youHaveAlreadyCompletedThisDrive;
        break;
      case CampaignValidationErrors.CampaignNotAvailableForUser:
        errorMessage = Constants.givenDriveScheduleIsNotAvailableForThisUserPleaseContactAdministrator;
        break;
      case CampaignValidationErrors.DomainRestriction:
        errorMessage = Constants.domainIsInvalidPleaseTakeTheAssessmentWithValidEmail;
        break;
      case CampaignValidationErrors.ValidityNotStartedOrExpired:
        errorMessage = Constants.driveValidityIsNotStartedOrExpired;
        break;
      case CampaignValidationErrors.CampaignNotAvailable:
        errorMessage = Constants.driveIsCurrentlyNotAvailablePleaseContactAdministrator;
        break;
    }
    this.router.navigate(['../../invalid-request', { tenantAdminEmailAddress: '', tenantId: this.currentTenantId, errorCode: campaignResult.errorCode, errorMessage: errorMessage, startTime: campaignResult.startDateTime, endTime: campaignResult.endDateTime }], { relativeTo: this.activatedRoute });
  }

  validateAssessment(): void {
    let data: ValidateAssessment = {
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
      emailAddress: this.emailAddress,
      tenantId: this.currentTenantId
    };
    this.assessmentService.validateUserAssessment(data).subscribe(res => {
      if (!res.result.isAvailable) {
        this.isTestAvailable = false;
        this.router.navigate(['../../invalid-request'], { relativeTo: this.activatedRoute });
      }
      else {
        this.getTestDetails();
      }
    });
  }

  startWheeboxProctoring() {
    this.isProctoringStarted = true;
    let studentId = localStorage.getItem(Constants.studentUniqueId);
    let attemptId = parseInt(localStorage.getItem(Constants.attemptId));
    let studentName = localStorage.getItem(Constants.studentName);
    let mappingType = "soft";
    if (this.wheeboxProctoringConfig.IsHardMapping && this.wheeboxProctoringConfig.IsHardMapping !== null && this.wheeboxProctoringConfig.IsHardMapping === true) {
      mappingType = "hard";
    }
    let isScreenSharing = false;
    if (this.wheeboxProctoringConfig.IsScreenSharing && this.wheeboxProctoringConfig.IsScreenSharing !== null && this.wheeboxProctoringConfig.IsScreenSharing === true) {
      isScreenSharing = true;
    }
    let userDetail = { "student_unique_id": studentId, "student_name": studentName, "attemptId": attemptId, "recordsession": "", "screencapture": isScreenSharing, "pmapping": mappingType };
    if (this.wheeboxProctoringConfig.VideoRecording !== undefined && this.wheeboxProctoringConfig.VideoRecording === true) {
      userDetail = { "student_unique_id": studentId, "student_name": studentName, "attemptId": attemptId, "recordsession": "enabled", "screencapture": isScreenSharing, "pmapping": mappingType };
    }
    let token = localStorage.getItem(Constants.token);
    this.wheeboxComponent.startClientLiveVideoStreamingWithUser(userDetail, token, this.wheeboxProctoringConfig.FaceCheck, this.wheeboxProctoringConfig.SuspiciousObjectCheck);
    this.wheeboxComponent.showCameraIcon();
    if (this.wheeboxProctoringConfig.LiveProctoring) {
      this.checkOverAllReport();
    }
  }

  disableDragging(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  showCalculator() {
    this.viewCalculator = !this.viewCalculator;
  }
  changeCalculator() {
    this.isScientific = !this.isScientific;
  }

  checkOverAllReport() {
    setTimeout(() => {
      this.proctoringStatusInterval = setInterval(() => {
        var status = checkOverallProctoringStatus();
        const overAllStatus: OverAllProctorStatus = status;
        if (!this.isProctorFirstCallBack)
          this.onProctorStatusCheck(overAllStatus);
        this.isProctorFirstCallBack = false;
      }, 3000);
    }, 10000);
  }

  onProctorStatusCheck(status: OverAllProctorStatus) {
    this.terminateProctor = this.terminateProctor === false ? !status.forcesubmit : undefined;
    if (!status.forcesubmit && this.terminateProctor) {
      this.terminateProctor = undefined;
      this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceProctorFoundSuspicious;
      this.isProctoringViolated = true;
      this.violatedProctoringSetting = ProctoringSetting.SuspiciousObjectCheck;
      this.endTestOnViolation();
      this.toastrService.warning(Constants.yourTestHasBeenTerminatedSinceProctorFoundSuspicious);
      return;
    } else if (status.pausestatus && this.screenPause !== status.pausestatus) {
      this.screenPause = status.pausestatus;
      this.countdown.pause();
      this.toastrService.warning(Constants.yourTestHasBeenPausedSinceProctorFoundSuspicious);
      return;
    } else if (!status.pausestatus && this.screenPause !== status.pausestatus) {
      this.screenPause = status.pausestatus;
      this.countdown.resume();
      this.toastrService.warning(Constants.yourTestHasBeenResumed);
      return;
    }
  }

  @HostListener("window:aeye.startMonitoringCallbackEvent", ['$event'])
  initiateMonitoring(event) {
    this.spinner.hide();
    const data = event?.detail;
    this.aeyeTestTakerId = data.test_taker_id;
    this.aeyeExamId = data.exam_id;
    this.onLoadTestDetails();
    this.onViolationHandling();
  }

  onViolationHandling() {
    const url = `${env.aeyeWSSUrl}${this.assessmentDetails.assessmentScheduleId}-commonchannel`;
    this.aeyeCommunicationWSS = new WebSocket(url);

    this.aeyeCommunicationWSS.onmessage = event => {
      const receivedEvent = JSON.parse(event.data).message.data;
      if (this.users.emailAddress === receivedEvent.alert_for) {
        switch (receivedEvent.exam_event) {
          case Constants.terminateExam:
            this.isProctoringViolated = true;
            this.endTestOnViolation();
            if (receivedEvent.terminated_by !== Constants.aEyeProctor) {
              this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceProctorFoundSuspicious;
              this.toastrService.warning(Constants.yourTestHasBeenTerminatedSinceProctorFoundSuspicious);
            }
            else {
              this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYouHaveReachedTheViolationLimit;
              this.toastrService.warning(Constants.yourTestHasBeenTerminatedSinceYouHaveReachedTheViolationLimit);
            }
            return;
          case Constants.pauseExam:
            this.screenPause = true;
            this.countdown.pause();
            this.toastrService.warning(Constants.yourTestHasBeenPausedSinceProctorFoundSuspicious);
            return;
          case Constants.resumeExam:
            this.screenPause = false;
            this.countdown.resume();
            this.toastrService.warning(Constants.yourTestHasBeenResumed);
            return;
          case Constants.roomScan:
            // do nothing
            return;
        }
      }
    };

    this.aeyeCommunicationWSS.onerror = event => {
      console.log(event);
    };
    this.aeyeCommunicationWSS.onclose = event => {
      console.log(event);
    };
  }

  startAeyeProctoring() {
    const startMonitoringCallback = (event) => {
      let callbackEvent = new CustomEvent("aeye.startMonitoringCallbackEvent", {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(callbackEvent);
    };
    this.spinner.show();
    StartMonitoring({
      exam_id_from_lms: this.assessmentTestDetails.assessmentScheduleId,
      email: this.emailAddress,
      tenant_name: env.aeyeTenantName,
      api_key: env.aeyeApiKey,
      attempt_id: this.assessmentTestDetails.attemptNumber,
      attempt_timestamp: new Date().toISOString(),
      additional_information: { sub_tenant_name: this.tenantName },
      startMonitoringCallback: startMonitoringCallback.toString()
    }, false, '');
  }

  ngOnDestroy() {
    if (this.isTestAvailable && !this.isSubmitted && !this.isPreview && !this.dataService.isSaveAndExit) {
      this.submitAssessment();
    }
    if (this.dataService.autoSaveCall) {
      clearInterval(this.dataService.autoSaveCall);
    }
    document.removeAllListeners();
    window.removeAllListeners();

    if (this.isTestAvailable && !this.isPreview && this.assessmentDetails.proctorType) {
      try {
        this.pauseTimer();
        if (this.assessmentTestDetails.proctorType === ProctorType.Aeye)
          this.aeyeCommunicationWSS.close();
        else {
          this.wheeboxComponent.stopTestProctoring();
          this.wheeboxComponent.hideCameraIcon();
          stopcamera();
        }
      }
      catch (ex) {
        console.error(ex);
      }
    }
    if (this.proctoringStatusInterval) {
      clearInterval(this.proctoringStatusInterval);
    }
    if (localStorage.getItem(Constants.customArgs))
      localStorage.removeItem(Constants.customArgs);

    if (localStorage.getItem(Constants.violationLog)) {
      localStorage.removeItem(Constants.violationLog);
    }

    if (localStorage.getItem(this.constants.enableDragDirective)) {
      localStorage.removeItem(this.constants.enableDragDirective);
    }

    // this.destroyLoadedJSScripts();
  }

  closeFullScreen() {
    const docWithFullScreenExitFunctions = document as Document & {
      mozCancelFullScreen(): Promise<void>;
      webkitExitFullscreen(): Promise<void>;
      msExitFullscreen(): Promise<void>;
    };
    if (docWithFullScreenExitFunctions.exitFullscreen) {
      docWithFullScreenExitFunctions.exitFullscreen();
    }
    /* Firefox */
    else if (docWithFullScreenExitFunctions.mozCancelFullScreen) {
      docWithFullScreenExitFunctions.mozCancelFullScreen();
    }
    /* Chrome, Safari and Opera */
    else if (docWithFullScreenExitFunctions.webkitExitFullscreen) {
      this.document.webkitExitFullscreen();
    }
    /* IE/Edge */
    else if (docWithFullScreenExitFunctions.msExitFullscreen) {
      docWithFullScreenExitFunctions.msExitFullscreen();
    }
  }
  @HostListener('window:focus', ['$event'])
  blinkTab() {
    this.isTabFocused = true;
  }
  handleEvent(e: CountdownEvent) {
    const originalTitle = this.document.title;
    this.documentTitile = this.document.title;
    const blinkTitle = Constants.hurryUpOnlyFewMinutesLeft;
    const questionTypeId = this.assessmentDetails.assessmentSections[0].questions[0].questionType.id;
    let blink = false;
    this.notify = e.action.toUpperCase();
    if (e.action === Constants.notify) {
      this.isNotified = true;
      if (e.left > (((this.assessmentDetails.duration + this.extraTimeDuration) - this.assessmentDetails.submitEnableDuration) * 60 * 1000)) {
        this.isSubmitDisabled = true;
      }
      else {
        this.isSubmitDisabled = false;
      }
      if (this.isVMBasedAssessment == true && e.left == this.timeLeft10Min * 1000) {
        if (document?.fullscreenElement) {
          document?.exitFullscreen();
        }
        this.toastrService.warning(Constants.youOnlyHave10MinutesLeftPleasePushYourCodeAndExecuteTheTestscriptToCollectYourResults, null, { disableTimeOut: true });
      }
      else if (this.isVMBasedAssessment == true && e.left > this.timeLeft10Min * 1000) {
        let timeLeftInMins = (e.left / 1000);
        if (((this.actualAssessmentDuration * 60) % this.thirtyMins) == (timeLeftInMins % this.thirtyMins)) {
          if (document?.fullscreenElement) {
            document?.exitFullscreen();
          }
          this.toastrService.warning(Constants.executeYourTestCasesToEnsureTheyAreScored, null, { disableTimeOut: true });
        }
      }

      if (e.left <= this.timeLeft5Min * 1000) {
        this.highlightTimer = true;
        if (!this.blinkerInterval) {

          this.blinkerInterval = setInterval(() => {
            if (questionTypeId === this.constants.cloudId && !this.isTabFocused) {
              blink = !blink;
              this.document.title = blink ? blinkTitle : originalTitle;
            } else {
              this.document.title = originalTitle;
            } this.blinkTimer = !this.blinkTimer;
          }, 500);
        }
      }
      this.cookieService.set(Constants.remainingTime, btoa((e.left / 1000).toString()), null, "/", null, true, "None");
    }
    if (this.isNotified && e.action === Constants.done) {
      const nextSectionIndex = this.assessmentSections.indexOf(this.currentSelectedSection) + 1;
      if (this.assessmentSections[nextSectionIndex] && this.viewBySection) {
        let isCodeSubmitted = this.currentQuestion.chosenAnswer && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase() ? true : false;
        let questionUpdateData = this.prepareQuestionUpdateData(isCodeSubmitted);
        this.spinner.show();
        this.testService.insertOrUpdateUserAttemptQuestions(questionUpdateData).subscribe(res => {
          this.spinner.hide();
          if (res && res.result) {
            if (res.result === this.constants.success) {
              let cookieTimer = this.cookieService.get(Constants.remainingTime);
              this.insertSectionDuration(cookieTimer);
              this.changeToSection(this.assessmentSections[nextSectionIndex]);
              this.modalService.dismissAll();
              this.toastrService.warning(Constants.sectionTimeExpiredAndYouAreInNextSection);
            }
            else if (res.result === this.constants.failure) {
              this.toastrService.error(this.constants.sessionInvalid);
            }
            else if (res.result === this.constants.inActiveSchedule) {
              this.toastrService.error(this.constants.inActiveAssessment);
            }
          }
        }, error => {
          console.error(error);
          this.spinner.hide();
          if (error && error.status && error.status == 401) {
            this.toastrService.error(this.constants.sessionInvalid);
          }
        });
      } else {
        clearInterval(this.blinkerInterval);
        this.assessmentStopped = true;
        if (this.isAdaptiveAssessment)
          this.isSubmitAdaptiveAssessment = true;
        this.submitAssessment();
      }
    }
  }



  getTestDetails(): void {
    let requestData: GetAssessmentQuestions = {
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
      emailAddress: this.emailAddress,
      assessmentId: this.assessmentId,
      isPreview: this.isPreview,
      externalArgs: this.customArgs,
      customField: localStorage.getItem(this.constants.customField),
      wheeboxAttemptId: parseInt(localStorage.getItem(Constants.attemptId)),
      campaignScheduleIdNumber: this.campaignScheduleIdNumber
    };
    this.isQuestionsLoading = true;
    this.testService.getUserAssessmentQuestions(requestData).subscribe(res => {
      this.isQuestionsLoading = false;
      if (res && res.success && res.result) {
        this.assessmentTestDetails = res.result;
        if (!this.isPreview && this.assessmentTestDetails.proctorType === ProctorType.Aeye) {
          this.startAeyeProctoring();
          return;
        }
        else {
          this.onLoadTestDetails();
        }
      }
      else {
        this.isReload = true;
      }
    }, error => {
      console.error(error);
      this.isQuestionsLoading = false;
      this.isReload = true;
    });
  }

  onLoadTestDetails() {
    this.isAssessmentInProgress = true;
    this.assessmentDetails = this.assessmentTestDetails;
    if (this.assessmentDetails.assessmentType === AssessmentType.Adaptive) {
      this.isAdaptiveAssessment = true;
      this.setProficiencyJourney(this.assessmentDetails.proficiencyJourney);
    }
    if (this.assessmentDetails.startDateTime !== null) {
      let difference = new Date(this.assessmentDetails.startDateTime).getMinutes() + (this.assessmentDetails.cutOffTime);
      var cutOffDate = new Date(this.assessmentDetails.startDateTime);
      cutOffDate.setMinutes(difference);
      this.cutOffTime = cutOffDate.toISOString();
    }
    this.viewBySection = this.assessmentDetails.sectionDuration?.length > 0 ? true : false;
    this.scheduleDuration = this.assessmentDetails.duration;
    if (!this.isPreview && this.assessmentDetails.proctoringConfig && this.assessmentDetails.proctorType !== ProctorType.Aeye) {
      this.proctoringConfig = JSON.parse(this.assessmentDetails.proctoringConfig) as ProctoringConfig;
      if (this.assessmentDetails.isProctoringEnabled && (!this.assessmentDetails.enableWheeboxProctoring || !this.proctoringConfig.EnableFullScreenMode)) {
        this.enableProctoringSettings();
      }
    }
    if (!this.isPreview && this.assessmentTestDetails.enableWheeboxProctoring && this.assessmentTestDetails.proctorType === ProctorType.Wheebox) {
      if (!this.isCameraDisabled) {
        this.startWheeboxProctoring();
      }
      else {
        this.showCameraWarning();
      }
      this.startTimer();
    }
    if (!this.isPreview && this.assessmentDetails.wheeboxProctoringConfig && this.assessmentDetails.proctorType === ProctorType.Wheebox) {
      this.wheeboxProctoringConfig = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig) as wheeboxProctoringConfig;
    }
    this.assessmentDetails.isPreview = this.isPreview;
    this.assessmentSections = this.assessmentDetails.assessmentSections;
    this.currentSelectedSection = this.assessmentDetails.assessmentType === AssessmentType.Adaptive ?
      this.assessmentSections.find(x => x.assessmentSectionId === this.assessmentDetails.currentSectionId) : this.assessmentSections[0];
    this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
    let lastSelectedAssessmentSection;
    if (this.viewBySection) {
      lastSelectedAssessmentSection = this.getLastSelectedSection();
      this.currentSelectedSection = lastSelectedAssessmentSection ? lastSelectedAssessmentSection : this.assessmentSections[0];
      this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
      this.cookieService.set(Constants.currentSectionId, btoa(JSON.stringify(this.currentSelectedSection.assessmentSectionId)), null, "/", null, true, "None");
    }
    this.assessmentScheduleId = this.assessmentDetails.assessmentScheduleId;
    this.setAssessmentSections();

    //for hold the MFA timer
    if (this.assessmentDetails.assessmentSections[0].questions.length > 0)
      var questionTypeId = this.assessmentDetails.assessmentSections[0].questions[0].questionType.parentQuestionTypeId;
    if (questionTypeId !== this.constants.stackTypeId) {
      if (this.viewBySection) {
        this.extraTimeDuration = this.assessmentDetails.extraTime;
        const lastSelectedSectionId = this.cookieService.get(Constants.currentSectionId);
        const duration = lastSelectedAssessmentSection ? this.getSectionBasedDuration(parseInt(atob(lastSelectedSectionId))) :
          (this.assessmentDetails.sectionDuration?.length > 0 ? this.assessmentDetails.sectionDuration[0].duration : undefined);
        this.setTimer(duration + this.extraTimeDuration);
      } else {
        this.extraTimeDuration = this.assessmentDetails.extraTime;
        this.setTimer(this.assessmentDetails.duration + this.extraTimeDuration);
      }

    }
    this.isCopyPasteEnabledForCoding = this.assessmentDetails.isCopyPasteEnabledForCoding;
    this.currentQuestion = lastSelectedAssessmentSection ?
      this.assessmentQuestions[this.assessmentQuestions.indexOf(lastSelectedAssessmentSection.questions[0])] : this.assessmentQuestions[0];
    this.isCheckCodeBasedType(this.currentQuestion);
    this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
    this.isFirstQuestion = true;
    this.isLastQuestion = this.assessmentDetails.totalQuestions > 1 ? false : true;
    this.isProctorEnabled = (this.assessmentDetails.isProctoringEnabled || this.assessmentDetails.proctorType != null);
    this.dynamicForm = DynamicFormComponent;
    this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
    this.questionDetails = this.assessmentQuestions;
    const questTypeId = this.assessmentDetails.assessmentSections[0].questions[0].questionType.id;
    if (questTypeId === this.constants.cloudId) {
      this.startStackTimer();
    }
    this.startExtraDurationTimer();
  }

  isCheckCodeBasedType(isCodeBasedQuestion: QuestionDetailDto) {
    if (isCodeBasedQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
      if (!this.currentQuestion.isCodeSubmitted) {
        this.lastSavedTime = null;
        this.dataService.autoSaveCall = setInterval(() => {
          this.autoSave();
        }, 120000);
      }
      else {
        clearInterval(this.dataService.autoSaveCall);
        this.isLastSavedTime();
      }
    }
    else {
      clearInterval(this.dataService.autoSaveCall);
      this.lastSavedTime = null;
    }
  }

  isLastSavedTime() {
    let data: GetEditorCode = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      questionId: this.currentQuestion.questionId,
      assessmentScheduleId: this.currentQuestion.assessmentScheduleId,
      assessmentId: this.currentQuestion.assessmentId,
      timeZone: Helper.getTimeZone()
    };
    this.testService.getLastSavedTime(data).subscribe(res => {
      if (res.result) {
        this.lastSavedTime = res.result;
      }
    });
  }

  getLastSelectedSection(): any {
    const lastSelectedSectionId = this.cookieService.get(Constants.currentSectionId);
    if (lastSelectedSectionId) {
      const id = parseInt(atob(lastSelectedSectionId));
      return this.assessmentSections.filter(obj => obj.assessmentSectionId === id)[0];
    }
    return null;
  }

  setTimer(duration: number) {
    this.config = { leftTime: duration * 60, notify: [this.timeLeft5Min, this.timeLeft2Min] };
    let cookieTimer = this.cookieService.get(Constants.remainingTime);
    if (cookieTimer)
      duration = parseInt(atob(cookieTimer)) / 60;
    let timer = [...Array(Math.floor(duration * 60))].map((_, i) => i).filter(x => x > 0 && (duration * 60) > x);
    let remainingTime = cookieTimer ? (duration * 60) : (duration * 60) - this.questionTotalDuration;
    this.config = { leftTime: remainingTime, notify: [this.timeLeft5Min, this.timeLeft2Min, ...timer] };
  }

  startStackTimer(isVM: boolean = false) {
    this.isVMBasedAssessment = isVM;
    this.actualAssessmentDuration = this.assessmentDetails.duration;
    this.dataService.startTimer(this.currentQuestion.questionId);
    this.config = { leftTime: this.assessmentDetails.duration * 60, notify: [this.timeLeft5Min, this.timeLeft2Min] };
    let cookieTimer = this.cookieService.get(Constants.remainingTime);
    if (cookieTimer)
      this.assessmentDetails.duration = parseInt(atob(cookieTimer)) / 60;
    let timer = [...Array(Math.floor(this.assessmentDetails.duration * 60))].map((_, i) => i).filter(x => x > 0 && (this.assessmentDetails.duration * 60) > x);
    let remainingTime = cookieTimer ? (this.assessmentDetails.duration * 60) : (this.assessmentDetails.duration * 60) - this.questionTotalDuration;
    this.config = { leftTime: remainingTime, notify: [this.timeLeft5Min, this.timeLeft2Min, ...timer] };
    setTimeout(() => {
      this.updateAssessmentQuestionDuration(this);
    }, 120000);
  }

  updateAssessmentQuestionDuration(_this) {
    let currentTimer = parseInt(atob(_this.cookieService.get(Constants.remainingTime))) / 60;
    this.dataService.stopTimer(this.currentQuestion.questionId);
    const durationInMilliSeconds = this.dataService.getTimeSpent(this.currentQuestion.questionId);
    this.dataService.startTimer(this.currentQuestion.questionId);
    let request: UpdateAssessmentQuestionDuration = {
      userAssessmentAttemptId: _this.assessmentDetails.userAssessmentAttemptId,
      currentDuration: _this.scheduleDuration - currentTimer,
      questionId: _this.currentQuestion.questionId,
      durationMilliSeconds: durationInMilliSeconds,
    };
    _this.testService.updateAssessmentQuestionDuration(request).subscribe(res => {
      if (res.success && res.result) {
        if ((currentTimer * 60) > 120 && (_this.dataService.isSaveAndExit !== true || _this.isSubmitted !== true)) {
          _this.callbackAfterTimeout(_this.updateAssessmentQuestionDuration, _this, 120);
        }
      }
    });
  }

  autoSave() {
    let currentTimer = parseInt(atob(this.cookieService.get(Constants.remainingTime))) / 60;
    this.dataService.stopTimer(this.currentQuestion.questionId);
    const autoSavedTime = this.dataService.getTimeSpent(this.currentQuestion.questionId);
    this.dataService.startTimer(this.currentQuestion.questionId);
    let request: AutoSaveUserCodingQuestion = {
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      questionId: this.currentQuestion.questionId,
      answer: this.currentQuestion.chosenAnswer,
      timeZone: Helper.getTimeZone(),
      duration: this.currentQuestion.duration,
      durationMilliSeconds: autoSavedTime,
      languageId: this.currentQuestion.chosenLanguage ? this.currentQuestion.chosenLanguage.languageId : 0,
      userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId,
    };
    this.testService.autoSaveCodingQuestion(request).subscribe(res => {
      if (res.success && res.result) {
        if ((currentTimer * 60) > 120 && (this.dataService.isSaveAndExit !== true || this.isSubmitted !== true)) {
          this.lastSavedTime = res.result;
        }
      }
    });
  }

  callbackAfterTimeout(_callback: any, _arg, _defaultInterval: number = 30) {
    _defaultInterval = _defaultInterval * 1000;
    setTimeout(() => {
      _callback(_arg);
    }, _defaultInterval);
  }

  enableProctoringSettings() {
    if (this.proctoringConfig.EnableFullScreenMode) {
      // user exits out of fullscreen
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && !this.isProctoringViolated) {
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYouViolatedFullscreenProctoring;
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.FullScreen;
          this.endTestOnViolation();
        }
      });
      //user navigates away from exam page and Chatbot termination removed after clickig on the chaticon 
      window.addEventListener('blur', () => {
        if (!this.isProctoringViolated) {
          const element = document.querySelector('[data-id="zsalesiq"]');
          this.hasChatBotClass = element.classList.contains('zsiqfanim');
          localStorage.getItem(Constants.chatbot);
          if (this.hasChatBotClass) {
            this.hasChatBotClass = false;
          }
          else {
            this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYouViolatedFullscreenProctoring;
            this.isProctoringViolated = true;
            this.violatedProctoringSetting = ProctoringSetting.FullScreen;
            this.endTestOnViolation();
            if (document.fullscreenElement)
              this.closeFullscreen();
          }
        }
      });
    }
    else if (this.proctoringConfig.RestrictWindowViolation) {
      let browserPrefix = this.getBrowserPrefix();
      let visibilityChangeEvent = this.getVisibilityEventName(browserPrefix);
      let hiddenProperty = this.getHiddenPropertyName(browserPrefix);
      document.addEventListener(visibilityChangeEvent, function () {
        if (!this.isProctoringViolated && (document.visibilityState === Constants.hidden || document[hiddenProperty])) {
          this.currentViolationCount = this.currentViolationCount + 1;
          if (this.currentViolationCount === this.proctoringConfig.WindowViolationLimit) {
            this.showWarning();
          }
          else if (this.currentViolationCount > this.proctoringConfig.WindowViolationLimit) {
            this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceViolationLimitExceeded;
            this.isProctoringViolated = true;
            this.violatedProctoringSetting = ProctoringSetting.BrowserWindowViolation;
            this.endTestOnViolation();
          }
        }
      }.bind(this));
    }
  }

  getBrowserPrefix() {
    for (let i = 0; i < this.browserPrefixes.length; i++) {
      if (this.getHiddenPropertyName(this.browserPrefixes[i]) in document) {
        return this.browserPrefixes[i];
      }
    }
    return null;
  }

  getHiddenPropertyName(prefix: string): string {
    return (prefix ? prefix + Constants.hiddenSuffix : Constants.hidden);
  }

  getVisibilityEventName(prefix) {
    return (prefix ? prefix : '') + Constants.visibilityChange;
  }

  showWarning() {
    this.modalService.open(this.templateRef, { centered: true });
  }

  viewInstructions() {
    this.modalService.open(InstructionsComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  sidebarWidgetClick() {
    if (!this.isSideDivShow) {
      this.isSideDivShow = true;
    }
    else {
      this.isSideDivShow = false;
    }
  }

  openInstructions(invitation: string) {
    this.modalService.open(invitation, { size: 'lg' });
  }

  onQuestionNumberClick(question: QuestionDetailDto): void {
    this.moveOtherQuestion = this.constants.moveToQuestion;
    let answer = '';
    if (this.currentQuestion.serialNumber !== question.serialNumber) {
      this.updateCurrentQuestionToLocal();
      this.otherQuestion = question;
      if (this.currentQuestion.chosenAnswer !== null && this.currentQuestion.chosenAnswer !== '') {
        if (!this.currentQuestion.isCodeSubmitted && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
          let data: GetCurrentQuestionAnswer = {
            questionId: this.currentQuestion.questionId,
            userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
          };
          this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
          })).subscribe(res => {
            if (res.result) {
              answer = this.helper.stripHtml(res.result);
            }
            else if (res.result != null)
              answer = '';
            else
              answer = this.helper.stripHtml(this.currentQuestion.codingAssessment[0].defaultCode);
            let currentAnswer = this.helper.stripHtml(this.currentQuestion.chosenAnswer);
            if (answer != null && answer.replace(/\s+/g, '') !== currentAnswer.replace(/\s+/g, '')) {
              const modalRef = this.modalService.open(ConfirmationComponent, {
                centered: true,
                backdrop: 'static',
                size: 'lg'
              });
              modalRef.componentInstance.submit = this.updateCurrentQuestionToDb.bind(this);
              modalRef.componentInstance.leave = this.leaveQuestion.bind(this);
              modalRef.componentInstance.isExecuteAndSubmit = true;
              modalRef.componentInstance.isMoveOtherQuestion = true;
              modalRef.componentInstance.isResetQuestion = true;
            }
            else {
              clearInterval(this.dataService.autoSaveCall);
              this.moveToClickedQuestion(question);
            }
          });
        }
        else if (this.currentQuestion.questionType.name.toUpperCase() !== this.constants.codeBased.toUpperCase()) {
          this.insertOrUpdateUserAttemptQuestions();
        }
        else {
          this.moveToClickedQuestion(question);
        }
      }
      else {
        if (this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
          clearInterval(this.dataService.autoSaveCall);
        }
        this.insertOrUpdateUserAttemptQuestions();
      }
    }
  }

  moveToClickedQuestion(question: QuestionDetailDto): void {
    this.currentQuestion = question;
    this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
    this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
    this.isCheckCodeBasedType(this.currentQuestion);
    this.dynamicForm.fields = this.currentQuestion;
    this.dynamicForm.isProctorEnabled = this.isProctorEnabled;
    this.dynamicForm.proctorType = this.proctorType;

    if (this.isStatusClicked) {
      this.isFirstQuestion = (this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber) === 0) ? true : false;
      this.isLastQuestion = this.currentSelectedSectionQuestions.indexOf(this.currentQuestion) + 1 === this.currentSelectedSectionQuestions.length ? true : false;
    }
    else {
      this.isFirstQuestion = (this.currentQuestion.serialNumber - 1 === 0) ? true : false;
      this.isLastQuestion = (this.currentQuestion.serialNumber === this.assessmentDetails.totalQuestions) ? true : false;
    }
    this.currentSectionName = this.currentQuestion.assessmentSectionName;
  }

  viewHint(): void {
    this.moveOtherQuestion = '';
    let hint = this.currentQuestion.questionHints.filter(x => !x.isViewed)[0];
    if (hint) {
      hint.isViewed = true;
      this.availedHintId.push(hint.id);
      this.currentQuestion.hintsAvailedJson = JSON.stringify(this.availedHintId);
      this.currentQuestion.hintsAvailed = this.availedHintId.length;
      if (!this.isPreview)
        this.insertOrUpdateUserAttemptQuestions();
    }
    const modalRef = this.modalService.open(HintComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.hintsData = {
      description: !!hint ? hint.description : Constants.noMoreHintsAvailable,
    };
  }

  getUserDetails() {
    const cacheEnabled: boolean = true;
    this.userService.getUser(cacheEnabled).subscribe(user => {
      this.users = user.result;
    });
  }

  gotoPreviousQuestion() {
    this.moveOtherQuestion = this.constants.movePrev;
    let answer = '';
    this.isAdaptiveSectionSubmission = false;
    this.updateCurrentQuestionToLocal();
    if (this.currentQuestion.chosenAnswer !== null && this.currentQuestion.chosenAnswer !== '') {
      if (this.currentQuestion.questionType.name.toUpperCase() === this.constants.subjective.toUpperCase() && !this.isValidJson(this.currentQuestion.chosenAnswer)) {
        this.currentQuestion.chosenAnswer = JSON.stringify(this.currentQuestion.chosenAnswer);
      }
      if (!this.currentQuestion.isCodeSubmitted && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
        let data: GetCurrentQuestionAnswer = {
          questionId: this.currentQuestion.questionId,
          userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
        };
        this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
        })).subscribe(res => {
          if (res.result) {
            answer = this.helper.stripHtml(res.result);
          }
          else if (res.result != null)
            answer = '';
          else
            answer = this.helper.stripHtml(this.currentQuestion.chosenLanguage.defaultCode);
          let currentAnswer = this.helper.stripHtml(this.currentQuestion.chosenAnswer);
          if (answer != null && answer.replace(/\s+/g, '') !== currentAnswer.replace(/\s+/g, '')) {
            const modalRef = this.modalService.open(ConfirmationComponent, {
              centered: true,
              backdrop: 'static',
              size: 'lg'
            });
            modalRef.componentInstance.submit = this.updateCurrentQuestionToDb.bind(this);
            modalRef.componentInstance.leave = this.leaveQuestion.bind(this);
            modalRef.componentInstance.isExecuteAndSubmit = true;
            modalRef.componentInstance.isMoveOtherQuestion = true;
            modalRef.componentInstance.isResetQuestion = true;
          }
          else {
            clearInterval(this.dataService.autoSaveCall);
            this.setPreviousQuestion();
          }
        });
      }
      else if (this.currentQuestion.questionType.name.toUpperCase() !== this.constants.codeBased.toUpperCase()) {
        this.insertOrUpdateUserAttemptQuestions();
      } else {
        this.setPreviousQuestion();
      }
    } else {
      if (this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
        clearInterval(this.dataService.autoSaveCall);
      }
      this.insertOrUpdateUserAttemptQuestions();
    }
  }

  setPreviousQuestion() {
    if (this.currentQuestion.givencount !== 0 && this.currentQuestion.executionCount >= this.currentQuestion.givencount) {
      this.currentQuestion.countExceed = true;
    }
    if (this.isStatusClicked) {
      this.availedHintId.length = 0;
      let currentQuestionIndexNumber = this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber);
      if (currentQuestionIndexNumber) {
        this.currentQuestion = this.currentSelectedSectionQuestions[currentQuestionIndexNumber - 1];
        this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
        this.dynamicForm.fields = this.currentQuestion;
        this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
      }
      this.isFirstQuestion = (this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber) === 0) ? true : false;
      this.isLastQuestion = this.currentSelectedSectionQuestions.indexOf(this.currentQuestion) + 1 === this.currentSelectedSectionQuestions.length ? true : false;
    }
    else if (this.currentQuestion.serialNumber - 1 !== 0) {
      this.availedHintId.length = 0;
      if (this.currentQuestion.serialNumber === this.currentSelectedSectionQuestions[0].serialNumber && !this.viewBySection) {
        let previousQuestion = this.assessmentQuestions.find(x => x.serialNumber === this.currentQuestion.serialNumber - 1);
        let previousSection = this.assessmentSections.find(x => x.assessmentSectionId === previousQuestion.assessmentSectionId);
        this.currentSelectedSectionQuestions = previousSection.questions;
      }
      if (this.currentQuestion.serialNumber === this.currentSelectedSectionQuestions[0].serialNumber && this.viewBySection) {
        this.toastrService.warning(Constants.youCantmoveToPreviousSection);
        return;
      }
      this.currentQuestion = this.assessmentQuestions[this.currentQuestion.serialNumber - 2];
      this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
      this.isCheckCodeBasedType(this.currentQuestion);
      this.dynamicForm.fields = this.currentQuestion;
      this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
      this.isFirstQuestion = (this.currentQuestion.serialNumber - 1 === 0) ? true : false;
      this.isLastQuestion = (this.currentQuestion.serialNumber === this.assessmentDetails.totalQuestions) ? true : false;
    }
  }

  gotoNextQuestion() {
    this.moveOtherQuestion = this.constants.moveNext;
    let answer = '';
    this.isAdaptiveSectionSubmission = (this.isAdaptiveAssessment && this.assessmentQuestions.length === this.currentQuestion.serialNumber === true) ? true : false;
    this.updateCurrentQuestionToLocal();
    if (this.currentQuestion.chosenAnswer !== null && this.currentQuestion.chosenAnswer !== '') {
      if (!this.currentQuestion.isCodeSubmitted && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
        let data: GetCurrentQuestionAnswer = {
          questionId: this.currentQuestion.questionId,
          userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
        };
        this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
        })).subscribe(res => {
          if (res.result) {
            answer = this.helper.stripHtml(res.result);
          }
          else if (res.result != null)
            answer = '';
          else
            answer = this.helper.stripHtml(this.currentQuestion.chosenLanguage.defaultCode);
          let currentAnswer = this.helper.stripHtml(this.currentQuestion.chosenAnswer);
          if (answer != null && answer.replace(/\s+/g, '') !== currentAnswer.replace(/\s+/g, '')) {
            const modalRef = this.modalService.open(ConfirmationComponent, {
              centered: true,
              backdrop: 'static',
              size: 'lg'
            });
            modalRef.componentInstance.submit = this.updateCurrentQuestionToDb.bind(this);
            modalRef.componentInstance.leave = this.leaveQuestion.bind(this);
            modalRef.componentInstance.isExecuteAndSubmit = true;
            modalRef.componentInstance.isMoveOtherQuestion = true;
            modalRef.componentInstance.isResetQuestion = true;
          }
          else {
            clearInterval(this.dataService.autoSaveCall);
            this.onInitNextQuestionConfirmation();
          }
        });
      }
      else if (this.currentQuestion.questionType.name.toUpperCase() !== this.constants.codeBased.toUpperCase()) {
        this.insertOrUpdateUserAttemptQuestions();
      } else {
        this.onInitNextQuestionConfirmation();
      }
    } else {
      this.insertOrUpdateUserAttemptQuestions();
    }
  }

  onInitNextQuestionConfirmation() {
    // check for next section change
    if (this.viewBySection && this.currentQuestion.assessmentSectionId !== this.assessmentQuestions[this.currentQuestion.serialNumber]?.assessmentSectionId) {
      const modalRef = this.modalService.open(ConfirmationComponent, {
        centered: true,
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.submit = this.setNextQuestion.bind(this);
      modalRef.componentInstance.leave = this.resetToDefaultTemplate.bind(this);
      modalRef.componentInstance.isDynamicMessageConfirmation = true;
      modalRef.componentInstance.inputMessage = Constants.sectionChangeConfirmationMessage;
      modalRef.componentInstance.isResetQuestion = true;
    } else if (this.isAdaptiveAssessment && this.assessmentQuestions.length === this.currentQuestion.serialNumber) {
      const modalRef = this.modalService.open(ConfirmationComponent, {
        centered: true,
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.submit = this.evaluateSection.bind(this);
      modalRef.componentInstance.isDynamicMessageConfirmation = true;
      modalRef.componentInstance.inputMessage = "Do you want to submit the section?";
    } else {
      if (this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
        clearInterval(this.dataService.autoSaveCall);
      }
      this.setNextQuestion();
    }
  }

  evaluateSection(): void {
    let data: ProgressFilter = {
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      assessmentScheduleId: this.assessmentScheduleId,
      assessmentSectionId: this.currentSelectedSection.assessmentSectionId,
      userAssessmentMappingId: this.assessmentDetails.userAssessmentMappingId,
      attemptId: parseInt(localStorage.getItem(Constants.attemptId)),
      attemptNumber: parseInt(localStorage.getItem(Constants.attemptNumber)),
      isProctoringViolated: this.isProctoringViolated,
      violatedProctoringSetting: this.violatedProctoringSetting,
      isSubmitAdaptiveAssessment: this.isSubmitAdaptiveAssessment,
      proficiencyLevelId: this.assessmentDetails.currentProficiencyId
    };
    let lastestAssessmentSectionId = data.assessmentSectionId;
    this.timeUtilized += (this.assessmentQuestions.map(x => x.duration).reduce((a, b) => a + b, 0));
    this.attempted += this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count;
    this.markedForReview += this.assessmentQuestions.filter(x => x.isMarkedForReview !== MarkedForReviewStatus.UnMarked).length;
    this.skipped += this.assessmentQuestions.filter(x => x.chosenAnswer === null || x.chosenAnswer === '').length;

    this.testService.evaluateAdaptiveAssessmentAttempt(data).subscribe(res => {
      if (res && res.result.isSuccess) {
        if (res.result.resultMessage !== this.constants.failure) {
          if (!res.result.isAssessmentSubmitted) {
            this.skillProficiencyJourneyModalTitle = res.result.resultMessage;
            let previousSkillProficiencyJourneyResult = res.result.proficiencyJourneyResult;
            let requestData: GetAssessmentQuestions = {
              assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
              emailAddress: this.emailAddress,
              assessmentId: this.assessmentId,
              isPreview: this.isPreview,
              externalArgs: this.customArgs,
              customField: localStorage.getItem(this.constants.customField),
              wheeboxAttemptId: parseInt(localStorage.getItem(Constants.attemptId)),
              campaignScheduleIdNumber: this.campaignScheduleIdNumber
            };
            this.testService.getUserAssessmentQuestions(requestData).subscribe(res => {
              if (res && res.result) {
                this.assessmentDetails = res.result;
                this.assessmentSections = this.assessmentDetails.assessmentSections;
                this.currentSelectedSection = this.assessmentSections.find(x => x.assessmentSectionId === this.assessmentDetails.currentSectionId);
                this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
                this.assessmentQuestions = [];
                this.questionsCount = 0;
                this.resetQuestionStatus();
                if (lastestAssessmentSectionId !== this.assessmentDetails.currentSectionId) {
                  this.isSkillCompleted = true;
                  this.setProficiencyJourney(previousSkillProficiencyJourneyResult);
                  this.skillProficiencyModal = this.modalService.open(this.skillProficiencyJourneyChart, { centered: true, backdrop: 'static', size: 'lg' });
                }
                else {
                  this.isSkillCompleted = false;
                  this.setProficiencyJourney(res.result.proficiencyJourney);
                }
                this.setAssessmentSections();
                this.currentQuestion = this.assessmentQuestions[0];
                this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
                this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
                this.isFirstQuestion = true;
                this.isLastQuestion = this.assessmentDetails.totalQuestions > 1 ? false : true;
                this.dynamicForm = DynamicFormComponent;
                this.questionDetails = this.assessmentQuestions;
              }
            });
          } else {
            if (res.result.resultMessage) {
              this.toastrService.info(res.result.resultMessage);
            }
            if (this.assessmentDetails.proctorType === ProctorType.Aeye) {
              endExam();
            }
            this.remainingAttempts = res.result.remainingAttempts;
            // Clear cookies and other data if adaptive assessment got auto submitted due to criteria met
            if (!this.isSubmitAdaptiveAssessment)
              this.clearOnSubmission();
            this.postSubmissionActivities();
            this.navigateToResultPage();
          }
        }
        else {
          this.toastrService.error(this.constants.sessionInvalid);
        }
      }
    });
  }

  setAssessmentSections() {
    this.assessmentSections.forEach(section => {
      section.questions.forEach(question => {
        this.questionsCount += 1;
        this.questionTotalDuration += question.duration;
        question.assessmentSectionName = section.assessmentSectionName;
        question.assessmentSectionId = section.assessmentSectionId;
        question.assessmentId = this.assessmentDetails.assessmentId;
        question.assessmentScheduleId = this.assessmentScheduleId;
        question.givencount = this.assessmentDetails.maximumExecutionCount;
        question.userAssessmentAttemptId = this.assessmentDetails.userAssessmentAttemptId;
        question.userAssessmentMappingId = this.assessmentDetails.userAssessmentMappingId;
        question.userEmail = this.emailAddress;
        question.serialNumber = this.questionsCount;
        question.isPreview = this.isPreview;
        question.isShuffleMcqOptions = this.assessmentDetails.isShuffleMcqOptions;
        question.isCollaborativeAssessment = this.assessmentDetails.isCollaborativeAssessment;
        question.enableSFATestcase = this.assessmentDetails.enableSFATestcase;
        question.campaignScheduleId = this.assessmentDetails.campaignScheduleId;
        this.configJson = question.configJson;
        this.executionConfig = JSON.parse(question.configJson) as ExecutionConfig;
        if (question.questionType.id === Constants.multipleChoiceId && question.isShuffleMcqOptions && question.choices) {
          question.choices = JSON.stringify(shuffle(JSON.parse(question.choices)));
        }
        this.dataService.timeRecords.set(question.questionId, { startTime: null, timeSpent: question.durationMilliSeconds, previousTimeSpent: question.durationMilliSeconds });
        if (!this.isStack) {
          this.isStack = question.questionType.id === Constants.stackId ? true : false;
          this.isCloud = question.questionType.id === Constants.cloudId ? true : false;
          if (this.isStack) {
            this.question_toggle = this.isStack ? true : false;
          }
          if (this.isCloud) {
            this.question_toggle = this.isCloud ? true : false;
          }
        }

        if (!question.lastModificationTime) {
          question.questionStatus = QuestionStatus.Unread;
          this.questionsStatus.find(x => x.status === QuestionStatus.Unread).count += 1;
        } else if (question.isMarkedForReview === MarkedForReviewStatus.Marked) {
          question.questionStatus = QuestionStatus.MarkedForReview;
          this.questionsStatus.find(x => x.status === QuestionStatus.MarkedForReview).count += 1;
        } else if (question.chosenAnswer) {
          question.questionStatus = QuestionStatus.Attempted;
          this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count += 1;
        } else if (question.isSkipped || (question.isMarkedForReview === this.markedForReviewStatus.MarkedAndRemoved && (question.isSkipped === true || question.chosenAnswer))) {
          question.questionStatus = QuestionStatus.Skipped;
          this.questionsStatus.find(x => x.status === QuestionStatus.Skipped).count += 1;
        }
        if (question.questionStatus === QuestionStatus.Unread) {
          question.statusClass = `btn btn-${this.questionsStatus[question.questionStatus].class} btn-sm border-circle m-10`;
        } else {
          if (question.questionStatus === undefined) {
            question.questionStatus = QuestionStatus.Skipped;
            this.questionsStatus.find(x => x.status === QuestionStatus.Skipped).count += 1;
          }
          question.statusClass = `btn btn-${this.questionsStatus[question.questionStatus].class} btn-sm border-circle m-10`;
        }
        this.assessmentQuestions.push(question);
      });
    });
  }

  setProficiencyJourney(res: string) {
    if (res !== null && res !== '') {
      let proficiencyData = JSON.parse(res);
      let xdata: number;
      let ydata: string;
      let zdata: string;
      let proficiencyMetaData = [{ x: 0, y: 'Nil', z: 'Nil' }];
      proficiencyData.forEach((element) => {
        xdata = element.Point;
        ydata = element.ProficiencyName;
        zdata = element.Status;
        proficiencyMetaData.push({ x: xdata, y: ydata, z: zdata });
      });
      this.proficiencyChartData = proficiencyMetaData.sort(((first, second) => 0 - (first.x > second.x ? -1 : 1)));
      this.proficiencyChart();
    }
    else {
      this.proficiencyChartData = [];
    }
  }

  navigateToResultPage() {
    let attempted = this.attempted > 0 ? this.attempted : this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count;
    let markedForReview = this.markedForReview > 0 ? this.markedForReview : this.assessmentQuestions.filter(x => x.isMarkedForReview !== MarkedForReviewStatus.UnMarked).length;
    let skipped = (this.skipped > 0) ? this.skipped : this.assessmentQuestions.filter(x => x.chosenAnswer === null || x.chosenAnswer === '').length;
    let timeUtilized;
    if (this.isVMBasedAssessment) {
      let currentTime = parseInt(atob(this.vmCookieRemainingTime)) / 60;
      timeUtilized = (this.scheduleDuration - currentTime) * 60;
    } else {
      timeUtilized = this.timeUtilized > 0 ? this.timeUtilized : (this.assessmentQuestions.map(x => x.duration).reduce((a, b) => a + b, 0));
    }
    this.showResults(timeUtilized, attempted, skipped, markedForReview);
  }

  resetQuestionStatus(): void {
    this.questionsStatus.forEach(status => {
      status.count = 0;
    });
  }

  setNextQuestion() {
    if (this.currentQuestion.givencount !== 0 && this.currentQuestion.executionCount >= this.currentQuestion.givencount) {
      this.currentQuestion.countExceed = true;
    }
    if (this.isStatusClicked) {
      this.availedHintId.length = 0;
      let currentQuestionIndexNumber = this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber);
      if (currentQuestionIndexNumber < this.currentSelectedSectionQuestions.length) {
        this.currentQuestion = this.currentSelectedSectionQuestions[currentQuestionIndexNumber + 1];
        this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
        this.dynamicForm.fields = this.currentQuestion;
        this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
      }
      this.isFirstQuestion = (this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber) === 0) ? true : false;
      this.isLastQuestion = this.currentSelectedSectionQuestions.indexOf(this.currentQuestion) + 1 === this.currentSelectedSectionQuestions.length ? true : false;
    }
    else if (this.currentQuestion.serialNumber !== this.assessmentDetails.totalQuestions) {
      this.availedHintId.length = 0;
      if (this.currentQuestion.serialNumber === this.currentSelectedSectionQuestions[this.currentSelectedSectionQuestions.length - 1].serialNumber) {
        let nextQuestion = this.assessmentQuestions.find(x => x.serialNumber === this.currentQuestion.serialNumber + 1);
        let nextSection = this.assessmentSections.find(x => x.assessmentSectionId === nextQuestion.assessmentSectionId);
        this.currentSelectedSectionQuestions = nextSection.questions;
        this.currentSelectedSection = nextSection;
        this.cookieService.set(Constants.currentSectionId, btoa(JSON.stringify(this.currentSelectedSection.assessmentSectionId)), null, "/", null, true, "None");
      }
      if (this.viewBySection && this.currentQuestion.assessmentSectionId !== this.assessmentQuestions[this.currentQuestion.serialNumber]?.assessmentSectionId) {
        let cookieTimer = this.cookieService.get(Constants.remainingTime);
        this.insertSectionDuration(cookieTimer);
      }
      this.currentQuestion = this.assessmentQuestions[this.currentQuestion.serialNumber];
      this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
      this.isCheckCodeBasedType(this.currentQuestion);
      this.dynamicForm.fields = this.currentQuestion;
      this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
      this.isFirstQuestion = (this.currentQuestion.serialNumber - 1 === 0) ? true : false;
      this.isLastQuestion = (this.currentQuestion.serialNumber === this.assessmentDetails.totalQuestions) ? true : false;
    }
  }

  setNextSectionTimer() {
    this.cookieService.set(Constants.remainingTime, '', null, "/", null, true, "None");
    if (this.currentQuestion?.assessmentSectionId && !this.assessmentStopped) {
      this.resetTimerBlinker();
      this.setTimer(this.getSectionBasedDuration(this.currentQuestion.assessmentSectionId) + this.extraTimeDuration);
    }
  }

  resetTimerBlinker() {
    this.highlightTimer = this.blinkTimer = false;
    clearInterval(this.blinkerInterval);
  }

  insertSectionDuration(cookieTimer: string): void {
    const actualDuration = this.getSectionBasedDuration(this.currentQuestion.assessmentSectionId);
    const currentSectionCompletedDuration = (actualDuration * 60) - parseInt(atob(cookieTimer));

    let requestData: sectionDurationDto = {
      userAssessmentAttemptDetailId: this.assessmentDetails.userAssessmentAttemptId,
      userId: this.currentUserId,
      assessmentSectionId: this.currentQuestion.assessmentSectionId,
      duration: actualDuration,
      timeTaken: currentSectionCompletedDuration
    };
    this.testService.insertOrUpdateSectionDuration(requestData).subscribe(res => {
      this.setNextSectionTimer();
    });
  }

  getSectionBasedDuration(currentQuestionAssessmentSectionId: number): number {
    if (currentQuestionAssessmentSectionId) {
      const sectionDuration = this.assessmentDetails.sectionDuration;
      return sectionDuration.filter(obj => obj.assessmentSectionId === currentQuestionAssessmentSectionId)[0].duration;
    }
  }

  showStatusQuestions(status): void {
    this.moveOtherQuestion = this.constants.showQuestionStatus;
    let answer = '';
    let statusBasedQuestions = this.assessmentQuestions.filter(x => x.questionStatus === status.status);
    if (statusBasedQuestions.length) {
      this.updateCurrentQuestionToLocal();
      if (this.currentQuestion.chosenAnswer !== null && this.currentQuestion.chosenAnswer !== '') {
        this.otherQuestion = status;
        if (!this.currentQuestion.isCodeSubmitted && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
          let data: GetCurrentQuestionAnswer = {
            questionId: this.currentQuestion.questionId,
            userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
          };
          this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
          })).subscribe(res => {
            if (res.result) {
              answer = this.helper.stripHtml(res.result);
            }
            else if (res.result != null)
              answer = '';
            else
              answer = this.helper.stripHtml(this.currentQuestion.codingAssessment[0].defaultCode);
            let currentAnswer = this.helper.stripHtml(this.currentQuestion.chosenAnswer);
            if (answer != null && answer.replace(/\s+/g, '') !== currentAnswer.replace(/\s+/g, '')) {
              const modalRef = this.modalService.open(ConfirmationComponent, {
                centered: true,
                backdrop: 'static',
                size: 'lg'
              });
              modalRef.componentInstance.submit = this.updateCurrentQuestionToDb.bind(this);
              modalRef.componentInstance.leave = this.leaveQuestion.bind(this);
              modalRef.componentInstance.isExecuteAndSubmit = true;
              modalRef.componentInstance.isMoveOtherQuestion = true;
              modalRef.componentInstance.isResetQuestion = true;
            }
            else {
              clearInterval(this.dataService.autoSaveCall);
              this.showQuestionsStatus(status);
            }
          });
        }
        else if (this.currentQuestion.questionType.name.toUpperCase() !== this.constants.codeBased.toUpperCase()) {
          this.insertOrUpdateUserAttemptQuestions();
        }
        else {
          this.showQuestionsStatus(status);
        }
      }
      else {
        this.showQuestionsStatus(status);
      }
    }
  }

  showQuestionsStatus(status): void {
    this.isStatusClicked = true;
    this.currentSelectedSectionQuestions = this.assessmentQuestions.filter(x => x.questionStatus === status.status);
    if (this.currentSelectedSectionQuestions.length) {
      this.currentQuestion = this.currentSelectedSectionQuestions[0];
      this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
      this.dynamicForm.fields = this.currentQuestion;
      this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
    }
    this.isFirstQuestion = (this.currentSelectedSectionQuestions.map(a => a.serialNumber).indexOf(this.currentQuestion.serialNumber) === 0) ? true : false;
    this.isLastQuestion = (this.currentSelectedSectionQuestions.indexOf(this.currentQuestion) + 1 === this.currentSelectedSectionQuestions.length) ? true : false;
  }

  changeSection(assessmentSection: AssessmentSections) {
    this.moveOtherQuestion = this.constants.changeSection;
    let answer = '';
    if (this.currentQuestion.assessmentSectionId !== assessmentSection.assessmentSectionId) {
      this.updateCurrentQuestionToLocal();
      if (this.currentQuestion.chosenAnswer !== null && this.currentQuestion.chosenAnswer !== '') {
        this.otherQuestion = assessmentSection;
        if (!this.currentQuestion.isCodeSubmitted && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
          let data: GetCurrentQuestionAnswer = {
            questionId: this.currentQuestion.questionId,
            userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
          };
          this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
          })).subscribe(res => {
            if (res.result) {
              answer = this.helper.stripHtml(res.result);
            }
            else if (res.result != null)
              answer = '';
            else
              answer = this.helper.stripHtml(this.currentQuestion.chosenLanguage.defaultCode);
            let currentAnswer = this.helper.stripHtml(this.currentQuestion.chosenAnswer);
            if (answer != null && answer.replace(/\s+/g, '') !== currentAnswer.replace(/\s+/g, '')) {
              const modalRef = this.modalService.open(ConfirmationComponent, {
                centered: true,
                backdrop: 'static',
                size: 'lg'
              });
              modalRef.componentInstance.submit = this.updateCurrentQuestionToDb.bind(this);
              modalRef.componentInstance.leave = this.leaveQuestion.bind(this);
              modalRef.componentInstance.isExecuteAndSubmit = true;
              modalRef.componentInstance.isMoveOtherQuestion = true;
              modalRef.componentInstance.isResetQuestion = true;
            }
            else {
              clearInterval(this.dataService.autoSaveCall);
              this.changeToSection(assessmentSection);
            }
          });
        }
        else if (this.currentQuestion.questionType.name.toUpperCase() !== this.constants.codeBased.toUpperCase()) {
          this.insertOrUpdateUserAttemptQuestions();
        }
        else {
          this.changeToSection(assessmentSection);
        }
      }
      else {
        if (this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase()) {
          clearInterval(this.dataService.autoSaveCall);
        }
        this.changeToSection(assessmentSection);
      }
    }
  }

  changeToSection(assessmentSection: AssessmentSections) {
    if (this.currentQuestion.assessmentSectionId !== assessmentSection.assessmentSectionId || this.isStatusClicked) {
      this.isStatusClicked = false;
      this.currentQuestion = this.assessmentQuestions.filter(x => x.assessmentSectionId === assessmentSection.assessmentSectionId)[0];
      this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
      this.isCheckCodeBasedType(this.currentQuestion);
      this.dynamicForm.fields = this.currentQuestion;
      this.currentQuestion.isProctorEnabled = this.isProctorEnabled;
      this.isFirstQuestion = (this.currentQuestion.serialNumber - 1 === 0) ? true : false;
      this.isLastQuestion = (this.currentQuestion.serialNumber === this.assessmentDetails.totalQuestions) ? true : false;
      this.currentSectionName = this.currentQuestion.assessmentSectionName;
      this.currentSelectedSectionQuestions = assessmentSection.questions;
      this.currentSelectedSection = assessmentSection;
      this.cookieService.set(Constants.currentSectionId, btoa(JSON.stringify(this.currentSelectedSection.assessmentSectionId)), null, "/", null, true, "None");
    }
  }

  markForReview() {
    let currentReviewStatus = this.currentQuestion.isMarkedForReview;
    if (this.currentQuestion.isMarkedForReview === MarkedForReviewStatus.UnMarked || this.currentQuestion.isMarkedForReview === MarkedForReviewStatus.MarkedAndRemoved) {
      this.currentQuestion.isMarkedForReview = MarkedForReviewStatus.Marked;
      if (this.viewBySection && this.assessmentSections?.length > 1)
        this.toastrService.warning(Constants.revisitingTheSectionWillNotBePossible);
    }
    else if (this.currentQuestion.isMarkedForReview === MarkedForReviewStatus.Marked) {
      this.currentQuestion.isMarkedForReview = MarkedForReviewStatus.MarkedAndRemoved;
    }
    this.dataService.stopTimer(this.currentQuestion.questionId);
    this.dataService.startTimer(this.currentQuestion.questionId);
    let data = this.prepareQuestionUpdateData();
    this.testService.insertOrUpdateUserAttemptQuestions(data).subscribe(res => {
      if (res && res.result) {
        if (res.result === this.constants.success) {
          let statusTobeUpdated = (this.currentQuestion.isMarkedForReview === MarkedForReviewStatus.Marked) ? QuestionStatus.MarkedForReview : this.currentQuestion.chosenAnswer ? QuestionStatus.Attempted : QuestionStatus.Skipped;
          this.updateQuestionStatus(this.currentQuestion, statusTobeUpdated);
          this.assessmentQuestions[this.currentQuestion.serialNumber - 1] = this.currentQuestion;
        }
        else if (res.result === this.constants.failure) {
          this.toastrService.error(this.constants.sessionInvalid);
        }
        else if (res.result === this.constants.inActiveSchedule) {
          this.toastrService.error(this.constants.inActiveAssessment);
        }
      }
      else {
        this.currentQuestion.isMarkedForReview = currentReviewStatus;
        this.toastrService.warning(Constants.unableToMarkForReview);
      }
    }, error => {
      if (error && error.status && error.status == 401) {
        this.toastrService.error(this.constants.sessionInvalid);
      }
    });
  }

  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

  plagiarismCheck() {

    this.testService.checkPlagiarism(this.assessmentDetails.userAssessmentAttemptId).subscribe(res => {

    });
  }

  submitAssessment() {
    if (this.isCloud) {
      this.currentQuestion.chosenAnswer = this.constants.cloudBased;
    }
    this.updateAssessmentQuestionDuration(this);
    let cookieTimer = this.vmCookieRemainingTime = this.cookieService.get(Constants.remainingTime);
    this.clearOnSubmission();
    if (this.currentQuestion?.questionStatus !== QuestionStatus.MarkedForReview) {
      this.currentQuestion = this.currentQuestion.chosenAnswer ? this.updateQuestionStatus(this.currentQuestion, QuestionStatus.Attempted) : this.updateQuestionStatus(this.currentQuestion, QuestionStatus.Skipped);
    }
    this.assessmentQuestions[this.currentQuestion.serialNumber - 1] = this.currentQuestion;

    if (!this.isAdaptiveAssessment) {
      let apiMethodName: string;
      let assessmentSubmitData: StackAssessmentEvaluationData | InsertOrUpdateUserAttemptQuestions;
      if (this.isStack) {
        apiMethodName = Constants.validateUserAssessmentSubmission;
        assessmentSubmitData = this.prepareStackQuestionData();
      }
      else {
        apiMethodName = Constants.insertOrUpdateUserAttemptQuestions;
        assessmentSubmitData = this.prepareQuestionUpdateData(this.currentQuestion.chosenAnswer && this.currentQuestion.questionType.name.toUpperCase() === this.constants.codeBased.toUpperCase() ? true : false);
        assessmentSubmitData.isAssessmentSubmitted = true;
        if (this.viewBySection) {
          this.assessmentStopped = true;
          this.insertSectionDuration(cookieTimer);
        }
      }

      if (!this.isPreview) {
        if (apiMethodName === Constants.insertOrUpdateUserAttemptQuestions) {
          this.spinner.show();
        }
        this.testService[apiMethodName](assessmentSubmitData).subscribe(res => {
          if (apiMethodName === Constants.insertOrUpdateUserAttemptQuestions) {
            this.spinner.hide();
          }
          if (res && res.result) {
            var isValid = true;
            if (res.result !== this.constants.success && res.result !== this.constants.failure) {
              isValid = res.result.isValid;
            }
            else {
              if (res.result === this.constants.failure)
                isValid = false;
            }
            if (!isValid) {
              if (res.result === this.constants.inActiveSchedule) {
                this.toastrService.error(this.constants.inActiveAssessment);
              }
              else
                this.toastrService.error(this.constants.sessionInvalid);
            }
            else if (this.assessmentDetails.isReviewerAssigned) {
              var markAsEvaluationData: MarkAsEvaluationDto = {
                tenantId: this.currentTenantId,
                userId: this.currentUserId,
                assessmentScheduleId: this.assessmentScheduleId,
                isAutoSubmit: false
              };
              this.testService.reviewerEvaluationStatus(markAsEvaluationData).subscribe(res => {
                if (res && res.success) {
                  if (res.result === true) {
                    if (document.fullscreenElement)
                      this.closeFullscreen();
                    if (this.assessmentDetails.enablePlagiarism)
                      this.plagiarismCheck();
                    this.router.navigate(['../../reviewer-submit-request'], { relativeTo: this.activatedRoute });
                  }
                  else {
                    this.toastrService.error(Constants.anErrorOccuredWhileSubmittingTheAssessment);
                  }
                }
              });
            }
            else {
              if (!this.isStack) {
                let data: GetPostEvaluationStatus = {
                  tenantId: this.currentTenantId,
                  userId: this.currentUserId,
                  assessmentScheduleId: this.assessmentScheduleId,
                  userAssessmentMappingId: this.currentQuestion.userAssessmentMappingId,
                  isProctoringViolated: this.isProctoringViolated,
                  violatedProctoringSetting: this.violatedProctoringSetting,
                  attemptId: parseInt(localStorage.getItem(Constants.attemptId)),
                  attemptNumber: parseInt(localStorage.getItem(Constants.attemptNumber)),
                  isRetry: false,
                  aeyeTestTakerId: this.aeyeTestTakerId || "",
                  aeyeExamId: this.aeyeExamId || "",
                  campaignScheduleIdNumber: this.campaignScheduleIdNumber
                };
                this.testService.getRemainingAttempts(data).subscribe(res => {
                  if (res && res.result !== -1) {
                    if (!this.viewBySection) {
                      this.bulkInsertSectionDuration(false);
                    } else {
                      this.bulkInsertSectionDuration(true);
                    }
                    if (res && res.success && res.result !== null) {
                      if (this.assessmentDetails.proctorType === ProctorType.Aeye) {
                        endExam();
                      }
                      this.remainingAttempts = res.result;
                      if (this.assessmentDetails.enablePlagiarism)
                        this.plagiarismCheck();
                      this.postSubmissionActivities();
                      this.navigateToResultPage();
                    }
                    else {
                      //console.log("Response 1", res);
                      this.toastrService.error(Constants.anErrorOccuredWhileSubmittingTheAssessment);
                    }
                  } else if (res.result === -1) {
                    this.toastrService.error(this.constants.sessionInvalid);
                  }
                });
              }
              else {
                // this.remainingAttempts = res.result;
                let data = this.prepareStackQuestionData();
                if (!res.result.isSubmitted && res.result.userDetails.length > 0) {
                  let warningMessage = '';
                  res.result.userDetails.forEach(data => {
                    warningMessage = warningMessage.concat(data.emailAddress) + ',';
                  });
                  abp.message.confirm(`${warningMessage.slice(0, -1)} have not submitted the assessment. Do you want to submit the assessment?`,
                    (result: boolean) => {
                      if (result) {
                        this.testService.stackAssessmentSubmission(data).subscribe(res => {
                          if (res.result) {
                            if (this.assessmentDetails.proctorType === ProctorType.Aeye) {
                              endExam();
                            }
                            this.remainingAttempts = res.result.remainingAttempts;
                            this.isCollaborativeMember = res.result.isCollaborativeMember;
                            this.navigateToResultPage();
                          }
                        });
                      }
                    });
                }
                else {
                  if (isValid) {
                    this.testService.stackAssessmentSubmission(data).subscribe(res => {
                      if (res.result) {
                        if (this.assessmentDetails.proctorType === ProctorType.Aeye) {
                          endExam();
                        }
                        this.remainingAttempts = res.result.remainingAttempts;
                        this.isCollaborativeMember = res.result.isCollaborativeMember;
                        this.navigateToResultPage();
                      }
                    });
                  }
                  else {
                    this.toastrService.error(this.constants.sessionInvalid);
                  }
                }
              }
            }
          }
          else {
            //console.log("Response 2", res);
            this.toastrService.error(Constants.pleaseContactAdministratorForMoreDetails);
          }
        }, error => {
          console.error(error);
          this.spinner.hide();
          if (error && error.status && error.status == 401) {
            this.toastrService.error(this.constants.sessionInvalid);
          }
        });
      }
    } else {
      this.submitAdaptiveAssessment();
    }
  }

  // add the code here only if it is common for all assessment types (Standard, Adaptive)
  clearOnSubmission(): void {
    this.moveOtherQuestion = '';
    this.modalService.dismissAll();
    this.cookieService.set(Constants.remainingTime, '', null, "/", null, true, "None");
    this.cookieService.set(Constants.currentSectionId, '', null, "/", null, true, "None");
    this.cookieService.set("isAutoAuthenticated", 'false', null, "/", null, true, "None");
    this.cookieService.set("assessmentScheduleIdNumber", '', null, "/", null, true, "None");
    sessionStorage.clear();
    localStorage.clear();
    this.isSubmitted = true;
    window.removeAllListeners();
    document.removeAllListeners();
    if (!this.isPreview) {
      if (this.assessmentDetails.proctorType === ProctorType.Wheebox && this.assessmentDetails.enableWheeboxProctoring) {
        try {
          this.pauseTimer();
          this.wheeboxComponent.stopTestProctoring();
          this.wheeboxComponent.hideCameraIcon();
          stopcamera();
        }
        catch (ex) {
          console.error(ex);
        }
      }

      if (this.wheeboxProctoringConfig?.IsScreenSharing) {
        try {
          stopCapture();
        } catch (ex) {
          console.error(ex);
        }
      }
    }
  }

  submitAdaptiveAssessment() {
    let assessmentSubmitData = this.prepareQuestionUpdateData();
    this.spinner.show();
    this.testService.insertOrUpdateUserAttemptQuestions(assessmentSubmitData).subscribe(res => {
      this.spinner.hide();
      if (res && res.result) {
        if (res.result === this.constants.success)
          this.evaluateSection();
        else if (res.result === this.constants.failure) {
          this.toastrService.error(this.constants.sessionInvalid);
        }
      }
      else {
        this.toastrService.error(Constants.pleaseContactAdministratorForMoreDetails);
      }
    }, error => {
      console.error(error);
      this.spinner.hide();
      if (error && error.status && error.status == 401) {
        this.toastrService.error(this.constants.sessionInvalid);
      }
    });
  }

  // add the code here only if it is common for all assessment types (Standard, Adaptive)
  postSubmissionActivities() {
    if (document.fullscreenElement)
      this.closeFullscreen();
    this.getUserDetails();
    this.cookieService.set(Constants.remainingTime, '', null, "/", null, true, "None");
  }

  updateQuestionStatus(question: QuestionDetailDto, statusToBeUpdated: QuestionStatus): QuestionDetailDto {
    if ((question.questionStatus === QuestionStatus.MarkedForReview && this.currentQuestion.serialNumber !== question.serialNumber)) {
      return question;
    }
    this.questionsStatus.find(x => x.status === question.questionStatus).count -= 1;
    question.questionStatus = statusToBeUpdated;
    this.questionsStatus.find(x => x.status === question.questionStatus).count += 1;
    question.isSkipped = question.questionStatus === QuestionStatus.Skipped ? true : false;
    question.statusClass = `btn btn-${this.questionsStatus[question.questionStatus].class} btn-sm m-10`;
    return question;
  }

  updateCurrentQuestionToLocal(): void {
    if (this.currentQuestion.questionStatus !== QuestionStatus.MarkedForReview) {
      this.currentQuestion = this.currentQuestion.chosenAnswer ? this.updateQuestionStatus(this.currentQuestion, QuestionStatus.Attempted) : this.updateQuestionStatus(this.currentQuestion, QuestionStatus.Skipped);
      this.currentQuestion.isCopyPasteEnabledForCoding = this.isCopyPasteEnabledForCoding;
    }
    this.assessmentQuestions[this.currentQuestion.serialNumber - 1] = this.currentQuestion;
  }

  updateCurrentQuestionToDb(): void {
    this.insertOrUpdateUserAttemptQuestions(false, true);
  }

  insertOrUpdateUserAttemptQuestions(isCodeSubmited: boolean = false, saveCode: boolean = false): any {
    this.dataService.stopTimer(this.currentQuestion.questionId);
    if (!this.isPreview) {
      if (isCodeSubmited || saveCode) {
        clearInterval(this.dataService.autoSaveCall);
        this.spinner.show();
        this.countdown.pause();
        this.toastrService.info(Constants.yourCodeIsGettingSavedPleaseWaitForFewSeconds);
      }
      let data = this.prepareQuestionUpdateData(isCodeSubmited);
      this.testService.insertOrUpdateUserAttemptQuestions(data)
        .pipe(finalize(() => {
          if (isCodeSubmited || saveCode) {
            this.spinner.hide();
            this.countdown.resume();
          }
        })).subscribe(res => {
          if (res && res.result) {
            if (res.result === this.constants.success) {
              if (isCodeSubmited || saveCode) {
                this.toastrService.info(Constants.yourCodeGotSavedSuccessfully);
              }
              this.moveToOtherQuestion();
            }
            else if (res.result === this.constants.failure) {
              this.toastrService.error(this.constants.sessionInvalid);
            }
            else if (res.result === this.constants.inActiveSchedule) {
              this.toastrService.error(this.constants.inActiveAssessment);
            }
          }
          return res ? res.result : false;
        }, error => {
          if (error && error.status && error.status == 401) {
            this.toastrService.error(this.constants.sessionInvalid);
          }
        });
    } else {
      this.moveToOtherQuestion();
    }
  }

  isValidJson(answer: string) {
    try {
      JSON.parse(answer);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  prepareQuestionUpdateData(isCodeSubmited: boolean = false): InsertOrUpdateUserAttemptQuestions {
    this.currentQuestion.duration = this.currentQuestion.duration ? this.currentQuestion.duration : 0;
    this.currentQuestion.isCodeSubmitted = isCodeSubmited === true ? true : false;
    this.currentQuestion.durationMilliSeconds = this.dataService.getTimeSpent(this.currentQuestion.questionId);
    const timeLag = this.currentQuestion.duration - (this.currentQuestion.durationMilliSeconds / 1000)
    if ((this.currentQuestion.duration > (this.currentQuestion.durationMilliSeconds / 1000)) && (timeLag > 10)) {
      this.currentQuestion.durationMilliSeconds = this.currentQuestion.duration * 1000 + this.currentQuestion.duration;
      this.dataService.timeRecords.set(this.currentQuestion.questionId, { startTime: null, timeSpent: this.currentQuestion.durationMilliSeconds, previousTimeSpent: this.currentQuestion.durationMilliSeconds });
    }
    this.currentQuestion.durationMilliSeconds = this.currentQuestion.durationMilliSeconds ? this.currentQuestion.durationMilliSeconds : 0;
    return {
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      questionId: this.currentQuestion.questionId,
      assessmentId: this.assessmentDetails.assessmentId,
      answer: this.currentQuestion.chosenAnswer,
      isMarkedForReview: this.currentQuestion.isMarkedForReview,
      hintsAvailedJson: this.currentQuestion.hintsAvailedJson,
      userAssessmentMappingId: this.currentQuestion.userAssessmentMappingId,
      userEmailAddress: this.emailAddress,
      duration: this.currentQuestion.duration,
      durationMilliSeconds: this.currentQuestion.durationMilliSeconds,
      timeZone: Helper.getTimeZone(),
      reviewerId: 0,
      languageId: this.currentQuestion.chosenLanguage ? this.currentQuestion.chosenLanguage.languageId : 0,
      hintsAvailed: this.currentQuestion.hintsAvailed,
      isCodeSubmitted: this.currentQuestion.isCodeSubmitted,
      isSkipped: this.currentQuestion.isSkipped,
      assessmentScheduleId: this.assessmentScheduleId,
      campaignScheduleId: this.assessmentDetails.campaignScheduleId,
      executedCount: this.currentQuestion.executionCount,
      userAssessmentAttemptId: this.assessmentDetails.userAssessmentAttemptId,
      parentQuestionTypeId: this.currentQuestion.questionType.parentQuestionTypeId,
      questionTypeId: this.currentQuestion.questionType.id,
      questionTypeName: this.currentQuestion.questionType.name,
      isAssessmentSubmitted: false,
      IsAdaptiveSectionSubmit: this.isAdaptiveSectionSubmission
    };
  }

  prepareStackQuestionData(): StackAssessmentEvaluationData {
    return {
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      emailAddress: this.emailAddress,
      assessmentScheduleId: this.assessmentScheduleId,
      userAssessmentMappingId: this.assessmentDetails.userAssessmentMappingId,
      userAssessmentAttemptId: this.assessmentDetails.userAssessmentAttemptId,
      questionId: this.currentQuestion.questionId,
      type: this.currentQuestion?.stackAssessmentDetail.environmentType,
      campaignScheduleIdNumber: this.campaignScheduleIdNumber
    };
  }

  backToAssessments() {
    let params = btoa(this.assessmentId.toString());
    this.router.navigate(['../../../assessment/view-assessment', params], { relativeTo: this.activatedRoute });
  }

  submit(): void {
    this.assessmentSections.forEach(x => {
      x.questions.forEach(q => {
        if (q.questionType.parentQuestionTypeId === 2)
          this.codeBasedQuestionAvailable = true;
      });
    });
    if (this.codeBasedQuestionAvailable)
      this.checkCodebasedQuestions(this.assessmentDetails.userAssessmentAttemptId);
    else
      this.assessmentSubmit();
  }

  assessmentSubmit() {
    if (!this.isStack && !this.isCloud) {
      this.updateCurrentQuestionToLocal();
    }
    this.moveOtherQuestion = '';
    const modalRef = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    if (this.isAdaptiveAssessment) {
      this.isSubmitAdaptiveAssessment = true;
      modalRef.componentInstance.isSubmitAdaptiveAssessment = true;
    }
    modalRef.componentInstance.submit = this.submitAssessment.bind(this);
    if (modalRef.componentInstance.submit) {
      this.submitAssessmentVariable = true;
    }
    modalRef.componentInstance.leave = this.resetSubmission.bind(this);
    modalRef.componentInstance.questionsStatus = this.questionsStatus;
  }

  checkCodebasedQuestions(userAssessmentAttemptId: number) {
    const dictionary = new Map<number, number>();
    const questionSerialNumbers: any[] = [];
    this.testService.getUnSubmittedCodeQuestions(userAssessmentAttemptId).subscribe(res => {
      if (res.result) {
        let questionIds = res.result;
        if (questionIds) {
          this.assessmentSections.forEach(x => {
            x.questions.forEach(q => {
              dictionary.set(q.questionId, q.serialNumber);
            });
          });
          questionIds.forEach(question => {
            if (dictionary.has(question)) {
              let serialNumber = dictionary.get(question);
              questionSerialNumbers.push(serialNumber);
            }
          });
          if (questionIds.length > 1) {
            let MessageString = "Question Numbers : " + questionSerialNumbers.join(", ") + " should be submitted";
            this.toastrService.warning(MessageString);
          }
          else {
            let MessageString = "Question Number : " + questionSerialNumbers.join() + " should be submitted";
            this.toastrService.warning(MessageString);
          }
          return false;
        }
        else {
          this.assessmentSubmit();
        }
      }
      else {
        this.assessmentSubmit();
      }
    });
  }

  resetSubmission(): void {
    this.isSubmitAdaptiveAssessment = false;
  }

  toggleQuestions(): void {
    this.question_toggle = !this.question_toggle;
  }

  @HostListener('window:wheebox.proctor', ['$event'])
  onProctorRes(event: any): void {
    if (this.assessmentDetails.proctorType === ProctorType.Wheebox) {
      if (this.wheeboxProctoringConfig.ProctoringViolation === ProctoringResult.EndTheTestAfterNotifyingViolationToTheUser) {
        let resultList = event.detail.split('-');
        if (this.wheeboxProctoringConfig.InternetStatus && resultList[0] !== String(this.wheeboxProctoringConfig.InternetStatus).toLocaleLowerCase()) {
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.InternetStatus;
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYouHaveIssueInInternetConnection;
          this.endTestOnViolation();
          this.toastrService.warning(Constants.issueInInternetTestWillGetTerminated);
        }
        else if (this.wheeboxProctoringConfig.FaceCheck && resultList[1] !== String(this.wheeboxProctoringConfig.FaceCheck).toLocaleLowerCase()) {
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.FaceCheck;
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYourFaceNotMatched;
          this.endTestOnViolation();
          this.toastrService.warning(Constants.faceNotMatchedTestWillGetTerminated);
        }
        else if (this.wheeboxProctoringConfig.SuspiciousObjectCheck && resultList[2] !== String(this.wheeboxProctoringConfig.SuspiciousObjectCheck).toLocaleLowerCase()) {
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.SuspiciousObjectCheck;
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYourMobilePhoneFound;
          this.endTestOnViolation();
          this.toastrService.warning(Constants.mobilePhoneDetectedTestWillGetTerminated);
        }
        else if (this.wheeboxProctoringConfig.TwoFaces && resultList[3] !== String(this.wheeboxProctoringConfig.TwoFaces).toLocaleLowerCase()) {
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.TwoFaces;
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceMoreThanOneFaceDetected;
          this.endTestOnViolation();
          this.toastrService.warning(Constants.moreThanOneFaceDetectedTestWillGetTerminated);
        }
        else if (this.wheeboxProctoringConfig.NoFace && resultList[4] !== String(this.wheeboxProctoringConfig.NoFace).toLocaleLowerCase()) {
          this.isProctoringViolated = true;
          this.violatedProctoringSetting = ProctoringSetting.NoFace;
          this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceNoFaceDetected;
          this.endTestOnViolation();
          this.toastrService.warning(Constants.noFaceDetectedTestWillGetTerminated);
        }
      }
      else if (this.wheeboxProctoringConfig.ProctoringViolation === ProctoringResult.AllowUserToProceedWithTheTest) {
        let resultList = event.detail.split('-');
        if (this.wheeboxProctoringConfig.InternetStatus && resultList[0] !== String(this.wheeboxProctoringConfig.InternetStatus).toLocaleLowerCase()) {
          let violationObj = { violationName: this.constants.internetStatus, violationTime: new Date() };
          this.violationLog.push(violationObj);
          let violationCount = this.violationLog.length;
          this.toastrService.warning(this.constants.issueInInternetConnectionPleaseEnsureThatYouHaveProperInternetConnection + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });
        }
        if (this.wheeboxProctoringConfig.FaceCheck && resultList[1] !== String(this.wheeboxProctoringConfig.FaceCheck).toLocaleLowerCase()) {
          let violationObj = { violationName: this.constants.faceCheck, violationTime: new Date() };
          this.violationLog.push(violationObj);
          let violationCount = this.violationLog.length;
          this.toastrService.warning(this.constants.candidateFaceIsNotMatchWithTrainedFacePleaseEnsureThatRightPersonShouldAttendTheAssessment + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });
        }
        if (this.wheeboxProctoringConfig.SuspiciousObjectCheck && resultList[2] !== String(this.wheeboxProctoringConfig.SuspiciousObjectCheck).toLocaleLowerCase()) {
          let violationObj = { violationName: this.constants.suspiciousObjectCheck, violationTime: new Date() };
          this.violationLog.push(violationObj);
          let violationCount = this.violationLog.length;
          this.toastrService.warning(this.constants.mobilePhoneSuspiciousObjectDetectedInFrontOfCameraPleaseEnsureThatThereShouldNotBeAnySuspiciousObject + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });
        }
        if (this.wheeboxProctoringConfig.TwoFaces && resultList[3] !== String(this.wheeboxProctoringConfig.TwoFaces).toLocaleLowerCase()) {
          let violationObj = { violationName: this.constants.twoFaces, violationTime: new Date() };
          this.violationLog.push(violationObj);
          let violationCount = this.violationLog.length;
          this.toastrService.warning(this.constants.moreThanOneFaceDetectedInFrontOfCameraPleaseEnsureOnlyCandidateShouldAttendTheAssessment + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });
        }
        if (this.wheeboxProctoringConfig.NoFace && resultList[4] !== String(this.wheeboxProctoringConfig.NoFace).toLocaleLowerCase()) {
          let violationObj = { violationName: this.constants.twoFaces, violationTime: new Date() };
          this.violationLog.push(violationObj);
          let violationCount = this.violationLog.length;
          this.toastrService.warning(this.constants.noFaceDetectedInFrontOfCameraPleaseStayInFrontOfCamera + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });
        }
      }
    }
  }

  @HostListener('window:wheebox.stopSharing', ['$event'])
  onStopSharing(event: any): void {
    if (this.assessmentDetails.proctorType === ProctorType.Wheebox) {
      this.stopSharingCount++;
      let violationObj = { violationName: this.constants.screenSharingCheck, violationTime: new Date() };
      this.violationLog.push(violationObj);
      localStorage.setItem(Constants.violationLog, JSON.stringify(this.violationLog));
      let violationCount = this.violationLog.length;
      this.toastrService.warning(this.constants.youHaveNotShareTheScreenPleaseShareTheScreenByBhoosingEntireScreenTab + "</br>" + this.constants.totalViolationCount + violationCount, '', { enableHtml: true });

      if (this.wheeboxProctoringConfig.ScreenSharingViolationLimit && this.wheeboxProctoringConfig.ScreenSharingViolationLimit !== null && this.wheeboxProctoringConfig.ScreenSharingViolationLimit <= this.stopSharingCount) {
        this.isProctoringViolated = true;
        this.violatedProctoringSetting = ProctoringSetting.ScreenSharing;
        this.proctoringViolationMessage = Constants.yourTestHasBeenTerminatedSinceYouHaveCrossTheScreenSharingViolationLimit;
        this.endTestOnViolation();
        this.toastrService.warning(Constants.yourTestHasBeenTerminatedSinceYouHaveCrossTheScreenSharingViolationLimit);
      }
    }
  }
  @HostListener('window:wheebox.onNotSharingEntireScreen', ['$event'])
  onNotSharingEntireScreen(event: any): void {
    if (this.assessmentDetails.proctorType === ProctorType.Wheebox)
      this.toastrService.warning(Constants.pleaseShareEntireScreenBySelectingEntireScreenTabWhenScreenSharingPopUpDisplyed);
  }

  openFullScreen() {
    this.modalService.dismissAll();
    const element = document.documentElement as HTMLElement & {
      mozRequestFullScreen(): Promise<void>;
      webkitRequestFullscreen(): Promise<void>;
      msRequestFullscreen(): Promise<void>;
    };

    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
    /* Firefox */
    else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    }
    /* Chrome, Safari and Opera */
    else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
    /* IE/Edge */
    else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    this.enableProctoringSettings();
  }

  setProctoringMessage(): void {
    if (this.proctoringConfig.EnableFullScreenMode) {
      this.proctoringMessage = `<ul><li>${Constants.fullScreenProctoringIsEnabledForThisAssessment}</li>
      <li>${Constants.anyAttemptToExitOutOfFullscreenWhileTakingTheAssessmentWillResultInTerminationOfTestDueToNonCompliance}</li>
      <li class="font-bold">${Constants.pressingEscKeyWillAlsoLeadToTerminationOfAssessment}</li></ul>`;
    }
    else if (this.proctoringConfig.RestrictWindowViolation) {
      this.proctoringMessage = `<ul><li>${Constants.pleaseNoteThatIfYouMoveAwayFromTheTestWindowAndOpenAnythingElseItWillBeConsideredAsViolation}</li>
      <li>${Constants.youWillHave} ${this.proctoringConfig.WindowViolationLimit} ${Constants.chances}, ${Constants.theMomentYouExceedThemTheTestWillGetAutomaticallyAborted}</li></ul>`;
    }
    if (this.proctoringConfig.EnableFullScreenMode && this.assessmentDetails.enableWheeboxProctoring)
      this.showProctoringSettings();
  }

  showProctoringSettings(): void {
    this.modalService.open(this.confirmTemplateRef, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  endTestOnViolation() {
    setTimeout(() => {
      if (this.assessmentDetails.assessmentType === AssessmentType.Adaptive)
        this.isSubmitAdaptiveAssessment = true;
      this.submitAssessment();
    }, 3000);
  }

  launchIde(): void {
    let emptyString = 'mfa';
    if (this.currentQuestion !== null && this.currentQuestion !== undefined) {
      this.currentQuestion.chosenAnswer = emptyString;
      let data = this.prepareQuestionUpdateData();
      this.testService.insertOrUpdateUserAttemptQuestions(data).subscribe(res => {
        if (res && res.result) {
          if (res.result === this.constants.success) {
            this.updateQuestionStatus(this.currentQuestion, QuestionStatus.Attempted);
            this.assessmentQuestions[this.currentQuestion.serialNumber - 1] = this.currentQuestion;
          }
          else if (res.result === this.constants.failure) {
            this.toastrService.error(this.constants.sessionInvalid);
          }
        }
      }, error => {
        if (error && error.status && error.status == 401) {
          this.toastrService.error(this.constants.sessionInvalid);

        }
      });
    }
  }

  resetToDefaultTemplate(): void {
    clearInterval(this.dataService.autoSaveCall);
    this.currentQuestion.chosenAnswer = '';
    this.updateCurrentQuestionToLocal();
    this.moveToOtherQuestion();
  }

  leaveQuestion(): void {
    clearInterval(this.dataService.autoSaveCall);
    this.spinner.show();
    this.countdown.pause();
    let data: GetCurrentQuestionAnswer = {
      questionId: this.currentQuestion.questionId,
      userAssessmentAttemptId: this.currentQuestion.userAssessmentAttemptId
    };
    this.testService.getCurrentQuestionAnswer(data).pipe(finalize(() => {
      this.spinner.hide();
      this.countdown.resume();
    })).subscribe(res => {
      if (res.result) {
        this.currentQuestion.chosenAnswer = this.helper.stripHtml(res.result);
        this.updateCurrentQuestionToLocal();
      }
      this.currentQuestion.chosenAnswer = '';
      this.moveToOtherQuestion();
    });
  }


  showResults(timeUtilized, attempted, skipped, markedForReview) {
    if (this.assessmentDetails.resultType === ScheduleResultType.Detailed && !this.isCollaborativeMember) {
      let queryParam = this.assessmentScheduleId + '/' + this.currentUserId + '/' + this.currentTenantId +
        '/' + this.isProctoringViolated + '/' + this.proctoringViolationMessage + '/' + this.users.name + '/' + this.users.surname + '/' + this.users
          .emailAddress + '/' + this.assessmentDetails.enableWheeboxProctoring + '/' + this.remainingAttempts + '/' + this.assessmentDetails.assessmentType + '/' + this.assessmentDetails.assessmentId + '/' + this.campaignName + '/' + timeUtilized;
      queryParam = btoa(queryParam);
      if (!this.authUser) {
        this.router.navigate(['../../post-assessment-page-view', queryParam], { relativeTo: this.activatedRoute });
      }
      else {
        this.router.navigate(['../../dashboard'], { relativeTo: this.activatedRoute });
      }
    }
    else if (this.assessmentDetails.resultType === ScheduleResultType.Hidden || this.isCollaborativeMember) {
      let queryParam = this.assessmentScheduleId + '/' + timeUtilized + '/' + attempted + '/' + skipped +
        '/' + markedForReview + '/' + btoa(this.assessmentDetails.assessmentName) +
        '/' + this.isProctoringViolated + '/' + this.proctoringViolationMessage + '/' + this.users.name + '/' + this.users.surname + '/' + this.users
          .emailAddress + '/' + this.assessmentDetails.enableWheeboxProctoring + '/' + this.remainingAttempts + '/' + this.assessmentDetails.assessmentType + '/' + this.assessmentDetails.assessmentId + '/' + this.campaignName;
      queryParam = btoa(queryParam);
      if (!this.authUser) {
        this.router.navigate(['../../post-assessment', queryParam], { relativeTo: this.activatedRoute });
      }
      else {
        this.router.navigate(['../../dashboard'], { relativeTo: this.activatedRoute });
      }
    }
    else if (this.assessmentDetails.resultType === ScheduleResultType.Redirect) {
      window.open(this.assessmentDetails.redirectURL, "_self");
    }
  }

  moveToOtherQuestion() {
    switch (this.moveOtherQuestion) {
      case this.constants.moveNext:
        this.onInitNextQuestionConfirmation();
        break;
      case this.constants.movePrev:
        this.setPreviousQuestion();
        break;
      case this.constants.moveToQuestion:
        this.moveToClickedQuestion(this.otherQuestion);
        break;
      case this.constants.showQuestionStatus:
        this.showQuestionsStatus(this.otherQuestion);
        break;
      case this.constants.changeSection:
        this.changeToSection(this.otherQuestion);
        break;
    }
  }

  bulkInsertSectionDuration(scoreUpdate: boolean) {
    let requestData: bulkInsertSectionDto = {
      userAssessmentAttemptDetailId: this.assessmentDetails.userAssessmentAttemptId,
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      scoreUpdate: scoreUpdate
    };
    this.testService.bulkInsertSectionDuration(requestData).subscribe(data => {
      return;
    });
  }

  closeSkillProficiencyJourneyChart(): void {
    this.skillProficiencyModal.close();
  }

  startExtraDurationTimer() {
    setTimeout(() => {
      this.updateExtraTimeDuration(this);
    }, 120000);
  }

  updateExtraTimeDuration(_this) {

    _this.testService.getExtraDurationForAssementAttempt(_this.assessmentDetails.userAssessmentAttemptId).subscribe(res => {
      if (res.success) {
        let cookieTimer = _this.cookieService.get(Constants.remainingTime);
        let remainingDuration: number = 0;
        if (cookieTimer) {
          remainingDuration = parseInt(atob(cookieTimer)) / 60;
        }

        if (res.result > 0 && res.result > _this.extraTimeDuration) {
          _this.setTimerForExtra(remainingDuration + res.result - _this.extraTimeDuration);
          _this.extraTimeDuration = res.result;
        }
        _this.callbackAfterTimeout(_this.updateExtraTimeDuration, _this, 120);
      }
    });
  }

  setTimerForExtra(duration: number) {
    this.cookieService.set(Constants.remainingTime, btoa((duration * 60).toString()), null, "/", null, true, "None");
    if (this.blinkerInterval) {
      this.document.title = this.documentTitile;
      this.resetTimerBlinker();
      this.blinkerInterval = null;
    }
    this.setTimer(duration);

  }

  pauseCountDown() {
    this.countdown.pause();
  }

  resumeCountDown() {
    this.countdown.resume();
  }

  // onWindowClose(): void {
  //   if (!this.isNetworkChange) {
  //     let data = this.prepareQuestionUpdateData();
  //     this.testService.insertOrUpdateUserAttemptQuestions(data).subscribe(res => {
  //     });
  //   }
  //   else
  //     this.isNetworkChange = false;
  // }

  // @HostListener('window:offline', ['$event'])
  // @HostListener('window:online', ['$event'])
  // onNetworkChange(): void {
  //   this.isNetworkChange = true;
  //   location.reload();
  // }
}
