import { formatDate } from '@angular/common';
import { Component, HostListener, Injector, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewerEvaluationStatus } from '@app/enums/reviewer';
import { Constants } from '@app/models/constants';
import { monacoConfig } from '@app/test-taker/test-taker.module';
import { TestService } from '@app/test-taker/test.service';
import { EditorComponent } from 'ngx-monaco-editor';
import { AssessmentCandidates, QuestionDetails, ReviewQuestionsRequest, ReviewQuestionsResponse, SubjectiveAnswers, UpdateQuestionReviews } from '../reviewer';
import { ReviewerService } from '../reviewer.service';
import { EditorCode, ExecutedResult, GetPostEvaluationStatus } from '@app/test-taker/field';
import { AppComponentBase } from '@shared/app-component-base';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '@app/shared/helper';

declare function restrictMethod(editorInstance, monaco, changedCode, resetflag): any;

@Component({
  selector: 'app-review-candidate',
  templateUrl: './review-candidate.component.html',
  styleUrls: ['./review-candidate.component.scss']
})
export class ReviewCandidateComponent extends AppComponentBase implements OnInit {

  candidateInfo: AssessmentCandidates;
  reviewStatus = ReviewerEvaluationStatus;
  constants = Constants;
  assessmentId: number;
  scheduleId: number;
  questionsToReview: ReviewQuestionsResponse;
  currentQuestion: QuestionDetails;
  currentQuestionIndex: number = 0;
  input: string;
  output: string = "";
  @ViewChild("editor") editor: EditorComponent;
  editorOptions: any;
  editorInstance: Object;
  monacoInstance: Object;
  showNextQuestion: boolean = true;
  showPreviousQuestion: boolean = false;
  showRetry: boolean = false;
  enableSubmit: boolean = false;
  enableMonacoEditor: boolean = false;
  isCoding: boolean = true;
  isSubjective: boolean = false;
  isSqlQuestion: boolean = false;
  compiledOutput: ExecutedResult;
  score: number | null;
  subjectiveText: string;
  enableFileView: string;
  tenantId: number | null = this.appSession.tenantId;
  isScoreEmpty: boolean = false;
  isScoreExceeds: boolean = false;
  isScoreNegative: boolean = false;
  isEvaluated: boolean = false;
  isRetryRecommended: boolean;
  subjectiveAnswerList: SubjectiveAnswers[] = [];
  reviewValidationMessages = {
    pleaseEnterTheScore: "Please enter the score for this question",
    scoreShouldNotExceedMaximumScore: "Score should not exceed the max score.",
    scoreShouldNotbeNegative: "Score should not be negative"
  }
  rubrixFile: File;
  supportedTypes: string[];
  @ViewChild('rubrixInput') rubrixInput: ElementRef;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    public activatedRoute: ActivatedRoute,
    public reviewerService: ReviewerService,
    public testService: TestService,
    public router: Router,
    public toastr: ToastrService,
    injector: Injector
  ) { super(injector) }

  ngOnInit(): void {
    this.score = null;
    this.activatedRoute.params.subscribe(param => {
      let candidateData = atob(param['data']).split('/');
      this.candidateInfo = {
        userId: parseInt(candidateData[0]),
        firstName: candidateData[1],
        lastName: candidateData[2],
        emailAddress: candidateData[3],
        submissionDate: new Date(candidateData[4]),
        evaluationStatus: parseInt(candidateData[5]),
        attempt: parseInt(candidateData[6])
      }
      this.scheduleId = parseInt(candidateData[7]);
      this.isEvaluated = this.candidateInfo.evaluationStatus === ReviewerEvaluationStatus.Completed ? true : false;
      this.editorOptions = { readOnly: true };
    });
    this.getCandidateQuestionsForReview();
  }

  getCandidateQuestionsForReview() {
    let request: ReviewQuestionsRequest = {
      scheduleId: this.scheduleId,
      userId: this.candidateInfo.userId,
    };
    this.reviewerService.getCandidateQuestionsForReview(request).subscribe(res => {
      if (res.result) {
        this.questionsToReview = res.result;
        if (this.questionsToReview.questionDetails.length) {
          this.currentQuestion = this.questionsToReview.questionDetails[0];
          if (this.currentQuestion.reviewerRubrixUrl && this.currentQuestion.questionTypeId === Constants.subjectiveId) {
            let fileName = this.currentQuestion.reviewerRubrixUrl?.split('/')[4]?.split('?')[0];
            let file = new File([this.currentQuestion.reviewerRubrixUrl], fileName);
            this.rubrixFile = file;
          }
          else if (this.rubrixFile) {
            this.rubrixInput.nativeElement.value = '';
            this.rubrixFile = null;
          }
          if (this.currentQuestion.score !== undefined && this.currentQuestion.score !== null) {
            this.score = this.currentQuestion.score === 0 ? 0 : (this.currentQuestion.score / this.currentQuestion.questionScore) * 100;
          }
          this.patchSubjectiveAnswer();
          if (this.questionsToReview.questionDetails.length === 1) {
            this.showPreviousQuestion = false;
            this.showNextQuestion = false;
            this.enableSubmit = true;
            if (this.questionsToReview.totalAttempts > this.candidateInfo.attempt)
              this.showRetry = true;
          }
        }
        else {
          this.enableSubmit = true;
          this.isEvaluated = false;
        }
      }
    });
  }

  formattedDateTime(date: Date) {
    if (date) {
      return formatDate(date.toString(), 'MMM d, y, h:mm a', 'en_US');
    }
    else
      return "-";
  }

  onInitEditor(editorinstance) {
    this.editorInstance = editorinstance;
    this.monacoInstance = monacoConfig.onMonacoLoad();
    this.restrictEditor();
  }

  restrictEditor(resetflag = false) {
    restrictMethod(this.editorInstance, this.monacoInstance, this.currentQuestion.answer, resetflag);
  }

  compileAndRun() {
    let data: EditorCode = {
      script: this.currentQuestion.answer.length > 0
        ? (this.isSqlQuestion ? this.stripHtml(this.currentQuestion.defaultCode) + this.currentQuestion.answer.trim() : this.currentQuestion.answer.trim())
        : null,
      args: null,
      stdin: this.input,
      libs: [],
      hasInputFiles: this.input ? true : false,
      language: this.currentQuestion.language,
      versionIndex: this.currentQuestion.compilerVersionCode
    };
    if (data.script) {
      this.testService.executeJdoodleCompiler(data).subscribe(res => {
        if (res && res.success && res.result !== null) {
          this.compiledOutput = res.result;
          this.output = res.result.output;
        }
      });
    }
  }

  previousQuestion() {
    this.currentQuestionIndex -= 1;
    this.showRetry = false;
    this.enableSubmit = false;
    this.currentQuestion = this.questionsToReview.questionDetails[this.currentQuestionIndex];
    if (this.currentQuestion.reviewerRubrixUrl && this.currentQuestion.questionTypeId === Constants.subjectiveId) {
      let fileName = this.currentQuestion.reviewerRubrixUrl?.split('/')[4]?.split('?')[0];
      let file = new File([this.currentQuestion.reviewerRubrixUrl], fileName);
      this.rubrixFile = file;
    }
    else if (this.rubrixFile) {
      this.rubrixInput.nativeElement.value = '';
      this.rubrixFile = null;
    }
    this.patchSubjectiveAnswer();
    if (this.currentQuestion.score === null)
      this.getUserQuestionScore();
    else
      this.score = this.currentQuestion.score === 0 ? 0 : (this.currentQuestion.score / this.currentQuestion.questionScore) * 100;
    this.showNextQuestion = true;
    if (this.currentQuestionIndex === 0) {
      this.showPreviousQuestion = false;
    }
    else
      this.showPreviousQuestion = true;
    if (this.currentQuestion.language === this.constants.sql)
      this.isSqlQuestion = true;
  }

  nextQuestion() {
    if ((this.isScoreEmpty || this.isScoreExceeds || this.isScoreNegative || !this.validateScore(this.score))) {
      this.toastr.error(this.constants.correctValidationErrors);
      return;
    }
    if (!this.currentQuestion.answer?.trim() && this.score !== 0) {
      this.toastr.error(`${Constants.noAnswerSubmittedForThisQuestionPleaseSetTheScoreToZeroToContinueNextQuestion}`);
      return;
    }
    if (!this.isEvaluated)
      this.updateQuestionReview();
    this.currentQuestionIndex += 1;
    this.currentQuestion = this.questionsToReview.questionDetails[this.currentQuestionIndex];
    if (this.currentQuestion.reviewerRubrixUrl && this.currentQuestion.questionTypeId === Constants.subjectiveId) {
      let fileName = this.currentQuestion.reviewerRubrixUrl?.split('/')[4]?.split('?')[0];
      let file = new File([this.currentQuestion.reviewerRubrixUrl], fileName);
      this.rubrixFile = file;
    }
    else if (this.rubrixFile) {
      this.rubrixInput.nativeElement.value = '';
      this.rubrixFile = null;
    }
    this.patchSubjectiveAnswer();
    this.score = null;
    if (this.currentQuestion.score === null)
      this.getUserQuestionScore();
    else
      this.score = this.currentQuestion.score === 0 ? 0 : (this.currentQuestion.score / this.currentQuestion.questionScore) * 100;
    this.showPreviousQuestion = true;
    if (this.currentQuestionIndex === this.questionsToReview.questionDetails.length - 1) {
      this.showNextQuestion = false;
      this.enableSubmit = true;
      if (this.questionsToReview.totalAttempts > this.candidateInfo.attempt)
        this.showRetry = true;
    }
    else
      this.showNextQuestion = true;
    if (this.currentQuestion.language === this.constants.sql)
      this.isSqlQuestion = true;
  }

  updateQuestionReview(isSubmit: boolean = false, evaluationData: GetPostEvaluationStatus = null) {
    let score = this.score === 0 ? 0 : (this.score * this.currentQuestion.questionScore) / 100;
    let reviewedData: UpdateQuestionReviews = {
      userAssessmentAttemptQuestionId: this.currentQuestion.userAssessmentAttemptQuestionId,
      score: score
    }

    let formData = new FormData();
    if (this.rubrixFile) {
      if (!this.rubrixFile.type) {
        formData.append('File', null);
      }
      else {
        formData.append('File', this.rubrixFile, this.rubrixFile.name);
      }
    }
    else {
      formData.append('File', null);
    }

    formData.append('Input', JSON.stringify(reviewedData));

    this.reviewerService.updateQuestionReviews(formData).subscribe(res => {
      if (res.result.isSuccess) {
        const index = this.questionsToReview.questionDetails.findIndex(item => item.userAssessmentAttemptQuestionId === reviewedData.userAssessmentAttemptQuestionId);
        this.questionsToReview.questionDetails[index].score = score;
        this.questionsToReview.questionDetails[index].reviewerRubrixUrl = res.result.message;
        if (isSubmit) {
          this.testService.getRemainingAttempts(evaluationData).subscribe(res => {
            if (res && res.success && res.result !== null) {
              if (res.result === -1) {
                this.toastr.error(this.constants.sessionInvalid)
              }
              else
                this.backToCandidates();
            }
          });
        }
      }
    },
      err => { console.error(err); return false; }
    );
  }

  getUserQuestionScore() {
    this.reviewerService.getUserQuestionScore(this.currentQuestion.userAssessmentAttemptQuestionId).subscribe(res => {
      if (res.result !== null && res.result !== undefined) {
        this.score = res.result === 0 ? 0 : (res.result / this.currentQuestion.questionScore) * 100
      }
      else
        this.score = res.result;
    });
  }

  submit() {
    if (!this.validateScore(this.score)) {
      this.toastr.error(this.constants.correctValidationErrors);
      return;
    }
    if (!this.currentQuestion.answer?.trim() && this.score !== 0) {
      this.toastr.error(`${Constants.noAnswerSubmittedForThisQuestionPleaseSetTheScoreToZeroToContinueNextQuestion}`);
      return;
    }
    let evaluationData: GetPostEvaluationStatus = {
      tenantId: this.tenantId,
      userId: this.candidateInfo.userId,
      assessmentScheduleId: this.scheduleId,
      userAssessmentMappingId: this.questionsToReview.userAssessmentMappingId,
      isProctoringViolated: false,
      violatedProctoringSetting: null,
      attemptId: this.questionsToReview.userAssessmentAttemptId,
      attemptNumber: this.candidateInfo.attempt,
      isRetry: this.isRetryRecommended
    };
    this.updateQuestionReview(true, evaluationData);
  }

  patchSubjectiveAnswer() {
    if (this.currentQuestion.questionTypeId === this.constants.subjectiveId && !this.currentQuestion.isSubjectiveUrl) {
      this.subjectiveText = this.currentQuestion.answer ? this.currentQuestion.answer.replace(/<p>/gi, '<p style="margin-bottom:0px;">') : null;
    }
    else if (this.currentQuestion.questionTypeId === this.constants.subjectiveId && this.currentQuestion.isSubjectiveUrl) {
      this.subjectiveAnswerList = [];
      let answer = Helper.isValidJson(this.currentQuestion.answer) ? JSON.parse(this.currentQuestion.answer) : this.currentQuestion.answer;
      let fileNames = JSON.parse(this.currentQuestion.fileName);
      if (fileNames) {
        answer.forEach(element => {
          let reviewedData: SubjectiveAnswers = {
            answer: element,
            fileName: fileNames[answer.indexOf(element)]
          }
          this.subjectiveAnswerList.push(reviewedData);
        });
      }
    }
  }

  toggleRetry(value: boolean) {
    this.isRetryRecommended = value;
  }

  backToCandidates() {
    this.router.navigate(['../../assessments', btoa(this.scheduleId.toString())], { relativeTo: this.activatedRoute });
  }

  download(): void {
    location.href = this.currentQuestion.answer;
  }

  stripHtml(html: string) {
    if (html) {
      var startParagraph = /\<p>/gi;
      var breakTag = /\<br>/gi;
      var endParagraph = /\<\/p>/gi;
      var div = document.createElement("DIV");
      div.innerHTML = html.replace(startParagraph, "").replace(endParagraph, "").replace(breakTag, "\n");
      let cleanText = div.innerText;
      div = null;
      return cleanText;
    }
    else
      return "";
  }

  validateScore(score: number): boolean {
    if (score === undefined || score === null) {
      this.isScoreEmpty = true;
      this.isScoreExceeds = false;
      this.isScoreNegative = false;
      return false;
    }
    else if (score > 100) {
      this.isScoreExceeds = true;
      this.isScoreEmpty = false;
      this.isScoreNegative = false;
      return false;
    }
    else if (score < 0) {
      this.isScoreEmpty = false;
      this.isScoreExceeds = false;
      this.isScoreNegative = true;
      return false;
    }
    else {
      this.isScoreEmpty = this.isScoreExceeds = false;
      return true;
    }
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  onRubrixFileUpload(files) {
    if (files.length > 0) {
      const selectedFileType = files[0].type;
      this.rubrixFile = files[0];
      this.supportedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === selectedFileType);
      if (isFileTypeSupported) {
        this.toastr.success(Constants.fileUploaded);
      }
      else {
        this.rubrixFile = undefined;
        this.toastr.warning(Constants.uploadOnlyExcelFiles);
      }
    }
    else {
      this.toastr.warning(Constants.pleaseUploadFile);
    }
  }

  removeRubrix(): void {
    if (!this.isEvaluated) {
      this.rubrixInput.nativeElement.value = '';
      this.rubrixFile = null;
      this.toastr.warning(Constants.selectedFileWasRemoved);
    }
  }
  truncate(input: string) {
    if (input?.length > 75) {
      return input.substring(0, 75) + '...';
    }
    return input;
  }
}
