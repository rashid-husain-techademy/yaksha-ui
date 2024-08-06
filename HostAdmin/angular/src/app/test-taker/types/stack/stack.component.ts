import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnvironmentType, QuestionStatus, MmlStatus, GuacamoleReadyState } from '@app/enums/test';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { QuestionDetailDto, StackAssessmentEvaluationData, UserAssessmentQuestionsDto, LabStatusRequest, ScheduledTemplateDetails, UpdateStackAssessmentTemplateType, ExistingInstanceRequestData, LabInstanceConfig, updateVMDetailsData, VmDetailsRequestData, VmConnectionRequestData, UpdateAssessmentQuestionDuration } from '@app/test-taker/field';
import { TestService } from '@app/test-taker/test.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { HostListener } from '@angular/core';
import { TestComponent } from '@app/test-taker/test/test.component';
import { CookieService } from 'ngx-cookie-service';
import { UserRoles } from '@app/enums/user-roles';
import { UtilsService } from 'abp-ng2-module';
import { formatDate } from '@angular/common';
import { environment as en } from "environments/environment";
import Guacamole from 'guacamole-common-js';
import { Helper } from '@app/shared/helper';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent implements OnInit, OnDestroy {
  @Input() isTocExpand: boolean;
  @Input() fullScreen: boolean;
  @Input() stop: boolean;
  @Output() fullScreenClosed = new EventEmitter<boolean>();

  field: QuestionDetailDto;
  durationData: UserAssessmentQuestionsDto;
  group: FormGroup;
  formControlName: string;
  constants = Constants;
  questionText: string;
  calculateDuration: NodeJS.Timeout;
  fileUrl: string;
  fileName: string;
  containerName: string = null;
  labLaunchUrl: string;
  labPassword: string;
  isLaunchDisabled: boolean;
  browserRefresh: boolean = false;
  isPreview: boolean = true;
  userRole: string;
  userRoles = UserRoles;
  authUser: boolean = false;
  plainQuestion: string;
  replaceQuestion: string;
  cutOffTime: string = "";
  linkValidity: string = "";
  scheduledTemplateDetails: ScheduledTemplateDetails[] = [];
  stackTemplateType: ScheduledTemplateDetails[] = [];
  customArgs: string;
  iFrame: boolean = false;
  isLabLaunchFailed: boolean = false;
  type = EnvironmentType;
  environmentType: any;
  externalPlayer: boolean = false;
  labConfigJson: LabInstanceConfig;
  vmId: string = '';
  currentMmlStatus: string = '';
  deploymentHasError: boolean;
  isDeploymentCompleted: boolean = false;
  deploymentStatus: MmlStatus;
  isLabStarted: boolean = false;
  isRestarting: boolean = false;
  statusUpdate: boolean = false;
  keyBoard: any;
  tryCount: number = 0;
  showActions: boolean = false;
  connectiontoken: any;
  launchLabClicked: boolean = false;
  showRestartMessage: boolean = false;
  restartGuestOs: boolean = false;
  labName: string = '';
  ipAddress: string = '';
  isShowCreationMessage: boolean = false;
  keyboard: any;
  tunnel: any;
  errorMessage: string = "";
  vmError: boolean = false;
  displayDiv: any;
  subResult: any;
  scale: number = 1;
  Client: any;
  isCompress: boolean = true;
  elem: any;
  isSaveandExit: boolean = false;
  showExistingLabMessage: boolean = false;
  isEclipseIde: boolean = false;
  questionsStatus: any[] = [
    { "status": QuestionStatus.Unread, "count": 0, "class": "outline-secondary", "label": Constants.unread },
    { "status": QuestionStatus.Attempted, "count": 0, "class": "success", "label": Constants.attempted },
    { "status": QuestionStatus.MarkedForReview, "count": 0, "class": "warning", "label": Constants.forReview },
    { "status": QuestionStatus.Skipped, "count": 0, "class": "danger", "label": Constants.skipped }];
  vmStarted: boolean;
  vmLaunched: boolean;
  connectionFailed: boolean;
  stageValue: number = 0;
  isRefreshVM: boolean;
  isConnectionMade: boolean;
  vmTicketResponse: any;
  vmCommunicationWSS: WebSocket;
  manualClose: boolean = false;
  doesPageRefresh: boolean = false;
  switchToGenerateURL: boolean = false;
  suspendedOrStopped: boolean = false;
  isProctorEnabled: boolean;
  initVMApiCallGlobal: boolean = false;
  gotTicket: boolean = false;


  constructor(
    public dataService: dataService,
    private testService: TestService,
    private activatedRoute: ActivatedRoute,
    private appSessionService: AppSessionService,
    private cookieService: CookieService,
    private toastrService: ToastrService,
    private _utilsService: UtilsService,
    @Optional() public testComponent: TestComponent
  ) { }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.Client) {
      setTimeout(() => {
        if (this.isCompress)
          this.Client.sendSize(this.vw(), this.vh());
        else
          this.Client.sendSize(event.target.innerWidth, event.target.innerHeight);
      }, 500);
    }
  }

  ngOnInit(): void {
    window.addEventListener('beforeunload', (event) => {
      this.vmWsDisconnect();
    });
    document.addEventListener('fullscreenchange', this.exitHandler.bind(this), false);
    this.elem = document.documentElement;
    this.displayDiv = document.getElementById("display");
    this.connectionFailed = this.dataService.connectionFailed;
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    if (bool === "true")
      this.authUser = true;

    this.dataService.customArgs.subscribe(data => {
      if (data)
        this.customArgs = data;
      else {
        this.customArgs = localStorage.getItem(Constants.customArgs);
      }
    });

    if (this.customArgs !== null) {
      this.iFrame = true;
    }
    this.isProctorEnabled = this.field.isProctorEnabled;
    this.plainQuestion = this.field.questionText;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion.replace(/<p>/gi, '<p style="margin-bottom:0px;">');
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      if ((this.labLaunchUrl !== undefined && this.labLaunchUrl !== null && this.labLaunchUrl !== "") || this.stageValue === 6)
        this.field.duration += 1;
    }, 1000);
    this.formControlName = `question${this.field.questionId}`;
    this.fileName = (this.field?.stackAssessmentDetail.instructionDocumentUrl !== null) ? this.field?.stackAssessmentDetail.instructionDocumentUrl.split('/')[4].split('?')[0] : null;
    this.environmentType = this.field?.stackAssessmentDetail.environmentType;
    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const userAssessmentData = atob(params['assessment']).split('/');
        if (userAssessmentData.length > 1) {
          this.isPreview = false;
          this.showActions = true;
          this.getExistingLab();
        }
      }
    });
    document.addEventListener('fullscreenchange', this.exitHandler.bind(this), false);
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
    this.vmWsDisconnect();
  }

  updateAssessmentType(value: number, name: string) {
    const data: UpdateStackAssessmentTemplateType = {
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      templateTypeId: value
    };
    if (name === Constants.eclipse) {
      this.isEclipseIde = true;
    }
    this.testService.updateStackAssessmentTemplateTypeAsync(data).subscribe(res => {
      if (res.success && res.result) {
        this.launchIde();
      }
      else {
        this.toastrService.error(Constants.somethingWentWrong);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  launchIde(): void {
    const data: StackAssessmentEvaluationData = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      emailAddress: this.appSessionService.user.emailAddress,
      assessmentScheduleId: this.field.assessmentScheduleId,
      userAssessmentMappingId: this.field.userAssessmentMappingId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      type: this.environmentType
    };
    if (!this.isPreview) {
      this.testService.createLab(data).subscribe(res => {
        if (res.success) {
          this.isLaunchDisabled = true;
          this.isLabLaunchFailed = false;
          this.toastrService.info(Constants.labDeploymentInprogress);
          setTimeout(() => {
            this.getLabStatus(this);
          }, 15000);
        }
      },
        error => console.error(error));
    }
  }
  getScheduledTemplateDetailsAsync() {
    this.testService.getScheduledTemplateDetailsAsync(this.field.assessmentScheduleId, this.field.userAssessmentAttemptId).subscribe(res => {
      if (res.success && res.result) {
        this.scheduledTemplateDetails = res.result;
      }
      else {
        this.toastrService.error(Constants.somethingWentWrong);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  saveExitWarning() {
    if (this.environmentType === EnvironmentType.Container) {
      abp.message.confirm(
        this.l('SaveandExitWarningMessage', `${Constants.stackSaveAndExitConfirmationMessage}`),
        (result: boolean) => {
          if (result) {
            this.linkValidityPopup();
          }
        });
    }
    else {
      abp.message.confirm(
        this.l('SaveandExitWarningMessage', `${Constants.stackVMSaveAndExitConfirmationMessage}`),
        (result: boolean) => {
          if (result) {
            this.linkValidityPopup();
          }
        });
    }
  }

  linkValidityPopup() {
    this.testService.getAssessmentScheduleDurationDetails(this.field.assessmentScheduleId).subscribe(res => {
      if (res.success && res.result) {
        this.durationData = res.result;
        if (this.durationData.startDateTime !== null) {
          let difference = new Date(this.durationData.startDateTime).getMinutes() + (this.durationData.cutOffTime);
          var cutOffDate = new Date(this.durationData.startDateTime);
          cutOffDate.setMinutes(difference);
          var endDatetime = formatDate(Helper.convertUTCDateToLocalDate(new Date(this.durationData.endDateTime).toISOString()), 'd/M/yyyy, h:mm a', 'en_US');
          this.cutOffTime = formatDate(Helper.convertUTCDateToLocalDate(cutOffDate.toISOString()), 'd/M/yyyy, h:mm a', 'en_US');
          this.linkValidity = "\n\n Link Validity End Date - " + endDatetime + ", Candidate won't be allowed to login after cut off time -" + this.cutOffTime;
        }
      }
      abp.message.confirm(
        this.l('SaveandExitWarningMessage', this.linkValidity),
        (result: boolean) => {
          if (result) {
            if (this.environmentType === EnvironmentType.Container) {
              this.saveExit();
            }
            else {

              this.isSaveandExit = true;
              this.externalPlayer = false;
              this.statusUpdate = false;
              this.isLabStarted = false;
              this.Client.disconnect();
              this.vmWsDisconnect();
              this.outsideVM();
              this.saveExit();
            }
          }
        });
    },
      error => console.error(error));
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  saveExit(): void {

    const data: StackAssessmentEvaluationData = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      emailAddress: this.appSessionService.user.emailAddress,
      assessmentScheduleId: this.field.assessmentScheduleId,
      userAssessmentMappingId: this.field.userAssessmentMappingId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      type: this.environmentType
    };
    this.dataService.isSaveAndExit = true;
    this.testService.updateStackAssessmentStatus(data).subscribe(res => {
      if (res.success) {
        this.updateAssessmentQuestionDuration(this);
      }
    },
      error => console.error(error));
  }

  getExistingLab(): void {
    const data: ExistingInstanceRequestData = {
      tenantId: this.appSessionService.tenantId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      type: this.environmentType
    };

    this.testService.getExistingInstance(data).subscribe(res => {
      if (res.success && res.result) {
        if (this.environmentType === this.type.Container) {
          this.isLaunchDisabled = true;
          this.labLaunchUrl = res.result.labLaunchUrl;
          this.labPassword = res.result.labPassword;
          this.field.questionStatus = QuestionStatus.Attempted;
          this.testComponent.startStackTimer();
          let isIdeLaunched = true;
          this.dataService.setIdeLaunched(isIdeLaunched);
        }
        else {
          this.labConfigJson = JSON.parse(res.result.configJson);
          if (this.labConfigJson.LabId && this.labConfigJson.LabId !== "" && this.labConfigJson.LabId !== "0") {
            this.doesPageRefresh = true;
            if (new Date(this.labConfigJson.Validity) > new Date()) {
              this.updateLabStatus(1, true);
              setTimeout(() => {
                if (this.gotTicket == false) {
                  this.initVMApiCallGlobal = true;
                  this.getVMStatusByApi(this.labConfigJson.LabId, this.initVMApiCallGlobal);
                }
              }, 45000);
              this.getVMTicket(this.labConfigJson.LabId);
              this.field.questionStatus = QuestionStatus.Attempted;
              this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count += 1;
              this.testComponent.questionsStatus = this.questionsStatus;
              this.isLaunchDisabled = true;
              let isIdeLaunched = true;
              this.showExistingLabMessage = true;
              this.dataService.setIdeLaunched(isIdeLaunched);
            }
            else {
              this.getVMTicket(this.labConfigJson.LabId);
              this.toastrService.warning(this.constants.theLabProvisionedForThisAssessmentWasExpiredPleaseContactAdministrator);
            }
          }
        }
      }
      else if (res.success) {
        this.getScheduledTemplateDetailsAsync();
      }
    },
      error => console.error(error));
  }

  getLabStatus(_this) {
    let request: LabStatusRequest = {
      userAssessmentAttemptId: _this.field.userAssessmentAttemptId,
      questionId: _this.field.questionId,
      tenantId: _this.appSessionService.tenantId,
      containerName: _this.containerName
    };
    _this.testService.getLabStatus(request).subscribe(res => {
      if (res.success && res.result && res.result.labLaunchUrl !== "" && res.result.labLaunchUrl !== null) {
        if (_this.containerName === null) {
          _this.containerName = res.result.containername;
        }
        if (res.result.status === Constants.provisionFailed) {
          _this.isLaunchDisabled = false;
          _this.isLabLaunchFailed = true;
          return;
        }
        _this.labLaunchUrl = res.result.labLaunchUrl;
        _this.labPassword = res.result.labPassword;
        _this.isLabLaunchFailed = false;
        _this.field.questionStatus = QuestionStatus.Attempted;
        _this.testComponent.startStackTimer();
        let isIdeLaunched = true;
        _this.dataService.setIdeLaunched(isIdeLaunched);
        _this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count += 1;
        _this.field.questionStatus = QuestionStatus.Attempted;
        _this.testComponent.questionsStatus = _this.questionsStatus;
      }
      else
        _this.callbackAfterTimeout(_this.getLabStatus, _this, 15);
    });
  }

  copyPassword() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.labPassword;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  callbackAfterTimeout(_callback: any, _arg, _defaultInterval: number = 30) {
    _defaultInterval = _defaultInterval * 1000;
    setTimeout(() => {
      _callback(_arg);
    }, _defaultInterval);
  }

  openIde(): void {
    if (this.labLaunchUrl) {
      window.open(this.labLaunchUrl, '_blank');
    }
  }

  openInstructions(url) {
    window.open(url, '_blank');
  }

  /*MML Region*/

  createMMLLab() {
    const requestData: StackAssessmentEvaluationData = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      emailAddress: this.appSessionService.user.emailAddress,
      assessmentScheduleId: this.field.assessmentScheduleId,
      userAssessmentMappingId: this.field.userAssessmentMappingId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      type: this.environmentType
    };
    this.testService.createMMLLab(requestData).subscribe(res => {
      if (res.result && res.result.isSuccess) {
        this.isLaunchDisabled = true;
        this.field.questionStatus = QuestionStatus.Attempted;
        this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count += 1;
        this.testComponent.questionsStatus = this.questionsStatus;
        this.isShowCreationMessage = true;
        this.vmId = res.result.virtualMachineId;
        this.getVMTicket(this.vmId);
      }
      else {
        this.isLaunchDisabled = false;
        this.vmError = true;
        this.isShowCreationMessage = false;
        this.toastrService.error(res.result.errorMessage);
      }
    });
  }

  getVMTicket(vmId: string) {
    if (this.initVMApiCallGlobal == false) {
      var tenantId = this.appSessionService.tenantId;
      this.testService.getVMTicket(tenantId).subscribe(res => {
        if (res.result !== null) {
          this.gotTicket = true;
          this.vmTicketResponse = JSON.parse(res.result);
          this.getVMStatus(vmId);
        }
        else {
          setTimeout(() => {
            this.getVMTicket(vmId);
          }, 5000);
        }
      });
    }

  }

  getVMStatus(vmId: string) {
    if (this.vmTicketResponse && this.vmTicketResponse !== null) {
      const url = `wss://${en.makeMyLabsBaseURL}/v1/ws/vm/${this.vmTicketResponse.user}/${this.vmTicketResponse.id}`;
      try {
        let initVMApiCall: boolean = true; // parallely to init VM status API call
        this.vmCommunicationWSS = new WebSocket(url);
        setTimeout(() => {
          this.getVMStatusByApi(vmId, initVMApiCall);
        }, 60000);
        this.vmCommunicationWSS.onmessage = event => {
          initVMApiCall = false;
          this.vmWebSocketOnMessage(vmId, event);
        };
        this.vmCommunicationWSS.onerror = event => {
          this.resetVmWss(vmId);
        };
        this.vmCommunicationWSS.onclose = event => {
          if (!this.manualClose) {
            this.resetVmWss(vmId);
          }
          else {
            this.manualClose = false;
          }
        };
        this.setStateForRunning(vmId);
      }
      catch (error) {
        setTimeout(() => {
          this.resetVmWss(vmId);
        }, 5000);
      }
    }
  }

  getVMStatusByApi(vmId: string, invokeAPI: boolean) {
    if (invokeAPI) {
      let data: VmDetailsRequestData = {
        vmId: vmId,
        tenantId: this.appSessionService.tenantId
      };
      this.testService.getVMStatus(data).subscribe(res => {
        if (res.result !== null) {
          let result = JSON.parse(res.result);
          let format = { key: 'vm', payload: { vm: result.id, vm_state: result.vm_state, duration_minutes: result.duration_minutes } };
          this.vmWebSocketOnMessage(vmId, { data: JSON.stringify(format) }, Constants.api);
        }
        else {
          setTimeout(() => {
            this.getVMStatusByApi(vmId, invokeAPI);
          }, 5000);
        }
      });
    }
  }

  setStateForRunning(vmId: string) {
    let stackVmState = localStorage.getItem("stackVmState");
    if (!stackVmState && !(!stackVmState && this.doesPageRefresh == true)) {
      return;
    }
    const vmState = !stackVmState ? 0 : JSON.parse(stackVmState);
    if (vmState == 0 || vmState >= MmlStatus.ProvisioningSuccess) {
      let data: VmDetailsRequestData = {
        vmId: vmId,
        tenantId: this.appSessionService.tenantId
      };
      this.testService.getVMStatus(data).subscribe(res => {
        if (res.result !== null) {
          var result = JSON.parse(res.result);
          this.labDetails(result);
          this.triggerRunningState(this.vmId);
        }
      });
    }
  }

  triggerRunningState(vmId: string) {
    let status = 1;
    let data: any = {
      "virtualMachineId": vmId,
      "status": status,
      "tenantId": this.appSessionService.tenantId
    };
    this.testService.updateVirtualMachine(data).subscribe(res => {
      if (this.gotTicket == false) {
        this.getVMStatusByApi(vmId, true);
      }
    });
  }

  resetVmWss(vmId: string) {
    this.vmWsDisconnect();
    this.testComponent.pauseCountDown();
    this.getVMTicket(vmId);
  }

  vmWsDisconnect() {
    this.manualClose = true;
    this.vmCommunicationWSS?.close();
  }

  vmWebSocketOnMessage(vmId: string, status: any, callFrom?: string) {
    let data: VmDetailsRequestData = {
      vmId: vmId,
      tenantId: this.appSessionService.tenantId
    };

    let parsedResult = JSON.parse(status?.data);
    let result = parsedResult?.payload;
    if (!result?.vm_state && result?.vm !== vmId) {
      return;
    }

    localStorage.setItem("stackVmState", JSON.stringify(result.vm_state));
    if (this.doesPageRefresh && (result.vm_state === MmlStatus.Suspended || result.vm_state === MmlStatus.PowerOnInProgress || result.vm_state === MmlStatus.Running)) {
      this.stageValue = 2;
    }
    switch (result.vm_state) {
      case MmlStatus.CreationInProgress:
        this.currentMmlStatus = this.constants.creationInProgress;
        break;
      case MmlStatus.BaseVmNotFound:
        this.currentMmlStatus = this.constants.baseVmNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.ClusterNotFound:
        this.currentMmlStatus = this.constants.clusterNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.DatacenterNotFound:
        this.currentMmlStatus = this.constants.dataCenterNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.DVSNotFound:
        this.currentMmlStatus = this.constants.dVSNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.TenantPortGroupNotFound:
        this.currentMmlStatus = this.constants.tenantPortGroupNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.DatastoreNotFound:
        this.currentMmlStatus = this.constants.datastoreNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.SnapShotNotFound:
        this.currentMmlStatus = this.constants.snapshotNotFound;
        this.deploymentHasError = true;
        break;
      case MmlStatus.ConfigureParamSuccess:
        this.currentMmlStatus = this.constants.configureParamSuccess;
        break;
      case MmlStatus.CloningInProgress:
        this.currentMmlStatus = this.constants.cloningInProgress;
        break;
      case MmlStatus.CloningFailed:
        this.currentMmlStatus = this.constants.cloningFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.CloningSuccess:
        this.currentMmlStatus = this.constants.cloningSucess;
        break;
      case MmlStatus.ReConfigureInProgress:
        this.currentMmlStatus = this.constants.reconfigurationInProgress;
        break;
      case MmlStatus.ReConfigureFailed:
        this.currentMmlStatus = this.constants.reconfigurationFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.ReconfigureSuccess:
        this.currentMmlStatus = this.constants.reconfigurationSuccess;
        break;
      case MmlStatus.InitialBootInProgress:
        this.currentMmlStatus = this.constants.initialBootInProgress;
        break;
      case MmlStatus.InitialBootFailed:
        this.currentMmlStatus = this.constants.initialBootFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.InitialBootSuccess:
        this.currentMmlStatus = this.constants.initialBootSuccess;
        break;
      case MmlStatus.CustomizationInProgress:
        this.currentMmlStatus = this.constants.customizationInProgress;
        break;
      case MmlStatus.CustomizationFailed:
        this.currentMmlStatus = this.constants.customizationFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.CustomizationSuccess:
        this.currentMmlStatus = this.constants.customizationSuccess;
        break;
      case MmlStatus.InitialShutDownInProgress:
        this.currentMmlStatus = this.constants.initialSuspendInProgress;
        break;
      case MmlStatus.InitialShutDownFailed:
        this.currentMmlStatus = this.constants.initialSuspendFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.InitialShutDownSuccess:
        this.currentMmlStatus = this.constants.initialSuspendSuccess;
        break;
      case MmlStatus.ProvisioningFailed:
        this.currentMmlStatus = this.constants.provisioningFailed;
        this.deploymentHasError = true;
        break;
      case MmlStatus.ProvisioningSuccess:
        this.currentMmlStatus = this.constants.provisioningSuccess;
        this.isDeploymentCompleted = true;
        this.getVMStatusAfterProvisioning(data, 1);
        break;
      case MmlStatus.PowerOnInProgress:
        this.currentMmlStatus = this.constants.powerOnInProgress;
        this.deploymentStatus = MmlStatus.PowerOnInProgress;
        this.getVMStatusAfterProvisioning(data, 2, callFrom);
        break;
      case MmlStatus.Running:
        this.currentMmlStatus = this.constants.running;
        this.isRestarting = false;
        this.statusUpdate = false;
        this.doesPageRefresh = false;
        if (!this.switchToGenerateURL) {
          this.getVMStatusAfterProvisioning(data, 3);
        }
        this.switchToGenerateURL = false;
        break;
      case MmlStatus.PowerOffInProgress:
        this.currentMmlStatus = this.constants.powerOffInProgress;
        this.deploymentStatus = MmlStatus.PowerOffInProgress;
        this.getVMStatusAfterProvisioning(data, 2);
        break;
      case MmlStatus.Stopped:
        this.currentMmlStatus = this.constants.stopped;
        this.vmStarted = false;
        this.suspendedOrStopped = true;
        this.isLabStarted = false;
        this.vmLaunched = false;
        this.statusUpdate = false;
        this.testComponent.pauseCountDown();
        this.getVMStatusAfterProvisioning(data, 4);
        if (this.showExistingLabMessage && !this.isSaveandExit) {
          this.updateLabStatus(1);
        }
        else {
          if (this.isSaveandExit) {
            this.saveExit();
          }
          this.externalPlayer = false;
          if (this.Client) {
            this.Client.disconnect();
            this.outsideVM();
          }
        }
        break;
      case MmlStatus.Suspended:
        this.currentMmlStatus = this.constants.suspended;
        this.suspendedOrStopped = true;
        this.isLabStarted = false;
        this.statusUpdate = false;
        this.testComponent.pauseCountDown();
        this.getVMStatusAfterProvisioning(data, 1);
        break;
      case MmlStatus.Restarting:
        this.currentMmlStatus = this.constants.restarting;
        this.getVMStatusAfterProvisioning(data, 4);
        break;
      case MmlStatus.SuspendInProgress:
        this.currentMmlStatus = this.constants.suspendInProgress;
        break;
      case MmlStatus.ShutDownGuestOsInProgress:
        this.currentMmlStatus = this.constants.shutDownGuestOsInProgress;
        break;
      case MmlStatus.Deleted:
        this.currentMmlStatus = this.constants.deleted;
        break;
      case MmlStatus.DeletionInProgress:
        this.currentMmlStatus = this.constants.deletionInProgress;
        break;
      case MmlStatus.RestartingGuestOs:
        this.currentMmlStatus = this.constants.restartingGuestOS;
        this.getVMStatusAfterProvisioning(data, 4);
        break;
    }
  }

  getVMStatusAfterProvisioning(data: VmDetailsRequestData, countFunc: number, callFrom?: string) {
    this.testService.getVMStatus(data).subscribe(res => {
      if (res.result !== null) {
        var result = JSON.parse(res.result);
        if (countFunc == 1) {
          this.labDetails(result);
          this.updateLabStatus(1);
        }
        else if (countFunc == 3) {
          this.labDetails(result);
          this.updateVMDetails();
          this.generateUrl();
        }
        else if (countFunc == 4) {
          this.labDetails(result);
        }
        else if (countFunc == 2) {
          this.labDetails(result);
          this.labProgressStatus(this.deploymentStatus, result);
          if (callFrom === Constants.api) {
            setTimeout(() => {
              this.getVMStatusByApi(data.vmId, true);
            }, 3000);
          }
        }
      }
      else {
        this.Provisioningrecusivecall(data, countFunc);
      }
    });
  }

  Provisioningrecusivecall(data: VmDetailsRequestData, countFunc: number) {
    setTimeout(() => {
      this.getVMStatusAfterProvisioning(data, countFunc);
    }, 10000);
  }

  RefreshProvisioningrecusivecall(vmId: string) {
    setTimeout(() => {
      this.refreshGetVMStatus(vmId);
    }, 10000);
  }

  refreshGetVMStatus(vmId: string) {
    let data: VmDetailsRequestData = {
      vmId: vmId,
      tenantId: this.appSessionService.tenantId
    };
    this.testService.getVMStatus(data).subscribe(res => {
      if (res.result !== null) {
        let result = JSON.parse(res.result);
        switch (result.vm_state) {
          case MmlStatus.PowerOnInProgress:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.Running:
            this.updateVMDetails();
            setTimeout(() => {
              this.launchVm();
            }, 5000);
            break;
          case MmlStatus.Suspended:
            this.refreshUpdateLabstatus(vmId);
            break;
          case MmlStatus.PowerOffInProgress:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.Stopped:
            this.refreshUpdateLabstatus(vmId);
            break;
          case MmlStatus.Restarting:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.RestartingGuestOs:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.SuspendInProgress:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.DeletionInProgress:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.Deleted:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
          case MmlStatus.ShutDownGuestOsInProgress:
            this.RefreshProvisioningrecusivecall(vmId);
            break;
        }
      }
      else {
        setTimeout(() => {
          this.refreshGetVMStatus(vmId);
        }, 10000);
      }
    });
  }

  refreshUpdateLabstatus(vmId: string) {
    let status = 1;
    let data: any = {
      "virtualMachineId": vmId,
      "status": status,
      "tenantId": this.appSessionService.tenantId
    };
    this.testService.updateVirtualMachine(data).subscribe(res => {
      setTimeout(() => {
        this.refreshGetVMStatus(vmId);
      }, 10000);
    });
  }

  labDetails(result: any) {
    this.isShowCreationMessage = false;
    this.isDeploymentCompleted = true;
    this.labName = result.vm_name;
    this.ipAddress = result.vm_ip_address;
    this.vmId = result.id;
  }

  labProgressStatus(deploymentStatus, result: any) {
    if (deploymentStatus === MmlStatus.PowerOnInProgress) {
      this.labConfigJson.DeploymentStatus = MmlStatus.PowerOnInProgress;
      this.labConfigJson.DeploymentMessage = this.constants.powerOnInProgress;
      this.labConfigJson.LabStatus = this.constants.oN;
      this.labConfigJson.TotalDuration = result?.duration_minutes;
    }
    else if (deploymentStatus === MmlStatus.PowerOffInProgress) {
      this.labConfigJson.DeploymentStatus = MmlStatus.PowerOffInProgress;
      this.labConfigJson.DeploymentMessage = this.constants.powerOffInProgress;
      this.labConfigJson.LabStatus = this.constants.off;
      this.labConfigJson.TotalDuration = result?.duration_minutes;
    }
    else {
      this.labConfigJson.DeploymentStatus = this.deploymentStatus;
      this.labConfigJson.DeploymentMessage = this.constants.closedTheTab;
      this.labConfigJson.TotalDuration = result?.duration_minutes;
      this.updateVMDetails();
    }
  }

  updateLabStatus(status: number, initialStartAtSaveAndExit: boolean = false) {
    this.vmError = false;
    this.errorMessage = "";
    this.statusUpdate = true;
    this.tryCount = 0;
    this.showRestartMessage = false;
    this.launchLabClicked = false;
    let data: any = {
      "virtualMachineId": this.vmId == null || this.vmId == "" ? this.labConfigJson.LabId : this.vmId,
      "status": status,
      "tenantId": this.appSessionService.tenantId
    };

    this.testService.updateVirtualMachine(data).subscribe(res => {
      if (res && res.result && res.success && (!initialStartAtSaveAndExit)) {
        this.restartGuestOs = false;
        let result = JSON.parse(res.result);
        window.onunload = () => {
          this.labProgressStatus(this.deploymentStatus, result);
        };
        if (status === 1 && result) {
          if (result?.vm_state === MmlStatus.Running) { //Replace with Enum for Start
            this.isLabStarted = true;
            this.isRestarting = false;
            this.statusUpdate = false;
            this.launchLabClicked = true;
          }
          else if (result?.vm_state === MmlStatus.PowerOnInProgress) {
            this.isLabStarted = false;
          }
          else {
            this.isLabStarted = false;
            this.errorMessage = result[0]?.response?.Result.includes(this.constants.notFound) ? "" : (JSON.parse(result[0]?.response?.Result)?.message ? JSON.parse(result[0]?.response?.Result).message : "");
            this.vmError = true;
            this.toastrService.warning(this.constants.unableToStartTheLabPleaseContactTheAdministrator);
          }
        }
        else if (status === 5 && result) {
          if (res.result?.vm_state === MmlStatus.Running) { //Replace with Enum for Stop
            this.statusUpdate = false;
            this.toastrService.success(this.constants.labHasBeenStarted);
          }
          else if (result?.vm_state === MmlStatus.RestartingGuestOs) {
            this.isRestarting = true;
          }
          else {
            this.vmError = true;
            this.errorMessage = this.constants.unableToRestartTheLabPleaseContactTheAdministrator;
          }
        }
      }
    });
  }

  refreshVM() {
    this.isRefreshVM = this.switchToGenerateURL = true;
    if (this.connectionFailed === true) {
      const data: ExistingInstanceRequestData = {
        tenantId: this.appSessionService.tenantId,
        userAssessmentAttemptId: this.field.userAssessmentAttemptId,
        questionId: this.field.questionId,
        type: this.environmentType
      };
      this.testService.getExistingInstance(data).subscribe(res => {
        if (res.success && res.result) {
          this.labConfigJson = JSON.parse(res.result.configJson);
          if (this.labConfigJson.LabId && this.labConfigJson.LabId !== "" && this.labConfigJson.LabId !== "0") {
            if (new Date(this.labConfigJson.Validity) > new Date()) {
              this.refreshGetVMStatus(this.labConfigJson.LabId);
            }
            else {
              this.toastrService.warning(this.constants.theLabProvisionedForThisAssessmentWasExpiredPleaseContactAdministrator);
            }
          }
        }
        else {
          setTimeout(() => {
            this.refreshVM();
          }, 10000);
        }
      });
    }
    else {
      this.testComponent.resumeCountDown();
      this.launchVm();
    }
  }

  outsideVM() {
    if (this.keyBoard) {
      this.keyBoard.onkeydown = null;
      this.keyBoard.onkeyup = null;
    }
    if (this.Client) {
      this.Client.disconnect();
    }
  }

  updateVMDetails() {
    let data: updateVMDetailsData = {
      virtualMachineId: this.vmId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      tenantId: this.appSessionService.tenantId
    };
    this.testService.updateVMDetails(data).subscribe(res => {
    },
      error => console.error(error)
    );
  }

  generateUrl() {
    this.doesPageRefresh = false;
    if (this.stageValue > 5) // to avoid api server error
      return;

    if (this.stageValue < 1)
      this.stageValue += 1;

    let data: VmConnectionRequestData = {
      vmId: this.vmId,
      tenantId: this.appSessionService.tenantId,
      stageValue: this.stageValue
    };
    this.launchLabClicked = true;
    this.tryCount = this.tryCount + 1;
    this.testService.generateConnectionURL(data).subscribe(res => {
      if (res && res.result && res.success) {
        if (res.result.isSuccess) {
          switch (res.result.stage) {
            case 1:
              if (this.stageValue < 5) {
                this.stageValue = this.stageValue + 1;
                // vm quota
                this.generateUrl();
              }
              break;
            case 2:
              if (this.stageValue < 5) {
                this.stageValue = this.stageValue + 1;
                // vm status
                this.generateUrl();
              }
              break;
            case 3:
              if (this.stageValue < 5) {
                this.stageValue = this.stageValue + 1;
                //vmware tools
                this.generateUrl();
              }
              break;
            case 4:
              if (this.stageValue < 5) {
                this.stageValue = this.stageValue + 1;
                //ip
                this.generateUrl();
              }
              break;
            case 5:
              this.stageValue = this.stageValue + 1;
              this.connectiontoken = res.result.connectionToken;
              this.isLabStarted = true;
              let isIdeLaunched = true;
              this.dataService.setIdeLaunched(isIdeLaunched);
              break;
          }
        }
        else {
          this.restartGuestOs = false;
          if (res.result.stage === 1) {
            this.currentMmlStatus = this.constants.quotaExhausted;
            this.toastrService.warning(this.constants.quotaExhausted);
          }
          if (res.result.stage === 3) {
            this.currentMmlStatus = this.constants.vMWareToolsNotRunning;
            this.toastrService.warning(this.constants.vMWareToolsNotRunning);
            if (this.tryCount <= 3) {
              this.GenerateUrlRecusiveCall();
            }
            else {
              this.showRestartMessage = true;
              this.restartGuestOs = true;
            }
          }
          if (res.result.stage === 4) {
            this.currentMmlStatus = this.constants.vMIPNotFound;
            this.toastrService.warning(this.constants.vMIPNotFound);
            if (this.tryCount <= 3) {
              this.GenerateUrlRecusiveCall();
            }
            else {
              this.showRestartMessage = true;
              this.restartGuestOs = true;
            }
          }
        }
      }
      else {
        this.launchLabClicked = false;
        this.toastrService.warning(this.constants.pleaseWaitAsWeReconnectForYou);
        this.tryCount = 0;
        this.stageValue = 0;
        this.triggerRunningState(this.vmId);
      }
    });
  }

  reconnectGenerateUrl() {
    setTimeout(() => {
      this.generateUrl();
    }, 10000);
  }

  GenerateUrlRecusiveCall() {
    setTimeout(() => {
      this.generateUrl();
    }, 40000);
  }

  launchVm(startTimer?: boolean) {
    this.vmlanuch(this.vw(), this.vh(), startTimer);
  }

  async vmlanuch(width, height, startTimer?: boolean) {
    this.Client?.disconnect();
    this.connectionFailed = false;
    this.dataService.connectionFailed = this.connectionFailed;
    this.isRestarting = false;
    this.vmStarted = true;
    this.externalPlayer = this.showActions;
    this.Client = this.getClient(en['makeMyLabsBaseURL'] + "/v1/vm-connect?token=" + this.connectiontoken
      + "&height="
      + Math.floor(height)
      + "&width="
      + Math.floor(width)
      + "&display-update&disable-copy=true&disable-paste=true");

    this.renderDisplay(this.Client);
    this.bindEvents.call(this);

    this.Client.connect();
    this.isConnectionMade = true;
    this.Client.onstatechange = (state) => {
      if (state === GuacamoleReadyState.Connected) {
        this.isConnectionMade = this.connectionFailed = false;
        this.vmLaunched = this.isLabStarted = true;
        this.isRefreshVM = false;
        if (startTimer) {
          this.testComponent.startStackTimer(true);
        }
        else
          this.testComponent.resumeCountDown();
      }
      if ((state === GuacamoleReadyState.Closed || state === GuacamoleReadyState.Connecting) && !this.isSaveandExit) {
        this.connectionFailed = true;
      }
    };
    this.Client.onerror = (error) => {
      if (error.message.toLowerCase().indexOf("connection failed") !== -1 || error.message.toLowerCase().indexOf("aborted") !== -1) {
        this.connectionFailed = true;
        this.testComponent.pauseCountDown();
        this.dataService.connectionFailed = true;
      }
    };
    //Disconnect on close
    window.onunload = function () {
      this.Client.disconnect();
    };
  }

  vh() {
    var height = document.getElementById('question-area').clientHeight;
    return height + 100;
  }

  vw() {
    var screenWidth = document.getElementById('parent-div').clientWidth;;
    return screenWidth;
  }

  getClient(guacamoleEndpoint) {
    var tunnel;
    if (window.WebSocket) {
      var wsProtocol = "wss:";
      this.tunnel = new Guacamole.WebSocketTunnel(wsProtocol + "//" + guacamoleEndpoint);
      tunnel = new Guacamole.ChainedTunnel(this.tunnel);
    }
    return new Guacamole.Client(tunnel);
  }

  renderDisplay(client) {
    this.displayDiv = document.getElementById("display");
    if (this.displayDiv === null) {
      setInterval(() => {
        this.renderDisplay(client);
      }, 5000);
    } else {
      var display = client.getDisplay();
      this.displayDiv?.childNodes.forEach((element) => {
        element.remove();
      });
      this.displayDiv?.appendChild(display.getElement());
    }
  }

  bindEvents() {
    let mouse = new Guacamole.Mouse(this.Client.getDisplay().getElement());
    mouse.onmousedown = (mouseState) => {
      this.Client.sendMouseState(mouseState);
    };
    mouse.onmouseup = (mouseState) => {
      this.Client.sendMouseState(mouseState);
    };
    mouse.onmousemove = function (mouseState) {
      updateMouseState(mouseState);
    };

    let updateMouseState = (mouseState) => {
      mouseState.y = mouseState.y / this.scale;
      mouseState.x = mouseState.x / this.scale;
      this.Client.sendMouseState(mouseState);
    };

    this.keyboard = new Guacamole.Keyboard(document);

    if (!this.keyboard || !this.keyboard.onkeydown) {
      this.keyboard.onkeydown = (keysym) => {
        this.Client.sendKeyEvent(1, keysym);
      };
    }

    if (!this.keyboard || !this.keyboard.onkeyup) {
      this.keyboard.onkeyup = (keysym) => {
        this.Client.sendKeyEvent(0, keysym);
      };
    }
    this.dataService.isMakeMyLabsInUse = true;
  }

  async expandFullScreen(): Promise<void> {
    this.isCompress = false;
    await this.openFullscreen();
    this.scaleWindow();
  }

  async openFullscreen() {
    const target = document.getElementById('display');
    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      target.requestFullscreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      target.requestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      target.requestFullscreen();
    }
  }
  async closeFullscreen() {
    if (this.elem.exitFullscreen) {
      //target.exitFullscreen();
    } else if (this.elem.mozCancelFullScreen) {
      /* Firefox */
      this.elem.mozCancelFullScreen();
    } else if (this.elem.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitExitFullscreen();
    } else if (this.elem.msExitFullscreen) {
      /* IE/Edge */
      this.elem.msExitFullscreen();
    }
  }

  scaleWindow() {

    if (this.isCompress) {
      this.Client.sendSize(this.vw(), this.vh());
    }

    else
      this.Client.sendSize(window.screen.width, window.screen.height);
  }

  exitHandler() {
    if (!document.fullscreenElement) {
      this.isCompress = true;
      this.scaleWindow();
    }
  }
  updateAssessmentQuestionDuration(_this) {
    let currentTimer = parseInt(atob(_this.cookieService.get(Constants.remainingTime))) / 60;
    this.dataService.stopTimer(this.field.questionId);
    const durationInMilliSeconds = this.dataService.getTimeSpent(this.field.questionId);
    this.dataService.startTimer(this.field.questionId);
    let request: UpdateAssessmentQuestionDuration = {
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      currentDuration: this.durationData.duration - (isNaN(currentTimer) ? 0 : currentTimer),
      questionId: this.field.questionId,
      durationMilliSeconds: isNaN(currentTimer) ? (this.durationData.duration * 60 * 1000) : durationInMilliSeconds,
    };
    _this.testService.updateAssessmentQuestionDuration(request).subscribe(res => {
      if (res.success && res.result) {
        let landingUrl = abp.utils.getCookieValue(Constants.testLandingUrl);
        window.location.href = AppConsts.appBaseUrl + `/${this.appSessionService.tenantName}/account/test-taker/pre-assessment/${landingUrl}`;
        if (!this.authUser) {
          this.cookieService.delete(this.constants.abpAuthToken, "/");
        }
      }
    });
  }
}
