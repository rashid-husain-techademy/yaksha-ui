import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Questions } from '@app/assessment-review/assessment-review';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { UtilsService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-review-match-the-following',
  templateUrl: './review-match-the-following.component.html',
  styleUrls: ['./review-match-the-following.component.scss']
})
export class ReviewMatchTheFollowingComponent implements OnInit, OnDestroy {
  @Input() field: Questions;
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
  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();
  answers: Array<string>;
  isReplaceQuestion: boolean = false;
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
    if (this.field.chosenAnswer && this.field.chosenAnswer !== null && this.field.chosenAnswer !== '') {
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
    this.answers = this.field.answers ? JSON.parse(this.field.answers) : [];
    if (this.isReplaceQuestion) {
      this.removeQuestion();
    }
    this.tenantId=this.appSessionService.tenantId;
    this.enableAttemptDetails = this.dataService.isDxclateralYakshaTenant(this.tenantId);
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
