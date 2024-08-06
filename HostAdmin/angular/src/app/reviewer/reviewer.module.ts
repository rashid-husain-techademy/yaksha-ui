import { NgModule } from '@angular/core';
import { ReviewerRoutingModule } from './reviewer-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { AssessmentDetailComponent } from './assessment-detail/assessment-detail.component';
import { ReviewCandidateComponent } from './review-candidate/review-candidate.component';
import { SharedModule } from '@shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
export let monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: () => { return (<any>window).monaco; } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
};

@NgModule({
  declarations: [
    DashboardComponent,
    AssessmentsComponent,
    AssessmentDetailComponent,
    ReviewCandidateComponent
  ],
  imports: [
    SharedModule,
    NgbModule,
    ReviewerRoutingModule,
    NgApexchartsModule,
    MonacoEditorModule.forRoot(monacoConfig),
  ]
})
export class ReviewerModule { }
