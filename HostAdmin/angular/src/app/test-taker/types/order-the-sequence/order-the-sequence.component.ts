import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { dataService } from '@app/service/common/dataService';
import { QuestionDetailDto } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-order-the-sequence',
  templateUrl: './order-the-sequence.component.html',
  styleUrls: ['./order-the-sequence.component.scss']
})

export class OrderTheSequenceComponent implements OnInit, OnDestroy {
  @Input() field: QuestionDetailDto;
  @Input() group: FormGroup;
  choices: Array<string>;
  options: Array<any> = [];
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
      let chosenAnswers = JSON.parse(this.field.chosenAnswer);
      chosenAnswers.forEach(element => {
        this.options.push(element);
      });
    }
    else {
      this.choices = JSON.parse(this.field.choices);
      this.options = this.choices;
    }
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.field.chosenAnswer = JSON.stringify(event.container.data);
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
