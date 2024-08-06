import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from '@shared/roles-permission/permissions';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { UnsavedGuard } from '../../shared/guards/unsaved.guard';
import { BulkUploadHistoryComponent } from '../question/bulk-upload-history/bulk-upload-history.component';

const routes: Routes = [
  { path: 'create-question', component: CreateQuestionComponent, data: { permission: `${Permissions.questionsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'create-question/:id/:typeId', component: CreateQuestionComponent, data: { permission: `${Permissions.questionsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'create-question/:id/:typeId/:assessmentId/:assessmentSectionId/:assessmentSectionSkillId/:isQuestionUpdateFromQRAdmin', component: CreateQuestionComponent, data: { permission: `${Permissions.questionsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'question-list/:id/:scope', component: QuestionListComponent, data: { permission: `${Permissions.questionsManageAll}` } },
  { path: 'bulk-upload-history', component: BulkUploadHistoryComponent, data: { permission: `${Permissions.questionsManageAll}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionsRoutingModule { }
