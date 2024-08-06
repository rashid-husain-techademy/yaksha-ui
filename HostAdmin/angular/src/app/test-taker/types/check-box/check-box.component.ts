import { dataService } from './../../../service/common/dataService';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { UserToggledAnswers, QuestionDetailDto } from '@app/test-taker/field';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss']
})

export class CheckBoxComponent implements OnInit, OnDestroy {
  field: QuestionDetailDto;
  group: FormGroup;
  formControlName: string;
  constants = Constants;
  choices: string[] = [];
  chosenAnswer: string[] = [];
  choicesToggled: UserToggledAnswers[] = [];
  duration: number = 0;
  questionText: string;
  calculateDuration: NodeJS.Timeout;
  isMultipleChoice: boolean;
  plainQuestion: string;
  replaceQuestion: string;

  constructor(public dataService: dataService,
    private toastr: ToastrService) { }

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
    this.choices = JSON.parse(this.field.choices);
    this.isMultipleChoice = this.field.expectedCount > 1 ? true : false;
    this.chosenAnswer = JSON.parse(this.field.chosenAnswer);

    this.choices.forEach(answer => {
      let answeredChoice: UserToggledAnswers = {
        choice: answer,
        isSelected: this.chosenAnswer === null || this.chosenAnswer.findIndex(x => x === answer) === -1 ? false : true
      };
      this.choicesToggled.push(answeredChoice);
    });
    this.patchFormControls();
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }

  toggleChoiceSelection(clickedChoice: UserToggledAnswers) {
    this.choicesToggled.find(x => x.choice === clickedChoice.choice).isSelected = !this.choicesToggled.find(x => x.choice === clickedChoice.choice).isSelected;
    let isSelected = this.choicesToggled.find(x => x.choice === clickedChoice.choice).isSelected;
    if (!this.isMultipleChoice) {
      this.choicesToggled.filter(x => x.choice !== clickedChoice.choice).forEach(x => x.isSelected = false);
    }
    else if (this.isMultipleChoice && isSelected && (this.chosenAnswer !== null && this.chosenAnswer.length >= this.field.expectedCount)) {
      // eslint-disable-next-line eqeqeq
      this.toastr.warning(Constants.answerLimitReached);
      this.choicesToggled.find(x => x.choice == clickedChoice.choice).isSelected = false;
      event.preventDefault();
    }
    this.chosenAnswer = this.choicesToggled.filter(x => x.isSelected).map(x => x.choice);
    this.patchFormControls();
    this.field.chosenAnswer = this.chosenAnswer.length > 0 ? JSON.stringify(this.chosenAnswer) : null;
  }

  patchFormControls() {
    this.group.patchValue({
      [this.formControlName]: this.chosenAnswer,
    });
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }
}
