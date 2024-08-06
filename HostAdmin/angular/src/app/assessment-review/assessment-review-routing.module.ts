import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyQuestionnaireComponent } from './verify-questionnaire/verify-questionnaire.component';
import { Permissions } from '@shared/roles-permission/permissions';
import { AssessmentReviewListComponent } from './assessment-review-list/assessment-review-list.component';
import { ReviewDashboardComponent } from './review-dashboard/review-dashboard.component';

const routes: Routes = [
  { path: '', component: AssessmentReviewListComponent, data: { permission: `${Permissions.questionReviewerOnly}` } },
  { path: 'questionnaire/:id', component: VerifyQuestionnaireComponent, data: { permission: `${Permissions.superAdmin},${Permissions.tenantAdmin},${Permissions.questionReviewerOnly}` } },
  { path: 'review-dashboard/:tenantAssessmentReviewId/:assessmentId', component: ReviewDashboardComponent, data: { permission: `${Permissions.superAdmin},${Permissions.tenantAdmin},${Permissions.questionReviewerOnly}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentReviewRoutingModule { }
