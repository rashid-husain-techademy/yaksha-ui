import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestTakerRoutingModule } from './test-taker-routing.module';
import { RedirectComponent } from './redirect/redirect.component';
import { StackComponent } from './types/stack/stack.component';
import { TestTerminationComponent } from './test-termination/test-termination.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { HintComponent } from './hint/hint.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { MatchTheFollowingComponent } from './types/match-the-following/match-the-following.component';
import { PostAssessmentPageComponent } from './post-assessment-page/post-assessment-page.component';
import { PostAssessmentPageViewComponent } from './post-assessment-page-view/post-assessment-page-view.component';
import { CodingAssessmentComponent } from './types/coding-assessment/coding-assessment.component';
import { PostAssessmentComponent } from './post-assessment/post-assessment.component';
import { DynamicFieldDirective } from './dynamic-field/dynamic-field.directive';
import { TestComponent } from './test/test.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { TextAreaComponent } from './types/text-area/text-area.component';
import { CheckBoxComponent } from './types/check-box/check-box.component';
import { RadioButtonComponent } from './types/radio-button/radio-button.component';
import { InputComponent } from './types/input/input.component';
import { SharedModule } from '@shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InvalidRequestComponent } from './invalid-request/invalid-request.component';
import { ChartsModule } from 'ng2-charts';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { CountdownModule } from 'ngx-countdown';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { WheeboxComponent } from './wheebox/wheebox.component';
import { ApproverIdscanRedirectComponent } from './approver-idscan-redirect/approver-idscan-redirect.component';
import { FacetrainRedirectComponent } from './facetrain-redirect/facetrain-redirect.component';
import { PostAssessmentReviewerViewComponent } from './post-assessment-reviewer-view/post-assessment-reviewer-view.component';
import { OrderTheSequenceComponent } from './types/order-the-sequence/order-the-sequence.component';
import { SelectFromDropdownComponent } from './types/select-from-dropdown/select-from-dropdown.component';
import { DragAndDropComponent } from './types/drag-and-drop/drag-and-drop.component';
import { CloudAssessmentComponent } from './types/cloud-assessment/cloud-assessment.component';
import { CrosswordPuzzleComponent } from './types/crossWOrd-puzzle/crossword-puzzle/crossword-puzzle.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { QuillModule } from 'ngx-quill';

export let monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: () => { return (<any>window).monaco; } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
};
@NgModule({
  declarations: [
    InputComponent,
    RadioButtonComponent,
    CheckBoxComponent,
    TextAreaComponent,
    DynamicFormComponent,
    TestComponent,
    DynamicFieldDirective,
    PostAssessmentComponent,
    CodingAssessmentComponent,
    PostAssessmentPageViewComponent,
    PostAssessmentPageComponent,
    MatchTheFollowingComponent,
    InstructionsComponent,
    HintComponent,
    ConfirmationComponent,
    TestTerminationComponent,
    StackComponent,
    RedirectComponent,
    InvalidRequestComponent,
    WheeboxComponent,
    ApproverIdscanRedirectComponent,
    FacetrainRedirectComponent,
    PostAssessmentReviewerViewComponent,
    OrderTheSequenceComponent,
    SelectFromDropdownComponent,
    DragAndDropComponent,
    CloudAssessmentComponent,
    CrosswordPuzzleComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    NgbModule,
    TestTakerRoutingModule,
    ChartsModule,
    MonacoEditorModule.forRoot(monacoConfig),
    CountdownModule,
    NgApexchartsModule,
    NgxChartsModule,
    NgxQRCodeModule,
    QuillModule.forRoot()
  ]
})
export class TestTakerModule { }
