import { InputComponent } from '../types/input/input.component';
import { RadioButtonComponent } from '../types/radio-button/radio-button.component';
import { TextAreaComponent } from '../types/text-area/text-area.component';
import { CheckBoxComponent } from '../types/check-box/check-box.component';
import { ComponentFactoryResolver, Directive, Input, ViewContainerRef, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatchTheFollowingComponent } from '../types/match-the-following/match-the-following.component';
import { QuestionDetailDto } from '../field';
import { CodingAssessmentComponent } from '../types/coding-assessment/coding-assessment.component';
import { StackComponent } from '../types/stack/stack.component';
import { OrderTheSequenceComponent } from '../types/order-the-sequence/order-the-sequence.component';
import { DragAndDropComponent } from '../types/drag-and-drop/drag-and-drop.component';
import { SelectFromDropdownComponent } from '../types/select-from-dropdown/select-from-dropdown.component';
import { CloudAssessmentComponent } from '../types/cloud-assessment/cloud-assessment.component';
import { CrosswordPuzzleComponent } from '../types/crossWOrd-puzzle/crossword-puzzle/crossword-puzzle.component';

const componentMapper = {
    MultipleChoice: CheckBoxComponent,
    FillInTheBlanks: InputComponent,
    TrueOrFalse: RadioButtonComponent,
    Subjective: TextAreaComponent,
    MatchTheFollowing: MatchTheFollowingComponent,
    CodeBased: CodingAssessmentComponent,
    StackBased: StackComponent,
    OrderTheSequence: OrderTheSequenceComponent,
    SelectFromDropDown: SelectFromDropdownComponent,
    DragAndDrop: DragAndDropComponent,
    CloudBased: CloudAssessmentComponent,
    CrossWordPuzzle: CrosswordPuzzleComponent,
    MCQCodeSnippets: CheckBoxComponent,
    MCQScenario: CheckBoxComponent
};

@Directive({
    selector: '[appDynamicField]'
})

export class DynamicFieldDirective implements OnChanges {
    @Input() field: QuestionDetailDto;
    @Input() group: FormGroup;

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
    }
}
