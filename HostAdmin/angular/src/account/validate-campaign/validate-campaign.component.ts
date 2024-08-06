import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateCampaignRequestDto, ValidateCampaignResultDto } from '@app/admin/campaign/campaign';
import { CampaignService } from '@app/admin/campaign/campaign.service';
import { CampaignValidationErrors } from '@app/enums/assessment';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-validate-campaign',
  templateUrl: './validate-campaign.component.html',
  styleUrls: ['./validate-campaign.component.scss']
})
export class ValidateCampaignComponent implements OnInit {
  testTakerParams: string;
  scheduleIdNumber: string;
  tenantId: number;
  constants = Constants;

  constructor(private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService,
    private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      this.testTakerParams = param['id'];
      let params = atob(param['id']).split('/');
      this.scheduleIdNumber = params[0];
      this.tenantId = parseInt(params[1]);
      this.validateCampaign();
    });
  }

  validateCampaign() {
    let data: ValidateCampaignRequestDto = {
      scheduleIdNumber: this.scheduleIdNumber,
      tenantId: this.tenantId,
      emailAddress: ''
    };
    this.campaignService.validateUserCampaign(data).subscribe(res => {
      if (res.success) {
        const campaignResult = res.result;
        if (campaignResult.isAvailable && campaignResult.assessmentLink) {
          window.open(campaignResult.assessmentLink, "_self");
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
    this.router.navigate(['../../invalid-request', { tenantAdminEmailAddress: '', tenantId: this.tenantId, errorCode: campaignResult.errorCode, errorMessage: errorMessage, startTime: campaignResult.startDateTime, endTime: campaignResult.endDateTime }], { relativeTo: this.activatedRoute });
  }
}
