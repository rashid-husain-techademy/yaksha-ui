import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { SubjectiveUploadErrors } from '@app/enums/test';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { GetSubjectiveQuestionDataDto, SubjectiveAnswerUserData, SubjectiveQuestionData } from '@app/test-taker/test-data';
import { TestService } from '@app/test-taker/test.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-mobile-upload',
  templateUrl: './mobile-upload.component.html',
  styleUrls: ['./mobile-upload.component.scss']
})
export class MobileUploadComponent implements OnInit {
  constants = Constants;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  isCustomThemeEnabled: boolean = false;
  isTenantLogoLoaded: boolean = false;
  tenantId: number;
  userId: number;
  assessmentId: number;
  userAssessmentAttemptId: number;
  questionId: number;
  uploadCode: string;
  questionData: SubjectiveQuestionData;
  notSupportedFileCount: number = 0;
  selectedFileNames: string[] = [];
  @ViewChild('fileInput') fileInput: ElementRef;
  files: File[] = [];
  supportedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg", "image/png", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/csv", "text/html"];
  isDisableUpload: boolean = true;
  errorMessage: string[];
  showErrors: boolean = false;
  isUploadSuccessful: boolean = false;
  uploadErrorMessage: string;
  isUploaded: boolean = false;
  prevUploadedFileNames: string[] = [];
  maxFileCount: number = 20;
  constructor(private activatedRoute: ActivatedRoute,
    private testService: TestService,
    private toastr: ToastrService,
    private dataService: dataService,
    private tenantService: TenantsService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      if (param['encodedData']) {
        let params = atob(param['encodedData']).split('/');
        this.tenantId = +params[0];
        this.userId = +params[1];
        this.assessmentId = +params[2];
        this.userAssessmentAttemptId = +params[3];
        this.questionId = +params[4];
        this.uploadCode = params[5];
        this.getQuestionData();
      }
      if (this.tenantId) {
        this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
        this.tenantService.getTenantCustomizationSettings(this.tenantId).pipe(
          finalize(() => {
            this.isTenantLogoLoaded = true;
          })).subscribe(res => {
            if (res && res.result) {
              let customizationSettings = JSON.parse(res.result) as TenantCustomizationSettings;
              this.logoUrl = customizationSettings.TenantLogoUrl;
            }
          }, error => {
            console.error(error);
          });
      }
    });
  }

  getQuestionData() {
    let data: GetSubjectiveQuestionDataDto = {
      assessmentId: this.assessmentId,
      userAssessmentAttemptId: this.userAssessmentAttemptId,
      questionId: this.questionId
    };
    this.testService.getSubjectiveQuestionData(data).subscribe(res => {
      if (res && res.result) {
        this.questionData = res.result;
        if (this.questionData.prevUploadedFile)
          this.getFilenames();
      }
    });
  }

  onFileChange(files: File[]) {
    this.selectedFileNames = [];
    if (files.length > 0) {
      if (files.length <= this.maxFileCount) {
        this.files = Array.from(files);
        this.checkFileType(false);
      }
      else {
        this.toastr.warning(Constants.maximumFiles);
      }
    }
    else {
      this.toastr.warning(Constants.pleaseUploadFile);
    }
  }

  uploadFile() {
    this.showErrors = false;
    this.errorMessage = [];
    const formData = new FormData();
    this.files.forEach(file => {
      formData.append('files', file, file.name.replace(/\s/g, ""));
    });
    this.testService.uploadSubjectiveAnswerValidation(formData).pipe(
    ).subscribe(res => {
      if (!res.result.length) {
        let data: SubjectiveAnswerUserData = {
          userId: this.userId,
          userAssessmentAttemptId: this.userAssessmentAttemptId,
          questionId: this.questionId,
          uploadCode: this.uploadCode
        };
        formData.append('Input', JSON.stringify(data));
        this.testService.uploadSubjectiveAnswerViaMobile(formData).subscribe(res => {
          this.isUploaded = true;
          if (res && res.result.isSuccess) {
            this.files = undefined;
            this.errorMessage = [];
            this.showErrors = false;
            this.isUploadSuccessful = true;
          }
          else {
            this.uploadErrorMessage = this.getErrorMessage(res.result.errorCode);
          }
        });
      }
      else {
        this.showErrors = true;
        this.errorMessage = res.result;
        this.toastr.error(this.constants.fileUploadFailedCheckError);
      }
    });
  }

  removeSelectedFile(fileName: string): void {
    this.selectedFileNames = this.selectedFileNames.filter(file => file != fileName);
    this.files = this.files.filter(x => x.name != fileName);
    this.toastr.warning("The selected file : " + fileName + " was removed");
    if (this.files.length == 0) {
      this.files = undefined;
      this.errorMessage = [];
      this.showErrors = false;
      this.isDisableUpload = true;
    }
    if (this.files.length > 0) {
      this.checkFileType(true);
    }
  }

  getErrorMessage(errorCode: SubjectiveUploadErrors) {
    switch (errorCode) {
      case SubjectiveUploadErrors.AssessmentAlreadySubmitted:
        return Constants.assessmentIsAlreadySubmittedYouCannotUploadAnswerNow;
      case SubjectiveUploadErrors.QuestionInActive:
        return Constants.answerUploadFailedPleaseMakeSureYouHaveClickedOnUploadFromMobileOptionInSameQuestion;
      case SubjectiveUploadErrors.LinkIsInvalid:
        return Constants.linkIsInvalidYouCannotUploadAnswer;
      case SubjectiveUploadErrors.ErrorOccurred:
        return Constants.anErrorOccurredWhileUploadingYourAnswer;
    }
  }

  getFilenames() {
    let URLPattern = /https:\/\/[^\s"]+/g
    let fileUrls = this.questionData.prevUploadedFile.match(URLPattern);
    fileUrls.forEach(fileUrl => {
      let urlArray = fileUrl.split("/");
      let fileName = urlArray[urlArray.length - 1].split("?")[0].substring(0, urlArray[urlArray.length - 1].split("?")[0].lastIndexOf('_', urlArray[urlArray.length - 1].split("?")[0].lastIndexOf('_') - 1)).concat(urlArray[urlArray.length - 1].split("?")[0].substring(urlArray[urlArray.length - 1].split("?")[0].lastIndexOf(".")));
      this.prevUploadedFileNames.push(fileName);
    })
    return this.prevUploadedFileNames;
  }

  truncate(input) {
    if (input.length > 25) {
      return input.substring(0, 25) + '...';
    }
    return input;
  }

  checkFileType(removeFile: boolean) {
    this.notSupportedFileCount = 0;
    this.selectedFileNames = [];
    this.files.forEach(file => {
      let selectedFileType = file.type;
      this.selectedFileNames.push(file.name);
      let isFileTypeSupported = this.supportedTypes.some(x => x === selectedFileType);
      if (isFileTypeSupported) {
        this.isDisableUpload = false;
      }
      else {
        this.notSupportedFileCount++;
        this.toastr.warning(Constants.uploadOnlyDocDocxPdfFiles);
      }
    })
    if (this.notSupportedFileCount > 0)
      this.isDisableUpload = true;
    else if (this.notSupportedFileCount == 0 && !removeFile)
      this.toastr.success(Constants.fileSelectedPleaseClickOnUploadToSubmitYourAnswer);
  }
}
