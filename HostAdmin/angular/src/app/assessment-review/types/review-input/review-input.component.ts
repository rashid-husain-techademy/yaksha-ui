import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Questions, UserInputAnswers } from '@app/assessment-review/assessment-review';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { UtilsService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-review-input',
  templateUrl: './review-input.component.html',
  styleUrls: ['./review-input.component.scss']
})
export class ReviewInputComponent implements OnInit, AfterViewInit, OnDestroy {
  field: Questions;
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
  isReplaceQuestion: boolean = false;
  @ViewChild('inputLabel') inputLabel: ElementRef<HTMLCanvasElement>;
  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();
  answers: Array<string>;
  correctAttempts: number;
  incorrectAttempts: number;
  questionAttemptDetails: QuestionAttempDetails;
  isInfoClicked = false;
  tenantId: number;
  enableAttemptDetails= false;

  constructor(private formBuilder: FormBuilder,
    public dataService: dataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService,
    private toastr: ToastrService,
    private reviewerService: ReviewerService,
    private appSessionService: AppSessionService) {
  }

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
    if (this.group === undefined) {
      this.group = this.formBuilder.group({});
    }

    this.chosenAnswer = this.field.chosenAnswer ? JSON.parse(this.field.chosenAnswer) : null;
    this.group.patchValue({
      [this.formControlName]: this.chosenAnswer,
    });
    this.calculateTextBoxCount();
    this.answers = this.field.answers ? JSON.parse(this.field.answers) : [];
    if (this.isReplaceQuestion) {
      this.removeQuestion();
    }
    this.tenantId=this.appSessionService.tenantId;
    this.enableAttemptDetails = this.dataService.isDxclateralYakshaTenant(this.tenantId);
  }

  ngAfterViewInit(): void {
    this.addElement();
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

  calculateTextBoxCount(): void {
    this.convertedQuestionText = this.questionText;
    this.textBoxCount = (this.questionText.match(new RegExp("{{", "g")) || []).length;
    let isTextBox: boolean;
    if (this.textBoxCount > 0) {
      for (let i = 0; i < this.textBoxCount; i++) {
        isTextBox = this.convertedQuestionText.includes(`{{${i}}}`);
        if (isTextBox) {
          this.convertedQuestionText = this.convertedQuestionText.replace(`{{${i}}}`, `<span class='input-width-box${i}'></span>`);
        }
      }
    }
  }

  addElement(): void {
    for (let i = 0; i < this.textBoxCount; i++) {
      this.alreadyGivenAnswer = (this.chosenAnswer !== null && this.chosenAnswer[i] !== '') ? this.chosenAnswer[i] : '';
      let input = document.createElement('input');
      input.className = 'form-control';
      input.id = `${i}`;
      input.autocomplete = 'off';
      input.addEventListener("keyup", (event: MouseEvent) => this.search(event));
      input.value = this.alreadyGivenAnswer !== null ? this.alreadyGivenAnswer : '';
      input.disabled = true;
      input.style.backgroundColor = 'transparent';
      input.style.width = '100px';
      input.style.display = 'inline-block';
      input.style.margin = '5px 5px 5px 5px';
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
    this.field.chosenAnswer = this.chosenAnswer.findIndex(x => x !== '') === -1 ? null : JSON.stringify(this.chosenAnswer);
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
