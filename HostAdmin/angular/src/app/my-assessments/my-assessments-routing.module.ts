import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from "../../shared/roles-permission/permissions";
import { MyAssessmentsComponent } from "./my-assessments.component";
import { AssessmentReportComponent } from "./assessment-report/assessment-report.component";
import { CampaignComponent } from "./campaign/campaign.component";

const routes: Routes = [
  { path: '', component: MyAssessmentsComponent, data: { permission: `${Permissions.tenantUserOnly}` } },
  { path: 'assessment-report/:id', component: AssessmentReportComponent, data: { permission: `${Permissions.tenantUserOnly}` } },
  { path: 'drive/:campaignId/:campaignScheduleId', component: CampaignComponent, data: { permission: `${Permissions.tenantUserOnly}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyAssessmentsRoutingModule { }
