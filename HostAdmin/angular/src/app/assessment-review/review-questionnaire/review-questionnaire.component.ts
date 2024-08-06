import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@app/admin/users/users.service';
import { UserRoles } from '@app/enums/user-roles';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { dataService } from '@app/service/common/dataService';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { AssignAssessmentReviewerDto, ReviewersDto, ReviewQuestionnarieDto, UserDto, ReviewDetailsDto, TenantDto, UpdateReviewDto, RequestGetUserEmails, RequestReviewDetails, RequestReviewerAssigned, AssessmentSignOffQuestionsDetails } from '../assessment-review';
import { AssessmentReviewService } from '../assessment-review.service';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { formatDate } from '@angular/common';
import { Permissions } from '@shared/roles-permission/permissions';

@Component({
  selector: 'app-review-questionnaire',
  templateUrl: './review-questionnaire.component.html',
  styleUrls: ['./review-questionnaire.component.scss']
})
export class ReviewQuestionnaireComponent implements OnInit {
  @Input() public reviewQuestionnaireDto: ReviewQuestionnarieDto;
  constants = Constants;
  userRole: string;
  @ViewChild('instance', { static: true })
  instance = Object.create(null);
  tenants: TenantDto[] = [];
  selectedTenantId: number;
  userRoles = UserRoles;
  assignForm: FormGroup;
  getReviewers: UserDto[];
  reviewerDetails: ReviewersDto[] = [];
  adminDetails: UserDto[];
  selectedAdmins: UserDto[] = [];
  selectedAdminId: UserDto[];
  reviewerEmail: string;
  adminUserIds: number[] = [];
  LinkExpiryDateTime: string;
  currentDate = new Date();
  convertedExpiryDateTime: string = '';
  reviewers: object[] = [];
  reviewer: string = '';
  disableQuestionaire: boolean = false;
  isFormSubmitTriggered: boolean = false;
  assessmentId: number;
  reviewDetails: ReviewDetailsDto;
  buttonName: string = Constants.assign;
  title: string = Constants.markForReviewQuestionaire;
  defaultMinutes: string = '00';
  selectedSignOffEmail: ReviewersDto;
  assessmentQuestionReviewers: string[] = [];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };
  multiDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'userEmail',
    allowSearchFilter: true,
    closeDropDownOnSelection: false
  };
  reviewerMailDropDownSettings = {
    singleSelection: false,
    text: Constants.selectReviewerEmail,
    selectAllText: Constants.selectAll,
    unSelectAllText: Constants.unSelectAll,
    enableSearchFilter: true,
    classes: 'myclass custom-class',
    addNewItemOnFilter: true,
    addNewButtonText: Constants.addNewReviewer,
    disabled: false,
    enableCheckAll: true
  }
  assessmentSignOffCriteriaDetails: AssessmentSignOffQuestionsDetails = null;
  disableSignffCriteriaDetails: boolean = true;
  signOffMails: ReviewersDto[];
  permissions: any;
  isCheckBoxDisabled: false;

  constructor(private appSessionService: AppSessionService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private dataService: dataService,
    private assessmentReviewService: AssessmentReviewService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.assessmentId = this.reviewQuestionnaireDto.assessmentId;
    this.setSignOffQuestionDetails();
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
      this.initAssignForm();
      if (this.reviewQuestionnaireDto.isUpdate) {
        this.getReviewDetails();
        this.reviewerMailDropDownSettings.enableCheckAll = false;
        if (!this.reviewQuestionnaireDto.isReReview) {
          this.buttonName = Constants.update;
          this.title = Constants.extendValidity;
        }
      }
      else {

        if (this.userRole === UserRoles[1]) {
          this.getAllTenants();
        }
        if (this.permissions[Permissions.assesmentsManageAll] ) {
          let requestData: RequestReviewerAssigned = {
            tenantId: this.appSessionService.tenantId,
            assessmentId: this.assessmentId
          };
          this.assessmentReviewService.isReviewerAssigned(requestData).
            subscribe(res => {
              if (res.success && !res.result) {
                this.getAdmins();
                this.getQuestionReviewer();
                this.disableQuestionaire = false;
                this.assignForm.get('expiryTime').enable();
                this.assignForm.get('showAnswer').enable();
                this.reviewerMailDropDownSettings.disabled = false;
              }
              if (res.result) {
                this.toastrService.warning(this.constants.reviewerAlreadyAssigned);
                this.disableQuestionaire = true;
                this.assignForm.get('expiryTime').disable();
                this.assignForm.get('showAnswer').disable();
                this.reviewerMailDropDownSettings.disabled = true;
              }
            });
        }
      }
    });
  }

  getReviewDetails(): void {
    let requestData: RequestReviewDetails = {
      tenantId: this.reviewQuestionnaireDto.tenantId,
      tenantAssessmentReviewId: this.reviewQuestionnaireDto.tenantAssessmentReviewId
    };
    this.assessmentReviewService.getReviewDetails(requestData)
      .subscribe(res => {
        if (res && res.result) {
          this.reviewDetails = res.result;
          this.adminDetails = this.reviewDetails.adminEmails;
          this.tenants.push(this.reviewDetails.tenant);
          this.selectedTenantId = this.reviewDetails.tenant.id;
          this.assignForm.patchValue({
            tenantId: [{ id: this.reviewDetails.tenant.id, name: this.reviewDetails.tenant.name }],
            reviewerEmail: this.formReviewerMailFromResult(this.reviewDetails.reviewerEmails, true),
            expiryDate: this.getDate(this.reviewDetails.expiryDateTime),
            expiryTime: this.getTime(this.reviewDetails.expiryDateTime),
            adminUserIds: this.reviewDetails.adminEmails,
            signOffReviewerEmail: [{ id: this.reviewDetails.signOffReviewerEmail.id, name: this.reviewDetails.signOffReviewerEmail.userEmail }],
            showAnswer: this.reviewDetails.showAnswer
          });
          if (this.reviewQuestionnaireDto?.isUpdate) {
            this.assessmentQuestionReviewers = this.reviewDetails.reviewerEmails.map(x => x.userEmail);
            this.getQuestionReviewer();
          }
          this.assignForm.get('showAnswer').disable();
        }
      });
  }

  setSignOffQuestionDetails(): void {
    this.assessmentReviewService.getSignOffCriteriaDetails(this.assessmentId)
      .subscribe(res => {
        if (res.result && res.success)
          this.assessmentSignOffCriteriaDetails = res.result;
        else
          this.assessmentSignOffCriteriaDetails = null;
      });
  }

  getDate(date: Date) {
    let localDate = Helper.convertUTCDateToLocalDate(date.toString());
    return {
      day: localDate.getDate(),
      month: localDate.getMonth() + 1,
      year: localDate.getFullYear()
    };
  }

  getTime(date: Date) {
    return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'HH:mm', 'en_US');
  }

  updateReview(): void {
    this.isFormSubmitTriggered = true;
    if (this.assignForm.get('expiryDate').value && this.assignForm.get('expiryTime').value) {
      this.convertedExpiryDateTime = this.convertNgbDateToString(this.assignForm.get('expiryDate').value, this.assignForm.get('expiryTime').value);
    }
    if (new Date(this.convertedExpiryDateTime) < this.currentDate) {
      this.toastrService.warning(Constants.pleaseSelectValidExpiryDate);
      return;
    }
    if (this.assignForm.valid) {
      let updateReviewData: UpdateReviewDto = {
        tenantId: this.reviewDetails.tenant.id,
        tenantAssessmentReviewId: this.reviewQuestionnaireDto.tenantAssessmentReviewId,
        assessmentReviewerId: this.reviewQuestionnaireDto.assessmentReviewerId,
        reviewers: this.getReviewersEmail(),
        expiryDateTime: this.convertedExpiryDateTime,
        timeZone: Helper.getTimeZone(),
      };
      this.reviewQuestionnaireDto.isReReview ? this.assignReReview(updateReviewData) : this.extendValidity(updateReviewData);
    }
    else {
      this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
    }
  }

  assignReReview(updateReviewData: UpdateReviewDto): void {
    this.assessmentReviewService.assignReReview(updateReviewData).subscribe(res => {
      if (res && res.result) {
        this.toastrService.success(Constants.reReviewAssignedSuccessfully);
        let data = {
          isReload: true
        };
        this.modalService.dismissAll(data);
        this.resetQuestionnaireForm();
        this.assessmentId = 0;
      }
      else
        this.toastrService.error(Constants.anErrorOccurred);
    });
  }

  extendValidity(updateReviewData: UpdateReviewDto): void {
    this.assessmentReviewService.updateReviewExpiryAsync(updateReviewData).subscribe(res => {
      if (res && res.result && res.result.isSuccess) {
        this.toastrService.success(Constants.ReviewQuestionnaireUpdatedSuccessfully);
        this.modalService.dismissAll(false);
        this.resetQuestionnaireForm();
        this.assessmentId = 0;
      }
      else if (res && res.result && !res.result.isSuccess)
        this.toastrService.error(res.result.errorMessage);
      else {
        this.toastrService.error(Constants.anErrorOccurred);
      }
    });
  }

  getAllTenants() {
    this.userService.getAllTenants().subscribe(res => {
      if (res.success && res.result) {
        this.tenants = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  initAssignForm() {
    this.assignForm = this.formBuilder.group({
      tenantId: ['', Validators.required],
      expiryDate: ['', Validators.required],
      expiryTime: ['', Validators.required],
      reviewerEmail: [[], Validators.required],
      adminUserIds: [''],
      signOffReviewerEmail: ['', Validators.required],
      showAnswer: [false]
    });
    if (this.permissions[Permissions.assesmentsManageAll])
      this.assignForm.patchValue({
        tenantId: [{ id: this.appSessionService.tenantId, name: this.appSessionService.tenantName }]
      });
    if (this.reviewQuestionnaireDto.isReReview) {
      this.reviewerMailDropDownSettings.disabled = false;
    }
  }

  convertNgbDateToString(date: NgbDate, time: string) {
    if (date && time) {
      return `${date.year}-${date.month}-${date.day} ${time}`;
    }
    else
      return "";
  }

  getSignOffEmails(): void {
    let response: ReviewersDto[] = [];
    if (!this.reviewQuestionnaireDto?.isUpdate) {
      if (this.assignForm.get('reviewerEmail').value !== [] && this.assignForm.get('reviewerEmail').value?.length > 0) {
        this.assignForm.get('reviewerEmail').value?.forEach(element => {
          response.push({ id: element.id, name: element.itemName });
        });
      }
      if (response.length < 1)
        this.assignForm.get('signOffReviewerEmail').reset();
      else if (this.assignForm.get('signOffReviewerEmail').value && this.assignForm.get('signOffReviewerEmail').valid && response.length > 0) {
        let currentData = response.find(x => x.name === this.assignForm.get('signOffReviewerEmail').value[0].name);
        if (!currentData) {
          this.assignForm.get('signOffReviewerEmail').reset();
        }
      }
    }
    this.signOffMails = response;
  }

  getAdmins() {
    if (this.userRole !== UserRoles[1]) {
      this.selectedTenantId = this.appSessionService.tenantId;
    }
    let requestData: RequestGetUserEmails = {
      tenantId: this.selectedTenantId,
      roleName: this.constants.tenantAdmin
    };
    this.assessmentReviewService.getUserEmails(requestData).subscribe(res => {
      if (res.success) {
        this.adminDetails = res.result;
        if (this.permissions[Permissions.assesmentsManageAll]) {
          this.adminDetails = this.adminDetails.filter(x => x.id !== this.appSessionService.user.id);
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getQuestionReviewer() {
    if (this.userRole !== UserRoles[1]) {
      this.selectedTenantId = this.appSessionService.tenantId;
    }
    let requestData: RequestGetUserEmails = {
      tenantId: this.selectedTenantId,
      roleName: this.constants.questionReviewer
    };
    this.assessmentReviewService.getUserEmails(requestData).subscribe(res => {
      if (res && res.success) {
        this.reviewers = [];
        this.getReviewers = res.result;
        this.reviewers = this.formReviewerMailFromResult(res.result);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  formReviewerMailFromResult(result, isUpdate: boolean = false) {
    let res: object[] = [];
    if (this.assessmentQuestionReviewers.length > 0 && this.reviewQuestionnaireDto?.isUpdate && result?.length > 0) {
      result.forEach(element => {
        if (this.assessmentQuestionReviewers.includes(element.userEmail))
          res.push({ id: element.id, itemName: element.userEmail, disabled: true });
        else
          res.push({ id: element.id, itemName: element.userEmail, disabled: false });
      });
    }
    else if (result?.length > 0) {
      result.forEach(element => {
        res.push({ id: element.id, itemName: element.userEmail, disabled: isUpdate });
      });
    }
    return res;
  }

  isFormValid(formControlName: string): boolean {
    if (formControlName === 'tenantId')
      return !(this.assignForm.get(formControlName).errors?.required && (this.assignForm.get(formControlName).dirty || this.isFormSubmitTriggered));
    return !(this.assignForm.get(formControlName).errors?.required && (this.assignForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  selectAdmins(event: UserDto, select: boolean) {
    if (select === true) {
      this.selectedAdmins.push({
        id: event.id,
        userEmail: event.userEmail
      });
    }
    else {
      this.selectedAdmins = this.selectedAdmins.filter(x => x.id !== event.id);
    }
  }

  selectAllAdmins(event: UserDto[], selectAll: boolean) {
    if (selectAll === true) {
      event.forEach(element => {
        if (!this.selectedAdmins.find(x => x.id === element.id)) {
          this.selectedAdmins.push({
            id: element.id,
            userEmail: element.userEmail
          });
        }
      });
    }
    else {
      event.forEach(element => {
        this.selectedAdmins = this.selectedAdmins.filter(x => x.id !== element.id);
      });
    }
  }

  onTenantChangeforReviewer(event: TenantDto) {
    this.resetQuestionnaireForm();
    this.selectedTenantId = event.id;
    this.assignForm.patchValue({
      tenantId: [{ id: event.id, name: event.name }]
    });
    let requestData: RequestReviewerAssigned = {
      tenantId: event.id,
      assessmentId: this.assessmentId
    };
    this.assessmentReviewService.isReviewerAssigned(requestData).
      subscribe(res => {
        if (res.success) {
          if (!res.result) {
            this.getAdmins();
            this.getQuestionReviewer();
            this.disableQuestionaire = false;
            this.assignForm.get('expiryTime').enable();
            this.assignForm.get('showAnswer').enable();
            this.reviewerMailDropDownSettings.disabled = false;
          }
          if (res.result) {
            this.toastrService.warning(this.constants.reviewerAlreadyAssigned);
            this.disableQuestionaire = true;
            this.assignForm.get('expiryTime').disable();
            this.assignForm.get('showAnswer').disable();
            this.reviewerMailDropDownSettings.disabled = true;
            return;
          }
        }
        else {
          this.toastrService.error(this.constants.somethingWentWrong);
        }
      });
  }

  resetQuestionnaireForm() {
    this.assignForm.reset();
    this.assignForm.get('reviewerEmail').setValue([]);
    this.assignForm.get('showAnswer').setValue(false);
    this.selectedTenantId = 0;
    this.adminDetails = [];
    this.reviewers = [];
  }

  assignReviewer() {
    this.isFormSubmitTriggered = true;
    if (this.assignForm.get('expiryDate').value && this.assignForm.get('expiryTime').value) {
      this.convertedExpiryDateTime = this.convertNgbDateToString(this.assignForm.get('expiryDate').value, this.assignForm.get('expiryTime').value);
    }
    if (new Date(this.convertedExpiryDateTime) < this.currentDate) {
      this.toastrService.warning(Constants.pleaseSelectValidExpiryDate);
      return;
    }
    if (!this.assignForm.valid && this.assignForm.get('reviewerEmail').value?.length > 0) {
      this.assignForm.controls.reviewerEmail.clearValidators();
      this.assignForm.controls.reviewerEmail.updateValueAndValidity();
    }
    if (this.assignForm.valid) {
      let data: AssignAssessmentReviewerDto = {
        tenantId: this.selectedTenantId,
        adminUserIds: this.selectedAdmins.map(x => x.id),
        assessmentId: this.assessmentId,
        linkExpiryDateTime: this.convertedExpiryDateTime,
        timeZone: Helper.getTimeZone(),
        reviewersEmail: this.getReviewersEmail(),
        signOffReviewerEmail: this.assignForm.get('signOffReviewerEmail').value.map(x => x.name).toString(),
        showAnswer: true
      };
      this.assessmentReviewService.assignAssessmentReviewer(data).subscribe(res => {
        if (res.success && res.result.isSuccess) {
          this.toastrService.success(this.constants.reviewerAssignedSuccessfully);
          this.modalService.dismissAll(true);
          this.resetQuestionnaireForm();
          this.assessmentId = 0;
        }
        else
          this.toastrService.error(res.result.errorMessage);
      });
    }
    else {
      this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
    }
  }

  getReviewersEmail() {
    let res: string[] = [];
    this.assignForm.get('reviewerEmail').value.forEach((obj) => {
      res.push(obj.itemName);
    });
    return res;
  }

  cancelQuestionnaire() {
    this.isFormSubmitTriggered = false;
    this.assignForm.reset();
    this.adminDetails = [];
    this.assessmentId = 0;
    this.reviewers = [];
    let data = {
      isClose: true
    };
    this.assessmentQuestionReviewers = [];
    this.modalService.dismissAll(data);
  }

  onAddNewMail(newEmail: string) {
    if (newEmail && !this.assignForm.get('reviewerEmail').value?.filter(obj => obj.itemName === newEmail)[0]) {
      const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (regexp.test(newEmail)) {
        const arrayLength = this.assignForm.get('reviewerEmail').value.length;
        this.assignForm.get('reviewerEmail').value.push({ id: `new${arrayLength + 1}`, itemName: newEmail });
        this.getSignOffEmails();
      } else {
        this.toastrService.error(Constants.givenEmailIsNotValidPleaseCorrectTheError);
      }
    } else {
      this.toastrService.warning(Constants.givenEmailIsAlreadyAdded);
    }
  }
}
