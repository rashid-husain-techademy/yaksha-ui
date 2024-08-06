import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateQuestionBankComponent } from './create-question-bank/create-question-bank.component';
import { ViewQuestionBankComponent } from './view-question-bank/view-question-bank.component';
import { QuestionBankOperationComponent } from './question-bank-operation/question-bank-operation.component';
import { Permissions } from '@shared/roles-permission/permissions';
import { SearchResultsComponent } from './search-results/search-results.component';

const routes: Routes = [
  { path: 'create-question-bank', component: CreateQuestionBankComponent, data: { permission: `${Permissions.questionsManageAll}` } },
  { path: 'create-question-bank/:questionBank', component: CreateQuestionBankComponent, data: { permission: `${Permissions.questionsManageAll}` } },
  { path: 'view-question-bank/:id', component: ViewQuestionBankComponent, data: { permission: `${Permissions.questionsManageAll}` } },
  { path: 'question-bank-operation', component: QuestionBankOperationComponent, data: { permission: `${Permissions.questionsManageAll}` } },
  { path: 'search-results/:searchString', component: SearchResultsComponent, data: { permission: `${Permissions.questionsManageAll}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionBankRoutingModule { }
