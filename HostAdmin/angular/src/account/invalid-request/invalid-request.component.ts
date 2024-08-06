import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { RegistrationValidationErrors } from '@app/enums/assessment';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { Helper } from '@app/shared/helper';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-invalid-request',
  templateUrl: './invalid-request.component.html',
  styleUrls: ['./invalid-request.component.scss']
})
export class InvalidRequestComponent implements OnInit {
  constants = Constants;
  errorMessage: string;
  helper = Helper;
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  errorCode: number;
  tenantId: number;
  isHackathonRegistration: boolean = false;
  isEvaluationPending: boolean = false;
  tenantAdminEmailAddress: Array<string>;
  evoketechnologiesId: number = 465;
  isCustomThemeEnabled: boolean = false;
  registrationValidationErrors = RegistrationValidationErrors;
  isTenantLogoLoaded: boolean = false;
  isABInBev: boolean = false;

  constructor(private route: ActivatedRoute,
    private dataService: dataService,
    private tenantService: TenantsService,
    private renderer: Renderer2) { }

  ngOnInit() {
    const element = document.querySelector('[data-id="zsalesiq"]');
    if (element)
      this.renderer.setStyle(element, 'display', 'block');
    const tenantId = this.route.snapshot.params.tenantId;
    this.tenantAdminEmailAddress = [];
    if(Number(tenantId) === this.evoketechnologiesId && this.route.snapshot.params.tenantAdminEmailAddress)
    {
      this.tenantAdminEmailAddress = this.constants.evokeTechnologiesTestAdminMail.split(",");
    }
    else
      this.tenantAdminEmailAddress = this.route.snapshot.params.tenantAdminEmailAddress ? JSON.parse(atob(this.route.snapshot.params.tenantAdminEmailAddress)) : undefined;
    this.errorCode = this.route.snapshot.params.errorCode;
    this.errorMessage = this.route.snapshot.params.errorMessage;
    this.isEvaluationPending = this.route.snapshot.params.isEvaluationPending;
    this.startTime = this.route.snapshot.params.startTime ? this.helper.convertUTCDateToLocalDate(this.route.snapshot.params.startTime) : undefined;;
    this.endTime = this.route.snapshot.params.endTime ? this.helper.convertUTCDateToLocalDate(this.route.snapshot.params.endTime) : undefined;
    this.isHackathonRegistration = this.route.snapshot.params.isHackathonRegistration;
    if (this.isHackathonRegistration && this.route.snapshot.params.errorCode) {
      this.errorCode = +this.route.snapshot.params.errorCode;
      this.errorMessage = this.getRegistrationErrorMessage(this.errorCode);
    }
    this.currentTime = new Date();
    if (tenantId) {
      this.isABInBev = this.dataService.checkCustomThemeForAbinBev(Number(tenantId));
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(Number(tenantId));
      this.tenantService.getTenantCustomizationSettings(Number(tenantId)).pipe(
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

  getRegistrationErrorMessage(errorCode: number): string {
    let errorMessage = Constants.thanksForYourInterestInTakingAssessment;
    switch (errorCode)  {
      case RegistrationValidationErrors.RegistrationInactive:
        return errorMessage + Constants.registrationLinkIsCurrentlyInActive;
      case RegistrationValidationErrors.RegistrationNotStared:
        return errorMessage + Constants.registrationLinkWillBeEnabledOnTheBelowMentionedTime;
      case RegistrationValidationErrors.RegistrationLinkExpired:
        return errorMessage + Constants.registrationLinkIsExpiredAndItWillBeEnabledBetween;
      default:
        return errorMessage + Constants.registrationLinkIsInvalid;
    }
  }
}