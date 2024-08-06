import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Constants } from '@app/models/constants';
import { AdaptiveAssessmentList, ViewAdaptiveScheduleTabs, scheduleAdaptiveAssessmentData } from '../adaptive-assessment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSessionService } from '@shared/session/app-session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdaptiveAssessmentService } from '../adaptive-assessment.service';
import { ToastrService } from 'ngx-toastr';
import { ScheduleType } from '@app/enums/assessment';
import { NavigationService } from '@app/service/common/navigation.service';
import { Helper } from '@app/shared/helper';
import { AssessmentService } from '@app/admin/assessment/assessment.service';

@Component({
  selector: 'app-adaptive-assessment-schedule',
  templateUrl: './adaptive-assessment-schedule.component.html',
  styleUrls: ['./adaptive-assessment-schedule.component.scss']
})
export class AdaptiveAssessmentScheduleComponent implements OnInit {
  constants = Constants;
  active: number = ViewAdaptiveScheduleTabs.Schedule;
  scheduleAdaptiveForm: FormGroup;
  tenantId: number;
  adaptiveAssessment: AdaptiveAssessmentList;
  invitedUserIds: string;
  invitedUserEmails: string;
  disableInvite: boolean = true;
  isFormSubmitTriggered: boolean = false;
  file: File;
  supportedTypes: string[];
  selectedFileType: string;
  fileTypeGranted: boolean = false;
  fileName: string;
  @ViewChild('fileInput') fileInput: ElementRef;
  errorMessage: string[] = [];
  showErrors: boolean = false;
  sampleTemplate: string = "assets/sampleTemplate/Adaptive_Assessment_User_Invite.xlsx";

  constructor(
    private route: ActivatedRoute,
    private appSession: AppSessionService,
    private formBuilder: FormBuilder,
    private adaptiveAssessmentService: AdaptiveAssessmentService,
    private toastrService: ToastrService,
    private navigationService: NavigationService,
    private router: Router,
    private assessmentService: AssessmentService) {
  }

  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    this.route.params.subscribe(params => {
      if (params) {
        this.adaptiveAssessment = JSON.parse(atob(params['adaptive']));
      }
    });
    this.initScheduleAdaptiveForm();
  }
  initScheduleAdaptiveForm(): void {
    this.scheduleAdaptiveForm = this.formBuilder.group({
      candidateEmails: ['', [Validators.required]],
      scheduleType: [Constants.inviteCandidates, Validators.required],
      isSendInvite: [false]
    });
  }

  schedule() {
    this.isFormSubmitTriggered = true;
    this.invitedUserIds = "";
    this.isFormSubmitTriggered = true;
    if (!this.file) {
      if (!this.scheduleAdaptiveForm.get('candidateEmails').value) {
        this.toastrService.warning(Constants.pleaseInviteUsers);
        return;
      }
      if (this.scheduleAdaptiveForm.get('candidateEmails').value && this.scheduleAdaptiveForm.get('candidateEmails').value.length > 1) {
        if (!Helper.emailValidation(this.scheduleAdaptiveForm.get('candidateEmails').value)) {
          this.toastrService.warning(Constants.invalidEmailAddress);
          return;
        }
      }
    } else {
      this.scheduleAdaptiveForm.get('candidateEmails').setValidators([]);
      this.scheduleAdaptiveForm.get('candidateEmails').clearValidators();
      this.scheduleAdaptiveForm.get('candidateEmails').setValue('');
      this.scheduleAdaptiveForm.updateValueAndValidity();
    }
    if (this.scheduleAdaptiveForm.get('isSendInvite').value === false) {
      this.toastrService.warning(Constants.pleaseEnableEmailInvite);
      return;
    }
    if (false && this.file && this.scheduleAdaptiveForm.get('scheduleType').value === Constants.inviteCandidates) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);
      this.assessmentService.userInviteValidation(formData, this.tenantId, false).pipe(
      ).subscribe(res => {
        if (res.success && res.result.isSuccess) {
          this.constructData();
        }
        else {
          this.showErrors = true;
          this.errorMessage = res.result.errorList;
          this.toastrService.error(this.constants.fileUploadFailedErrorButton);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    } else {
      this.constructData();
    }
  }

  constructData() {
    if (this.scheduleAdaptiveForm.valid) {
      let data: scheduleAdaptiveAssessmentData = {
        invitedUserIds: this.invitedUserIds,
        invitedUserEmails: this.scheduleAdaptiveForm.get('candidateEmails').value,
        isSendInvite: this.scheduleAdaptiveForm.get('isSendInvite').value,
        adaptiveAssessmentId: this.adaptiveAssessment.id,
        scheduleType: this.scheduleAdaptiveForm.get('scheduleType').value === Constants.publicURL ? ScheduleType.Public
          : ScheduleType.Invite
      };
      const formData = new FormData();
      if (this.file) {
        formData.append('File', this.file, this.file.name);
      }
      else {
        formData.append('File', null);
      }
      formData.append('Input', JSON.stringify(data));
      this.adaptiveAssessmentService.scheduleAdaptiveAssessment(formData).subscribe(res => {
        if (res.result && res.result.isSuccess) {
          this.toastrService.success(res.result.successMessage);
          this.router.navigate([`../../view-adaptive-assessment`, btoa(JSON.stringify(this.adaptiveAssessment.id)),], { relativeTo: this.route });
        }
        else if (res.result.errorList?.length > 0) {
          this.showErrors = true;
          this.errorMessage = res.result.errorList;
          this.toastrService.error(this.constants.fileUploadFailedErrorButton);
        }
        else {
          this.toastrService.error(res.result.errorMessage);
          this.isFormSubmitTriggered = false;
        }
      });
    }
  }

  onFileChange(files: File[]) {
    let scheduleType = this.scheduleAdaptiveForm.get('scheduleType').value;
    if (files.length > 0) {
      this.selectedFileType = files[0].type;
      this.file = files[0];
      this.supportedTypes = scheduleType === Constants.selfRegistration
        ? ['image/jpg', 'image/jpeg', 'image/png']
        : ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = files[0].name;
      }
      else {
        this.file = undefined;
        this.toastrService.warning(scheduleType === Constants.selfRegistration ? Constants.uploadOnlyImageFiles : Constants.uploadOnlyExcelFiles);
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

  changeSchedule() {
    if (this.scheduleAdaptiveForm.get('scheduleType').value === ScheduleType.Invite)
      this.disableInvite = false;
    else
      this.disableInvite = true;
  }
  close() {
    this.navigationService.goBack();
  }

  isFormValid(formControlName: string): boolean {
    return !(this.scheduleAdaptiveForm.get(formControlName)?.errors?.required && (this.scheduleAdaptiveForm.get(formControlName).touched) || this.isFormSubmitTriggered);
  }


  scheduleAdaptiveFormValidationMessages = {
    candidateEmails: {
      required: Constants.candidatesEmailsCannotBeEmpty
    }
  }

}
