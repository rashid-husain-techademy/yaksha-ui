import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileUploadComponent } from '@app/admin/shared/file-upload/file-upload.component';
import { FileUploadType, UploadType } from '@app/enums/file-upload-type';
import { Constants } from '@app/models/constants';
import { QuestionDetailDto, subjectiveStatusDto } from '@app/test-taker/field';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from './../../../service/common/dataService';
import { TestService } from '@app/test-taker/test.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { GetSubjectiveQuestionDataDto } from '@app/test-taker/test-data';
import { UtilsService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts';
import { SubjectiveAnswers } from '@app/reviewer/reviewer';
import { Helper } from '@app/shared/helper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit, OnDestroy {
  path: string;
  field: QuestionDetailDto;
  group: FormGroup;
  questionText: string;
  formControlName: string;
  constants = Constants;
  chosenAnswer: string;
  calculateDuration: NodeJS.Timeout;
  isTextAreaQuestion: boolean = false;
  isFileUploaded: boolean = false;
  selectedFiles: SubjectiveAnswers[] = [];
  userId: number;
  tenantId: number;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrLink: string;
  assessmentScheduleId: number;
  fileSubmissionCall: NodeJS.Timeout;
  isQrOpen: boolean = false;
  qrValidTime: number;
  timeLeft: number;
  interval: NodeJS.Timeout | null = null;
  QRcode: string;
  QRInvalidated: boolean;
  @ViewChild('quillEditor') quill: any;

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      if (this.isQrOpen) {
        this.closeBtnClick();
      }
    }
  }

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': '1' }, { 'header': '2' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['direction'],
      [{ 'size': [] }],
      [{ 'header': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }, { 'align': [] }]

    ]
  }

  constructor(
    private modalService: NgbModal,
    public dataService: dataService,
    private formBuilder: FormBuilder,
    private appSessionService: AppSessionService,
    private _utilsService: UtilsService,
    private testService: TestService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.path = this._utilsService.getCookieValue(Constants.tenantName);
    this.userId = this.appSessionService.user.id;
    this.tenantId = this.appSessionService.tenantId;
    this.assessmentScheduleId = this.field.assessmentScheduleId;
    this.questionText = `Q${this.field.serialNumber}. ${this.field.questionText}`;
    this.questionText = this.questionText.replace(/<p>/gi, '<p style="margin-bottom:0px;">');
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);

    this.dataService.startTimer(this.field.questionId);

    this.formControlName = `question${this.field.questionId}`;
    let answerArray = Helper.isValidJson(this.field.chosenAnswer) ? JSON.parse(this.field.chosenAnswer) : this.field.chosenAnswer;
    this.chosenAnswer = answerArray;
    if (this.group === undefined) {
      this.group = this.formBuilder.group({});
    }
    if (JSON.parse(this.field.choices)[0].toLowerCase() == this.constants.textAreaLabel.toLowerCase()) {
      this.isTextAreaQuestion = true;
      this.patchFormControls();
    }
    else {
      this.isTextAreaQuestion = false;
      this.patchFormControls();
      this.isUploadCheck();
    }
    this.getAssessmentScheduleDetails();
  }

  ngOnDestroy() {
    clearInterval(this.calculateDuration);
    if (this.fileSubmissionCall)
      clearInterval(this.fileSubmissionCall);
  }

  getAssessmentScheduleDetails() {
    this.testService.getAssessmentScheduleConfig(this.field.assessmentScheduleId).subscribe(res => {
      this.qrValidTime = res.result.qrValidTime > 0 ? res.result.qrValidTime : 1;
      this.timeLeft = this.qrValidTime;
    })
  }

  patchFormControls() {
    this.group.patchValue({
      [this.formControlName]: this.chosenAnswer,
    });
  }

  answerChange() {
    setTimeout(() => {
      this.chosenAnswer = this.quill.quillEditor.root.innerHTML;
      const editor = this.quill.quillEditor;
      editor.setSelection(editor.getLength(), 0); // Move the cursor to the end
      this.patchFormControls();
      this.field.chosenAnswer = this.chosenAnswer.trim() !== null && this.chosenAnswer.trim() !== "" ? this.chosenAnswer : null;
  }, 10);
  }

  openUpload(): void {
    const modalRef = this.modalService.open(FileUploadComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.fileUploadData = {
      title: "Answer Upload",
      supportedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg", "image/png", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/csv", "text/html"],
      uploadType: UploadType.FileUpload,
      subUploadType: FileUploadType.SubjectiveQuestion,
      supportedTypesMessage: Constants.onlyDocDocxPdfFilesAreSupported,
      validationApiPath: "yaksha/UserAssessment/UploadSubjectiveQuestionAnswerValidation",
      uploadApiPath: `yaksha/UserAssessment/UploadSubjectiveQuestionAnswerAsync?userId=${this.userId}&questionId=${this.field.questionId}&userAssessmentAttemptId=${this.field.userAssessmentAttemptId}`,
      errorMessage: Constants.uploadOnlyDocDocxPdfFiles,
      fileUploadAccept: ".pdf,.doc,.docx,.jpeg,.jpg,.png,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.html,.htm",
      questionId: this.field.questionId,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId
    };
    modalRef.dismissed.subscribe(result => {
      if (result[0]) {
        this.selectedFiles = [];
        this.toastr.info(this.constants.fileUploadResultMessage);
        this.fileSubmissionCall = setInterval(() => {
          this.getFileSubmission();
        }, 1500);
      }
    });
  }

  isUploadCheck() {
    if (this.chosenAnswer !== null && this.chosenAnswer !== "") {
      this.isFileUploaded = true;
      this.selectedFiles = this.chosenAnswer !== "" && this.chosenAnswer !== null ? this.getFilename() : null;
    }
  }

  getFilename() {
    let URLPattern = /https:\/\/[^\s"]+/g
    let fileUrls = JSON.stringify(this.chosenAnswer).match(URLPattern);
    let urlArrayList: SubjectiveAnswers[] = [];
    fileUrls.forEach(fileUrl => {
      let urlArray = fileUrl.split("/");
      let fileName = urlArray[urlArray.length - 1].split("?")[0].substring(0, urlArray[urlArray.length - 1].split("?")[0].lastIndexOf('_', urlArray[urlArray.length - 1].split("?")[0].lastIndexOf('_') - 1)).concat(urlArray[urlArray.length - 1].split("?")[0].substring(urlArray[urlArray.length - 1].split("?")[0].lastIndexOf(".")));
      let answer: SubjectiveAnswers = {
        answer: fileUrl,
        fileName: fileName
      }
      urlArrayList.push(answer);
    })
    return urlArrayList;
  }

  closeBtnClick(): void {
    this.isQrOpen = false;
    if (this.fileSubmissionCall)
      clearInterval(this.fileSubmissionCall);
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.modalService.dismissAll();
    this.updateSubjectiveQuestionStatus(false);
  }

  updateSubjectiveQuestionStatus(isActive: boolean, targetModal?: NgbModal) {
    let data: subjectiveStatusDto = {
      isActive: isActive,
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId,
    };
    this.testService.updateSubjectiveActiveStatus(data).subscribe(res => {
      if (res) {
        if (isActive) {
          this.QRInvalidated = false;
          this.displayQR(targetModal, res.result);
          this.startTimer();
        }
      }
    });
  }

  displayQR(targetModal: NgbModal, uploadCode: string): void {
    this.QRcode = uploadCode;
    let queryParam = this.tenantId + '/' + this.userId + '/' + this.field.assessmentId + '/' + this.field.userAssessmentAttemptId + '/' + this.field.questionId + '/' + uploadCode;
    queryParam = btoa(queryParam);
    this.qrLink = `${AppConsts.appBaseUrl}/${this.path}/account/mobile-upload/${queryParam}`;
    this.isQrOpen = true;
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static'
    });
    this.fileSubmissionCall = setInterval(() => {
      this.getFileSubmission();
    }, 10000);
  }

  getFileSubmission(): void {
    let data: GetSubjectiveQuestionDataDto = {
      userAssessmentAttemptId: this.field.userAssessmentAttemptId,
      questionId: this.field.questionId
    };
    this.testService.getSubjectiveFileSubmission(data).subscribe(res => {
      if (res && res.result) {
        if (this.chosenAnswer !== res.result) {
          this.chosenAnswer = res.result;
          this.patchFormControls();
          this.field.chosenAnswer = this.chosenAnswer !== null && this.chosenAnswer !== "" ? this.chosenAnswer : null;
          this.isUploadCheck();
          if (this.isQrOpen)
            this.closeBtnClick();
          else {
            if (this.fileSubmissionCall)
              clearInterval(this.fileSubmissionCall);
          }
        }
      }
    });
  }

  removeSelectedFile(file: SubjectiveAnswers): void {
    this.selectedFiles = this.selectedFiles.filter(x => x !== file);
    let answerFiles = Helper.isValidJson(this.field.chosenAnswer) ? JSON.parse(this.field.chosenAnswer) : this.field.chosenAnswer;
    answerFiles = answerFiles.filter(answer => file.answer != answer);
    this.field.chosenAnswer = JSON.stringify(answerFiles);
    this.toastr.warning(file.fileName + " was removed");
  }

  startTimer() {
    this.timeLeft = this.qrValidTime;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        if (!this.QRInvalidated) {
          this.QRInvalidate();
        }
      }
    }, 1000)
  }

  QRInvalidate(): void {
    this.isQrOpen = false;
    this.QRInvalidated = true;
    if (this.fileSubmissionCall)
      clearInterval(this.fileSubmissionCall);
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.updateSubjectiveQuestionStatus(false);
    this.modalService.dismissAll();
  }

  truncate(input: string) {
    if (input?.length > 30) {
      return input.substring(0, 30) + '...';
    }
    return input;
  }
}