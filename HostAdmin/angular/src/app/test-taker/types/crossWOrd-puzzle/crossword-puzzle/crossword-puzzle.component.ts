import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { QuestionDetailDto } from '@app/test-taker/field';
import { dataService } from '../../../../service/common/dataService';
import '../../../../../assets/crossWord/crossword.js';
declare function buildCrosswordPuzzle(inputData: any, identifier: any): any;

@Component({
  selector: 'app-crossword-puzzle',
  templateUrl: './crossword-puzzle.component.html',
  styleUrls: ['./crossword-puzzle.component.scss']
})
export class CrosswordPuzzleComponent implements OnInit {
  field: QuestionDetailDto;
  group: FormGroup;
  formControlName: string;
  questionText: string;
  plainQuestion: string;
  replaceQuestion: string;
  constants = Constants;
  calculateDuration: NodeJS.Timeout;
  puzzleData: object[];
  userGivenData: object[];
  isExistListener: boolean;
  @Output() crosswordpuzzleEvent = new EventEmitter();
  constructor(public dataService: dataService) { }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion;
    this.formControlName = `question${this.field.questionId}`;
    this.userGivenData = JSON.parse(this.field.chosenAnswer)
    this.puzzleData = JSON.parse(this.field.choices);
    if (this.userGivenData == null) {
      this.puzzleData = this.puzzleData.map(obj => {
        return {
          ...obj,
          useranswer: ''
        }
      });
    }
    else {
      this.puzzleData = this.userGivenData;
    }

    buildCrosswordPuzzle(this.puzzleData, '#test-taker-puzzle-wrapper');
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);

    this.dataService.startTimer(this.field.questionId);
  }

  ngAfterViewChecked() {
    const element = document.querySelector('app-crossword-puzzle') as HTMLElement;
    element.addEventListener('crosswordpuzzleEvent', (event: any) => {
      this.setUserData(event.detail);
    });
  }
  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  public setUserData(data) {
    if (data.some(obj => obj.useranswer.trim().length > 0)) {
      this.field.chosenAnswer = JSON.stringify(data);
    }
    else {
      if (this.field.isPreview) {
        this.field.chosenAnswer = null;
      }
      else {
        data = data.map((puzzle) => {
          return { ...puzzle, useranswer: puzzle.useranswer.trim() };
        })
        this.field.chosenAnswer = JSON.stringify(data);
      }

    }

  }
}
