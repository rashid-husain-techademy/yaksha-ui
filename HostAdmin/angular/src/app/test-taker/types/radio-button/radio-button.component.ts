import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserToggledAnswers, QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})

export class RadioButtonComponent implements OnInit, OnDestroy {
  field: QuestionDetailDto;
  group: FormGroup;
  formControlName: string;
  constants = Constants;

  choices: string[] = [];
  chosenAnswer: string[] = [];
  choicesToggled: UserToggledAnswers[] = [];
  calculateDuration: NodeJS.Timeout;
  duration: number = 0;
  questionText: string;
  plainQuestion: string;
  replaceQuestion: string;
  constructor(public dataService: dataService) { }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion.replace(/<p>/gi, '<p style="margin-bottom:0px;">')
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);

    this.dataService.startTimer(this.field.questionId);

    this.formControlName = `question${this.field.questionId}`;
    this.choices = (this.field.choices === null || JSON.parse(this.field.choices).length === 0) ? ['true', 'false'] : JSON.parse(this.field.choices);
    this.chosenAnswer = JSON.parse(this.field.chosenAnswer);
    this.patchFormControls();

    this.choices.forEach(answer => {
      let answeredChoice: UserToggledAnswers = {
        choice: answer,
        // eslint-disable-next-line eqeqeq
        isSelected: this.chosenAnswer === null || this.chosenAnswer.findIndex(x => x == answer) === -1 ? false : true
      };
      this.choicesToggled.push(answeredChoice);
    });
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }

  toggleChoiceSelection(clickedChoice: UserToggledAnswers) {
    this.choicesToggled.find(x => x.choice === clickedChoice.choice).isSelected = !this.choicesToggled.find(x => x.choice === clickedChoice.choice).isSelected;
    this.choicesToggled.filter(x => x.choice !== clickedChoice.choice).forEach(x => x.isSelected = false);
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
