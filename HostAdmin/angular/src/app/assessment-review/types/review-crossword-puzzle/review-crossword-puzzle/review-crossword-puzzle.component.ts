import { Constants } from '@app/models/constants';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Questions } from '@app/assessment-review/assessment-review';
import { dataService } from '@app/service/common/dataService';
import { UtilsService } from 'abp-ng2-module';
import { PuzzleAnswerData, PuzzleChoiceData, puzzleData } from '@app/admin/question/question-details';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-review-crossword-puzzle',
  templateUrl: './review-crossword-puzzle.component.html',
  styleUrls: ['./review-crossword-puzzle.component.scss']
})
export class ReviewCrosswordPuzzleComponent implements OnInit {
  field: Questions;
  group: FormGroup;
  formControlName: string;
  questionText: string;
  plainQuestion: string;
  replaceQuestion: string;
  constants = Constants;
  puzzleData: puzzleData[];
  choiceData: PuzzleChoiceData[];
  answerData: PuzzleAnswerData[];
  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();
  isReplaceQuestion: boolean = false;
  correctAttempts: number;
  incorrectAttempts: number;
  questionAttemptDetails: QuestionAttempDetails;
  isInfoClicked = false;
  tenantId: number;
  enableAttemptDetails= false;
  constructor(public dataService: dataService, private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService,
    private toastr: ToastrService,
    private reviewerService: ReviewerService,
    private appSessionService: AppSessionService) { }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;
    this.isReplaceQuestion = this.utilsService.getCookieValue(this.constants.isReplaceQuestion) === 'true' ? true : false;
    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion;//.replace(/<p>/gi, '<p style="margin-bottom;0px">');
    this.formControlName = `question${this.field.questionId}`;
    this.choiceData = JSON.parse(this.field.choices);
    this.answerData = this.field.answers ? JSON.parse(this.field.answers) : null;
    if (!this.answerData) {
      this.puzzleData = this.choiceData.map(obj => {
        return { ...obj, answer: "" };
      });
    }
    else {
      this.puzzleData = this.choiceData.map((obj1) => {
        const obj2 = this.answerData.find((obj2) => obj2.position == obj1.position && obj2.orientation == obj1.orientation);
        return { ...obj1, ...obj2 };
      });
    }

    buildCrosswordPuzzle(this.puzzleData, '#questionnaire-reviewer-puzzle-wrapper');
    if (this.isReplaceQuestion) {
      this.removeQuestion();
    }
    this.tenantId=this.appSessionService.tenantId;
    this.enableAttemptDetails = this.dataService.isDxclateralYakshaTenant(this.tenantId);
  }
  navigateToEditQuestion(): void {
    this.utilsService.setCookieValue(Constants.previousPath, this.router.url, undefined, abp.appPath);
    this.utilsService.setCookieValue(Constants.redirectQuestionDetails, btoa(this.field.serialNumber.toString() + '/' + this.field.selectedCommentStatus), undefined, abp.appPath);
    let questionId = btoa(this.field.questionId.toString());
    let questiontypeId = btoa(this.field.questionType.id.toString());
    let assessmentId = btoa(this.field.assessmentId.toString());
    let assessmentSectionId = btoa(this.field.sectionId.toString());
    let assessmentSectionSkillId = btoa(this.field.assessmentSectionSkillId.toString());
    let isQuestionUpdateFromQRAdmin = btoa("true");
    this.router.navigate(['../../../question/create-question', questionId, questiontypeId, assessmentId, assessmentSectionId, assessmentSectionSkillId, isQuestionUpdateFromQRAdmin], { relativeTo: this.activatedRoute });
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  removeQuestion() {
    this.utilsService.setCookieValue(this.constants.isReplaceQuestion, this.isReplaceQuestion.toString(), undefined, abp.appPath);
    if (this.field.reviews.length)
      this.utilsService.setCookieValue(this.constants.reviewCommentId, this.field.reviews.find(x => x.reviewCommentId).reviewCommentId.toString(), undefined, abp.appPath);
    this.questionRemoveEvent.emit(true);
  }

  attemptDetails() {
    this.isInfoClicked = true;
    this.reviewerService.getQuestionAttemptDetails(this.field.questionId,this.field.assessmentSectionSkillId).subscribe(
      (res) => {
        if (res && res.result) {
          this.correctAttempts = res.result.correctAttempts;
          this.incorrectAttempts = res.result.incorrectAttempts;
        }
      },
      (error) => {
        this.toastr.error(Constants.somethingWentWrong);
      }
    );
  }
}
