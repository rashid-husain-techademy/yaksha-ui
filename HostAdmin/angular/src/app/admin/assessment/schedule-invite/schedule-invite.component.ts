import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ScheduleInvite, UpdateScheduleInvite } from '../assessment';
import { AssessmentService } from '../assessment.service';
import { CampaignService } from '@app/admin/campaign/campaign.service';

@Component({
  selector: 'app-schedule-invite',
  templateUrl: './schedule-invite.component.html',
  styleUrls: ['./schedule-invite.component.scss']
})
export class ScheduleInviteComponent implements OnInit {
  @Input() public updateSchedule: ScheduleInvite;
  @Input() public updateCampaignSchedule: any;
  @ViewChild('fileInput') fileInput: ElementRef;
  inviteUserForm: FormGroup;
  selectedFileType: string;
  file: File;
  supportedTypes: string[];
  fileTypeGranted: boolean;
  fileName: string;
  errorMessage: string[];
  invitedUserIds: string;
  showErrors: boolean;
  constants = Constants;
  sampleTemplate: string = "assets/sampleTemplate/Assessment_User_Invite.xlsx";
  isCampaign: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private assessmentService: AssessmentService,
    private modalService: NgbModal,
    private campaignService: CampaignService
  ) { }

  ngOnInit(): void {
    if (this.updateCampaignSchedule)
      this.isCampaign = true;
    this.initInviteUserForm();
  }

  initInviteUserForm() {
    this.inviteUserForm = this.formBuilder.group({
      candidateEmails: ['']
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

  inviteUsers() {
    if (this.inviteUserForm.get('candidateEmails').value && !Helper.emailValidation(this.inviteUserForm.get('candidateEmails').value)) {
      this.toastrService.warning(Constants.invalidEmailAddress);
      return;
    }
    else if (!this.file && !this.inviteUserForm.get('candidateEmails').value) {
      this.toastrService.warning(Constants.pleaseInviteUsers);
      return;
    }
    else {
      if (!this.isCampaign) {
        if (this.file) {
          this.errorMessage = [];
          this.invitedUserIds = "";
          const formData = new FormData();
          formData.append('file', this.file, this.file.name);
          this.assessmentService.userInviteValidation(formData, this.updateSchedule.tenantId, false).pipe(
          ).subscribe(res => {
            if (res.success && res.result.isSuccess) {
              this.invitedUserIds = res.result.userIds;
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
        }
        else {
          this.constructData();
        }
      }
      else {
        if (this.file) {
          this.errorMessage = [];
          this.invitedUserIds = "";
          const formData = new FormData();
          formData.append('file', this.file, this.file.name);
          this.assessmentService.userInviteValidation(formData, this.updateCampaignSchedule.tenantId, this.updateCampaignSchedule.hasCloudBasedAssessment).pipe(
          ).subscribe(res => {
            if (res.success && res.result.isSuccess) {
              this.invitedUserIds = res.result.userIds;
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
        }
        else {
          this.constructData();
        }
      }
    }
  }

  constructData() {
    if (!this.isCampaign) {
      let data: UpdateScheduleInvite = {
        AssessmentScheduleId: this.updateSchedule.assessmentScheduleId,
        AssessmentName: this.updateSchedule.assessmentName,
        TenantId: this.updateSchedule.tenantId,
        TotalQuestions: this.updateSchedule.totalQuestions,
        InvitedUserIds: this.invitedUserIds,
        InvitedUserEmails: this.inviteUserForm.get('candidateEmails').value,
        ScheduleType: this.updateSchedule.scheduleType,
        IsCloud: this.updateSchedule.isCloud
      };
      const formData = new FormData();
      if (this.file) {
        formData.append('File', this.file, this.file.name);
      }
      else {
        formData.append('File', null);
      }
      formData.append('Input', JSON.stringify(data));
      this.assessmentService.updateScheduleInvites(formData).subscribe(res => {
        if (res && res.result) {
          this.toastrService.success(Constants.usersHavebeenInvitedSuccessfully);
          this.clearAll();
        }
        else {
          this.toastrService.warning(Constants.userInviteFailed);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }

    else {
      let data: any = {
        CampaignScheduleId: this.updateCampaignSchedule.campaignScheduleId,
        TenantId: this.updateCampaignSchedule.tenantId,
        InvitedUserEmails: this.inviteUserForm.get('candidateEmails').value,
        HasCloudBasedAssessment: this.updateCampaignSchedule.hasCloudBasedAssessment
      };
      const formData = new FormData();
      if (this.file) {
        formData.append('File', this.file, this.file.name);
      }
      else {
        formData.append('File', null);
      }
      formData.append('Input', JSON.stringify(data));
      this.campaignService.UpdateCampaignScheduleInvites(formData).subscribe(res => {
        if (res && res.result) {
          this.toastrService.success(Constants.usersHavebeenInvitedSuccessfully);
          this.clearAll();
        }
        else {
          this.toastrService.warning(Constants.userInviteFailed);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }

  }

  clearAll() {
    this.modalService.dismissAll();
  }
}
