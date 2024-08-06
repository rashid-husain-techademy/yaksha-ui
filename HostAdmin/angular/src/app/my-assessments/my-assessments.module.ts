import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MyAssessmentsRoutingModule } from './my-assessments-routing.module';
import { MyAssessmentsComponent } from "./my-assessments.component";
import { AssessmentReportComponent } from "./assessment-report/assessment-report.component";
import { NgApexchartsModule } from 'ng-apexcharts';
import { CampaignComponent } from './campaign/campaign.component';
@NgModule({
  declarations: [
    MyAssessmentsComponent,
    AssessmentReportComponent,
    CampaignComponent
  ],
  imports: [
    SharedModule,
    MyAssessmentsRoutingModule,
    NgbModule,
    NgApexchartsModule
  ]
})
export class MyAssessmentsModule { }