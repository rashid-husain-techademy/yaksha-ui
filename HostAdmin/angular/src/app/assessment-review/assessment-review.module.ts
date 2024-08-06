import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentReviewRoutingModule } from './assessment-review-routing.module';
import { AssessmentReviewListComponent } from './assessment-review-list/assessment-review-list.component';
import { VerifyQuestionnaireComponent } from './verify-questionnaire/verify-questionnaire.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { ReviewDynamicFormComponent } from './review-dynamic-form/review-dynamic-form.component';
import { ReviewCheckboxComponent } from './types/review-checkbox/review-checkbox.component';
import { ReviewInputComponent } from './types/review-input/review-input.component';
import { ReviewRadioButtonComponent } from './types/review-radio-button/review-radio-button.component';
import { ReviewTextAreaComponent } from './types/review-text-area/review-text-area.component';
import { ReviewMatchTheFollowingComponent } from './types/review-match-the-following/review-match-the-following.component';
import { ReviewDynamicFieldDirective } from './review-dynamic-field/review-dynamic-field.directive';
import { ReviewQuestionnaireComponent } from './review-questionnaire/review-questionnaire.component';
import { ReviewDashboardComponent } from './review-dashboard/review-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ReviewOrderTheSequenceComponent } from './types/review-order-the-sequence/review-order-the-sequence.component';
import { ReviewSelectFromDropdownComponent } from './types/review-select-from-dropdown/review-select-from-dropdown.component';
import { ReviewDragAndDropComponent } from './types/review-drag-and-drop/review-drag-and-drop.component';
import { ReviewCrosswordPuzzleComponent } from './types/review-crossword-puzzle/review-crossword-puzzle/review-crossword-puzzle.component';

@NgModule({
  declarations: [
    AssessmentReviewListComponent,
    VerifyQuestionnaireComponent,
    ReviewDynamicFormComponent,
    ReviewCheckboxComponent,
    ReviewInputComponent,
    ReviewRadioButtonComponent,
    ReviewTextAreaComponent,
    ReviewMatchTheFollowingComponent,
    ReviewDynamicFieldDirective,
    ReviewQuestionnaireComponent,
    ReviewDashboardComponent,
    ReviewOrderTheSequenceComponent,
    ReviewSelectFromDropdownComponent,
    ReviewDragAndDropComponent,
    ReviewCrosswordPuzzleComponent
  ],
  imports: [
    CommonModule,
    AssessmentReviewRoutingModule,
    NgbModule,
    SharedModule,
    NgApexchartsModule,
    NgxChartsModule
  ]
})
export class AssessmentReviewModule { }
