import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserInputAnswers, QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})

export class DragAndDropComponent implements OnInit, AfterViewInit, OnDestroy {
  field: QuestionDetailDto;
  group: FormGroup;
  formControlName: string;
  constants = Constants;
  textBoxCount: number;
  givenAnswers: UserInputAnswers[] = [];
  chosenAnswer: string[] = [];
  alreadyGivenAnswer: string;
  convertedQuestionText: string;
  calculateDuration: NodeJS.Timeout;
  duration: number = 0;
  questionText: string;
  plainQuestion: string;
  replaceQuestion: string;
  @ViewChild('inputLabel') inputLabel: ElementRef<HTMLCanvasElement>;
  @ViewChild('choicesDiv', { static: true }) choicesDiv: ElementRef;
  choiceId: string;
  choiceBoxPaddingWidth: number = 10;
  choiceBoxMinWidthForSingleCharacter: number = 10;
  minChoiceBoxWidth: number = 55;

  constructor(private formBuilder: FormBuilder,
    public dataService: dataService) { }

  ngOnInit(): void {
    this.setChoicesId();
    this.enableDrag();
    this.plainQuestion = this.field.questionText;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion.replace(/<p>/gi, '<p style="margin-bottom:0px;">');
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);

    this.dataService.startTimer(this.field.questionId);

    this.formControlName = `question${this.field.questionId}`;
    if (this.group === undefined) {
      this.group = this.formBuilder.group({});
    }
    this.chosenAnswer = JSON.parse(this.field.chosenAnswer);
    this.group.patchValue({
      [this.formControlName]: this.chosenAnswer,
    });
    this.calculateTextBoxCount();
  }

  ngAfterViewInit(): void {
    this.addElement();
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
    this.deleteDragCookie();
  }

  calculateTextBoxCount(): void {
    this.convertedQuestionText = this.questionText;
    this.textBoxCount = (this.questionText.match(new RegExp("{{", "g")) || []).length;
    let indexPositions = [];
    var choiceVal = JSON.parse(this.field.choices);
    // if Answer consists more than 9 options logic to be changed for fetching the index value.
    for (let ch = 1; ch <= choiceVal.length; ch++) {
      let splitKey = '{{' + ch + '}}';
      for (let i = 0; i < this.convertedQuestionText.length;) {
        let indexPosition = this.convertedQuestionText.indexOf(splitKey, i);
        if (indexPosition === -1)
          break;
        i = indexPosition + 1;
        indexPositions.push(indexPosition + 2);
      }
    }
    indexPositions.sort((a, b) => a - b).forEach((a, x) => this.convertedQuestionText = this.replaceQuestionAt(this.convertedQuestionText, a, x.toString()));

    if (this.textBoxCount === indexPositions.length) {
      for (let i = 0; i <= this.textBoxCount; i++) {
        this.convertedQuestionText = this.convertedQuestionText.replace(`{{${i}}}`, `<span class='input-width-box${i}'></span>`);
      }
    }
  }

  setChoicesId() {
    this.choicesDiv.nativeElement.id = this.choiceId = `choices-${this.field.questionId}-${new Date().toString()}`;
  }

  replaceQuestionAt(str, index, chr) {
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  enableDrag() {
    if (!this.field.isPreview)
      localStorage.setItem(this.constants.enableDragDirective, 'true');
  }

  deleteDragCookie() {
    localStorage.removeItem(this.constants.enableDragDirective);
  }

  addElement(): void {
    for (let i = 0; i < this.textBoxCount; i++) {
      this.alreadyGivenAnswer = (this.chosenAnswer !== null && this.chosenAnswer[i] !== '') ? this.chosenAnswer[i] : '';

      let input = document.createElement('input');
      input.className = 'form-control';
      input.id = `${i}`;
      input.autocomplete = 'off';
      input.value = this.alreadyGivenAnswer !== null && this.alreadyGivenAnswer !== '' ? this.alreadyGivenAnswer : '';
      input.style.width = '30%';
      input.style.display = "inline-block";
      input.style.margin = '5px 5px 5px 5px';
      input.disabled = true;
      input.style.backgroundColor = 'transparent';
      input.style.borderColor = 'gray';
      input.style.borderWidth = '2px';
      input.style.borderRadius = '5px';
      input.draggable = false;
      input.addEventListener("drop", (event: any) => this.onDrop(event));
      input.addEventListener("dragover", (event: any) => this.allowDrop(event));
      let inputAnswer: UserInputAnswers = {
        inputId: `${i}`,
        givenAnswer: this.alreadyGivenAnswer !== null ? this.alreadyGivenAnswer : ''
      };
      this.givenAnswers.push(inputAnswer);

      let span = this.inputLabel.nativeElement.getElementsByClassName(`input-width-box${i}`)[0];
      span?.appendChild(input);
    }
    let choices = JSON.parse(this.field.choices);
    choices.forEach((element, ind) => {
      let choicesTag = document.getElementById(this.choiceId);
      let width = element.length < 5 ? this.minChoiceBoxWidth : (element.length * this.choiceBoxMinWidthForSingleCharacter) + this.choiceBoxPaddingWidth;
      let input = document.createElement('input');
      input.id = `drag-${ind}`;
      input.value = element;
      input.type = "text";
      input.draggable = true;
      input.disabled = true;
      input.style.margin = '5px 7px';
      input.style.borderRadius = '5px';
      input.style.borderColor = 'gray';
      input.style.padding = '0 6px';
      input.style.cursor = 'grabbing';
      input.style.width = width > 1000 ? '100%' : width + 'px';
      input.style.maxWidth = '100%';
      input.style.height = 'calc(1.5em + 0.75rem + 2px)';
      input.addEventListener("dragstart", (event: any) => this.drag(event));
      choicesTag.appendChild(input);
    });
  }

  drag(ev) {
    ev.dataTransfer.dropEffect = "copy";
    ev.dataTransfer.setData("text/plain", ev.target.id);
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  onDrop(event): void {
    let ans = (document.getElementById(event.dataTransfer.getData("text/plain")) as HTMLInputElement)?.value;
    if (ans) {
      this.givenAnswers[event.currentTarget.id].givenAnswer = ans;
      this.chosenAnswer = this.givenAnswers.map(x => x.givenAnswer);
      this.group.patchValue({
        [this.formControlName]: this.chosenAnswer,
      });
      let isAnswersValid = this.chosenAnswer.filter(x => x === "").length > 0 && this.chosenAnswer.filter(x => x === "").length === this.chosenAnswer.length ? false : true;
      if (!this.field.isPreview)
        this.field.chosenAnswer = !isAnswersValid ? null : JSON.stringify(this.chosenAnswer);
      let data = document.getElementById(event.currentTarget.id) as HTMLInputElement;
      data.value = ans;
    }
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }
}