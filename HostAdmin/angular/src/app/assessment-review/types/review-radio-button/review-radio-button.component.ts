import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Questions, UserToggledAnswers } from '@app/assessment-review/assessment-review';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { UtilsService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-review-radio-button',
  templateUrl: './review-radio-button.component.html',
  styleUrls: ['./review-radio-button.component.scss']
})
export class ReviewRadioButtonComponent implements OnInit, OnDestroy {
  field: Questions;
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
  isReplaceQuestion: boolean = false;
  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();
  answers: any;
  correctAttempts: number;
  incorrectAttempts: number;
  questionAttemptDetails: QuestionAttempDetails;
  isInfoClicked = false;
  tenantId: number;
  enableAttemptDetails= false;

  constructor(public dataService: dataService,
    private activatedRoute: ActivatedRoute,
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
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);
    this.formControlName = `question${this.field.questionId}`;
    this.choices = (this.field.choices === null || JSON.parse(this.field.choices).length === 0) ? ['true', 'false'] : JSON.parse(this.field.choices);
    this.chosenAnswer = this.field.chosenAnswer ? JSON.parse(this.field.chosenAnswer) : null;
    this.patchFormControls();

    this.choices.forEach(answer => {
      let answeredChoice: UserToggledAnswers = {
        choice: answer,
        isSelected: this.chosenAnswer === null || this.chosenAnswer.findIndex(x => x === answer) === -1 ? false : true
      };
      this.choicesToggled.push(answeredChoice);
    });
    this.answers = this.field.answers ? JSON.parse(this.field.answers) : [];
    if (this.isReplaceQuestion) {
      this.removeQuestion();
    }
    this.tenantId=this.appSessionService.tenantId;
    this.enableAttemptDetails = this.dataService.isDxclateralYakshaTenant(this.tenantId)
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
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

  removeQuestion() {
    this.utilsService.setCookieValue(this.constants.isReplaceQuestion, this.isReplaceQuestion.toString(), undefined, abp.appPath);
    if (this.field.reviews.length)
      this.utilsService.setCookieValue(this.constants.reviewCommentId, this.field.reviews.find(x => x.reviewCommentId).reviewCommentId.toString(), undefined, abp.appPath);
    this.questionRemoveEvent.emit(true);
  }

  attemptDetails() {
    this.isInfoClicked = true;
    this.reviewerService.getQuestionAttemptDetails(this.field.questionId, this.field.assessmentSectionSkillId).subscribe(
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
