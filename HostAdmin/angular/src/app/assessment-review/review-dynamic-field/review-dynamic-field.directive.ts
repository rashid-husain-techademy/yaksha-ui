import { ComponentFactoryResolver, Directive, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Questions } from '../assessment-review';
import { ReviewCheckboxComponent } from '../types/review-checkbox/review-checkbox.component';
import { ReviewInputComponent } from '../types/review-input/review-input.component';
import { ReviewMatchTheFollowingComponent } from '../types/review-match-the-following/review-match-the-following.component';
import { ReviewRadioButtonComponent } from '../types/review-radio-button/review-radio-button.component';
import { ReviewTextAreaComponent } from '../types/review-text-area/review-text-area.component';
import { ReviewOrderTheSequenceComponent } from '../types/review-order-the-sequence/review-order-the-sequence.component';
import { ReviewDragAndDropComponent } from '../types/review-drag-and-drop/review-drag-and-drop.component';
import { ReviewSelectFromDropdownComponent } from '../types/review-select-from-dropdown/review-select-from-dropdown.component';
import { ReviewCrosswordPuzzleComponent } from '../types/review-crossword-puzzle/review-crossword-puzzle/review-crossword-puzzle.component';

const componentMapper = {
  MultipleChoice: ReviewCheckboxComponent,
  FillInTheBlanks: ReviewInputComponent,
  TrueOrFalse: ReviewRadioButtonComponent,
  Subjective: ReviewTextAreaComponent,
  MatchTheFollowing: ReviewMatchTheFollowingComponent,
  OrderTheSequence: ReviewOrderTheSequenceComponent,
  SelectFromDropDown: ReviewSelectFromDropdownComponent,
  DragAndDrop: ReviewDragAndDropComponent,
  CrossWordPuzzle: ReviewCrosswordPuzzleComponent,
  MCQCodeSnippets: ReviewCheckboxComponent,
  MCQScenario: ReviewCheckboxComponent
};

@Directive({
  selector: '[appReviewDynamicField]'
})
export class ReviewDynamicFieldDirective implements OnChanges {

  @Input() field: Questions;
  @Input() group: FormGroup;
  @Output() questionRemove = new EventEmitter<any>();
  componentRef: any;
  @ViewChild('inputLabel') inputLabel: ElementRef<HTMLCanvasElement>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) { }

  ngOnChanges() {
    this.changeQuestion();
  }

  changeQuestion() {
    this.container.detach();
    const factory = this.resolver.resolveComponentFactory(
      componentMapper[this.field.questionType.name]
    );
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.field = this.field;
    this.componentRef.instance.group = this.group;
    this.componentRef.instance.questionRemoveEvent?.subscribe(val => {
      if (val) {
        this.questionRemove.emit(val);
      }
    });
  }

}
