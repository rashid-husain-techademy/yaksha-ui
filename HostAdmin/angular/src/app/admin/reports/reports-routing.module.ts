import { Permissions } from "../../../shared/roles-permission/permissions";
import { ReportsComponent } from "./reports.component";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProctoringComponent } from "./proctoring/proctoring.component";
import { StackReportComponent } from "./stack-report/stack-report.component";
import { AeyeProctorReportComponent } from "./aeye-proctor-report/aeye-proctor-report.component";
import { AeyeReviewSessionComponent } from "./aeye-review-session/aeye-review-session.component";

const routes: Routes = [
  { path: '', component: ReportsComponent, data: { permission: `${Permissions.reportsManageAll}` } },
  { path: 'proctoring/:id/:emailId', component: ProctoringComponent, data: { permission: `${Permissions.reportsManageAll}` } },
  { path: 'user-reports/:reportDetails', component: AeyeProctorReportComponent, data: { permission: `${Permissions.reportsManageAll}` } },
  { path: 'review-session/:reportDetails', component: AeyeReviewSessionComponent, data: { permission: `${Permissions.reportsManageAll}` } },
  { path: 'stack-report/:userId/:userAttemptId/:assessmentName/:scheduleId/:emailAddress/:type', component: StackReportComponent, data: { permission: `${Permissions.reportsManageAll}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ReportsRoutingModule { }
