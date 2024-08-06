import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentDetailComponent } from './assessment-detail/assessment-detail.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReviewCandidateComponent } from './review-candidate/review-candidate.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'assessments', component: AssessmentsComponent },
  { path: 'assessments/:assessment', component: AssessmentDetailComponent },
  { path: 'review-candidate/:data', component: ReviewCandidateComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewerRoutingModule { }
