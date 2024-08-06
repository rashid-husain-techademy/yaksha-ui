import { Constants } from '@app/models/constants';
import { FileUploadData } from '../../users/users';
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@app/admin/users/users.service';
import { ToastrService } from 'ngx-toastr';
import { FileUploadType, UploadType } from '@app/enums/file-upload-type';
import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { TenantsService } from '@app/admin/tenants/tenants.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent {
  @Input() public fileUploadData: FileUploadData;
  supportedTypesMessage: string;
  constants = Constants;
  selectedFileType: string;
  file: File;
  files: File[] = [];
  fileTypeGranted: boolean = false;
  fileName: string;
  @ViewChild('fileInput') fileInput: ElementRef;
  errorMessage: string[] = [];
  showErrors: boolean = false;
  errorLength: number = 99;
  uploadType = UploadType;
  fileUploadType = FileUploadType;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  selectedImage: any;
  isValidImage: boolean;
  uploadedImage: boolean = true;
  isDisableUpload: boolean = true;
  maxFileCount: number = 20;
  notSupportedFileCount: number = 0;
  constructor(private toastr: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private assessmentService: AssessmentService,
    private tenantService: TenantsService
  ) { }

  closeBtnClick(): void {
    this.modalService.dismissAll(false);
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      if (this.fileUploadData.subUploadType === FileUploadType.User) {
        this.files = Array.from(event.target.files);
        this.file = event.target.files[0];
        this.fileTypeCheck(false);
      }
      else {
        if (event.target.files.length <= this.maxFileCount) {
          this.files = Array.from(event.target.files);
          this.fileTypeCheck(false);
        }
        else {
          this.toastr.warning(Constants.maximumFiles);
        }
      }
    }
    else {
      this.toastr.warning(Constants.pleaseUploadFile);
    }
  }

  imageChange(event: any): void {
    if (event.target.files.length) {
      this.selectedImage = event.target.files[0];
      let isFileTypeSupported = this.checkFileType(this.selectedImage.type, this.fileUploadData.supportedTypes);
      if (!isFileTypeSupported) {
        this.selectedImage = '';
        this.toastr.warning(this.fileUploadData.errorMessage);
      }
      else {
        this.uploadedImage = false;
        this.imageChangedEvent = event;
        this.fileName = this.selectedImage.name;
        this.isDisableUpload = false;
        this.toastr.success(Constants.imageSelectedPleaseClickOnUpload);
      }
    }
  }

  checkFileType(fileType: string, supportedList: string[]) {
    return supportedList.some(file => file === fileType);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.selectedImage.data = base64ToFile(this.croppedImage);
  }

  imageLoaded() {
    this.showCropper = true;
  }

  onPictureUpload() {
    this.errorMessage = [];
    const formData = new FormData();
    if (this.fileUploadData.subUploadType === FileUploadType.TenantLogo) {
      formData.append('file', this.selectedImage, this.selectedImage.name);
    }
    else {
      formData.append('file', this.selectedImage.data, this.selectedImage.name);
    }
    if (this.fileUploadData.subUploadType === FileUploadType.User) {
      this.userService.uploadProfilePicture(`${this.fileUploadData.uploadApiPath}?userId=${this.fileUploadData.userId}`, formData).subscribe(res => {
        if (res.success && res.result) {
          this.toastr.success(this.constants.pictureUploaded);
          this.reset();
        }
        else {
          this.toastr.warning(this.constants.pictureNotUploaded);
        }
      });
    }
    else if (this.fileUploadData.subUploadType === this.fileUploadType.HackathonScheduleLogo) {
      this.assessmentService.updateScheduleLogo(`${this.fileUploadData.uploadApiPath}?scheduleId=${this.fileUploadData.scheduleId}`, formData).subscribe(res => {
        if (res.success && res.result) {
          this.toastr.success(this.constants.scheduleLogoUpdatedSuccessfully);
          this.reset();
        }
        else {
          this.toastr.warning(this.constants.anErrorOccurredInUploadingScheduleLogoPleaseContactAdministrator);
        }
      });
    }
    else if (this.fileUploadData.subUploadType === this.fileUploadType.TenantLogo) {
      this.tenantService.uploadTenantLogo(this.fileUploadData.tenantId, formData).subscribe(res => {
        if (res.success && res.result) {
          this.toastr.success(this.constants.tenantLogoUpdatedSuccessfully);
          this.reset();
        }
        else {
          this.toastr.warning(this.constants.anErrorOccurredInUploadingTenantLogoPleaseContactAdministrator);
        }
      });
    }
  }

  reset() {
    this.fileName = '';
    this.file = undefined;
    this.errorMessage = [];
    this.showErrors = false;
    this.modalService.dismissAll(true);
  }

  onUpload() {
    this.errorMessage = [];
    const formData = new FormData();
    if (this.fileUploadData.subUploadType === FileUploadType.SubjectiveQuestion) {
      this.files.forEach(file => {
        formData.append('files', file, file.name.replace(/\s/g, ""));
      });
    }
    else {
      formData.append('file', this.file, this.file.name);
    }
    this.userService.fileUpload<string>(this.fileUploadData.validationApiPath, formData).pipe(
    ).subscribe(res => {
      if (!res.result.length) {
        this.userService.fileUpload<boolean | [boolean, string]>(this.fileUploadData.uploadApiPath, formData).subscribe(res => {
          if (this.fileUploadData.subUploadType === FileUploadType.SubjectiveQuestion && res.success && res.result['item1']) {
            this.fileName = '';
            this.file = undefined;
            this.errorMessage = [];
            this.showErrors = false;
            this.toastr.success(this.constants.fileUploaded);
            this.modalService.dismissAll([true, res.result['item2']]);
          }
          else if (this.fileUploadData.subUploadType !== FileUploadType.SubjectiveQuestion && res.success && res.result) {
            this.fileName = '';
            this.file = undefined;
            this.errorMessage = [];
            this.showErrors = false;
            this.toastr.success(this.constants.fileUploaded);
            this.modalService.dismissAll(true);
          }
          else {
            this.toastr.warning(this.constants.fileNotUploaded);
          }
        });
      }
      else {
        this.showErrors = true;
        this.errorMessage.push(res.result);
        this.toastr.error(this.constants.fileUploadFailedErrorButton);
      }
    });
  }

  removeSelectedFile(file: File): void {
    this.files = this.files.filter(x => x !== file);
    this.toastr.warning("The selected file : " + file.name + " was removed");
    if (this.files.length == 0) {
      this.files = undefined;
      this.fileInput.nativeElement.value = '';
      this.isDisableUpload = true;
    }
    this.selectedImage = '';
    if (this.files.length > 0)
      this.fileTypeCheck(true);
  }

  truncate(input: string) {
    if (input?.length > 30) {
      return input.substring(0, 30) + '...';
    }
    return input;
  }

  fileTypeCheck(removeFile: boolean) {
    this.notSupportedFileCount = 0;
    this.files.forEach(element => {
      this.selectedFileType = element.type;
      let isFileTypeSupported = this.fileUploadData.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = element.name;
        this.isDisableUpload = false;
      }
      else {
        this.notSupportedFileCount++;
        this.toastr.warning(this.fileUploadData.errorMessage);
      }
    });
    if (this.notSupportedFileCount > 0)
      this.isDisableUpload = true;
    else if (this.notSupportedFileCount == 0 && !removeFile)
      this.toastr.success(Constants.fileSelectedPleaseClickOnTheSumbitToImport);
  }
}
