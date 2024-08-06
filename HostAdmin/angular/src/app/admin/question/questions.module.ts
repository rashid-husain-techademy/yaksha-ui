import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { CreateTestCaseComponent } from './create-test-case/create-test-case.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionsRoutingModule } from './questions-routing.module';
import { UploadQuestionComponent } from './upload-question/upload-question.component';
import { SharedModule } from '../../../shared/shared.module';
import { BulkUploadHistoryComponent } from '../question/bulk-upload-history/bulk-upload-history.component';

@NgModule({
  declarations: [
    CreateQuestionComponent,
    CreateTestCaseComponent,
    UploadQuestionComponent,
    QuestionListComponent,
    BulkUploadHistoryComponent
  ],
  imports: [
    SharedModule,
    QuestionsRoutingModule,
    NgbModule,
    QuillModule.forRoot()
  ]
})
export class QuestionsModule { }