import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { dataService } from '@app/service/common/dataService';
import { Constants } from '@app/models/constants';
import { Questions } from '@app/assessment-review/assessment-review';
import { UtilsService } from 'abp-ng2-module';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-order-the-sequence',
  templateUrl: './review-order-the-sequence.component.html',
  styleUrls: ['./review-order-the-sequence.component.scss']
})

export class ReviewOrderTheSequenceComponent implements OnInit, OnDestroy {
  @Input() field: Questions;
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
  answers: Array<string>;
  isReplaceQuestion: boolean = false;
  correctAttempts: number;
  incorrectAttempts: number;
  questionAttemptDetails: QuestionAttempDetails;
  isInfoClicked = false;
  tenantId: number;
  enableAttemptDetails= false;

  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();

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
    if (this.field.choices !== null && this.field.choices !== '') {
      this.patchValue(this.field.choices);
      let chosenAnswers = JSON.parse(this.field.choices);
      chosenAnswers.forEach(element => {
        this.options.push(element);
      });
    }
    else {
      this.choices = JSON.parse(this.field.choices);
      this.options = this.choices;
    }
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
