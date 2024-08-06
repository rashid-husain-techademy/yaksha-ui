import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import { AppComponentBase } from '@shared/app-component-base';
import { CampaignValidationErrors, UserAssessmentStatus } from '@app/enums/assessment';
import { MyAssessmentsService } from '../my-assessments.service';
import { CampaignAssessment, UserCampaignAssessment, UserCampaignStatus } from '../my-assessments';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateCampaignRequestDto, ValidateCampaignResultDto } from '@app/admin/campaign/campaign';
import { CampaignService } from '@app/admin/campaign/campaign.service';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantId: number;
  userId: number;
  emailAddress: string;
  userAssessmentStatus = UserAssessmentStatus;
  userCampaignStatus = UserCampaignStatus;
  campaignAssessmentResult: UserCampaignAssessment;
  campaignAssessments: CampaignAssessment[];
  enableStartIndex: number;
  campaignScheduleId: number;
  campaignId: number;
  scheduleId: any;
  isDescription: boolean = false;
  driveInActiveMessage: string;
  constructor(private myAssessmentsService: MyAssessmentsService,
    private activateRoute: ActivatedRoute, private router: Router,
    injector: Injector, private modalService: NgbModal, private campaignService: CampaignService,
    private activatedRoute: ActivatedRoute) { super(injector); }


  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    this.userId = this.appSession.user.id;
    this.emailAddress = this.appSession.user.emailAddress;
    this.activateRoute.params.subscribe(param => {
      this.campaignId = JSON.parse(atob(param['campaignId']));
      this.campaignScheduleId = JSON.parse(atob(param['campaignScheduleId']));
    });
    this.getCampaignAssessments();
  }

  getCampaignAssessments() {
    this.myAssessmentsService.getUserCampaignAssessments(this.campaignId, this.campaignScheduleId).subscribe(res => {
      if (res.result) {
        this.campaignAssessmentResult = res.result;
        if (!this.campaignAssessmentResult.isScheduleActive && (this.campaignAssessmentResult.userCampaignStatus === UserCampaignStatus.NotStarted ||
          this.campaignAssessmentResult.userCampaignStatus === UserCampaignStatus.InProgress)) {
          this.driveInActiveMessage = this.campaignAssessmentResult.userCampaignStatus === UserCampaignStatus.InProgress ?
            Constants.driveScheduleIsCurrentlyInActiveYouCannotProceedWithFurtherLevelsOfDrive : Constants.driveScheduleIsCurrentlyInActiveYouCannotStartTheDrive;
        }
        if (this.campaignAssessmentResult && this.campaignAssessmentResult.campaignAssessments.length) {
          this.campaignAssessments = this.campaignAssessmentResult.campaignAssessments
          for (let i = 0; i < this.campaignAssessmentResult.campaignAssessments.length; i++) {
            const assessment = this.campaignAssessmentResult.campaignAssessments[i];
            if ((assessment.userAssessmentStatus === null || assessment.userAssessmentStatus == UserAssessmentStatus.InProgress)
              && (i == 0 || this.campaignAssessments[i - 1].userAssessmentStatus === UserAssessmentStatus.Passed)) {
              this.enableStartIndex = i;
              break;
            }
          }
        }
      }
    });
  }

  getUserAssessmentStatus(userCampaign): string {
    switch (userCampaign) {
      case UserAssessmentStatus.NotStarted:
        return Constants.notStarted;
      case UserAssessmentStatus.InProgress:
        return Constants.inProgress;
      case UserAssessmentStatus.EvaluationPending:
        return Constants.evaluationPending;
      case UserAssessmentStatus.Completed:
        return Constants.completed;
      case UserAssessmentStatus.Failed:
        return Constants.notCleared;
      case UserAssessmentStatus.Passed:
        return Constants.passed;
      case UserAssessmentStatus.Expired:
        return Constants.expired;
      default:
        break;
    }
  }

  progressAssessment(scheduleId: string) {
    let queryParam = scheduleId + '/' + this.tenantId + '/' + this.emailAddress;
    queryParam = btoa(queryParam);
    this.router.navigate(['../../../../../account/test-taker/pre-assessment', queryParam], { relativeTo: this.activateRoute });
  }

  startAssessment(scheduleId: string) {
    this.validateCampaign(scheduleId);
  }

  validateCampaign(scheduleId: string) {
    let data: ValidateCampaignRequestDto = {
      scheduleIdNumber: this.campaignAssessmentResult.campaignScheduleIdNumber,
      assessmentScheduleIdNumber: scheduleId,
      tenantId: this.tenantId,
      emailAddress: this.emailAddress
    };
    this.campaignService.validateUserCampaign(data).subscribe(res => {
      if (res.success) {
        const campaignResult = res.result;
        if (campaignResult.isAvailable && campaignResult.assessmentLink) {
          this.progressAssessment(scheduleId);
        } else {
          this.handleErrorCode(campaignResult);
        }
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
    this.router.navigate(['../../../../../account/test-taker/invalid-request', { tenantAdminEmailAddress: '', tenantId: this.tenantId, errorCode: campaignResult.errorCode, errorMessage: errorMessage, startTime: campaignResult.startDateTime, endTime: campaignResult.endDateTime }], { relativeTo: this.activatedRoute });
  }

  viewModel(invitation: string, isDescription: boolean) {
    this.isDescription = isDescription;
    this.modalService.open(invitation, { size: 'lg' });
  }

  close(): void {
    localStorage.setItem(Constants.backToMyAssessments, Constants.drives);
    this.router.navigate(['../../../../my-assessments'], { relativeTo: this.activateRoute });
  }
}