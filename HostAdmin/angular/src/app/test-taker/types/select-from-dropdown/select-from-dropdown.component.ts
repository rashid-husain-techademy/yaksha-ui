import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserInputAnswers, QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-select-from-dropdown',
  templateUrl: './select-from-dropdown.component.html',
  styleUrls: ['./select-from-dropdown.component.scss']
})

export class SelectFromDropdownComponent implements OnInit, AfterViewInit, OnDestroy {
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
    indexPositions.sort((first, second) => first - second).forEach((a, x) => this.convertedQuestionText = this.replaceQuestionAt(this.convertedQuestionText, a, x.toString()));

    if (this.textBoxCount === indexPositions.length) {
      for (let i = 0; i <= this.textBoxCount; i++) {
        this.convertedQuestionText = this.convertedQuestionText.replace(`{{${i}}}`, `<span class='input-width-box${i}'></span>`);
      }
    }
  }

  replaceQuestionAt(str, index, chr) {
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  addElement(): void {
    for (let i = 0; i < this.textBoxCount; i++) {
      this.alreadyGivenAnswer = (this.chosenAnswer !== null && this.chosenAnswer[i] !== '') ? this.chosenAnswer[i] : '';

      let input = document.createElement('select');
      input.className = 'form-control';
      input.id = `${i}`;
      input.autocomplete = 'off';
      input.addEventListener("change", (event: any) => this.search(event));
      input.value = this.alreadyGivenAnswer !== null && this.alreadyGivenAnswer !== '' ? this.alreadyGivenAnswer : '';
      input.style.width = '30%';
      input.style.display = "inline-block";
      input.style.margin = '5px 5px 5px 5px';
      let answers = JSON.parse(this.field.choices);
      let options = document.createElement('option');
      options.text = "";
      options.value = "";
      options.disabled = true;
      options.selected = (this.alreadyGivenAnswer === null || this.alreadyGivenAnswer === '') ? true : false;
      input.add(options);
      for (let j = 0; j < answers.length; j++) {
        let option = document.createElement('option');
        option.text = answers[j];
        option.value = answers[j];
        if (this.alreadyGivenAnswer === answers[j]) {
          option.selected = true;
        }
        input.add(option);
      }

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
    let isAnswersValid = this.chosenAnswer.filter(x => x === "").length > 0 && this.chosenAnswer.filter(x => x === "").length === this.chosenAnswer.length ? false : true;
    if (!this.field.isPreview)
      this.field.chosenAnswer = !isAnswersValid ? null : JSON.stringify(this.chosenAnswer);
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }
}
