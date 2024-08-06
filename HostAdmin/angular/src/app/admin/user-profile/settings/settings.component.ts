import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadComponent } from '@app/admin/shared/file-upload/file-upload.component';
import { ChangePassword, UserDto, UserUpdateList } from '@app/admin/users/users';
import { UserService } from '@app/admin/users/users.service';
import { FileUploadType, UploadType } from '@app/enums/file-upload-type';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { dataService } from '@app/service/common/dataService';
import { Constants } from '../../../models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { Unsaved } from '@app/interface/unsaved-data';
import { ApiClientService } from '@app/service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, Unsaved {
  constants = Constants;
  user: UserDto = {
    id: 0,
    userName: '',
    name: '',
    surname: '',
    emailAddress: '',
    phoneNumber: 0,
    profilePicture: '',
    socialProfileConfig: '',
    facebookProfile: '',
    linkedInProfile: '',
    twitterProfile: '',
    tenantId: 0,
    isActive: false,
    fullName: '',
    lastLogin: undefined,
    creationTime: undefined
  };
  passwordForm: FormGroup;
  changePasswordForm: FormGroup;
  newPassword: string;
  confirmPassword: string;
  match: boolean = true;
  currentPassword: string;
  isDataChanged: boolean = false;
  isFormSubmitTriggered: boolean;
  onLoadValue: UserDto;

  constructor(private userService: UserService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    public dataService: dataService,
    private formBuilder: FormBuilder,
    private apiClientService: ApiClientService) { }

  ngOnInit(): void {
    this.initForm();
    this.getUserDetail();
    this.initChangePasswordForm();
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=^.{8,16}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$")]]
    });
  }

  changeEvent() {
    this.isDataChanged = true;
  }

  initForm() {
    this.passwordForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), WhiteSpaceValidators.emptySpace()]],
      email: [''],
      surName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), WhiteSpaceValidators.emptySpace()]],
      phoneNumber: ['', [Validators.maxLength(10), Validators.pattern("^(\\+91 )?[0-9]*$"), WhiteSpaceValidators.emptySpace()]],
      linkedInProfiles: ['', [Validators.pattern("^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$")]],
      twitterProfiles: ['', [Validators.pattern("^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$")]],
      facebookProfiles: ['', [Validators.pattern("^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$")]],
    });
  }

  getUserDetail() {
    const cacheEnabled: boolean = true;
    this.userService.getUser(cacheEnabled).subscribe(res => {
      this.dataService.userProfile = res.result;
      this.user = res.result;
      this.passwordForm.get('firstName').setValue(this.user.name);
      this.passwordForm.get('surName').setValue(this.user.surname);
      this.passwordForm.get('email').setValue(this.user.emailAddress);
      this.passwordForm.patchValue({
        phoneNumber: this.user.phoneNumber ? this.user.phoneNumber : undefined,
        facebookProfiles: res.result.socialProfileConfig ? JSON.parse(res.result.socialProfileConfig).FacebookProfile : undefined,
        linkedInProfiles: res.result.socialProfileConfig ? JSON.parse(res.result.socialProfileConfig).LinkedInProfile : undefined,
        twitterProfiles: res.result.socialProfileConfig ? JSON.parse(res.result.socialProfileConfig).TwitterProfile : undefined
      });
      this.onLoadValue = this.passwordForm.value;
    });
  }

  openUpload() {
    const modalRef = this.modalService.open(FileUploadComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.fileUploadData = {
      title: "Profile Picture Upload",
      supportedTypes: ["image/jpg", "image/jpeg", "image/png"],
      uploadType: UploadType.ImageUpload,
      subUploadType: FileUploadType.User,
      existingImageUrl: this.user.profilePicture,
      supportedTypesMessage: Constants.onlyPngJpgFilesAreAccepted,
      uploadApiPath: "yaksha/User/UploadProfilePicture",
      errorMessage: Constants.onlyPngJpgFilesAreAccepted,
      userId: this.user.id
    };
    modalRef.dismissed.subscribe(result => {
      if (result)
        this.ngOnInit();
    });
  }

  updateUser() {
    if (this.passwordForm.valid) {
      this.isFormSubmitTriggered = true;
      let data: UserUpdateList = {
        id: this.user.id,
        name: this.passwordForm.get('firstName').value,
        emailAddress: this.user.emailAddress,
        surName: this.passwordForm.get('surName').value,
        profilePicture: this.user.profilePicture,
        phoneNumber: this.passwordForm.get('phoneNumber').value,
        facebookProfile: this.passwordForm.get('facebookProfiles').value,
        linkedInProfile: this.passwordForm.get('linkedInProfiles').value,
        twitterProfile: this.passwordForm.get('twitterProfiles').value
      };
      this.userService.updateUserDetails(data).subscribe(res => {
        if (res.result) {
          this.toastrService.success(Constants.userDetailsUpdatedSuccessfully);
          this.apiClientService.reloadCache("yaksha/User/GetUser");
        }
        else
          this.toastrService.error(Constants.failedToUpdatedUserDetails);
      });
    }
    else {
      this.toastrService.warning(this.constants.pleaseFillTheMandatoryFields);
    }
  }

  onChange() {
    if (this.changePasswordForm.get('newPassword').value !== this.confirmPassword) {
      this.match = false;
    } else {
      this.match = true;
    }
  }

  changePassword() {
    if (this.changePasswordForm.valid) {
      if (this.currentPassword === this.changePasswordForm.get('newPassword').value) {
        this.toastrService.error(Constants.currentAndNewPasswordShouldNotBeSame);
        return;
      }
      if (this.changePasswordForm.get('newPassword').value !== this.confirmPassword) {
        this.toastrService.error(Constants.pleaseEnsureBothPasswordsAreSame);
        return;
      }
      let data: ChangePassword = {
        currentPassword: this.currentPassword,
        newPassword: this.changePasswordForm.get('newPassword').value
      };
      this.userService.changePassword(data).subscribe(res => {
        if (res.success && res.result) {
          this.toastrService.success(Constants.passwordChangedSuccessfully);
        }
        else {
          this.toastrService.error(Constants.enterValidCurrentPassword);
        }
      });
    }
    else
      this.toastrService.warning(Constants.pleaseEnterValidData);
  }

  isUnsaved(): boolean {
    if (!this.isFormSubmitTriggered && JSON.stringify(this.passwordForm.value) !== JSON.stringify(this.onLoadValue)) {
      return true;
    }
    return false;
  }
}
