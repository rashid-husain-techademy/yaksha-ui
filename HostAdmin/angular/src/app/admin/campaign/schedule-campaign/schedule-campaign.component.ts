import { formatDate } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssessmentTenants, NgbDate, ScheduleAssessmentDto, ScheduleConfigOptions, TenantScheduleCatalogResultsDto, UpdateAssessmentScheduled } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { CustomFieldType, ProctorType, ScheduleTarget, ScheduleType } from '@app/enums/assessment';
import { UserRoles } from '@app/enums/user-roles';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Constants } from '@app/models/constants';
import { NavigationService } from '@app/service/common/navigation.service';
import { Helper } from '@app/shared/helper';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { dataService } from '@app/service/common/dataService';
import { CampaignScheduleCustomField, CampaignScheduleDataDto, GetCampaignScheduleDetails, ScheduleCampaign, ScheduleCampaignPageInputData, UpdateScheduledCampaign } from '../campaign';
import { CampaignService } from '../campaign.service';
import { CampaignScopeType } from '@app/enums/campaign';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-schedule-campaign',
  templateUrl: './schedule-campaign.component.html',
  styleUrls: ['./schedule-campaign.component.scss']
})
export class ScheduleCampaignComponent implements OnInit {
  @Input() public scheduleAssessmentDto: ScheduleAssessmentDto;
  scheduleCampaignPageInputData: ScheduleCampaignPageInputData;
  constants = Constants;
  campaignForm: FormGroup;
  userRole: string;
  dropdownSettings: { singleSelection: boolean; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  singledropdownSettings: { singleSelection: boolean; selectAllText: string; unSelectAllText: string; allowSearchFilter: boolean; closeDropDownOnSelection: any; };
  isFormSubmitTriggered: boolean = false;
  formattedStartTime: string = "";
  formattedEndTime: string = "";
  supportedTypesMessage: string;
  selectedFileType: string;
  file: File;
  fileTypeGranted: boolean = false;
  fileName: string;
  errorMessage: string[] = [];
  showErrors: boolean = false;
  errorLength: number = 99;
  supportedTypes: string[];
  userInviteSampleTemplate: string = "assets/sampleTemplate/Assessment_User_Invite.xlsx";
  userGroupUploadSampleTemplate: string = "assets/sampleTemplate/Assessment_User_Group_Invite.xlsx"
  invitedUserIds: string;
  showPublicLink: boolean = false;
  userRoles = UserRoles;
  isSubmitted: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  hideScheduleCreation: boolean = false;
  currentDate = new Date();
  updateScheduledAssessment: UpdateAssessmentScheduled;
  isTenantDisabled: boolean = false;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  tenantCatalogs: TenantScheduleCatalogResultsDto[];
  isTenantCatalogAvailable: boolean = false;
  selectedTenantCatalog: number = null;
  multiSelectDropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  templateSelectDropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  isUpdate: boolean = true;
  endDateValue: any = null;
  scheduledId: number;
  isCodeBased: boolean = false;
  enumProctorType = ProctorType;
  tenantId: number;
  scheduleConfigOptions: ScheduleConfigOptions = null;
  isSuperAdmin: boolean = false;
  isTenantAdmin: boolean = false;
  sampleTemplate: string;
  tenantList: AssessmentTenants[] = [];
  activateRoute: any;
  isCloudBased: boolean;

  constructor(private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private appSessionService: AppSessionService,
    private dataService: dataService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private appSession: AppSessionService,
    private campaignService: CampaignService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    this.route.params.subscribe(params => {
      if (params) {
        this.scheduleCampaignPageInputData = { campaignId: JSON.parse(atob(params['campaignId'])), campaignName: JSON.parse(atob(params['campaignName'])), isUpdate: JSON.parse(atob(params['isUpdate'])), duration: JSON.parse(atob(params['duration'])), scheduleId: JSON.parse(atob(params['scheduleId'])), tenantId: JSON.parse(atob(params['tenantId'])), campaignDate: JSON.parse(atob(params['campaignDate'])) };
      }
    });

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
      if (this.userRole === this.userRoles[1]) {
        this.isSuperAdmin = true;
      }
      else if (this.userRole === this.userRoles[2]) {
        this.isTenantAdmin = true;
      }
      this.getTenantScheduleConfigById(this.tenantId);
      if (this.isSuperAdmin) {
        this.getCampaignTenant();
      }
      else {
        this.initPage();
      }
      this.sampleTemplate = this.userInviteSampleTemplate;
    });
  }

  getTenantScheduleConfigById(tenantId: number): void {
    if (!this.dataService.isSuperAdmin() && !this.dataService.isTenantAdmin()) {
      this.assessmentService.getTenantScheduleConfigById(tenantId).subscribe(res => {
        if (res.result !== null) {
          this.scheduleConfigOptions = JSON.parse(res.result);
        }
      },
        error => {
          console.error(error);
        });
    }
  }

  getCampaignTenant() {
    this.campaignService.getTenantsByCampaignId(this.scheduleCampaignPageInputData.campaignId).subscribe(res => {
      if (res.result) {
        this.tenantList = res.result;
        this.initPage();
      }
      else
        this.toastrService.warning(Constants.noTenantsFound);
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  initPage(): void {
    if (this.scheduleCampaignPageInputData.scheduleId !== null) {
      this.hideScheduleCreation = true;
      this.initCampaignForm();
      this.patchCampaignDetails();
    }
    else {
      this.IsCloudBasedCampaign();
    }
  }

  IsCloudBasedCampaign() {
    this.campaignService.isCloudBasedCampaign(this.scheduleCampaignPageInputData.campaignId).subscribe(res => {
      this.isCloudBased = res.result;
      this.initAndPatchCampaignForm();
      if (this.isTenantAdmin || this.userRole === UserRoles[7]) {
        this.campaignForm.patchValue({
          tenantId: [{ id: this.appSessionService.tenantId, name: this.appSessionService.tenantName }]
        });
      }
      else {
        this.campaignForm.patchValue({
          tenantId: [{ id: this.tenantList[0].id, name: this.tenantList[0].name }]
        });
      }
    });
  }

  endDateAndTimeValueChange() {
    this.campaignForm.get("endDate").valueChanges.pipe(debounceTime(1000), distinctUntilChanged(), startWith(this.campaignForm.get("endDate").value)).subscribe(endDate => {
      if (endDate) {
        this.campaignForm.get('endTime').setValidators([Validators.required]);
        this.campaignForm.get('endTime').enable();
      }
      else {
        this.campaignForm.get('endTime').clearValidators();
        this.campaignForm.get('endTime').setValue('');
        this.campaignForm.get('endTime').disable();
      }
    });
  }

  convertToDateTime(dateValue, timeValue) {
    var Year = dateValue.year;
    var Month = dateValue.month;
    var Day = dateValue.day;

    var DateTimeValue = new Date(Year + '-' + Month + '-' + Day);
    DateTimeValue.setHours((timeValue.split(' ')[0]).split(':')[0]);
    DateTimeValue.setMinutes((timeValue.split(' ')[0]).split(':')[1]);

    return DateTimeValue;
  }

  getDifferenceInMinutes(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60);
  }

  initAndPatchCampaignForm() {
    this.campaignForm = this.formBuilder.group({
      tenantId: ['', Validators.required],
      attempts: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")]],
      duration: [{ value: this.scheduleCampaignPageInputData.duration, disabled: true }, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      startDate: [{ value: this.getDateFromString(this.scheduleCampaignPageInputData.campaignDate.startDateTime), disabled: true }],
      endDate: [{ value: this.getDateFromString(this.scheduleCampaignPageInputData.campaignDate.endDateTime), disabled: true }],
      startTime: [{ value: this.getTimeFromString(this.scheduleCampaignPageInputData.campaignDate.startDateTime), disabled: true }],
      endTime: [{ value: this.getTimeFromString(this.scheduleCampaignPageInputData.campaignDate.endDateTime), disabled: true }],
      scheduleType: this.isCloudBased ? [Constants.inviteCandidates, Validators.required] : [Constants.publicURL, Validators.required],
      candidateEmails: [''],
      domain: [''],
      scheduleLink: [''],
      customLabel1: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField1Mandatory: [false],
      customLabel2: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField2Mandatory: [false],
      customLabel3: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField3Mandatory: [false],
      customLabel4: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField4Mandatory: [false],
      tenantCatalogId: [''],
      testPurpose: ['', [Validators.required, Validators.pattern("^[a-zA-Z].*")]]
    });
  }

  initCampaignForm() {
    this.campaignForm = this.formBuilder.group({
      tenantId: ['', Validators.required],
      attempts: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")]],
      duration: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      startTime: [{ value: '', disabled: true }],
      endTime: [{ value: '', disabled: true }],
      scheduleType: [Constants.publicURL, Validators.required],
      candidateEmails: [''],
      domain: [''],
      scheduleLink: [''],
      customLabel1: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField1Mandatory: [false],
      customLabel2: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField2Mandatory: [false],
      customLabel3: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField3Mandatory: [false],
      customLabel4: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField4Mandatory: [false],
      tenantCatalogId: [''],
      testPurpose: ['', [Validators.required, Validators.pattern("^[a-zA-Z].*")]]
    });
  }

  isFormValid(formControlName: string): boolean {
    return !(this.campaignForm.get(formControlName).errors?.required && (this.campaignForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  close(): void {
    this.navigationService.goBack();
  }

  getTenantSpecificDetails() {
    let tenantId = this.campaignForm.get('tenantId').value[0].id;
    this.assessmentService.getTenantCatalogs(tenantId).subscribe(res => {
      if (res.success && res.result.length) {
        this.tenantCatalogs = res.result;
        this.isTenantCatalogAvailable = true;
      }
      else {
        this.tenantCatalogs = [];
        this.isTenantCatalogAvailable = false;
        this.selectedTenantCatalog = null;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  changeSchedule() {
    this.campaignForm.get('tenantCatalogId').setValidators([Validators.required]);
    if (this.campaignForm.get('scheduleType').value === Constants.inviteCandidates) {
      this.campaignForm.get('candidateEmails').setValue('');
      this.fileName = '';
      this.file = undefined;
      this.campaignForm.get('tenantCatalogId').setErrors(null);
    }
    else if (this.campaignForm.get('scheduleType').value === Constants.publicURL) {
      this.campaignForm.get('domain').setValue('');
      this.campaignForm.get('tenantCatalogId').setErrors(null);
      this.campaignForm.get('customLabel1').setValue('');
      this.campaignForm.get('isCustomField1Mandatory').setValue(false);
      this.campaignForm.get('customLabel2').setValue('');
      this.campaignForm.get('isCustomField2Mandatory').setValue(false);
      this.campaignForm.get('customLabel3').setValue('');
      this.campaignForm.get('isCustomField3Mandatory').setValue(false);
      this.campaignForm.get('customLabel4').setValue('');
      this.campaignForm.get('isCustomField4Mandatory').setValue(false);
    }
    else {
      this.campaignForm.get('tenantCatalogId').setErrors(null);
    }
  }


  save() {
    this.currentDate = new Date();
    this.isFormSubmitTriggered = true;
    if (this.campaignForm.valid) {

      if (this.campaignForm.get('startDate').value || this.campaignForm.get('endDate').value) {
        this.formattedStartTime = this.convertNgbDateToString(this.campaignForm.get('startDate').value, this.campaignForm.get('startTime').value);
        this.formattedEndTime = this.convertNgbDateToString(this.campaignForm.get('endDate').value, this.campaignForm.get('endTime').value);

        if (!(this.campaignForm.get('startTime').value)) {
          this.currentDate.setHours(0, 0, 0, 0);
        }
      }
      if (this.campaignForm.get('candidateEmails').value && !Helper.emailValidation(this.campaignForm.get('candidateEmails').value)) {
        this.toastrService.warning(Constants.invalidEmailAddress);
        return;
      }
      else if (this.campaignForm.get('scheduleType').value === Constants.inviteCandidates && (!this.file && !this.campaignForm.get('candidateEmails').value)) {
        this.toastrService.warning(Constants.pleaseInviteUsers);
        return;
      }
      else if (this.campaignForm.get('customLabel1').value === this.campaignForm.get('customLabel2').value && this.campaignForm.get('customLabel1').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField1AndCustomField2ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel1').value === this.campaignForm.get('customLabel3').value && this.campaignForm.get('customLabel1').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField1AndCustomField3ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel1').value === this.campaignForm.get('customLabel4').value && this.campaignForm.get('customLabel1').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField1AndCustomField4ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel2').value === this.campaignForm.get('customLabel3').value && this.campaignForm.get('customLabel2').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField2AndCustomField3ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel3').value === this.campaignForm.get('customLabel4').value && this.campaignForm.get('customLabel3').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField3AndCustomField4ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel2').value === this.campaignForm.get('customLabel4').value && this.campaignForm.get('customLabel2').value.toString().trim() !== '') {
        this.toastrService.warning(Constants.customField2AndCustomField4ShouldNotBeSame);
        return;
      }
      else if (this.campaignForm.get('customLabel1').value === '' && (this.campaignForm.get('customLabel3').value !== '' || this.campaignForm.get('customLabel4').value !== '')) {
        this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable1);
        return;
      }
      else if (this.campaignForm.get('customLabel2').value === '' && (this.campaignForm.get('customLabel3').value !== '' || this.campaignForm.get('customLabel4').value !== '')) {
        this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable2);
        return;
      }
      else if (this.campaignForm.get('customLabel3').value === '' && (this.campaignForm.get('customLabel4').value !== '')) {
        this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable3);
        return;
      }
      else if (this.campaignForm.get('customLabel1').value === this.constants.firstName || this.campaignForm.get('customLabel1').value === this.constants.lastName || this.campaignForm.get('customLabel1').value === this.constants.email || this.campaignForm.get('customLabel1').value === this.constants.phone) {
        this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
        return;
      }
      else if (this.campaignForm.get('customLabel2').value === this.constants.firstName || this.campaignForm.get('customLabel2').value === this.constants.lastName || this.campaignForm.get('customLabel2').value === this.constants.email || this.campaignForm.get('customLabel1').value === this.constants.phone) {
        this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
        return;
      }
      else if (this.campaignForm.get('customLabel3').value === this.constants.firstName || this.campaignForm.get('customLabel3').value === this.constants.lastName || this.campaignForm.get('customLabel3').value === this.constants.email || this.campaignForm.get('customLabel3').value === this.constants.phone) {
        this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
        return;
      }
      else if (this.campaignForm.get('customLabel4').value === this.constants.firstName || this.campaignForm.get('customLabel4').value === this.constants.lastName || this.campaignForm.get('customLabel4').value === this.constants.email || this.campaignForm.get('customLabel4').value === this.constants.phone) {
        this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
        return;
      }
      else {
        this.isSubmitted = true;

        if (this.file && this.campaignForm.get('scheduleType').value === Constants.inviteCandidates) {
          this.errorMessage = [];
          this.invitedUserIds = "";
          const formData = new FormData();
          formData.append('file', this.file, this.file.name);
          this.assessmentService.userInviteValidation(formData, this.campaignForm.get('tenantId').value[0].id, this.isCloudBased).pipe(
          ).subscribe(res => {
            if (res.success && res.result.isSuccess) {
              this.constructData();
            }
            else {
              this.showErrors = true;
              this.errorMessage = res.result.errorList;
              this.toastrService.error(this.constants.fileUploadFailedErrorButton);
              this.isSubmitted = false;
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
        else {
          this.constructData();
        }
      }
    }
    else {
      this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
    }
  }

  constructData() {
    let customFields: CampaignScheduleCustomField[] = [];
    if (this.campaignForm.get("customLabel1").value.toString().trim().length > 0) {
      let temp: CampaignScheduleCustomField = { fieldLabel: this.campaignForm.get('customLabel1').value, isMandatory: this.campaignForm.get('isCustomField1Mandatory').value, fieldType: CustomFieldType.TextBox, scope: CampaignScopeType.Assessment };
      customFields.push(temp);
    }
    if (this.campaignForm.get("customLabel2").value.toString().trim().length > 0) {
      let temp: CampaignScheduleCustomField = { fieldLabel: this.campaignForm.get('customLabel2').value, isMandatory: this.campaignForm.get('isCustomField2Mandatory').value, fieldType: CustomFieldType.TextBox, scope: CampaignScopeType.Assessment };
      customFields.push(temp);
    }
    if (this.campaignForm.get("customLabel3").value.toString().trim().length > 0) {
      let temp: CampaignScheduleCustomField = { fieldLabel: this.campaignForm.get('customLabel3').value, isMandatory: this.campaignForm.get('isCustomField3Mandatory').value, fieldType: CustomFieldType.TextBox, scope: CampaignScopeType.Assessment };
      customFields.push(temp);
    }
    if (this.campaignForm.get("customLabel4").value.toString().trim().length > 0) {
      let temp: CampaignScheduleCustomField = { fieldLabel: this.campaignForm.get('customLabel4').value, isMandatory: this.campaignForm.get('isCustomField4Mandatory').value, fieldType: CustomFieldType.TextBox, scope: CampaignScopeType.Assessment };
      customFields.push(temp);
    }

    let data: ScheduleCampaign =
    {
      campaignId: this.scheduleCampaignPageInputData.campaignId,
      campaignName: this.scheduleCampaignPageInputData.campaignName,
      tenantId: this.campaignForm.get('tenantId').value[0].id,
      totalAttempts: this.campaignForm.get('attempts').value,
      duration: this.campaignForm.get('duration').value,
      startDateTime: this.formattedStartTime,
      endDateTime: this.formattedEndTime,
      timeZone: Helper.getTimeZone(),
      scheduleTarget: this.campaignForm.get('scheduleType').value === Constants.publicURL ? ScheduleTarget.Public : ScheduleTarget.Private,
      restrictToDomain: this.campaignForm.get('domain').value,
      invitedUserEmails: this.campaignForm.get('candidateEmails').value,
      scheduleType: this.campaignForm.get('scheduleType').value === Constants.publicURL ? ScheduleType.Public
        : this.campaignForm.get('scheduleType').value === Constants.inviteCandidates ? ScheduleType.Invite : null,
      hasCloudBasedAssessment: this.isCloudBased,
      scheduleCustomFields: customFields,
      testPurpose: this.campaignForm.get('testPurpose').value
    };
    const formData = new FormData();
    if (this.file) {
      formData.append('File', this.file, this.file.name);
    }
    else {
      formData.append('File', null);
    }
    formData.append('Input', JSON.stringify(data));
    this.campaignService.scheduleCampaign(formData).subscribe((res: any) => {
      if (res && res.result.isSuccess) {
        this.scheduledId = res.result.scheduleId;
        if (data.scheduleType === ScheduleType.Public) {
          this.showPublicLink = true;
          this.campaignForm.patchValue({
            scheduleLink: res.result.scheduleLink
          });
          this.campaignForm.get('scheduleLink').disable();
        }
        this.toastrService.success(Constants.driveHasBeenScheduledSuccessfully);
        this.isFormSubmitTriggered = false;
        if (data.scheduleType === ScheduleType.Invite) {
          this.close();
        }
      }
      else {
        this.isSubmitted = false;
        this.toastrService.warning(Constants.failedToScheduleDrive);
      }
    },
      error => {
        console.error(error);
        this.toastrService.error(Constants.failedToScheduleDrive);
      });
  }

  onFileChange(files: File[]) {
    if (files.length > 0) {
      this.selectedFileType = files[0].type;
      this.file = files[0];
      this.supportedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = files[0].name;
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
    this.fileName = '';
    this.file = undefined;
    this.errorMessage = [];
    this.showErrors = false;
    this.toastrService.warning(Constants.selectedFileWasRemoved);
  }

  copyInputMessage(): void {
    let copyText = this.campaignForm.get('scheduleLink').value;
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.style.left = '0';
    selectBox.style.top = '0';
    selectBox.style.opacity = '0';
    selectBox.value = copyText;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
    this.toastrService.success(Constants.copiedToClipboard);
  }

  convertNgbDateToString(date: NgbDate, time: string) {
    if (date && time)
      return `${date.year}-${date.month}-${date.day} ${time}`;
    else
      return "";
  }

  getDate(date: Date) {
    let localDate = Helper.convertUTCDateToLocalDate(date.toString());
    return {
      day: localDate.getDate(),
      month: localDate.getMonth() + 1,
      year: localDate.getFullYear()
    };
  }

  getDateFromString(date: string) {
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

  getTimeFromString(date: string) {
    return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'HH:mm', 'en_US');
  }

  getISOTime(date: Date) {
    return formatDate(date.toString(), 'HH:mm', 'en_US');
  }

  UpdateScheduledAssessment() {
    if (this.campaignForm.get('endDate').value) {
      this.formattedEndTime = this.convertNgbDateToString(this.campaignForm.get('endDate').value, this.campaignForm.get('endTime').value);
      this.formattedStartTime = this.convertNgbDateToString(this.campaignForm.get('startDate').value, this.campaignForm.get('startTime').value);
      if (!this.formattedEndTime) {
        this.toastrService.warning(Constants.pleaseSelectEndDateAndTime);
        return;
      }
      else if (!(this.campaignForm.get('endTime').value)) {
        this.currentDate.setHours(0, 0, 0, 0);
      }
      else if (new Date(this.formattedStartTime) > new Date(this.formattedEndTime) || new Date(this.formattedEndTime) < this.currentDate) {
        this.toastrService.warning(Constants.pleaseSelectValidDate);
        return;
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseSelectValidDate);
      return;
    }

    let data: UpdateScheduledCampaign = {
      campaignScheduleId: this.scheduleCampaignPageInputData.scheduleId,
      endDateTime: this.formattedEndTime,
      timeZone: Helper.getTimeZone(),
      tenantId: this.campaignForm.get('tenantId').value[0].id,
    };
    this.campaignService.updateScheduledCampaign(data).subscribe(res => {
      if (res.success && res.result) {
        this.toastrService.success(Constants.driveScheduleUpdatedSuccessfully);
        this.close();
      }
      this.modalService.dismissAll(true);
    });
  }

  patchCampaignDetails() {
    let data: GetCampaignScheduleDetails = {
      campaignScheduleId: this.scheduleCampaignPageInputData.scheduleId
    };
    this.campaignService.getCampaignScheduleById(data).subscribe(res => {
      if (res.success && res.result) {
        let schedule: CampaignScheduleDataDto = res.result;
        let tenant: any;
        this.endDateValue = schedule.endDateTime ? this.getDate(schedule.endDateTime) : '';
        if (this.userRole === UserRoles[2] || this.userRole === UserRoles[7])
          tenant = { id: this.appSessionService.tenantId, name: this.appSessionService.tenantName };
        else
          tenant = { id: this.tenantList[0].id, name: this.tenantList[0].name };
        this.campaignForm.patchValue({
          tenantId: [{ id: tenant.id, name: tenant.name }],
          attempts: [1],
          duration: schedule.duration,
          startDate: schedule.startDateTime ? this.getDate(schedule.startDateTime) : '',
          endDate: schedule.endDateTime ? this.getDate(schedule.endDateTime) : '',
          startTime: schedule.startDateTime ? this.getTime(schedule.startDateTime) : '',
          endTime: schedule.endDateTime ? this.getTime(schedule.endDateTime) : '',
          scheduleType: this.getScheduleType(schedule),
          candidateEmails: [''],
          domain: schedule.restrictToDomain,
          scheduleLink: schedule.link,
          testPurpose: schedule.testPurpose
        });

        if (res.result.scheduleCustomFields?.length > 0) {
          this.campaignForm.patchValue({
            customLabel1: res.result.scheduleCustomFields[0].fieldLabel,
            isCustomField1Mandatory: res.result.scheduleCustomFields[0].isMandatory
          });
        }
        if (res.result.scheduleCustomFields?.length > 1) {
          this.campaignForm.patchValue({
            customLabel2: res.result.scheduleCustomFields[1].fieldLabel,
            isCustomField2Mandatory: res.result.scheduleCustomFields[1].isMandatory
          });
        }
        if (res.result.scheduleCustomFields?.length > 2) {
          this.campaignForm.patchValue({
            customLabel3: res.result.scheduleCustomFields[2].fieldLabel,
            isCustomField3Mandatory: res.result.scheduleCustomFields[2].isMandatory
          });
        }
        if (res.result.scheduleCustomFields?.length > 3) {
          this.campaignForm.patchValue({
            customLabel4: res.result.scheduleCustomFields[3].fieldLabel,
            isCustomField4Mandatory: res.result.scheduleCustomFields[3].isMandatory
          });
        }
        this.isTenantDisabled = true;
        this.campaignForm.disable();
        if (this.scheduleCampaignPageInputData.isUpdate === true) {
          this.campaignForm.get('endDate').enable();
          this.campaignForm.get('endTime').enable();
        }
      }
      else {
        this.toastrService.warning(Constants.scheduleNotFound);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getScheduleType(schedule: CampaignScheduleDataDto) {
    if (schedule.scheduleType === ScheduleType.Public || schedule.target === ScheduleTarget.Public) {
      return Constants.publicURL;
    }
    else if (schedule.scheduleType === ScheduleType.Invite || schedule.scheduleType === ScheduleType.Collaborative) {
      return Constants.inviteCandidates;
    }
  }



  onEndDateChange() {
    var endDateTemp = JSON.stringify(this.getDateFormat(this.campaignForm.get('endDate').value));
    var endDateTempConstant = JSON.stringify(this.endDateValue !== null ? this.endDateValue : '');
    if (this.endDateValue !== null && endDateTemp !== endDateTempConstant) {
      this.endDateAndTimeValueChange();
    }
  }

  getDateFormat(date: any) {
    return {
      day: date.day,
      month: date.month,
      year: date.year
    };
  }

  isCustomFieldRegularExpresson(field: string): boolean {
    let value = (this.campaignForm.get(field).touched || this.isFormSubmitTriggered);
    if (value) {
      return !this.campaignForm.get(field).valid;
    }
    return false;
  }
}
