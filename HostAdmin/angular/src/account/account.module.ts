import { NgModule } from '@angular/core';
import { AccountRoutingModule } from './account-routing.module';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { SharedModule } from '@shared/shared.module';
import { AccountComponent } from './account.component';
import { LoginService } from './login/login.service';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { LandingComponent } from './landing/landing.component';
import { SsoInternalComponent } from './sso-internal/sso-internal.component';
import { LoginComponent } from './login/login.component';
import { PreAssessmentComponent } from './pre-assessment/pre-assessment.component';
import { InvalidRequestComponent } from './invalid-request/invalid-request.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomScrollDirective } from '../shared/directives/custom-scroll.directive';
import { NgxCaptchaModule } from 'ngx-captcha';
import { HackathonRegistrationComponent } from './hackathon-registration/hackathon-registration.component';
import { ValidateCampaignComponent } from './validate-campaign/validate-campaign.component';
import { MobileUploadComponent } from './mobile-upload/mobile-upload.component';
import { SlotBookComponent } from './slot-book/slot-book.component';

@NgModule({
    imports: [
        SharedModule,
        ServiceProxyModule,
        AccountRoutingModule,
        NgbModule,
        NgxCaptchaModule
    ],
    declarations: [
        AccountComponent,
        LandingComponent,
        LoginComponent,
        ForgotpasswordComponent,
        ResetpasswordComponent,
        SsoInternalComponent,
        PreAssessmentComponent,
        InvalidRequestComponent,
        CustomScrollDirective,
        HackathonRegistrationComponent,
        ValidateCampaignComponent,
        MobileUploadComponent,
        SlotBookComponent,
    ],
    providers: [
        LoginService
    ],
    entryComponents: [
    ]
})
export class AccountModule {

}
