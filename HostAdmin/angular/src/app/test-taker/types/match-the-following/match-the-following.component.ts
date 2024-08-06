import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { dataService } from '@app/service/common/dataService';
import { QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-match-the-following',
  templateUrl: './match-the-following.component.html',
  styleUrls: ['./match-the-following.component.scss']
})

export class MatchTheFollowingComponent implements OnInit, OnDestroy {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  @Input() field: QuestionDetailDto;
  @Input() group: FormGroup;
  choices: Array<string>;
  leftOptions: Array<any> = [];
  rightOptions: Array<any> = [];
  returnData: Array<string>;
  formControlName: string;
  calculateDuration: NodeJS.Timeout;
  duration: number = 0;
  questionText: string;
  constants = Constants;
  plainQuestion: string;
  replaceQuestion: string;
  constructor(public dataService: dataService) { }

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
    if (this.field.chosenAnswer !== null && this.field.chosenAnswer !== '') {
      this.patchValue(this.field.chosenAnswer);
      let options = JSON.parse(this.field.chosenAnswer);
      let existingOptions = Array<string[]>();
      options.forEach(element => {
        existingOptions.push(element.split('@#@'));
      });
      for (let i = 0; i < existingOptions.length; i++) {
        this.leftOptions.push(existingOptions[i][0]);
        this.rightOptions.push(existingOptions[i][1]);
      }
    }
    else {
      this.choices = JSON.parse(this.field.choices);
      let choiceLength = this.choices.length;
      this.leftOptions = this.choices.splice(0, (choiceLength / 2));
      this.rightOptions = this.choices.splice(-(choiceLength / 2));
    }
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.manipulateData(event);
    }
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  manipulateData(eventData): void {
    let index = 0;
    this.returnData = [];
    this.leftOptions.forEach(element => {
      this.returnData.push(`${element}` + '@#@' + `${eventData.container.data[index]}`);
      index += 1;
    });
    this.patchValue(this.returnData);
    this.field.chosenAnswer = JSON.stringify(this.returnData);
  }

  patchValue(data): void {
    this.group.patchValue({
      [this.formControlName]: data
    });
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }
}
