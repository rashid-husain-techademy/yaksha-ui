import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserRoles } from '@app/enums/user-roles';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { AppSessionService } from '@shared/session/app-session.service';
import { CampaignService } from '../campaign.service';
import { CampaignDate, CampaignDetail, CampaignSchedule, CampaignSchedulesListDto, UpdateCampaignSchedule, campaignAssessmentDetail, campaignDetailRequestDto } from '../campaign';
import { AssessmentStatus, ScheduleTarget, ScheduleType } from '@app/enums/assessment';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentDetail, ExportHackathonReportDto, UpdateAssessmentSchedule } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { ToastrService } from 'ngx-toastr';
import { ApiClientService } from '@app/service';
import { formatDate } from '@angular/common';
import { Helper } from '@app/shared/helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleInviteComponent } from '@app/admin/assessment/schedule-invite/schedule-invite.component';
import { UserCampaignStatus } from '@app/my-assessments/my-assessments';

@Component({
  selector: 'app-view-campaign',
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.scss']
})
export class ViewCampaignComponent implements OnInit {
  constants = Constants;
  userRole: string;
  userRoles = UserRoles;
  campaignId: number;
  tenantId: number;
  active = 1;
  campaignDetail: CampaignDetail;
  totalAssessments: number;
  totalVirtutors: number;
  assessmentStatus = AssessmentStatus;
  assessmentId: number;
  isStackAssessment: boolean;
  isCloudAssessment: boolean;
  isVMBasedAssessment: boolean;
  isCodingAssessment: boolean;
  isMCQAssessment: boolean;
  assessmentDetail: AssessmentDetail;
  extendValidity: boolean = true;
  scheduleView: boolean = true;
  showMasterSchedule: boolean = false;
  campaignsOverAllDuration: number;
  schedulePageIndex: number = 1;
  schedulePageSize: number = 5;
  scheduleCount: number = 0;
  schedulesList: CampaignSchedule[];
  pageSizes: number[] = [5, 10, 15];
  maxSize: number = 5;
  extendLinkValidity: boolean = true;
  scheduleTarget = ScheduleTarget;
  scheduleType = ScheduleType;
  currentDate: string = new Date().toISOString();
  categories: string;
  statusToUpdate: AssessmentStatus;
  buttonText: string;
  campaignDate: CampaignDate;
  isSubjectiveAssessment: boolean;
  isUploadType: boolean;
  invitedUsers: any;
  isCloneSchedule: boolean = false;

  constructor(
    private appSessionService: AppSessionService,
    private activateRoute: ActivatedRoute,
    private dataService: dataService,
    private campaignService: CampaignService,
    private router: Router,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private apiClientService: ApiClientService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.campaignId = parseInt(atob(params['id']));
        this.getCampaignDetail();
      }
    });

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    if (this.userRole === this.userRoles[1]) {
      this.getAllTenants();
    }
    else {
      this.tenantId = this.appSessionService.tenantId;
    }
  }

  getAllTenants() {
    this.campaignService.getTenantsByCampaignId(this.campaignId).subscribe(res => {
      if (res.result) {
        this.tenantId = res.result[0].id;
      }
      else
        this.toastrService.warning(Constants.noTenantsFound);
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  runPlagiarism(scheduleId: number) {
    this.assessmentService.runSchedulePlagiarism(scheduleId).subscribe(
      res => {
        if (res.success && res.result.isSuccess) {
          if (res.result.errorMessage) {
            this.toastrService.error(res.result.errorMessage);
          } else {
            this.toastrService.success(this.constants.plagiarismScoreSuccessfullyUpdated);
          }
        } else {
          if (res.result?.errorMessage) {
            this.toastrService.error(res.result.errorMessage);
          } else {
            this.toastrService.error(this.constants.somethingWentWrong);
          }
        }
      });
  }

  getCampaignDetail() {
    let data: campaignDetailRequestDto = {
      campaignId: this.campaignId,
    };

    this.campaignService.getCampaignDetail(data).subscribe(res => {
      if (res.success) {
        this.campaignsOverAllDuration = 0;
        let campaignEndDate = this.currentDate;
        let campaignStartDate;
        this.campaignDetail = res.result;
        this.showMasterSchedule = this.campaignDetail.status === AssessmentStatus.Published && this.campaignDetail.campaignAssessmentDetails.filter(data => data.link === null).length <= 0;
        this.campaignDetail.campaignAssessmentDetails.forEach(data => {
          this.campaignsOverAllDuration = this.campaignsOverAllDuration + data.duration;
          campaignEndDate = Helper.convertUTCDateToLocalDate(campaignEndDate) < Helper.convertUTCDateToLocalDate(data.cutOffDateTime) ? data.cutOffDateTime : campaignEndDate;
          campaignStartDate = campaignStartDate ? (Helper.convertUTCDateToLocalDate(campaignStartDate) > Helper.convertUTCDateToLocalDate(data.startDateTime) ? data.startDateTime : campaignStartDate) : data.startDateTime;
        });
        this.campaignDate = { startDateTime: campaignStartDate, endDateTime: campaignEndDate };
        let modules = JSON.parse(this.campaignDetail.totalModules);
        this.totalAssessments = modules.Assessments ? modules.Assessments : 0;
        this.totalVirtutors = modules.Virtutors ? modules.Virtutors : 0;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  schedule(assessment: campaignAssessmentDetail) {
    if (assessment.link !== null) {
      abp.message.confirm(
        this.l('ReScheduleWarningMessage', `${Constants.assessmentAlreadyScheduledDoYouStillWantToReschedule} "${assessment.name}"?`),
        (result: boolean) => {
          if (result) {
            this.getAssessmentDetail(assessment);
            this.updateScheduleStatus(assessment);
          }
        });
    } else { this.getAssessmentDetail(assessment); }
  }

  scheduleInvite(schedule: CampaignSchedule) {
    this.campaignService.isCloudBasedCampaign(this.campaignId).subscribe(res => {
      let hasCloudBasedAssessment = res.result;
      if (!schedule.endDateTime || this.currentDate <= schedule.endDateTime.toString() && schedule.isActive) {
        const modalRef = this.modalService.open(ScheduleInviteComponent, {
          centered: true,
          backdrop: 'static'
        });
        modalRef.componentInstance.updateCampaignSchedule = {
          campaignScheduleId: schedule.id,
          campaignName: this.campaignDetail.name,
          tenantId: schedule.tenantId,
          hasCloudBasedAssessment: hasCloudBasedAssessment
        };
      }
      else if (!schedule.isActive) {
        this.toastrService.warning(Constants.scheduleIsNotActiveToInviteUsers);
      }
      else {
        this.toastrService.warning(Constants.scheduleHasBeenExpired);
      }
    })
  }

  showInvitedCandidates(scheduleId: number, tenantId: number) {
    this.campaignService.getUserAssessmentCampaignScheduleInviteEmails(scheduleId, tenantId).subscribe(res => {
      if (res && res.result) {
        this.invitedUsers = res.result;
      }
    }, error => {
      this.toastrService.warning(Constants.errorInRetrievingInvitedCandidates);
    });
  }

  openInvitedUsers(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }


  updateScheduleStatus(assessment: campaignAssessmentDetail) {
    let data: UpdateAssessmentSchedule = {
      AssessmentScheduleId: assessment.assessmentScheduleId,
      tenantId: this.tenantId,
      assessmentId: assessment.assessmentId,
      IsActive: false
    };
    this.assessmentService.updateAssessmentScheduleAsync(data).subscribe(res => {
      if (res && res.success) {
        this.toastrService.success(Constants.assessmentScheduleInActivatedSuccessfully);
      }
      this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  getAssessmentDetail(assessment: campaignAssessmentDetail, isUpdateScheduleAssessment?: boolean, isScheduleView?: boolean) {
    this.assessmentService.getAssessmentDetail(assessment.assessmentId).subscribe(res => {
      if (res.result) {
        this.assessmentDetail = res.result;
        this.checkIsCodingAssessment();
        this.checkAssesmentQuestionType(assessment, isUpdateScheduleAssessment, isScheduleView);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  openSchedule(assessment: campaignAssessmentDetail, isUpdateScheduleAssessment?: boolean, isScheduleView?: boolean) {
    const campaignDetails = { callFromCampaign: true, campaignId: this.campaignId };
    if (isUpdateScheduleAssessment || isScheduleView) {
      this.router.navigate([`../../../assessment/schedule-assessment`, btoa(JSON.stringify(assessment.assessmentId)), btoa(JSON.stringify(this.isStackAssessment)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(assessment.assessmentScheduleId)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(isUpdateScheduleAssessment)), btoa(JSON.stringify(this.isCodingAssessment)), btoa(JSON.stringify(this.isMCQAssessment)), btoa(JSON.stringify(campaignDetails)), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType)), btoa(JSON.stringify(this.isCloneSchedule))], { relativeTo: this.activateRoute });
    } else {
      this.router.navigate([`../../../assessment/schedule-assessment`, btoa(JSON.stringify(assessment.assessmentId)), btoa(JSON.stringify(this.isStackAssessment)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(this.isCodingAssessment)), btoa(JSON.stringify(this.isMCQAssessment)), btoa(JSON.stringify(campaignDetails)), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType))], { relativeTo: this.activateRoute });
    }
  }

  checkAssesmentQuestionType(assessment: campaignAssessmentDetail, isUpdateScheduleAssessment?: boolean, isScheduleView?: boolean): void {
    this.isStackAssessment = false;
    this.isCloudAssessment = false;
    this.isVMBasedAssessment = false;
    this.assessmentService.getAssessmentQuestionType(assessment.assessmentId).subscribe(res => {
      if (res.success) {
        this.isStackAssessment = res.result.isStack;
        this.isCloudAssessment = res.result.isCloud;
        this.isVMBasedAssessment = res.result.isVmBased;
        this.isSubjectiveAssessment = res.result.isSubjective;
        this.isUploadType = res.result.isUploadType;
        this.openSchedule(assessment, isUpdateScheduleAssessment, isScheduleView);
      }
    });
  }

  checkIsCodingAssessment(): void {
    this.isCodingAssessment = false;
    this.assessmentDetail.assessmentSections.forEach(x => {
      if (!this.isCodingAssessment) {
        this.isCodingAssessment = x.sectionSkills.some(y => y.totalCodingQuestions > 0);
      }
      if (!this.isMCQAssessment) {
        this.isMCQAssessment = x.sectionSkills.some(y => y.totalMCQQuestions > 0);
      }
      return;
    });
  }

  viewOrUpdateAssessmentScheduleDetails(assessment: campaignAssessmentDetail, isUpdateScheduleAssessment: boolean, isScheduleView?: boolean) {
    this.getAssessmentDetail(assessment, isUpdateScheduleAssessment, isScheduleView);
  }

  updateStatus(campaignId: number, assessmentStatus: AssessmentStatus) {
    let warningMessage = "";
    if (this.campaignDetail.status === AssessmentStatus.Published) {
      warningMessage = this.campaignDetail.hasActiveSchedule ? Constants.driveHasActiveSchedules : Constants.areYouSureYouWantToMoveToDraft + this.campaignDetail.name + " " + Constants.toDraft;;
    }
    else {
      warningMessage = `${Constants.areYouSureYouWantToPublish} ${this.campaignDetail.name}`;
    }
    abp.message.confirm(
      this.l('AssessmentStatusUpdateWarningMessage', `${warningMessage}?`),
      (result: boolean) => {
        if (result) {
          this.statusToUpdate = this.campaignDetail.status === AssessmentStatus.Published ? AssessmentStatus.Draft : AssessmentStatus.Published;
          let data = {
            campaignId: campaignId,
            status: assessmentStatus
          };
          this.campaignService.updateCampaignStatusAsync(data).subscribe(res => {
            if (res.result) {
              this.campaignDetail.status = this.statusToUpdate;
              this.buttonText = this.campaignDetail.status === AssessmentStatus.Published ? Constants.draftButtonText : Constants.publishButtonText;
              this.apiClientService.reloadCache("");
              let message = this.statusToUpdate === AssessmentStatus.Published ? Constants.drivePublishedSuccessfully : Constants.driveMovedToDraftSuccessfully;
              this.toastrService.success(message);
            }
            this.getCampaignDetail();
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });

  }

  editCampaign(id: number) {
    this.router.navigate(['../../create-drive', btoa(id.toString())], { relativeTo: this.activateRoute });
  }

  ScheduleCampaign(isUpdate: boolean) {
    this.getCampaignSchedules();
    if (this.campaignDate.endDateTime == this.currentDate) {
      this.toastrService.warning(this.constants.pleaseExtendTheScheduleValidityOfAssessmentsOrReSchedule);
      return;
    }
    if (this.campaignDetail.hasActiveSchedule) {
      abp.message.confirm(
        this.l('InstanceIsActiveWarningMessage', Constants.driveAlreadyScheduledDoYouStillWantToReschedule + Constants.continuingThisWillInactivateThePreviousSchedule + " ?"),
        (result: boolean) => {
          if (result) {
            let activeSchedule = this.schedulesList.find(x => x.isActive);
            let data: UpdateCampaignSchedule = {
              campaignScheduleId: activeSchedule.id,
              isActive: false,
              tenantId: this.tenantId
            };
            this.campaignService.updateCampaignScheduleStatus(data).subscribe(res => {
              if (res && res.success) {
                this.toastrService.success(Constants.driveScheduleInActivatedSuccessfully);
                setTimeout(() => {
                  this.router.navigate([`../../schedule-drive`, btoa(JSON.stringify(this.campaignId)), btoa(JSON.stringify(this.campaignDetail.name)), btoa(JSON.stringify(isUpdate)), btoa(JSON.stringify(this.campaignsOverAllDuration)), btoa(JSON.stringify(null)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(this.campaignDate))], { relativeTo: this.activateRoute });
                }, 1000);

              }
            },
              error => {
                this.toastrService.error(Constants.somethingWentWrong);
              });
          }
        });
    } else {
      this.router.navigate([`../../schedule-drive`, btoa(JSON.stringify(this.campaignId)), btoa(JSON.stringify(this.campaignDetail.name)), btoa(JSON.stringify(isUpdate)), btoa(JSON.stringify(this.campaignsOverAllDuration)), btoa(JSON.stringify(null)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(this.campaignDate))], { relativeTo: this.activateRoute });
    }
  }

  exportScheduleReport(tenantId: number, scheduleId: number) {
    let data: ExportHackathonReportDto = {
      tenantId: tenantId,
      scheduleId: scheduleId
    };
    this.campaignService.exportScheduleReport(data).subscribe(res => {
      if (res && res.result)
        this.toastrService.info(Constants.reportWillBeSentThroughMail);
      else
        this.toastrService.warning(Constants.failedToFetchReportAtThisInstanceOfTime);
    });
  }

  getCampaignSchedules() {
    let data: CampaignSchedulesListDto = {
      campaignId: this.campaignId,
      skipCount: (this.schedulePageIndex - 1) * this.schedulePageSize,
      maxResultCount: this.schedulePageSize
    };
    this.campaignService.getCampaignScheduleList(data).subscribe(res => {
      if (res.result && res.result.totalCount) {
        this.scheduleCount = res.result.totalCount;
        this.schedulesList = res.result.campaignSchedules;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getCampaignScheduleStatus(schedule: CampaignSchedule) {
    this.campaignService.getCampaignScheduleStatus(schedule.tenantId, schedule.id).subscribe(res => {
      if (res && res.result) {
        let completed = res.result.find(x => x.status === UserCampaignStatus.Completed).count;
        let evaluationPending = res.result.find(x => x.status === UserCampaignStatus.Failed).count;
        let inProgress = res.result.find(x => x.status === UserCampaignStatus.InProgress).count;
        abp.message.info(`In Progress = ${inProgress}\nCompleted = ${completed}\nFailed = ${evaluationPending}`,
          this.campaignDetail.name);
      }
    }, error => {
      this.toastrService.warning(Constants.errorInRetrievingScheduleStatus);
      console.error(error);
    });
  }

  changePageSize() {
    this.schedulePageIndex = 1;
    this.getCampaignSchedules();
  }

  loadPage() {
    this.getCampaignSchedules();
  }

  formattedDateTime(date: Date) {
    if (date) {
      return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'MMM d, y, h:mm a', 'en_US');
    }
    else
      return "-";
  }

  onStatusChange(schedule: CampaignSchedule) {
    if (!schedule.isActive && this.schedulesList.length > 1) {
      if (this.campaignDetail.hasActiveSchedule) {
        this.toastrService.warning(this.constants.alreadyAnActiveScheduleExistsPleaseMarkItAsInActive);
        return;
      }
      else {
        if (this.campaignDate.endDateTime == this.currentDate) {
          this.toastrService.warning(this.constants.pleaseExtendTheScheduleValidityOfAssessmentsOrReSchedule);
          return;
        }
      }
    }
    let message = schedule.isActive ? Constants.inActive : Constants.active;
    abp.message.confirm(
      this.l('InstanceIsActiveWarningMessage', Constants.doYouWantToMarkScheduleAs + message + " ?"),
      (result: boolean) => {
        if (result) {
          let data: UpdateCampaignSchedule = {
            campaignScheduleId: schedule.id,
            tenantId: schedule.tenantId,
            isActive: !schedule.isActive,
            isUpdateMetadata: !schedule.isActive
          };
          this.campaignService.updateCampaignScheduleStatus(data).subscribe(res => {
            if (res && res.success) {
              schedule.isActive = !schedule.isActive;
              this.campaignDetail.hasActiveSchedule = schedule.isActive;
              if (data.isUpdateMetadata && res.result) {
                schedule.startDateTime = res.result.startDateTime;
                schedule.endDateTime = res.result.endDateTime;
              }
              if (message === Constants.inActive)
                this.toastrService.success(Constants.driveScheduleInactivatedSuccessfully);
              else
                this.toastrService.success(Constants.driveScheduleActivatedSuccessfully);
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });
  }

  viewOrUpdateCampaignSchedule(schedule: CampaignSchedule, isUpdate: boolean) {
    this.router.navigate([`../../schedule-drive`, btoa(JSON.stringify(this.campaignId)), btoa(JSON.stringify(this.campaignDetail.name)), btoa(JSON.stringify(isUpdate)), btoa(JSON.stringify(this.campaignsOverAllDuration)), btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(this.campaignDate))], { relativeTo: this.activateRoute });
  }

  copyLink(link: string): void {
    let copyText = link;
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
  extendExamTime(schedule: CampaignSchedule) {
    this.router.navigate([`../../extra-time`, btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(schedule.tenantId)), btoa(JSON.stringify(true))], { relativeTo: this.activateRoute });
  }

}
