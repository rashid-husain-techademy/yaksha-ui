import { Component, ElementRef, ViewChild } from '@angular/core';
import { Constants } from '../../../models/constants';
import { ToastrService } from 'ngx-toastr';
import { QuestionsService } from '../questions.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-upload-question',
  templateUrl: './upload-question.component.html',
  styleUrls: ['./upload-question.component.scss']
})
export class UploadQuestionComponent {
  constants = Constants;
  uploadType: string;
  mcqFilePath: string = "assets/sampleTemplate/Objective_Question_Import.xlsx";
  codingFilePath: string = "assets/sampleTemplate/CodingQuestions_Import.xlsx";
  stackFilePath: string = "assets/sampleTemplate/StackQuestions_Import.xlsx";
  cloudFilePath: string = "assets/sampleTemplate/CloudQuestions_Import.xlsx";
  @ViewChild('fileInput') fileInput: ElementRef;
  selectedFile: string;
  file: File;
  fileType: string;
  fileTypeGranted: boolean = false;
  fileName: string;
  showErrors: boolean;
  errorMessage: string[] = [];
  selectedFileType: string;
  supportedTypes: string[];
  fileTypeSelect: boolean = false;
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private questionService: QuestionsService,
    private toastrService: ToastrService,
    private activateRoute: ActivatedRoute,
  ) { }

  downloadSampleTemplate() {
    window.location.href = this.mcqFilePath;
  }
  checkQuestionType(event) {
    this.fileType = event.target.value;
    if (this.fileType !== undefined)
      this.fileTypeSelect = true;
    this.showErrors = false;
    this.file = null;
    this.fileName = undefined;
  }

  uploadFile(): void {
    this.fileTypeGranted = false;
    const formData = new FormData();
    formData.append('file', this.file, this.file.name);
    if (this.fileType === Constants.mcqTitle) {
      this.questionService.validationMcqQuestions(formData).subscribe(res => {
        if (res && res.result.length === 0) {
          this.questionService.uploadMcqQuestions(formData).subscribe(res => {
            if (res && res.result) {
              this.toastr.success(Constants.fileUploaded);
              this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activateRoute });
              this.errorMessage = [];
              this.showErrors = false;
              this.file = undefined;
              this.fileName = '';
              this.fileInput.nativeElement.value = '';
            }
            else {
              this.fileInput.nativeElement.value = '';
              this.selectedFile = '';
              this.file = null;
              this.fileName = '',
                this.toastrService.error(Constants.fileUploadFailedPleaseCheckLogsForDetailedInformation);

            }
          });
        }
        else {
          this.showErrors = true;
          this.errorMessage = res.result;
          this.toastr.error(Constants.fileUploadFailedError);
        }
      });
    }
    else if (this.fileType === Constants.coding) {
      this.questionService.validationCodingQuestions(formData, this.constants.codeBased).subscribe(res => {
        if (res && res.result.length === 0) {
          this.questionService.uploadCodingQuestions(formData, this.constants.codeBased).subscribe(res => {
            if (res && res.result) {
              this.toastr.success(Constants.fileUploaded);
              this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activateRoute });
              this.errorMessage = [];
              this.showErrors = false;
              this.file = undefined;
              this.fileName = '';
              this.fileInput.nativeElement.value = '';
            }
          });
        }
        else {
          this.showErrors = true;
          this.errorMessage = res.result;
          this.toastr.error(Constants.fileUploadFailedError);
        }
      });
    } else if (this.fileType === Constants.cloud) {
      this.questionService.validationCodingQuestions(formData, this.constants.cloudBased).subscribe(res => {
        if (res && res.result.length === 0) {
          this.questionService.uploadCodingQuestions(formData, this.constants.cloudBased).subscribe(res => {
            if (res && res.result) {
              this.toastr.success(Constants.fileUploaded);
              this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activateRoute });
              this.errorMessage = [];
              this.showErrors = false;
              this.file = undefined;
              this.fileName = '';
              this.fileInput.nativeElement.value = '';
            }
          });
        }
        else {
          this.showErrors = true;
          this.errorMessage = res.result;
          this.toastr.error(Constants.fileUploadFailedError);
        }
      });
    }
    else if (this.fileType === Constants.stack) {
      this.questionService.validateStackQuestions(formData).subscribe(res => {
        if (res && res.result.length === 0) {
          this.questionService.uploadStackQuestions(formData).subscribe(res => {
            if (res && res.result) {
              this.toastr.success(Constants.fileUploaded);
              this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activateRoute });
              this.errorMessage = [];
              this.showErrors = false;
              this.file = undefined;
              this.fileName = '';
              this.fileInput.nativeElement.value = '';
            }
          });
        }
        else {
          this.showErrors = true;
          this.errorMessage = res.result;
          this.toastr.error(Constants.fileUploadFailedError);
        }
      });
    }
  }

  onFileChange(files) {
    if (files.length > 0) {
      this.selectedFileType = files[0].type;
      this.file = files[0];
      this.supportedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = files[0].name;
        this.toastrService.success(Constants.fileSelectedPleaseClickOnTheSumbitToImport);
      }
      else {
        this.file = undefined;
        this.toastrService.warning(Constants.uploadOnlyExcelFiles);
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseUploadFile);
    }
  }

  removeSelectedFile(): void {
    this.fileInput.nativeElement.value = '';
    this.selectedFile = '';
    this.file = null;
    this.fileName = '',
      this.showErrors = false;
    this.toastr.warning(Constants.selectedFileWasRemoved);
  }
}
