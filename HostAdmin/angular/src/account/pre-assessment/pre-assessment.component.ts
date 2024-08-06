import { Component, Injector, OnInit, TemplateRef, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { UserService } from '@app/admin/users/users.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import { AppComponentBase } from '@shared/app-component-base';
import { ValidateAssessment, AssessmentDetails, WheeboxUrlRequestDto } from '../pre-assessment/pre-assessment-details';
import { CreateUserRequest, UserUploadData } from '@app/admin/users/users';
import { CookieService } from 'ngx-cookie-service';
import { TenantLoginInfoDto, TenantServiceProxy, UserLoginInfoDto } from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '@shared/session/app-session.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentScheduleCustomField, AssessmentScheduleCustomFieldCollectionDto, AssessmentScheduleCustomFieldUserInput, HackathonLeaderBoard, HackathonLeaderBoardRequest, NgbDate, ProctoringConfig, wheeboxProctoringConfig } from '../../app/admin/assessment/assessment';
import { dataService } from '@app/service/common/dataService';
import { Helper } from '@app/shared/helper';
import { AssessmentType, CampaignValidationErrors, ProctorType, ScheduleType, WheeboxSettings } from '@app/enums/assessment';
import { UserRoles } from '@app/enums/user-roles';
import { UtilsService } from 'abp-ng2-module';
import { ScheduleResultType } from '@app/enums/test';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { environment as env } from "../../environments/environment";
import { AppConsts } from '@shared/AppConsts';
import { AeyeUserFullVideo } from '@app/admin/reports/reports';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { finalize } from 'rxjs/operators';
import { ValidateCampaignRequestDto, ValidateCampaignResultDto } from '@app/admin/campaign/campaign';
import { CampaignService } from '@app/admin/campaign/campaign.service';
import { AppAuthService } from '@shared/auth/app-auth.service';
declare function CandidateOnboarding(userVal, sButtonRequired, className): any;
declare function CandidateVerification(userVal, sButtonRequired, className): any;
@Component({
  selector: 'app-pre-assessment',
  templateUrl: './pre-assessment.component.html',
  styleUrls: ['./pre-assessment.component.scss']
})

export class PreAssessmentComponent extends AppComponentBase implements OnInit {
  [x: string]: any;
  disableCaptcha: boolean = false;
  assessmentScheduleIdNumber: string;
  proctoringConfig: ProctoringConfig;
  proctoringMessage: string = null;
  assessmentDetails: AssessmentDetails;
  assessmentRegisterForm: FormGroup;
  emailAddress: string = '';
  tenantId: number;
  isNewUser: boolean = true;
  isSubmitTriggered: boolean = false;
  tenantName: string = location.pathname.split('/')[1];
  authToken: string;
  customArgs: string;
  isEmailFromLink: boolean = false;
  userUpload = new UserUploadData();
  request = new CreateUserRequest();
  helper = Helper;
  constants = Constants;
  @ViewChild('proctoringModal') templateRef: TemplateRef<any>;
  wheeboxProctoringConfig: wheeboxProctoringConfig;
  isProctoringEnabled: boolean = false;
  isScreenSharingEnabled: boolean = false;
  isInstructionsRead: boolean = false;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  isStack: boolean;
  testTakerParams: string;
  isAssessmentProcessing: boolean = false;
  isAiApprove: boolean = false;
  isRetryAssessment: boolean = false;
  userRole: string;
  userRoles = UserRoles;
  userId: number;
  customFieldItems!: FormArray;
  authUser: boolean = false;
  cutOffTime: string = "";
  redirectParam: string;
  resultType: ScheduleResultType;
  hackathonLeaderBoard: HackathonLeaderBoard;
  assessmentType = AssessmentType;
  showAdaptive: boolean = false;
  isHideResultStatus: boolean = false;
  isIrisIntegrated: boolean = false;
  isCustomThemeEnabled: boolean = false;
  isGurukashi: boolean = false;
  showCustomFields: boolean = false;
  isTenantLogoLoaded: boolean = false;
  iscustomArgs: boolean = false;
  isABInBev: boolean = false;
  theme: 'light' | 'dark' = 'light';
  size: 'compact' | 'normal' = 'normal';
  lang = 'en';
  type: 'image' | 'audio';
  siteKey = env.reCaptchaSiteKey;
  isInfosys: boolean = false;
  slotStartTime: Date | null;
  slotEndTime: Date | null;

  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private modalService: NgbModal,
    private tenantServiceProxy: TenantServiceProxy,
    private assessmentService: AssessmentService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private sessionService: AppSessionService,
    private _appAuthService: AppAuthService,
    private dataService: dataService,
    private _utilsService: UtilsService,
    private spinner: SpinnerVisibilityService,
    private renderer: Renderer2,
    private tenantService: TenantsService,
    private campaignService: CampaignService,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    if (bool === "true")
      this.authUser = true;
    this.activatedRoute.params.subscribe(param => {
      this.testTakerParams = param['id'];
      let params = atob(param['id']).split('/');
      this.assessmentScheduleIdNumber = params[0];
      this.tenantId = parseInt(params[1]);
      this.isInfosys = this.dataService.checkTenantId(this.tenantId) === 'Infosys' ? true : false;
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
      this.isABInBev = this.dataService.checkCustomThemeForAbinBev(this.tenantId);
      this.isGurukashi = this.dataService.isGurukashiTenant(this.tenantId);
      this.isInfosys = this.dataService.checkTenantId(this.tenantId) === 'Infosys' ? true : false;
      if (this.assessmentScheduleIdNumber !== this._utilsService.getCookieValue("assessmentScheduleIdNumber")) {
        this._utilsService.setCookieValue("ssoInitialUrl", this.router.url, undefined, abp.appPath);
        this._utilsService.setCookieValue("assessmentScheduleIdNumber", this.assessmentScheduleIdNumber, undefined, abp.appPath);
      }

      if (params.length > 2) {
        this.isNewUser = false;
        this.isEmailFromLink = true;
        this.emailAddress = params[2];
        this.customArgs = params.length > 3 ? params[3] : '';
        this.isIrisIntegrated = typeof (this.customArgs) === "object";
        this.isRetryAssessment = params.length > 4 ? params[4] === "true" : false;
        this.dataService.setCustomArgs(this.customArgs);
        localStorage.setItem(Constants.customArgs, this.customArgs);
      }

      this.validateAssessment();

      if (this.tenantId) {
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
      if (this.isGurukashi) {
        this.disableCaptcha = true;
      }
      else {
        this.activatedRoute.queryParams
          .subscribe(params => {
            this.disableCaptcha = params.env == env.disableCaptchaToken ? true : false;
          }
          );
      }

      let chatbotConfig = {
        iscustomArgs: this.customArgs ? true : false,
        isIrisIntegrated: this.isIrisIntegrated,
        disableCaptcha: this.disableCaptcha
      };

      localStorage.setItem(Constants.chatbot, JSON.stringify(chatbotConfig));

      if (!chatbotConfig.iscustomArgs && !this.isIrisIntegrated && !this.disableCaptcha) {
        if (!document.getElementById("chatbot") && !this.isInfosys)
          this.loadJsScript("assets/chatbot/chatbot-script.js");
        const element = document.querySelector('[data-id="zsalesiq"]');
        if (element)
          this.renderer.setStyle(element, 'display', 'block');
      }

    });
  }

  private initiateSSOAuth(tenantName: string, isNonSSORequest: boolean, assessmentUrl: string) {
    this.tenantServiceProxy.GetIDProvider(tenantName, this._utilsService.getCookieValue("requestOrigin")).subscribe(res => {
      if (res) {
        let response = JSON.parse(res);
        this._utilsService.setCookieValue("isValidAuthRequst", response.IsRedirectionWhitelisted);
        if (!response.IsRedirectionWhitelisted) {
          this.toastrService.warning(response.Message);
          return setTimeout(function () {
            return this.router.navigate([`/${this.path}/account/landing`]);
          }, 5000);
        }
        if (response.SSOEnabled && this.assessmentDetails && this.assessmentDetails.scheduleType === ScheduleType.Public) {
          this._utilsService.setCookieValue("SSOEnabled", response.SSOEnabled + "", undefined, abp.appPath);
          this._utilsService.setCookieValue(Constants.tenantName, response.TenantName, undefined, abp.appPath);
          if (!this._appAuthService.isLoggedIn()) {
            if (this._utilsService.getCookieValue("IsInternalLogin") === "true") {
              return;
            }
            this._appAuthService.startAuthentication(response.TenantName);
          }
          else if (this._appAuthService.isLoggedIn()) {
            this._appAuthService.setToken(this._appAuthService.getToken());
            let authStatus = this._utilsService.getCookieValue("isAutoAuthenticated");
            if (authStatus === "true") {
              this.isNewUser = false;
              // let userDetails = this.userService.getMe()
              this.userService.getMe().subscribe(res => {
                if (res) {
                  this.ssoPatchUserValue(res.emailAddress, res.name, res.surname);
                  this.disableSSOFormFields();
                }
              });
            }
            else
              this._appAuthService.completeAuthentication();
          }
        }
        else {
          abp.utils.setCookieValue("isAutoAuthenticated", "false", undefined, abp.appPath);
          if (this.appSession.user && this.appSession.user.id) {
            this.router.navigate([`${tenantName}/app/home`]);
          }
        }
      }
    },
      error => console.error(error));
  }

  public loadJsScript(src: string): HTMLScriptElement {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.id = 'chatbot';
    this.renderer.appendChild(window.document.body, script);
    return script;
  }

  initRegisterForm(): void {
    this.assessmentRegisterForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email, WhiteSpaceValidators.emptySpace()]],
      phoneNumber: ['', [Validators.pattern("^(\\+91 )?[0-9]{10}$")]],
      recaptcha: ['', [Validators.required]],
      dateOfBirth: [''],
      nameOnIdCard: [''],
      fatherName: [''],
      customFields: this.formBuilder.array([])
    });
    if (!this.isNewUser) {
      this.patchValue();
      this.setFormValidators();
    }
  }

  isFormValid(controlName: string): boolean {
    let value = !(this.assessmentRegisterForm.get(controlName).errors?.required && (this.assessmentRegisterForm.get(controlName).touched || this.isSubmitTriggered));
    return value;
  }

  isFormArrayGroupValid(index: number): boolean {
    let value = ((this.customFieldItems.at(index).touched || this.isSubmitTriggered));
    if (value) {
      if (this.assessmentDetails.assessmentScheduleCustomField[index].isMandatory) {
        if (this.customFieldItems.at(index).value && this.customFieldItems.at(index).value.customField.length === 0)
          return true;
      }
    }
    return false;
  }

  isFormArrayGroupValidRegularExpresson(index: number): boolean {
    if (this.customFieldItems.at(index).value.customField.toString() === "" || !this.isNewUser)
      return false;
    let value = ((this.customFieldItems.at(index).touched || this.isSubmitTriggered));
    if (value) {
      return !this.customFieldItems.at(index).valid;
    }
    return false;
  }

  validateAssessment(): void {
    let data: ValidateAssessment = {
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
      emailAddress: this.emailAddress,
      tenantId: this.tenantId
    };
    this.assessmentService.validateUserAssessment(data).subscribe(res => {
      if (!res.result.isAvailable) {
        this.router.navigate(['../../invalid-request', { tenantAdminEmailAddress: res.result.tenantAdminEmailAddress ? btoa(JSON.stringify(res.result.tenantAdminEmailAddress)) : '', tenantId: this.tenantId, errorCode: res.result.errorCode, errorMessage: res.result.errorMessage, startTime: res.result.startTime, endTime: res.result.endTime }], { relativeTo: this.activatedRoute });
      }
      else {
        if (res.result.redirectParam !== '' && res.result.redirectParam !== undefined && res.result.redirectParam !== null) {
          this.redirectParam = res.result.redirectParam;
          this.resultType = res.result.resultType;
        }
        this.initRegisterForm();
        this.getAssessmentDetails();
      }
    });
  }

  getAssessmentDetails(): void {
    this.assessmentService.getAssessmentDetails(this.assessmentScheduleIdNumber, this.emailAddress).subscribe(res => {
      if (res.result) {
        this.assessmentDetails = res.result;

        let routePath = this.router.url;
        let requestedTenantName = routePath.split('/')[1];
        if (this.assessmentDetails.scheduleType === ScheduleType.Public && !this.isRetryAssessment)
          this.initiateSSOAuth(requestedTenantName, true, "");

        this.showCustomFields = this.assessmentDetails.scheduleType !== ScheduleType.SelfRegistration;
        let difference = new Date(this.assessmentDetails.startTime).getMinutes() + (this.assessmentDetails.cutOffTime);
        var cutOffDate = new Date(this.assessmentDetails.startTime);
        cutOffDate.setMinutes(difference);
        this.cutOffTime = cutOffDate.toISOString();
        this.slotStartTime = this.assessmentDetails.slotStartTime ? this.helper.convertUTCDateToLocalDate(this.assessmentDetails.slotStartTime) : undefined;
        this.slotEndTime = this.assessmentDetails.slotEndTime ? this.helper.convertUTCDateToLocalDate(this.assessmentDetails.slotEndTime) : undefined;
        if (this.assessmentDetails.type === AssessmentType.Adaptive) {
          this.showAdaptive = true;
        }
        if (this.assessmentDetails !== null) {
          this.getLeaderBoardDetails();
        }
        let sectionPercent = 0;
        this.assessmentDetails.sections.forEach(element => {
          if (element.sectionScore > 0) {
            sectionPercent = (element.sectionScore / this.assessmentDetails.totalMarks) * 100;
            element.sectionPercent = sectionPercent;
          }
          else {
            this.isStack = true;
          }
        });
        if (this.assessmentDetails.proctoringConfig) {
          this.proctoringConfig = JSON.parse(this.assessmentDetails.proctoringConfig) as ProctoringConfig;
          this.wheeboxProctoringConfig = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig) as wheeboxProctoringConfig;
          if (this.assessmentDetails.enableProctoring || this.assessmentDetails.enableWheeboxProctoring) {
            this.isProctoringEnabled = this.setProctoringMessage(this.assessmentDetails.enableProctoring, this.assessmentDetails.enableWheeboxProctoring);
          }
          if (this.assessmentDetails.enableWheeboxProctoring) {
            const pageType = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig).EnvironmentValidation;
            if (pageType === WheeboxSettings.EnvironmentValidationIDScanningAiApproval || pageType === WheeboxSettings.FaceTrainingIDScanningAiApproval) {
              this.isAiApprove = true;
              this.assessmentRegisterForm.get('dateOfBirth').setValidators([Validators.required]);
              this.assessmentRegisterForm.get('nameOnIdCard').setValidators([Validators.required, Validators.min(1)]);
              this.assessmentRegisterForm.get('fatherName').setValidators([Validators.required]);
            }
          }
        }

        this.isHideResultStatus = this.assessmentDetails.hideResultStatus;
        if (this.showCustomFields && this.assessmentDetails.assessmentScheduleCustomField) {
          this.assessmentDetails.assessmentScheduleCustomField.forEach(element => {
            this.addcustomField(element);
          });
        }
        localStorage.setItem(Constants.sourceOfSchedule, this.assessmentDetails.sourceOfSchedule === Constants.techademy ? this.assessmentDetails.sourceOfSchedule : Constants.na);
      }
    },
      error => console.error(error));
  }

  addcustomField(customField: AssessmentScheduleCustomField) {
    const customFieldFormItem = this.formBuilder.group({
      customField: [''],
    });
    if (this.isNewUser)
      customFieldFormItem.get('customField').setValidators([Validators.pattern("^[a-zA-Z0-9].*"), Validators.maxLength(250)]);
    if (customField.isMandatory && this.isNewUser) {
      customFieldFormItem.get('customField').setValidators([Validators.required, Validators.min(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9].*")]);
    }
    this.customFieldItems = this.assessmentRegisterForm.get("customFields") as FormArray;
    this.customFieldItems.push(customFieldFormItem);
    if (!this.isNewUser) {
      let oldCustomField = localStorage.getItem(this.constants.customField);
      if (oldCustomField?.length > 0) {
        let assessmentScheduleCustomFieldCollectionDto: AssessmentScheduleCustomFieldCollectionDto;
        assessmentScheduleCustomFieldCollectionDto = JSON.parse(oldCustomField);
        assessmentScheduleCustomFieldCollectionDto.customField.forEach(element => {
          if (element.fieldLabel === customField.fieldLabel) {
            customFieldFormItem.get('customField').setValue(element.fieldValue);
            customFieldFormItem.get('customField').disable();
          }
        });
      }
      else {
        if (!customField.isMandatory)
          customFieldFormItem.get('customField').setValidators([Validators.pattern("^[a-zA-Z0-9].*"), Validators.maxLength(250)]);
        else {
          customFieldFormItem.get('customField').setValidators([Validators.required, Validators.min(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9].*")]);
        }
      }
    }
  }

  setProctoringMessage(isProctoringEnabled: boolean, isWheeboxEnabled: boolean): boolean {
    let proctoringMessages: string[] = [];
    if (isProctoringEnabled) {
      if (this.proctoringConfig.EnableFullScreenMode) {
        proctoringMessages.push(Constants.fullScreenProctoringIsEnabledForThisAssessment);
        proctoringMessages.push(Constants.anyAttemptToExitOutOfFullscreenWhileTakingTheAssessmentWillResultInTerminationOfTestDueToNonCompliance);
        proctoringMessages.push(Constants.pressingEscKeyWillAlsoLeadToTerminationOfAssessment);
      }
      else if (this.proctoringConfig.RestrictWindowViolation) {
        proctoringMessages.push(Constants.pleaseNoteThatIfYouMoveAwayFromTheTestWindowAndOpenAnythingElseItWillBeConsideredAsViolation);
        proctoringMessages.push(`${Constants.youWillHave} ${this.proctoringConfig.WindowViolationLimit} ${Constants.chances}, ${Constants.theMomentYouExceedThemTheTestWillGetAutomaticallyAborted}`);
      }
    }
    if (isWheeboxEnabled) {
      proctoringMessages.push(Constants.theLightingOnTheFaceMustBeBrightEnoughAndTheBackgroundShouldBeClear);
      proctoringMessages.push(Constants.pleaseEnsureThatYouAreFacingTheLightAndMakeSureThatThereIsNoLightSourceBehindYou);
      proctoringMessages.push(Constants.aadharCardPanCardPassportDrivingLicenseOrVoterIDcardShould);
      if (this.wheeboxProctoringConfig.IsScreenSharing && this.wheeboxProctoringConfig.IsScreenSharing !== null && this.wheeboxProctoringConfig.IsScreenSharing === true) {
        proctoringMessages.push(Constants.pleaseShareEntireScreenBySelectingEntireScreenTabWhenScreenSharingPopUpDisplyed);
      }
    }
    if (proctoringMessages.length <= 0)
      return false;
    this.proctoringMessage = '<ul>';
    proctoringMessages.forEach(message => {
      this.proctoringMessage += `<li class="font-bold">${message}</li>`;
    });
    this.proctoringMessage += '</ul>';
    return true;
  }

  openFullScreen() {
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
  }

  start(): void {
    this.isSubmitTriggered = true;
    if (this.assessmentRegisterForm.invalid) {
      if (!(this.assessmentRegisterForm.get('firstName').value && this.assessmentRegisterForm.get('lastName').value && this.assessmentRegisterForm.get('email').value)) {
        this.toastrService.warning(Constants.pleaseCorrectTheValidationErrors);
        return;
      }
      if (!this.assessmentRegisterForm.get('customFields').valid) {
        this.toastrService.warning(Constants.pleaseCorrectTheValidationErrors);
        return;
      }
      if (!this.disableCaptcha) {
        if (this.assessmentRegisterForm.get('recaptcha').invalid) {
          this.toastrService.warning(Constants.PleaseConfirmthatYourAreNotARobot);
          return;
        }
      }
    }
    if (this.isNewUser && !this.userEmailValidation(this.assessmentRegisterForm.value.email)) {
      this.toastrService.warning(this.constants.invalidEmailAddress);
      return;
    }
    if (this.assessmentDetails.domainRestriction && this.isDomainRestricted()) {
      this.toastrService.warning(this.constants.hi + this.assessmentRegisterForm.value.firstName + " " + this.assessmentRegisterForm.value.lastName + this.constants.enteredEmailAddressDoesNotBelongToTheFollowingDomain + this.assessmentDetails.domainRestriction);
      return;
    }
    if (this.isAiApprove && this.assessmentRegisterForm.get("nameOnIdCard").value === this.assessmentRegisterForm.get("fatherName").value) {
      this.toastrService.warning(Constants.nameOnIdCardAndFatherNameShouldNotBeSame);
      return;
    }
    this.isInstructionsRead = false;
    if (this.isValidString(this.assessmentDetails.instructions) || this.isValidString(this.proctoringMessage))
      this.showProctoringSettings();
    else {
      this.isInstructionsRead = true;
      this.startAssessment();
    }
  }

  showProctoringSettings(): void {
    this.modalService.open(this.templateRef, { centered: true, size: 'md', backdrop: 'static', scrollable: true });
  }

  startAssessment(): void {
    if (this.assessmentDetails.sourceOfSchedule === Constants.techademy && !this.customArgs && !this.isRetryAssessment) {
      this.toastrService.warning(Constants.unableToStartTheAssessmentPleaseContactAdministrator);
      return;
    }
    if (!this.isInstructionsRead && !this.isGurukashi) {
      this.toastrService.warning(Constants.pleaseReadAndAcceptTheInstructions);
      return;
    }
    this.isAssessmentProcessing = true;
    this.cookieService.set(Constants.remainingTime, '', null, "/", null, true, "None");
    this.modalService.dismissAll();
    if (this.proctoringConfig && this.proctoringConfig.EnableFullScreenMode) {
      this.openFullScreen();
    }
    if (this.authUser) {
      this.userId = this.appSession.user.id;
      this.wheeboxConfig(this.userId, this.tenantId);
      this.cookieService.set(Constants.testLandingUrl, this.testTakerParams, null, "/", null, true, "None");
    } else if (!this.isNewUser && !this.authUser) {
      this.userUpload.email = this.emailAddress;
      this.userUpload.tenantId = this.tenantId;
      this.userUpload.tenantName = this.tenantName;
      this.request.userUpload = this.userUpload;
      this.request.isNewUser = this.isNewUser;
      let wheeboxProctoringConfig = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig);
      if (wheeboxProctoringConfig && (wheeboxProctoringConfig.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningAiApproval || JSON.parse(this.assessmentDetails.wheeboxProctoringConfig).EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningAiApproval)) {
        this.userUpload.nameOnIdCard = this.assessmentRegisterForm.value.nameOnIdCard;
        this.userUpload.fatherName = this.assessmentRegisterForm.value.fatherName;
      }
      if (this._appAuthService.isLoggedIn() && this._appAuthService.getToken()) {
        this.authToken = this._appAuthService.getToken();
        this.setAppSession();
      }
      else {
        this.cookieService.delete(this.constants.abpAuthToken, "/");
        this.userService.onboardUser(this.request).subscribe(res => {
          if (res) {
            this.authToken = res.result;
            this.setAppSession();
          }
        });
      }
    } else {
      this.emailAddress = this.assessmentRegisterForm.value.email;
      if (this.assessmentDetails.scheduleType == ScheduleType.Campaign && this.assessmentDetails.campaignDetails.scheduleIdNumber) {
        this.validateCampaign();
      } else {
        this.validatePublicAssessment();
      }
    }
  }

  validateCampaign() {
    let data: ValidateCampaignRequestDto = {
      scheduleIdNumber: this.assessmentDetails.campaignDetails.scheduleIdNumber,
      tenantId: this.tenantId,
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
        this.validatePublicAssessment();
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

  validatePublicAssessment() {
    let data: ValidateAssessment = {
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
      emailAddress: this.emailAddress,
      tenantId: this.tenantId
    };
    this.assessmentService.validateUserAssessment(data).subscribe(res => {
      if (!res.result.isAvailable) {
        if (res.result.isEvaluationPending) {
          this.router.navigate(['../../invalid-request', { isEvaluationPending: res.result.isEvaluationPending }], { relativeTo: this.activatedRoute });
        }
        else {
          this.router.navigate(['../../invalid-request', { tenantAdminEmailAddress: res.result.tenantAdminEmailAddress ? btoa(JSON.stringify(res.result.tenantAdminEmailAddress)) : '', errorCode: res.result.errorCode, tenantId: this.tenantId }], { relativeTo: this.activatedRoute });
        }
      }
      else {
        if (res.result.redirectParam !== '' && res.result.redirectParam !== undefined && res.result.redirectParam !== null) {
          this.redirectParam = res.result.redirectParam;
          this.resultType = res.result.resultType;
        }
        this.userUpload.email = this.assessmentRegisterForm.value.email;
        this.userUpload.name = this.assessmentRegisterForm.value.firstName;
        this.userUpload.surName = this.assessmentRegisterForm.value.lastName;
        this.userUpload.phoneNumber = this.assessmentRegisterForm.value.phoneNumber;
        this.userUpload.businessUnitName = Constants.default;
        this.userUpload.tenantId = this.tenantId;
        this.userUpload.tenantName = null;
        this.request.userUpload = this.userUpload;
        this.request.isNewUser = true;
        let wheeboxProctoringConfig = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig);
        if (wheeboxProctoringConfig && (wheeboxProctoringConfig.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningAiApproval || JSON.parse(this.assessmentDetails.wheeboxProctoringConfig).EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningAiApproval)) {
          this.userUpload.nameOnIdCard = this.assessmentRegisterForm.value.nameOnIdCard;
          this.userUpload.fatherName = this.assessmentRegisterForm.value.fatherName;
        }
        if (this._appAuthService.isLoggedIn() && this._appAuthService.getToken()) {
          this.authToken = this._appAuthService.getToken();
          this.setAppSession();
        }
        else {
          this.cookieService.delete(this.constants.abpAuthToken, "/");
          this.userService.onboardUser(this.request).subscribe(res => {
            if (res.result) {
              this.authToken = res.result;
              this.setAppSession();
            }
            else
              this.toastrService.warning(this.constants.failedToLoadAssessmentPleaseContactYourAdministrator);
          });
        }
      }
    });
  }

  patchValue(): void {
    this.assessmentRegisterForm.patchValue({
      email: this.emailAddress
    });
  }

  ssoPatchUserValue(_emailAddress: string, _name: string, _surName: string): void {
    this.assessmentRegisterForm.patchValue({
      email: _emailAddress,
      firstName: _name,
      lastName: _surName ? _surName : " "
    });
  }

  disableSSOFormFields(): void {
    this.setFormValidators();
    this.assessmentRegisterForm.get('email').disable();
    this.assessmentRegisterForm.get('firstName').disable();
    this.assessmentRegisterForm.get('lastName').disable();
    this.disableCaptcha = true;
  }

  setFormValidators(): void {
    let firstName = this.assessmentRegisterForm.get('firstName');
    firstName.removeValidators(Validators.required);
    firstName.removeValidators(Validators.pattern('^[a-zA-Z ]*$'));
    let lastName = this.assessmentRegisterForm.get('lastName');
    lastName.removeValidators(Validators.required);
    lastName.removeValidators(Validators.pattern('^[a-zA-Z ]*$'));
    let email = this.assessmentRegisterForm.get('email');
    email.disable();
    let phoneNumber = this.assessmentRegisterForm.get('phoneNumber');
    phoneNumber.removeValidators(Validators.pattern("^(\\+91 ?)[0-9]{12}$ | [0-9]{10}"));
    let captcha = this.assessmentRegisterForm.get('recaptcha');
    captcha.removeValidators(Validators.required);
  }

  setAppSession(): void {
    this.cookieService.set(this.constants.abpAuthToken, this.authToken, null, "/", null, true, "None");
    this.cookieService.set(Constants.tenantName, this.tenantName, null, "/", null, true, "None");
    this.cookieService.set(Constants.testLandingUrl, this.testTakerParams, null, "/", null, true, "None");
    this.userService.getMe().subscribe(res => {
      if (res) {
        this.appSession.user = <UserLoginInfoDto>{
          emailAddress: res.emailAddress,
          id: res.id,
          name: res.name,
          surname: res.surname,
          tenantId: res.tenantId,
          userName: res.userName
        };
        this.sessionService.user = this.appSession.user;
        this.appSession.tenant = <TenantLoginInfoDto>{
          id: res.tenantId,
          name: this.tenantName,
          tenancyName: this.tenantName
        };
        localStorage.setItem(this.constants.customField, "");
        if (this.showCustomFields && this.assessmentDetails.assessmentScheduleCustomField && this.assessmentDetails.assessmentScheduleCustomField.length > 0) {
          let userCustomFieldArray: AssessmentScheduleCustomFieldUserInput[] = [];
          this.assessmentDetails.assessmentScheduleCustomField.forEach((element, index) => {
            let userCustomField: AssessmentScheduleCustomFieldUserInput = { fieldLabel: element.fieldLabel, fieldValue: this.customFieldItems.value[index].customField };
            userCustomFieldArray.push(userCustomField);
          });
          let customFieldCollection = new AssessmentScheduleCustomFieldCollectionDto();
          customFieldCollection.customField = userCustomFieldArray;
          localStorage.setItem(this.constants.customField, JSON.stringify(customFieldCollection));
        }
        this.wheeboxConfig(res.id, res.tenantId);
      }
    });
  }

  wheeboxConfig(userId, tenantId): void {
    if (this.redirectParam !== null && this.redirectParam !== '' && this.redirectParam !== undefined) {
      let queryParam = btoa(this.redirectParam);
      if (this.resultType === ScheduleResultType.Hidden) {
        this.router.navigate(['../../../../app/test-taker/post-assessment', queryParam], { relativeTo: this.activatedRoute });
      }
      else if (this.resultType === ScheduleResultType.Detailed) {
        this.router.navigate(['../../../../app/test-taker/post-assessment-page-view', queryParam], { relativeTo: this.activatedRoute });
      }
      else if (this.resultType === ScheduleResultType.Redirect) {
        window.open(this.redirectParam, "_self");
      }
    }
    else {
      if (this.assessmentDetails.proctorType === ProctorType.Aeye) {
        const user = this.appSession.user;
        let data: AeyeUserFullVideo = {
          userEmail: user.emailAddress,
          userExamId: this.assessmentDetails.assessmentScheduleId,
        };
        this.assessmentService.checkUserAlreadyOnboarded(data).subscribe(res => {
          if (res && res.result) {
            let result = JSON.parse(res?.result).data.is_onboarding_completed;
            if (result) {
              this.initiateCandidateVerification(null);
            }
            else {
              this.onboardCandidate();
            }
          }
        });

      }
      else if (this.assessmentDetails.proctorType === ProctorType.Wheebox && this.assessmentDetails.enableWheeboxProctoring) {
        let queryParam = this.tenantId + '/' + this.assessmentScheduleIdNumber + '/' + this.emailAddress + '/' + this.tenantName;
        if (this.assessmentDetails.scheduleType == ScheduleType.Campaign) {
          queryParam = `${queryParam}/${this.assessmentDetails.campaignDetails.scheduleIdNumber}/${this.assessmentDetails.campaignDetails.name}`
        }
        queryParam = btoa(queryParam);
        let data: WheeboxUrlRequestDto = {
          userUniqueId: userId + '/' + tenantId,
          scheduleIdNumber: this.assessmentScheduleIdNumber,
          redirectUrl: AppConsts.appBaseUrl + '/' + this.tenantName + '/app/test-taker/test/' + queryParam,
          pageType: JSON.parse(this.assessmentDetails.wheeboxProctoringConfig) ? JSON.parse(this.assessmentDetails.wheeboxProctoringConfig).EnvironmentValidation : null,
          userFullName: this.appSession.user.name + (this.appSession.user.surname ? " " + this.appSession.user.surname : ""),
          dob: '',
          fatherName: '',
          nameOnIdCard: '',
          emailid: this.assessmentRegisterForm.get("email").value
        };
        let wheeboxProctoringConfig = JSON.parse(this.assessmentDetails.wheeboxProctoringConfig);
        if (wheeboxProctoringConfig && (wheeboxProctoringConfig.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningAiApproval || JSON.parse(this.assessmentDetails.wheeboxProctoringConfig).EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningAiApproval)) {
          data.dob = this.convertNgbDateToString(this.assessmentRegisterForm.get("dateOfBirth").value);
          data.fatherName = this.assessmentRegisterForm.get("fatherName").value;
          data.nameOnIdCard = this.assessmentRegisterForm.get("nameOnIdCard").value;
        }
        this.assessmentService.getWheeboxUrlAsync(data).subscribe(res => {
          if (res.result && res.result.isSuccess) {
            this.dataService.setUserRegisterData(res.result.userRegisterData);
            this.dataService.setToken(res.result.token);
            localStorage.setItem(Constants.attemptId, JSON.parse(res.result.userRegisterData).attemptId);
            localStorage.setItem(Constants.studentName, data.userFullName);
            localStorage.setItem(Constants.token, res.result.token + "");
            localStorage.setItem(Constants.studentUniqueId, data.userUniqueId.toString());
            localStorage.setItem(Constants.faceTrainUrl, res.result.trainUrl);
            localStorage.setItem(Constants.attemptNumber, res.result.attemptNumber.toString());
            localStorage.setItem(Constants.approvalPayload, res.result.approvePayloadData.toString());
            localStorage.setItem(Constants.trainPageUrlPayload, res.result.trainPayloadData.toString());
            window.open(res.result.environmentUrl, "_self");
          }
          else {
            this.toastrService.warning(res.result.errorMessage);
          }
        }, error => console.error(error));
      }
      else {
        this.navigateToQuestions();
      }
    }
  }

  @HostListener("window:aeye.candidateOnboardingCallbackEvent", ['$event'])
  initiateCandidateVerification(event: any) {
    if (event?.detail?.eventClose) {
      this.isAssessmentProcessing = false;
      return;
    }
    this.spinner.show();
    const user = this.appSession.user;
    const successfullVerificationCallbackDefinition = (event) => {
      let callbackEvent = new CustomEvent("aeye.candidateVerificationCallbackEvent", {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(callbackEvent);
    };

    this.spinner.hide();
    CandidateVerification({
      exam_id_from_lms: this.assessmentDetails.assessmentScheduleId,
      first_name: user.name,
      last_name: user.surname,
      email_id: user.emailAddress,
      organization_name: Constants.techademy,
      tenant_name: env.aeyeTenantName,
      api_key: env.aeyeApiKey,
      successfullVerificationCallback: successfullVerificationCallbackDefinition.toString(),
    }, false, '');
  }

  @HostListener("window:aeye.candidateVerificationCallbackEvent", ['$event'])
  initiateStartMonitoring(event) {
    if (event?.detail?.eventClose) {
      this.isAssessmentProcessing = false;
      return;
    }
    this.spinner.show();
    this.navigateToQuestions();
  }

  onboardCandidate() {
    const user = this.appSession.user;
    const successfullOnboardingCallbackDefinition = (event) => {
      let callbackEvent = new CustomEvent("aeye.candidateOnboardingCallbackEvent", {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(callbackEvent);
    };

    CandidateOnboarding({
      first_name: user.name.replace(/[^a-zA-Z ]/g, "").replace(/\s/g, ""),
      last_name: user.surname.replace(/[^a-zA-Z ]/g, "").replace(/\s/g, ""),
      email_id: this.emailAddress,
      organization_name: Constants.techademy,
      organization_provided_id: user.id,
      exam_id_from_lms: this.assessmentDetails.assessmentScheduleId,
      tenant_name: env.aeyeTenantName,
      additional_information: { sub_tenant_name: this.tenantName },
      successfullOnboardingCallback: successfullOnboardingCallbackDefinition.toString(),
      api_key: env.aeyeApiKey
    }, false, '');
  }

  navigateToQuestions(): void {
    this.emailAddress = this.assessmentRegisterForm.get('email').value;
    let queryParam = `${this.tenantId}/${this.assessmentScheduleIdNumber}/${this.emailAddress}/${this.tenantName}`;
    if (this.assessmentDetails.scheduleType == ScheduleType.Campaign)
      queryParam = `${queryParam}/${this.assessmentDetails.campaignDetails.scheduleIdNumber}/${this.assessmentDetails.campaignDetails.name}`
    queryParam = btoa(queryParam);
    this.router.navigate(['../../../../app/test-taker/test', queryParam], { relativeTo: this.activatedRoute });
    this.spinner.hide();
  }

  isDomainRestricted() {
    let result = true;
    let domainRestrictions = this.assessmentDetails.domainRestriction.split(',');
    if (this.isNewUser)
      this.emailAddress = this.assessmentRegisterForm.value.email;
    domainRestrictions.forEach(element => {
      if (this.emailAddress.includes(element))
        result = false;
    });
    return result;
  }

  private userEmailValidation(email: string) {
    let regex = /^[\w']+([\.'-]?[\w']+)*@\w+([\.-]?\w+)*(\.\w{1,}\w+)+$/;
    if (email === "" || !regex.test(email)) {
      return false;
    }
    return true;
  }

  isHtml(str) {
    let doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  isValidString(input: string): boolean {
    if (input !== null && input !== "" && input !== undefined) {
      return true;
    }
    return false;
  }
  convertNgbDateToString(date: NgbDate) {
    if (date)
      return `${date.year}-${date.month}-${date.day}`;
    else
      return "";
  }

  getLeaderBoardDetails() {
    if (this.assessmentDetails.type === AssessmentType.Hackathon) {
      let leaderBoardRequest: HackathonLeaderBoardRequest = {
        AssessmentId: this.assessmentDetails.assessmentId,
        AssessmentScheduleId: this.assessmentDetails.assessmentScheduleId,
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
  }
}
