import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuestionBankRoutingModule } from './question-bank-routing.module';
import { CreateQuestionBankComponent } from './create-question-bank/create-question-bank.component';
import { ViewQuestionBankComponent } from './view-question-bank/view-question-bank.component';
import { QuestionBankOperationComponent } from './question-bank-operation/question-bank-operation.component';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
  declarations: [
    CreateQuestionBankComponent,
    ViewQuestionBankComponent,
    QuestionBankOperationComponent,
    SearchResultsComponent
  ],
  imports: [
    SharedModule,
    QuestionBankRoutingModule,
    NgbModule
  ]
})
export class QuestionBankModule { }