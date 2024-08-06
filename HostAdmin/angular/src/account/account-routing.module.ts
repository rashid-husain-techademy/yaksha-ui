import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountComponent } from './account.component';
import { TenantloginComponent } from '@shared/tenantlogin/tenantlogin.component';
import { LandingComponent } from './landing/landing.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { LoginComponent } from './login/login.component';
import { PreAssessmentComponent } from './pre-assessment/pre-assessment.component';
import { InvalidRequestComponent } from './invalid-request/invalid-request.component';
import { HackathonRegistrationComponent } from './hackathon-registration/hackathon-registration.component';
import { ValidateCampaignComponent } from './validate-campaign/validate-campaign.component';
import { MobileUploadComponent } from './mobile-upload/mobile-upload.component';
import { SlotBookComponent } from './slot-book/slot-book.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountComponent,
                children: [
                    { path: 'landing', component: LandingComponent },
                    { path: 'test-taker/hackathon-registration/:encodedUrl', component: HackathonRegistrationComponent },
                    { path: '', redirectTo: 'landing', pathMatch: 'full' },
                    { path: 'landing/:encodedUrl', component: LandingComponent },
                    { path: 'login', component: LoginComponent },
                    { path: 'resetpassword/:encodedUrl', component: ResetpasswordComponent },
                    { path: 'forgotpassword', component: ForgotpasswordComponent },
                    { path: 'test-taker/self-registration/:id', component: SlotBookComponent },
                    { path: 'test-taker/pre-assessment/:id', component: PreAssessmentComponent },
                    { path: 'test-taker/drive/:id', component: ValidateCampaignComponent },
                    { path: 'test-taker/invalid-request', component: InvalidRequestComponent },
                    { path: 'mobile-upload/:encodedData', component: MobileUploadComponent },
                    { path: '**', component: TenantloginComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AccountRoutingModule { }
