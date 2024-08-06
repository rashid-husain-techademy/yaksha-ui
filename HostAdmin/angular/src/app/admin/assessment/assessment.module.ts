import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { AssessmentOperationComponent } from './assessment-operation/assessment-operation.component';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { CreateAssessmentComponent } from './create-assessment/create-assessment.component';
import { ListAssessmentComponent } from './list-assessment/list-assessment.component';
import { ScheduleAssessmentComponent } from './schedule-assessment/schedule-assessment.component';
import { ScheduleInviteComponent } from './schedule-invite/schedule-invite.component';
import { ViewAssessmentComponent } from './view-assessment/view-assessment.component';
import { ViewQuestionComponent } from './view-question/view-question.component';
import { CreateAdaptiveAssessmentComponent } from './create-adaptive-assessment/create-adaptive-assessment.component';
import { CloneAssessmentComponent } from './clone-assessment/clone-assessment.component';
import { ExtraTimeComponent } from './extra-time/extra-time.component';
import { BulkAssessmentScheduleComponent } from './bulk-assessment-schedule/bulk-assessment-schedule.component';
import { UpdateUserAttemptComponent } from './update-user-attempt/update-user-attempt.component';

@NgModule({
  declarations: [
    ListAssessmentComponent,
    CreateAssessmentComponent,
    ViewAssessmentComponent,
    AssessmentOperationComponent,
    ScheduleAssessmentComponent,
    ScheduleInviteComponent,
    ViewQuestionComponent,
    CreateAdaptiveAssessmentComponent,
    CloneAssessmentComponent,
    ExtraTimeComponent,
    BulkAssessmentScheduleComponent,
    UpdateUserAttemptComponent
  ],
  imports: [
    SharedModule,
    AssessmentRoutingModule,
    NgbModule,
    QuillModule.forRoot()
  ]
})
export class AssessmentModule { }