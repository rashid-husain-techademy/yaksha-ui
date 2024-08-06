import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserInputAnswers, QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})

export class InputComponent implements OnInit, AfterViewInit, OnDestroy {
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

  constructor(private formBuilder: FormBuilder,
    public dataService: dataService) {
  }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion;
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
  }

  calculateTextBoxCount(): void {
    this.convertedQuestionText = this.questionText.replace(/<p>/gi, '<p style="margin-bottom:0px;">');
    let regExp = /{{(\d+)}}/g;
    this.textBoxCount = (this.questionText.match(regExp) || []).length;
    let isTextBox: boolean;

    if (this.textBoxCount > 0) {
      for (let i = 0; i < this.textBoxCount; i++) {
        isTextBox = this.convertedQuestionText.includes(`{{${i}}}`);
        if (isTextBox) {
          this.convertedQuestionText = this.convertedQuestionText.replace(`{{${i}}}`, `<span class='input-width-box${i}'></span>`);
        }
      }
    }
  }

  addElement(): void {
    for (let i = 0; i < this.textBoxCount; i++) {
      this.alreadyGivenAnswer = (this.chosenAnswer !== null && this.chosenAnswer[i] !== '') ? this.chosenAnswer[i] : '';

      let input = document.createElement('input');
      input.className = 'form-control';
      input.id = `${i}`;
      input.autocomplete = 'off';
      input.addEventListener("keyup", (event: MouseEvent) => this.search(event));
      input.value = this.alreadyGivenAnswer !== null ? this.alreadyGivenAnswer : '';

      let inputAnswer: UserInputAnswers = {
        inputId: `${i}`,
        givenAnswer: this.alreadyGivenAnswer !== null ? this.alreadyGivenAnswer : ''
      };
      this.givenAnswers.push(inputAnswer);

      let span = this.inputLabel.nativeElement.getElementsByClassName(`input-width-box${i}`)[0];
      span.appendChild(input);
    }
  }

  search(event): void {
    this.givenAnswers[event.currentTarget.id].givenAnswer = event.target.value;
    this.chosenAnswer = this.givenAnswers.map(x => x.givenAnswer);
    this.group.patchValue({
      [this.formControlName]: this.chosenAnswer,
    });
    this.field.chosenAnswer = this.chosenAnswer.findIndex(x => x !== '') === -1 ? null : JSON.stringify(this.chosenAnswer);
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }
}
