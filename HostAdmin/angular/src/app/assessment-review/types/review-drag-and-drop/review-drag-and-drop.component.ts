import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserInputAnswers } from '@app/test-taker/field';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { Questions } from '@app/assessment-review/assessment-review';
import { UtilsService } from 'abp-ng2-module';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReviewerService } from '@app/reviewer/reviewer.service';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-review-drag-and-drop',
  templateUrl: './review-drag-and-drop.component.html',
  styleUrls: ['./review-drag-and-drop.component.scss']
})

export class ReviewDragAndDropComponent implements OnInit, AfterViewInit, OnDestroy {
  field: Questions;
  group: FormGroup;
  formControlName: string;
  constants = Constants;
  textBoxCount: number;
  givenAnswers: UserInputAnswers[] = [];
  convertedQuestionText: string;
  calculateDuration: NodeJS.Timeout;
  duration: number = 0;
  questionText: string;
  plainQuestion: string;
  replaceQuestion: string;
  answers: Array<string>;
  isReplaceQuestion: boolean = false;
  @ViewChild('inputLabel') inputLabel: ElementRef<HTMLCanvasElement>;
  @Output() questionRemoveEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('choicesDiv', { static: true }) choicesDiv: ElementRef;
  choiceId: string;
  choiceBoxPaddingWidth: number = 10;
  choiceBoxMinWidthForSingleCharacter: number = 10;
  minChoiceBoxWidth: number = 55;
  correctAttempts: number;
  incorrectAttempts: number;
  questionAttemptDetails: QuestionAttempDetails;
  isInfoClicked = false;
  tenantId: number;
  enableAttemptDetails= false;

  constructor(private formBuilder: FormBuilder,
    public dataService: dataService,
    private utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private reviewerService: ReviewerService,
    private appSessionService: AppSessionService) { }

  ngOnInit(): void {
    this.setChoicesId();
    this.isReplaceQuestion = this.utilsService.getCookieValue(this.constants.isReplaceQuestion) === 'true' ? true : false;
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

    this.formControlName = `question${this.field.questionId}`;
    if (this.group === undefined) {
      this.group = this.formBuilder.group({});
    }

    this.answers = this.field.answers ? JSON.parse(this.field.answers) : [];
    this.calculateTextBoxCount();
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

  calculateTextBoxCount(): void {
    this.convertedQuestionText = this.questionText;//.replace(/<p>/gi, '<p style="margin-bottom;0px">');
    this.textBoxCount = (this.questionText.match(new RegExp("{{", "g")) || []).length;
    let indexPositions = [];
    var choiceVal = JSON.parse(this.field.choices);

    // if Answer consists more than 9 options logic to be changed for fetching the index value.
    for (let ch = 1; ch <= choiceVal.length; ch++) {
      let splitKey = '{{' + ch + '}}';
      for (let i = 0; i < this.convertedQuestionText.length;) {
        let indexPosition = this.convertedQuestionText.indexOf(splitKey, i);
        if (indexPosition === -1)
          break;
        i = indexPosition + 1;
        indexPositions.push(indexPosition + 2);
      }
    }
    indexPositions.sort().forEach((a, x) => this.convertedQuestionText = this.replaceQuestionAt(this.convertedQuestionText, a, x.toString()));

    if (this.textBoxCount === indexPositions.length) {
      for (let i = 0; i <= this.textBoxCount; i++) {
        this.convertedQuestionText = this.convertedQuestionText.replace(`{{${i}}}`, `<span class='input-width-box${i}'></span>`);
      }
    }
  }

  setChoicesId() {
    this.choicesDiv.nativeElement.id = this.choiceId = `choices-${this.field.questionId}-${new Date().toString()}`;
  }

  replaceQuestionAt(str, index, chr) {
    return str.substring(0, index) + chr + str.substring(index + 1);
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

  removeQuestion() {
    this.utilsService.setCookieValue(this.constants.isReplaceQuestion, this.isReplaceQuestion.toString(), undefined, abp.appPath);
    if (this.field.reviews.length)
      this.utilsService.setCookieValue(this.constants.reviewCommentId, this.field.reviews.find(x => x.reviewCommentId).reviewCommentId.toString(), undefined, abp.appPath);
    this.questionRemoveEvent.emit(true);
  }

  addElement(): void {
    for (let i = 0; i < this.textBoxCount; i++) {
      let input = document.createElement('input');
      input.className = 'form-control';
      input.id = `${i}`;
      input.autocomplete = 'off';
      input.value = '';
      input.style.width = '30%';
      input.style.display = "inline-block";
      input.style.margin = '5px 5px 5px 5px';
      input.disabled = true;
      input.style.backgroundColor = 'transparent';
      input.style.borderColor = 'gray';
      input.style.borderWidth = '2px';
      input.style.borderRadius = '5px';
      let span = this.inputLabel.nativeElement.getElementsByClassName(`input-width-box${i}`)[0];
      span.appendChild(input);
    }

    let choices = JSON.parse(this.field.choices);
    choices.forEach((element, ind) => {
      let choicesTag = document.getElementById(this.choiceId);
      let input = document.createElement('input');
      let width = element.length < 5 ? this.minChoiceBoxWidth : (element.length * this.choiceBoxMinWidthForSingleCharacter) + this.choiceBoxPaddingWidth;
      input.id = `drag-${ind}`;
      input.value = element;
      input.type = "text";
      input.disabled = true;
      input.style.margin = '5px 7px';
      input.style.borderRadius = '5px';
      input.style.borderColor = 'gray';
      input.style.padding = '0 6px';
      input.style.maxWidth = '100%';
      input.style.width = width > 1000 ? '100%' : width + 'px';
      input.style.height = 'calc(1.5em + 0.75rem + 2px)';
      choicesTag.appendChild(input);
    });
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
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
