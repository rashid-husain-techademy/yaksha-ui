import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvalidRequestComponent } from './invalid-request/invalid-request.component';
import { PostAssessmentPageViewComponent } from './post-assessment-page-view/post-assessment-page-view.component';
import { PostAssessmentPageComponent } from './post-assessment-page/post-assessment-page.component';
import { PostAssessmentComponent } from './post-assessment/post-assessment.component';
import { RedirectComponent } from './redirect/redirect.component';
import { TestComponent } from './test/test.component';
import { ApproverIdscanRedirectComponent } from './approver-idscan-redirect/approver-idscan-redirect.component';
import { FacetrainRedirectComponent } from './facetrain-redirect/facetrain-redirect.component';
import { PostAssessmentReviewerViewComponent } from './post-assessment-reviewer-view/post-assessment-reviewer-view.component';
const routes: Routes = [
  { path: 'test/:assessment', component: TestComponent },
  { path: 'post-assessment-page-view/:assessment', component: PostAssessmentPageViewComponent },
  { path: 'post-assessment-page/:assessment', component: PostAssessmentPageComponent },
  { path: 'post-assessment/:assessment', component: PostAssessmentComponent },
  { path: 'redirect', component: RedirectComponent },
  { path: 'approverredirect', component: ApproverIdscanRedirectComponent },
  { path: 'approveridscanredirect', component: ApproverIdscanRedirectComponent },
  { path: 'facetrainredirect', component: FacetrainRedirectComponent },
  { path: 'invalid-request', component: InvalidRequestComponent },
  { path: 'reviewer-submit-request', component: PostAssessmentReviewerViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestTakerRoutingModule { }
