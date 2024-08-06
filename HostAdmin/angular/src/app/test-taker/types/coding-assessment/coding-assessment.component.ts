import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { CodingAssessment, EditorCode, ExecutedResult, GetCompilerLanguageDefaultCode, GetEditorCode, InsertOrUpdateUserAttemptQuestions, QuestionDetailDto, TestCaseData, TestcaseResult, TestcasesResult, UserAssessmentQuestionsDto } from '@app/test-taker/field';
import { TestService } from '@app/test-taker/test.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationComponent } from '@app/test-taker/confirmation/confirmation.component';
import { dataService } from '@app/service/common/dataService';
import { EditorComponent } from 'ngx-monaco-editor';
import { ToastrService } from 'ngx-toastr';
import { TestCaseResultStatus } from '@app/enums/test';
import { ExecutionConfig } from '@app/admin/assessment/assessment';
import { ActivatedRoute } from '@angular/router';
import { monacoConfig } from '@app/test-taker/test-taker.module';
import { Helper } from '@app/shared/helper';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { finalize } from 'rxjs/operators';
// import { environment as env } from 'environments/environment';

declare function restrictMethod(editorInstance, monaco, changedCode, resetflag): any;
// var socketClient = window['socketClient'];
// declare var SockJS: any;

@Component({
  selector: 'app-coding-assessment',
  templateUrl: './coding-assessment.component.html',
  styleUrls: ['./coding-assessment.component.scss']
})

export class CodingAssessmentComponent implements OnInit, OnDestroy {
  field: QuestionDetailDto;
  isCopyPasteEnabledForCoding?: boolean;
  group: FormGroup;
  formControlName: string;
  questionDetails: QuestionDetailDto;
  currentSelectedLanguage: CodingAssessment;
  constants = Constants;
  input = new FormControl();
  output = new FormControl();
  errorWarningLines = new FormControl();
  hasWarningOrErrors: boolean = false;
  executionCount = new FormControl();
  restrictedCount = new FormControl();
  editorLanguage: string;
  compiledOutput: ExecutedResult;
  editorOptions: any;
  code: string;
  isLightTheme: boolean = true;
  theme: string = "Light Mode"
  calculateDuration: NodeJS.Timeout;
  duration: number = 0;
  initialDefaultCode: string;
  questionText: string;
  @ViewChild("editor") editor: EditorComponent;
  chosenLanguageId: number;
  testCaseDetails: TestcasesResult[];
  assessmentSection: string;
  attemptId: UserAssessmentQuestionsDto;
  executeAll: boolean = false;
  executesResult: TestcaseResult[];
  testcasestatus = TestCaseResultStatus;
  testCaseCount: number;
  isSqlQuestion: boolean = false;
  sqlDefaultCode: string;
  ExecutedCount: ExecutionConfig;
  isPreview: boolean = true;
  editorInstance: Object;
  monacoInstance: Object;
  plainQuestion: string;
  replaceQuestion: string;
  isHtmlCss: boolean = false;
  htmlstring: string = "";
  // postResponse: any;
  // authToken: string;
  // wsNextId: number = 1;
  // enableInputAndOutput: boolean = false;
  // disableCompileAndRun: boolean = false;
  // isExecutionStarted: boolean = false;
  unicodeCharReplacements: any = {
    '\u00A0': ' ',
    '\u2000': ' ',
    '\u2001': ' ',
    '\u2002': ' ',
    '\u2003': ' ',
    '\u2004': ' ',
    '\u2005': ' ',
    '\u2007': ' ',
    '\u2008': ' ',
    '\u2009': ' ',
    '\u200A': ' ',
    '\u200B': '',
    '\u2060': '',
    '\uFEFF': ' ',
    '\u3000': '  ',
    '\uD834\uDD73': '',
    '\uD834\uDD74': '',
    '\uD834\uDD75': '',
    '\uD834\uDD76': '',
    '\uD834\uDD77': '',
    '\uD834\uDD78': '',
    '\uD834\uDD79': '',
    '\uD834\uDD7A': '',
    '\u2800': ' ',
  };
  selectedLanguageId: any; 
  constructor(
    private testService: TestService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private appSessionService: AppSessionService,
    public dataService: dataService,
    private toastr: ToastrService,
    private spinner: SpinnerVisibilityService) { }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;
    if (this.field.codingAssessment.length) {
      let htmlLanguage = this.field.codingAssessment.find(x => x.language === this.constants.htmlCss);
      if (htmlLanguage) {
        this.isHtmlCss = true;
      }
    }
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
    this.questionDetails = this.field;
    this.testCaseDetails = this.field.testCases;
    this.testCaseCount = this.testCaseDetails.length;
    this.testCaseDetails.forEach(element => {
      element.isTestcaseExecuted = false;
    });
    if (this.questionDetails.configJson) {
      this.ExecutedCount = JSON.parse(this.questionDetails.configJson);
      if (this.questionDetails.givencount !== 0 && this.ExecutedCount.ExecutedCount >= this.questionDetails.givencount) {
        this.field.countExceed = true;
      }
    }

    this.currentSelectedLanguage = this.field.chosenLanguage ? this.field.chosenLanguage : this.questionDetails.codingAssessment[0];
    this.field.chosenLanguage = this.currentSelectedLanguage;
    this.editorOptions = { theme: 'vs-dark', language: this.currentSelectedLanguage.editorLanguage, contextmenu: false, automaticLayout: true };
    this.chosenLanguageId = this.field.chosenLanguage.languageId;
    this.selectedLanguageId=this.chosenLanguageId;
    if (this.ExecutedCount)
      this.field.executionCount = this.ExecutedCount.ExecutedCount;
    else
      this.field.executionCount = 0;
    this.executionCount.patchValue(this.field.executionCount);
    this.restrictedCount.patchValue(this.field.givencount);

    if (this.currentSelectedLanguage.language === Constants.sql) {
      this.getDefaultCode();
      this.updateCodeEditor();
      this.isSqlQuestion = true;
      this.code = this.initialDefaultCode = this.field.chosenAnswer ? this.field.chosenAnswer : '';
    }
    else
      this.code = this.initialDefaultCode = this.field.chosenAnswer ? this.field.chosenAnswer : this.stripHtml(this.currentSelectedLanguage.defaultCode);

    this.editorLanguage = this.editorOptions.language;
    if (this.field.isCodeSubmitted)
      this.disableFields();

    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const userAssessmentData = atob(params['assessment']).split('/');
        if (userAssessmentData.length > 1) {
          this.isPreview = false;
        }
      }
    });
  }

  expandTestCase(acc, panelId, executeAll, testCaseId) {
    let panelIdString = "panel-" + panelId;
    if (!acc.isExpanded(panelIdString)) {
      acc.toggle(panelIdString);
    }
    this.executeTestCase(executeAll, testCaseId);
  }

  stripHtml(html: string) {
    if (html) {
      var startParagraph = /\<p>/i;
      var remainingParagraph = /\<p>/gi;
      var breakTag = /\<br>/gi;
      var endParagraph = /\<\/p>/gi;
      var div = document.createElement("DIV");
      div.innerHTML = html.replace(startParagraph, "").replace(remainingParagraph, "\n").replace(endParagraph, "").replace(breakTag, "\n");
      let cleanText = div.innerText;
      div = null;
      return cleanText;
    }
    else
      return "";
  }

  onInitEditor(editorinstance) {
    if (this.field.isCopyPasteEnabledForCoding == false) {
      this.disablePaste();
    }
    editorinstance.setValue(this.removeSpaceUnicodeChars(this.code));
    this.editorInstance = editorinstance;
    this.monacoInstance = monacoConfig.onMonacoLoad();
    this.restrictEditor();
  }

  restrictEditor(resetflag = false) {
    restrictMethod(this.editorInstance, this.monacoInstance, this.code, resetflag);
  }

  disablePaste() {
    this.editor['_editor'].onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;
      if ((keyCode === 33 || keyCode === 52) && (metaKey || ctrlKey)) {
        event.preventDefault();
      }
    });
  }

  disableFields(): void {
    this.theme = "Light Mode";
    this.editorOptions = { theme: 'vs-dark', readOnly: true, contextmenu: false };
    this.input.disable();
    this.output.disable();
    this.errorWarningLines.disable();
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      this.theme = "Light Mode";
      this.editorOptions = { theme: 'vs-dark', language: this.editorLanguage, contextmenu: false };
    }
    else {
      this.theme = "Dark Mode";
      this.editorOptions = { theme: 'vs-light', language: this.editorLanguage, contextmenu: false };
    }
  }

  ngOnDestroy() {
    // this.field.duration += this.duration;
    clearInterval(this.calculateDuration);
  }

  getCode(languageId: string) {
    this.currentSelectedLanguage = this.questionDetails.codingAssessment.find(x => x.languageId === Number(languageId));
    this.editorLanguage = this.currentSelectedLanguage.compilerLanguage;
    this.editorOptions = { language: this.editorLanguage, contextmenu: false };
    this.code = this.initialDefaultCode = this.stripHtml(this.currentSelectedLanguage.defaultCode);
    this.field.chosenAnswer = this.code;
    this.field.chosenLanguage = this.currentSelectedLanguage;
    this.chosenLanguageId = this.field.chosenLanguage.languageId;
    this.selectedLanguageId=this.chosenLanguageId;
    this.input.patchValue('');
    this.output.patchValue('');
    this.errorWarningLines.patchValue('');
    this.testCaseDetails.forEach(element => {
      element.isTestcaseExecuted = false;
      element.actualOutput = null;
      element.actualmaxCpuTime = null;
      element.actualmaxMemoryPermitted = null;
    });
  }
  
  updateCode(event: any) {
    if (this.code !== this.initialDefaultCode)
      this.field.chosenAnswer = this.code;
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  resetToDefaultTemplate() {
    abp.message.confirm(
      this.l('AssessmentSectionDeleteWarningMessage', `${Constants.areYouSureYouWantToResetTheCodeOnceResetedCodeCannotBeReverted}`),
      (result: boolean) => {
        if (result) {
          if (this.isSqlQuestion)
            this.code = "";
          else {
            let data: GetCompilerLanguageDefaultCode = {
              questionId: this.field.questionId,
              languageId: this.chosenLanguageId
            };
            this.testService.getCompilerLanguageDefaultCode(data).subscribe(res => {
              if (res.result) {
                this.code = this.removeSpaceUnicodeChars(this.stripHtml(res.result));
                this.restrictEditor(true);
              }
            });
          }
          this.field.chosenAnswer = "";
        }
      });
  }

  compileHtml() {

    this.htmlstring = this.code.trim();
    var iframe = document.createElement('iframe');
    this.clearIframe();
    // div tag in which iframe will be added should have id attribute with value myDIV
    document.getElementById("myDIV").appendChild(iframe);
    // provide height and width to it
    iframe.setAttribute("style", "height:100%;width:100%;");
    iframe.id = "iframeCloud";
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(this.htmlstring);
    iframe.contentWindow.document.close();
    this.dataService.stopTimer(this.field.questionId);
    var milliSeconds=this.dataService.getTimeSpent(this.field.questionId);
    const timeLag =this.field.duration - (milliSeconds/ 1000)
    if ((this.field.duration > (milliSeconds / 1000)) && (timeLag > 10)) {
      milliSeconds = this.field.duration * 1000 + milliSeconds;
      this.dataService.timeRecords.set(this.field.questionId, { startTime: null, timeSpent: milliSeconds, previousTimeSpent: milliSeconds })
    }
    this.dataService.startTimer(this.field.questionId);
    let data: InsertOrUpdateUserAttemptQuestions = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      questionId: this.field.questionId,
      assessmentId: this.field.assessmentId,
      answer: this.code,
      userAssessmentMappingId: this.field.userAssessmentMappingId,
      timeZone: Helper.getTimeZone(),
      isMarkedForReview: this.field.isMarkedForReview,
      hintsAvailedJson: this.field.hintsAvailedJson,
      userEmailAddress: this.field.userEmail,
      duration: this.field.duration,
      durationMilliSeconds:this.dataService.getTimeSpent(this.field.questionId),
      reviewerId: 0,
      languageId: this.field.chosenLanguage.languageId,
      hintsAvailed: 0,
      isCodeSubmitted: this.field.isCodeSubmitted,
      isSkipped: this.field.isSkipped,
      assessmentScheduleId: this.field.assessmentScheduleId,
      executedCount: this.field.executionCount,
      campaignScheduleId: this.field.campaignScheduleId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      parentQuestionTypeId: this.field.questionType.parentQuestionTypeId,
      questionTypeId: this.field.questionType.id,
      questionTypeName: this.field.questionType.name,
      isAssessmentSubmitted: false
    };
    this.testService.insertOrUpdateUserAttemptQuestions(data)
      .subscribe(res => {
        if (res && res.result) {
          if (res.result === this.constants.success) { }
          else if (res.result === this.constants.failure) {
            this.toastr.error(this.constants.sessionInvalid);
          } else if (res.result === this.constants.inActiveSchedule) {
            this.toastr.error(this.constants.inActiveAssessment);
          }
        }
      }, error => {
        if (error && error.status && error.status == 401) {
          this.toastr.error(this.constants.sessionInvalid);
        }
      });
  }

  compileAndRun(): void {
    let data: EditorCode = {
      script: this.code.length > 0
        ? (this.isSqlQuestion ? this.stripHtml(this.sqlDefaultCode) + this.code.trim() : this.code.trim())
        : null,
      args: null,
      stdin: this.input.value,
      libs: [],
      hasInputFiles: this.input.value ? true : false,
      language: this.editorLanguage,
      versionIndex: this.questionDetails.codingAssessment.find(x => x.editorLanguage === this.editorLanguage).compilerVersionCode
    };
    if (data.script) {
      //if (this.isSqlQuestion) {
      this.field.executionCount = this.field.executionCount + 1;
      this.executionCount.patchValue(this.field.executionCount);

      if (this.questionDetails.givencount !== 0 && this.field.executionCount >= this.questionDetails.givencount) {
        this.field.countExceed = true;
      }
      this.testService.executeJdoodleCompiler(data).subscribe(res => {
        if (res.success) {
          this.compiledOutput = res.result;
          this.output.patchValue(res.result.output);
          this.errorWarningLines.patchValue(res.result.errorWarningLines);
          if (res.result.errorWarningLines && res.result.errorWarningLines != '')
            this.hasWarningOrErrors = true;
          else
            this.hasWarningOrErrors = false;
        }
      });
      //}
      // else {
      //   this.testService.getJDoodleAuthToken().subscribe(res => {
      //     if (res.result) {
      //       this.authToken = res.result;
      //       socketClient = webstomp.over(new SockJS(env.jdoodleSockJSURL), { heartbeat: false, debug: true });
      //       socketClient.connect({}, this.onWsConnection.bind(this), this.onWsConnectionFailed.bind(this));
      //     }
      //   });
      // }

      // this.field.executionCount = this.field.executionCount + 1;
      // this.executionCount.patchValue(this.field.executionCount);

      // if (this.questionDetails.givencount !== 0 && this.field.executionCount >= this.questionDetails.givencount) {
      //   this.field.countExceed = true;
      // }
      this.field.chosenAnswer = this.code;
      this.field.isCodeSubmitted = false;
      this.field.chosenLanguage = this.currentSelectedLanguage;
      this.field.isSkipped = this.code !== this.currentSelectedLanguage.defaultCode ? false : true;
      this.field.duration = this.field.duration ? this.field.duration : 0;
      this.questionDetails.configJson = `{"ExecutedCount":${this.field.executionCount}}`;
      this.dataService.stopTimer(this.field.questionId);
      var milliSeconds=this.dataService.getTimeSpent(this.field.questionId);
      const timeLag =this.field.duration - (milliSeconds/ 1000)
      if ((this.field.duration > (milliSeconds / 1000)) && (timeLag > 10)) {
        milliSeconds = this.field.duration * 1000 + milliSeconds;
        this.dataService.timeRecords.set(this.field.questionId, { startTime: null, timeSpent: milliSeconds, previousTimeSpent: milliSeconds })
      }
      this.dataService.startTimer(this.field.questionId);
      let exedata: InsertOrUpdateUserAttemptQuestions = {
        tenantId: this.appSessionService.tenantId,
        userId: this.appSessionService.userId,
        questionId: this.field.questionId,
        assessmentId: this.field.assessmentId,
        answer: this.code,
        userAssessmentMappingId: this.field.userAssessmentMappingId,
        isMarkedForReview: this.field.isMarkedForReview,
        hintsAvailedJson: this.field.hintsAvailedJson,
        timeZone: Helper.getTimeZone(),
        userEmailAddress: this.field.userEmail,
        duration: this.field.duration,
        durationMilliSeconds:this.dataService.getTimeSpent(this.field.questionId),
        reviewerId: 0,
        languageId: this.field.chosenLanguage.languageId,
        hintsAvailed: 0,
        isCodeSubmitted: this.field.isCodeSubmitted,
        isSkipped: this.field.isSkipped,
        assessmentScheduleId: this.field.assessmentScheduleId,
        executedCount: this.field.executionCount,
        campaignScheduleId: this.field.campaignScheduleId,
        userAssessmentAttemptId: this.field.userAssessmentAttemptId,
        parentQuestionTypeId: this.field.questionType.parentQuestionTypeId,
        questionTypeId: this.field.questionType.id,
        questionTypeName: this.field.questionType.name,
        isAssessmentSubmitted: false,
        IsAdaptiveSectionSubmit: false
      };
      this.testService.insertOrUpdateUserAttemptQuestions(exedata).subscribe(res => {
        if (res && res.result) {
          if (res.result === this.constants.success) { }
          else if (res.result === this.constants.failure) {
            this.toastr.error(this.constants.sessionInvalid);
          }
          else if (res.result === this.constants.inActiveSchedule) {
            this.toastr.error(this.constants.inActiveAssessment);
          }
        }
      }, error => {
        if (error && error.status && error.status == 401) {
          this.toastr.error(this.constants.sessionInvalid);
        }
      });
    }
    else {
      this.toastr.error(this.constants.codeSnippetIsEmpty);
    }
  }

  executeTestCase(executeAll, testCaseId): void {
    let data: TestCaseData = {
      attemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
      testCaseId: executeAll === false ? testCaseId : null,
      answer: this.code.length > 0
        ? (this.isSqlQuestion ? this.stripHtml(this.sqlDefaultCode) + this.code.trim() : this.code.trim())
        : null,
      language: this.currentSelectedLanguage.editorLanguage,
      versionIndex: this.questionDetails.codingAssessment.find(x => x.editorLanguage === this.editorLanguage).compilerVersionCode
    };
    if (data.answer) {
      this.testService.executeTestCases(data).subscribe(res => {
        if (res && res.result) {
          this.executesResult = res.result;
          this.executesResult.forEach(value => {
            let output = value.output;
            let cpuUtlized = value.cpuTime;
            let memoryUtlized = value.memory;
            let status = true;
            this.testCaseDetails.find(x => x.id === value.id).actualOutput = output;
            this.testCaseDetails.find(x => x.id === value.id).actualmaxCpuTime = cpuUtlized;
            this.testCaseDetails.find(x => x.id === value.id).actualmaxMemoryPermitted = memoryUtlized;
            this.testCaseDetails.find(x => x.id === value.id).isTestcaseExecuted = status;
          });
        }
      });
    }
    else {
      this.toastr.error(this.constants.codeSnippetIsEmpty);
    }
  }

  executeAndSubmit(): void {
    if (this.field.isPreview)
      return;
    // if (this.disableCompileAndRun) {
    //   this.stopExecution();
    // }
    clearInterval(this.dataService.autoSaveCall);
    this.field.chosenAnswer = this.code;
    this.field.isCodeSubmitted = true;
    this.field.chosenLanguage = this.currentSelectedLanguage;
    this.field.isSkipped = this.code !== this.currentSelectedLanguage.defaultCode ? false : true;
    this.field.duration = this.field.duration ? this.field.duration : 0;
    this.field.durationMilliSeconds=this.field.durationMilliSeconds ? this.field.durationMilliSeconds : 0;
    this.disableFields();
    this.spinner.show();
    if (this.dataService.countDown) {
      this.dataService.countDown.pause();
    }
    this.toastr.info(Constants.yourCodeIsGettingSavedPleaseWaitForFewSeconds);
    this.dataService.stopTimer(this.field.questionId);
    var milliSeconds=this.dataService.getTimeSpent(this.field.questionId);
    const timeLag =this.field.duration - (milliSeconds/ 1000);
    if ((this.field.duration > (milliSeconds / 1000)) && (timeLag > 10)) {
      milliSeconds = this.field.duration * 1000 + milliSeconds;
      this.dataService.timeRecords.set(this.field.questionId, { startTime: null, timeSpent: milliSeconds, previousTimeSpent: milliSeconds })
    }
    this.dataService.startTimer(this.field.questionId);
    let data: InsertOrUpdateUserAttemptQuestions = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      questionId: this.field.questionId,
      assessmentId: this.field.assessmentId,
      answer: this.code,
      userAssessmentMappingId: this.field.userAssessmentMappingId,
      timeZone: Helper.getTimeZone(),
      isMarkedForReview: this.field.isMarkedForReview,
      hintsAvailedJson: this.field.hintsAvailedJson,
      userEmailAddress: this.field.userEmail,
      duration: this.field.duration,
      durationMilliSeconds: this.dataService.getTimeSpent(this.field.questionId),
      reviewerId: 0,
      languageId: this.field.chosenLanguage.languageId,
      hintsAvailed: 0,
      isCodeSubmitted: this.field.isCodeSubmitted,
      isSkipped: this.field.isSkipped,
      assessmentScheduleId: this.field.assessmentScheduleId,
      executedCount: this.field.executionCount,
      campaignScheduleId: this.field.campaignScheduleId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      parentQuestionTypeId: this.field.questionType.parentQuestionTypeId,
      questionTypeId: this.field.questionType.id,
      questionTypeName: this.field.questionType.name,
      isAssessmentSubmitted: false,
      IsAdaptiveSectionSubmit: false
    };
    this.testService.insertOrUpdateUserAttemptQuestions(data).pipe(
      finalize(() => {
        this.spinner.hide();
        if (this.dataService.countDown) {
          this.dataService.countDown.resume();
        }
      })).subscribe(res => {
        if (res && res.result) {
          if (res.result === this.constants.success) {
            this.toastr.info(Constants.yourCodeGotSavedSuccessfully);
          }
          else if (res.result === this.constants.failure) {
            this.toastr.error(this.constants.sessionInvalid);
          }
          else if (res.result === this.constants.inActiveSchedule) {
            this.toastr.error(this.constants.inActiveAssessment);
          }
        }
      }, error => {
        if (error && error.status && error.status == 401) {
          this.toastr.error(this.constants.sessionInvalid);
        }
      });
  }

  submitCode(): void {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.submit = this.executeAndSubmit.bind(this);
    modalRef.componentInstance.isExecuteAndSubmit = true;
  }

  isHtml(str) {
    var doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  getDefaultCode(): string {
    let data: GetCompilerLanguageDefaultCode = {
      questionId: this.field.questionId,
      languageId: this.chosenLanguageId
    };
    this.testService.getCompilerLanguageDefaultCode(data).subscribe(res => {
      if (res.result) {
        this.sqlDefaultCode = this.stripHtml(res.result);
      }
    });
    return "";
  }

  updateCodeEditor() {
    let data: GetEditorCode = {
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.userId,
      questionId: this.field.questionId,
      assessmentScheduleId: this.field.assessmentScheduleId,
      assessmentId: this.field.assessmentId,
      timeZone: Helper.getTimeZone()

    };
    this.testService.getEditorCode(data).subscribe(res => {
      if (res.result) {
        this.code = this.stripHtml(res.result);
      }
    });
  }


  // onWsConnection() {
  //   this.input.enable();
  //   this.disableCompileAndRun = true;
  //   this.enableInputAndOutput = true;
  //   const divElement = document.getElementById('displayDiv');
  //   divElement.style.display = this.constants.styleBlock;
  //   console.log('connection succeeded');
  //   socketClient.subscribe('/user/queue/execute-i', (message) => {
  //     let msgId = message.headers['message-id'];
  //     let msgSeq = parseInt(msgId.substring(msgId.lastIndexOf('-') + 1));
  //     let statusCode = parseInt(message.headers.statusCode);

  //     if (statusCode === 201) {
  //       this.wsNextId = msgSeq + 1;
  //       return;
  //     }

  //     let t0;
  //     try {
  //       t0 = performance.now();
  //       while ((performance.now() - t0) < 2500 && this.wsNextId !== msgSeq) {
  //       }
  //     } catch (e) {
  //     }

  //     if (statusCode === Constants.statusCodeNoContent) {
  //     } else if (statusCode === Constants.statusCodeServerError) {
  //       console.log("server error");
  //     } else if (statusCode === Constants.statusCodeClientError) {
  //       this.disableCompileAndRun = false;
  //       this.isExecutionStarted = false;
  //     } else if (statusCode === Constants.statusCodeFileNotSupported) {
  //       console.log("File list - not supported in this custom api");
  //     } else if (statusCode === Constants.statusCodeDailyLimitReached) {
  //       console.log("Daily limit reached");
  //     } else if (statusCode === Constants.statusCodeInvalidRequest) {
  //       console.log("invalid request - invalid signature or token expired");
  //     } else if (statusCode === Constants.statusCodeUnauthorizedRequest) {
  //       console.log("Unauthorised request");
  //     } else {
  //       const divElement = document.getElementById('displayDiv');
  //       divElement.style.display = this.constants.styleNone;
  //       this.output.patchValue(message.body);
  //     }
  //     this.wsNextId = msgSeq + 1;
  //   });
  //   let script = this.code.length > 0 ? (this.isSqlQuestion ? this.stripHtml(this.sqlDefaultCode) + this.code.trim() : this.code.trim()) : null;

  //   let versionIndexValue: number = +this.questionDetails.codingAssessment.find(x => x.editorLanguage === this.editorLanguage).compilerVersionCode

  //   let data = JSON.stringify({
  //     script: script,
  //     language: this.editorLanguage,
  //     versionIndex: versionIndexValue
  //   });
  //   socketClient.send('/app/execute-ws-api-token', data, { message_type: 'execute', token: this.authToken })
  // }

  // onWsConnectionFailed(e) {
  //   console.log('connection failed');
  //   console.log(e);
  // }

  // onInput(e) {
  //   let key = e.key;
  //   if (e.key === 'Enter') {
  //     key = '\n';
  //   }
  //   socketClient.send('/app/execute-ws-api-token', key, { message_type: 'input' });
  // }

  // stopExecution(isStopBtnClick: boolean = false) {
  //   this.disableCompileAndRun = false;
  //   this.isExecutionStarted = false;
  //   this.input.disable();
  //   this.output.disable();
  //   const divElement = document.getElementById('displayDiv');
  //   divElement.style.display = this.constants.styleNone;
  //   if (isStopBtnClick) {
  //     this.displayExecutionStoppedMessage();
  //   } else {
  //     this.removeExecutionStoppedMessage();
  //   }
  //   this.disconnectSocket();
  // }

  // disconnectSocket() {
  //   socketClient.disconnect();
  // }

  // displayExecutionStoppedMessage() {
  //   const executionStoppedDiv = document.getElementById('execution-stopped-msg');
  //   executionStoppedDiv.style.display = this.constants.styleBlock;
  // }

  // removeExecutionStoppedMessage() {
  //   const executionStoppedDiv = document.getElementById('execution-stopped-msg');
  //   executionStoppedDiv.style.display = this.constants.styleNone;
  // }

  removeSpaceUnicodeChars(inputCode: string): string {
    const unicodeRegex = new RegExp(Object.keys(this.unicodeCharReplacements).join('|'), 'g');
    return inputCode.replace(unicodeRegex, (match) => this.unicodeCharReplacements[match]);
  }

  clearIframe = () => {
    var isIframeAvailable = document.getElementById("myDIV").hasChildNodes();
    var iFrameCode = document.getElementById("iframeCloud");
    if (isIframeAvailable)
      iFrameCode.remove();
    return isIframeAvailable;
  }
}
