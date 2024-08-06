import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AssessmentService } from '../assessment.service';
import { AssessmentDetail, AssessmentSchedule, AssessmentScheduleFilter, AssessmentSections, UpdateAssessmentSchedule, AssessmentStatusUpdateDto, SortOrderUpdateDto, DeleteSectionRequestDto, DeleteSectionSkillRequestDto, HackathonLeaderBoardRequest, HackathonLeaderBoard, SectionSkills, GetRegisteredUsersRequest, RegisteredUsersResult, RegisteredUserData, ExportHackathonReportDto, AssessmentSlots } from '../assessment';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '../../../models/constants';
import { AdaptiveAssessmentType, AssessmentStatus, AssessmentType, ScheduleTarget, ScheduleType, UserAssessmentStatus, ViewAssessmentTabs } from '@app/enums/assessment';
import { ToastrService } from 'ngx-toastr';
import { AssessmentOperationComponent } from '../assessment-operation/assessment-operation.component';
import { Helper } from '@app/shared/helper';
import { formatDate } from '@angular/common';
import { AppSessionService } from '@shared/session/app-session.service';
import { ScheduleInviteComponent } from '../schedule-invite/schedule-invite.component';
import { ApiClientService } from '@app/service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { CookieService } from 'ngx-cookie-service';
import { FileUploadComponent } from '@app/admin/shared/file-upload/file-upload.component';
import { FileUploadType, UploadType } from '@app/enums/file-upload-type';
import { ReportFilter } from '@app/admin/reports/reports';
import { ReportsService } from '@app/admin/reports/reports.service';

@Component({
  selector: 'app-view-assessment',
  templateUrl: './view-assessment.component.html',
  styleUrls: ['./view-assessment.component.scss']
})

export class ViewAssessmentComponent implements OnInit, OnDestroy {
  constants = Constants;
  assessmentStatus = AssessmentStatus;
  scheduleTarget = ScheduleTarget;
  statusToUpdate: AssessmentStatus;
  assessmentId: number;
  assessmentDetail: AssessmentDetail;
  assessmentSections: AssessmentSections[];
  updateSortOrders: SortOrderUpdateDto[] = [];
  buttonText: string;
  isShow: boolean = true;
  pageSizes: number[] = [5, 10, 15];
  maxSize: number = 5;
  schedulesList: AssessmentSchedule[];
  selectedSchedule: AssessmentSchedule;
  currentDate: string = new Date().toISOString();
  categories: string;
  schedulePageIndex: number = 1;
  schedulePageSize: number = 5;
  scheduleCount: number = 0;
  leaderBoardPageIndex: number = 1;
  leaderBoardPageSize: number = 10;
  leaderBoardCount: number = 0;
  maxLeaderBoardSize: number = 10;
  leaderBoardpageSizes: number[] = [10, 25, 50];
  hackathonLeaderBoard: HackathonLeaderBoard;
  active: number = ViewAssessmentTabs.Description;
  userRole: string;
  userRoles = UserRoles;
  isStackAssessment: boolean;
  isCloudAssessment: boolean;
  isVMBasedAssessment: boolean;
  scheduleType = ScheduleType;
  searchString: string = '';
  assessmentType = AssessmentType;
  skillType: string;
  regression: number;
  progression: number;
  skillName: string;
  extendLinkValidity: boolean = true;
  isCodingAssessment: boolean;
  isMCQAssessment: boolean;
  registeredUsersResult: RegisteredUsersResult;
  registeredUsers: RegisteredUserData[] = [];
  registeredUserPageIndex: number = 1;
  registeredUserPageSize: number = 5;
  registeredUserCount: number = 0;
  maxRegisteredUserSize: number = 5;
  registeredUsersPageSizes: number[] = [5, 10, 15];
  noActiveSchedules: boolean = false;
  isSubjectiveAssessment: boolean;
  isUploadType: boolean;
  invitedUsers: any;
  isCloneSchedule: boolean = false;
  slotData: AssessmentSlots[] = [];


  constructor(private reportService: ReportsService,
    private activateRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private assessmentService: AssessmentService,
    private cookieService: CookieService,
    private router: Router,
    private modalService: NgbModal,
    private appSessionService: AppSessionService,
    private apiClientService: ApiClientService,
    private dataService: dataService
  ) {
  }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.assessmentId = parseInt(atob(params['id']));
        this.getAssessmentDetail();
      }
      if (params['activePage']) {
        this.active = parseInt(atob(params['activePage']));
        if (this.active === ViewAssessmentTabs.Schedule)
          this.getAssessmentSchedules();
      }
    });
    this.reset();
  }

  getScheduleStatus(schedule: AssessmentSchedule) {
    this.assessmentService.getScheduleStatus(schedule.tenantId, schedule.id).subscribe(res => {
      if (res && res.result) {
        let completed = res.result.find(x => x.status === UserAssessmentStatus.Completed).count;
        let evaluationPending = res.result.find(x => x.status === UserAssessmentStatus.EvaluationPending).count;
        let inProgress = res.result.find(x => x.status === UserAssessmentStatus.InProgress).count;
        abp.message.info(`Completed = ${completed}\nEvaluation Pending = ${evaluationPending}\nIn Progress = ${inProgress}`,
          this.assessmentDetail.name);
      }
    }, error => {
      this.toastrService.warning(Constants.errorInRetrievingScheduleStatus);
      console.error(error);
    });
  }

  showInvitedCandidates(scheduleId: number, tenantId: number) {
    this.assessmentService.getUserAssessmentScheduleInviteEmails(scheduleId, tenantId).subscribe(res => {
      if (res && res.result) {
        this.invitedUsers = res.result;
      }
    }, error => {
      this.toastrService.warning(Constants.errorInRetrievingInvitedCandidates);
      console.error(error);
    });
  }

  openInvitedUsers(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }
  openAssessmentSlots(slotContent: TemplateRef<any>) {
    this.modalService.open(slotContent, { centered: true });
  }

  updateSectionSortOrder() {
    let assessmentSections = this.assessmentSections;
    for (let i = 0; i < assessmentSections.length; i++) {
      let data: SortOrderUpdateDto = {
        assessmentSectionId: assessmentSections[i].id,
        sortOrder: i + 1
      };
      this.updateSortOrders.push(data);
    }
    this.assessmentService.updateSectionSortOrder(this.updateSortOrders).subscribe(res => {
      if (res.result) {
        this.toastrService.success(Constants.sectionSortOrderUpdatedSuccessfully);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  drop(event: CdkDragDrop<AssessmentSections[]>) {
    if (this.assessmentDetail.assessmentStatus === this.assessmentStatus.Draft) {
      this.isShow = false;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.assessmentSections = event.container.data;
    }
    else {
      this.toastrService.warning(Constants.moveToDraftToEditAssessment);
    }
  }

  schedule(): void {
    if (this.assessmentDetail.totalApprovedQuestions > 0) {
      if (this.assessmentDetail.hasActiveSchedules === true && this.assessmentDetail.assessmentType === AssessmentType.Hackathon) {
        abp.message.confirm(
          this.l('scheduleHackathonConfirmationMessage', `${Constants.scheduleHackathonConfirmationMessage}`),
          (result: boolean) => {
            if (result) {
              this.openSchedule();
            }
          }
        );
      }
      else {
        this.openSchedule();
      }
    }
    else {
      this.toastrService.warning(Constants.noAcceptedQuestions);
    }
  }

  openSchedule(): void {
    this.router.navigate([`../../schedule-assessment`, btoa(JSON.stringify(this.assessmentId)), btoa(JSON.stringify(this.isStackAssessment)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(this.isCodingAssessment)), btoa(JSON.stringify(this.isMCQAssessment)), btoa(JSON.stringify({ callFromCampaign: false })), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType))], { relativeTo: this.activateRoute });
  }

  getAssessmentSchedules() {
    let data: AssessmentScheduleFilter = {
      AssessmentId: this.assessmentId,
      TenantId: this.appSessionService.tenantId,
      SkipCount: (this.schedulePageIndex - 1) * this.schedulePageSize,
      MaxResultCount: this.schedulePageSize
    };
    this.assessmentService.getAllAssessmentSchedule(data).subscribe(res => {
      if (res.result && res.result.totalCount) {
        this.scheduleCount = res.result.totalCount;
        this.schedulesList = res.result.assessmentSchedules;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }
  getAssessmentSlots(assessmentScheduleId: number) {
    let data = {
      assessmentScheduleId: assessmentScheduleId
    };
    this.assessmentService.getAssessmentSlots(data).subscribe(res => {
      if (res.result) {
        this.slotData = res.result;

      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  changePageSize() {
    this.schedulePageIndex = 1;
    this.getAssessmentSchedules();
  }

  changeLeaderBoardPageSize(): void {
    this.leaderBoardPageIndex = 1;
    this.getLeaderBoardDetails();
  }

  loadPage() {
    this.getAssessmentSchedules();
  }

  changeLeaderBoard(): void {
    this.getLeaderBoardDetails();
  }

  changeRegisteredUserPageSize(): void {
    this.registeredUserPageIndex = 1;
    this.getRegisteredUsers();
  }

  changeRegisteredUser(): void {
    this.getRegisteredUsers();
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll(false);
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

  formattedDateTime(date: Date) {
    if (date) {
      return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'MMM d, y, h:mm a', 'en_US');
    }
    else
      return "-";
  }

  exportHackathonReport(tenantId: number, scheduleId: number) {
    let data: ExportHackathonReportDto = {
      tenantId: tenantId,
      scheduleId: scheduleId
    }
    this.assessmentService.exportHackathonReport(data).subscribe(res => {
      if (res && res.result)
        this.toastrService.info(Constants.reportWillBeSentThroughMail);
      else
        this.toastrService.warning(Constants.failedToFetchReportAtThisInstanceOfTime);
    })
  }

  getAssessmentDetail() {
    this.assessmentService.getAssessmentDetail(this.assessmentId).subscribe(res => {
      if (res.result) {
        this.assessmentDetail = res.result;
        this.checkAssesmentQuestionType();
        this.checkIsCodingAssessment();
        this.categories = this.assessmentDetail.categories.map(x => x.name).join(', ');
        if (this.assessmentDetail.assessmentStatus === AssessmentStatus.Published) {
          this.buttonText = Constants.draftButtonText;
        }
        else {
          this.buttonText = Constants.publishButtonText;
        }
        if (res.result.assessmentSections.length > 0 && res.result.assessmentSections[0].sectionSkills.length > 0) {
          this.skillName = res.result.assessmentSections[0].sectionSkills[0].skillName;
        }
        if (this.assessmentDetail.assessmentType === AssessmentType.Adaptive) {
          this.skillType = (this.assessmentDetail.skillType === AdaptiveAssessmentType.SingleSkill) ? Constants.singleSkill : Constants.multiSkill;
          if (this.assessmentDetail.skillType === AdaptiveAssessmentType.SingleSkill) {
            this.categories = this.assessmentDetail.categories.map(x => x.name)[0];
          }
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getReportData(tenantId: number, scheduleId: number): void {
    tenantId = this.dataService.isSuperAdmin() ? tenantId : this.appSessionService.tenantId;
    let data: ReportFilter = {
      isExport: true,
      assessmentName: this.assessmentDetail.name,
      assessmentStatus: undefined,
      userName: '',
      assessmentStartDate: undefined,
      assessmentEndDate: undefined,
      tenantName: '',
      tenantId: tenantId,
      timeZone: undefined,
      startDate: undefined,
      endDate: undefined,
      isExportSfa: false,
      IsCloudBasedAssessment: this.isCloudAssessment,
      isAdaptiveAssessmentReport: this.assessmentDetail.assessmentType === AssessmentType.Adaptive ? true : false,
      selectedTestPurposeScheduleIds: scheduleId.toString()
    };
    if (this.isCloudAssessment) {
      this.toastrService.info(this.constants.yourReportIsBeingCreatedItwillBeSentToYouAsACloudReportTypeThroughEmailOnceItsReady);
      this.downloadReport(data);
    }
    else if (this.isStackAssessment) {
      this.toastrService.info(this.constants.yourReportIsBeingCreatedItwillBeSentToYouAsAStackReportTypeThroughEmailOnceItsReady);
      this.downloadStackReport(data);
    }
    else {
      if (this.assessmentDetail.assessmentType === AssessmentType.Adaptive) {
        this.toastrService.info(this.constants.yourReportIsBeingCreatedItwillBeSentToYouAsAAdaptiveReportTypeThroughEmailOnceItsReady);
      }
      else {
        this.toastrService.info(this.constants.yourReportIsBeingCreatedItwillBeSentToYouAsAMcqReportTypeThroughEmailOnceItsReady);
      }
      this.downloadReport(data);
    }
  }



  downloadReport(data: ReportFilter) {
    this.reportService.exportReportData(data).subscribe(res => {
    }, error => {
      this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      return;
    });
  }

  downloadStackReport(data: ReportFilter) {
    this.reportService.exportStackReportData(data).subscribe(res => {
    }, error => {
      this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      return;
    });
  }

  checkAssesmentQuestionType(): void {
    this.isStackAssessment = false;
    this.isCloudAssessment = false;
    this.isVMBasedAssessment = false;
    this.assessmentService.getAssessmentQuestionType(this.assessmentId).subscribe(res => {
      if (res.success) {
        this.isStackAssessment = res.result.isStack;
        this.isCloudAssessment = res.result.isCloud;
        this.isVMBasedAssessment = res.result.isVmBased;
        this.isSubjectiveAssessment = res.result.isSubjective;
        this.isUploadType = res.result.isUploadType;
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

  editAssessment(id: number) {
    let navigatedFrom = Constants.viewAssessment;
    if (this.assessmentDetail.assessmentType === AssessmentType.Adaptive) {
      return this.router.navigate(['../../create-adaptive-assessment', btoa(id.toString()), btoa(navigatedFrom)], { relativeTo: this.activateRoute });
    }
    return this.router.navigate(['../../create-assessment', btoa(id.toString()), btoa(navigatedFrom)], { relativeTo: this.activateRoute });
  }

  updateTenantLogo(schedule: AssessmentSchedule) {
    const modalRef = this.modalService.open(FileUploadComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.fileUploadData = {
      title: "Update Tenant Logo",
      supportedTypes: ["image/jpg", "image/jpeg", "image/png"],
      uploadType: UploadType.ImageUpload,
      subUploadType: FileUploadType.HackathonScheduleLogo,
      supportedTypesMessage: Constants.onlyPngJpgFilesAreAccepted,
      uploadApiPath: "yaksha/Assessment/UpdateScheduleLogoAsync",
      scheduleId: schedule.id,
      existingImageUrl: schedule.tenantLogoUrl,
      errorMessage: Constants.onlyPngJpgFilesAreAccepted,
    };
    modalRef.dismissed.subscribe(result => {
      if (result)
        this.changePageSize();
    });
  }

  onStatusChange(schedule: AssessmentSchedule) {
    if (!schedule.disableActivation) {
      if (this.assessmentDetail.assessmentType !== AssessmentType.Hackathon) {
        this.showWarningAndUpdateScheduleStatus(schedule);
      }
      else {
        if (!schedule.isActive && this.assessmentDetail.hasActiveSchedules) {
          abp.message.confirm(
            this.l('InstanceIsActiveWarningMessage', Constants.inActiveHackathonConfirmationMessage),
            (result: boolean) => {
              if (result) {
                let data: UpdateAssessmentSchedule = {
                  AssessmentScheduleId: schedule.id,
                  tenantId: schedule.tenantId,
                  assessmentId: this.assessmentId,
                  IsActive: !schedule.isActive
                };
                this.assessmentService.updateInActiveRemainingSchedulesAsync(data).subscribe(res => {
                  if (res && res.success) {
                    schedule.isActive = !schedule.isActive;
                    this.assessmentDetail.hasActiveSchedules = this.schedulesList.every(x => x.isActive === false) ? false : true;
                    this.toastrService.success(Constants.assessmentScheduleStatusUpdated);
                    this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
                    this.getAssessmentSchedules();
                  }
                },
                  error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                  });
              }
            });
        }
        else if (schedule.isActive && schedule.scheduleType == ScheduleType.SelfRegistration) {
          this.assessmentService.getUserInviteStatusAsync(schedule.id).subscribe(res => {
            if (res && res.result) {
              abp.message.confirm(
                this.l('UserRegistrationActiveWarningMessage', Constants.usersRegisteredMessage),
                (result: boolean) => {
                  if (result) {
                    this.updateScheduleStatus(schedule);
                  }
                });
            }
            else {
              this.showWarningAndUpdateScheduleStatus(schedule);
            }
          })
        }
        else {
          this.showWarningAndUpdateScheduleStatus(schedule);
        }
      }
    }
  }


  showWarningAndUpdateScheduleStatus(schedule: AssessmentSchedule) {
    let message = schedule.isActive ? Constants.inActive : Constants.active;
    abp.message.confirm(
      this.l('InstanceIsActiveWarningMessage', Constants.doYouWantToMarkScheduleAs + message + " ?"),
      (result: boolean) => {
        if (result) {
          this.updateScheduleStatus(schedule);
        }
      });
  }

  updateScheduleStatus(schedule: AssessmentSchedule) {
    let data: UpdateAssessmentSchedule = {
      AssessmentScheduleId: schedule.id,
      tenantId: schedule.tenantId,
      assessmentId: this.assessmentId,
      IsActive: !schedule.isActive
    };
    this.assessmentService.updateAssessmentScheduleAsync(data).subscribe(res => {
      if (res && res.success) {
        if (res.result) {
          schedule.isActive = !schedule.isActive;
          this.assessmentDetail.hasActiveSchedules = this.schedulesList.every(x => x.isActive === false) ? false : true;
          this.toastrService.success(Constants.assessmentScheduleStatusUpdated);
        }
        else if (data.IsActive)
          this.toastrService.error(Constants.thisScheduleCanNotMadeActive);
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

  scheduleInvite(schedule: AssessmentSchedule) {
    if (!schedule.endDateTime || this.currentDate <= schedule.endDateTime.toString() && schedule.isActive) {
      const modalRef = this.modalService.open(ScheduleInviteComponent, {
        centered: true,
        backdrop: 'static'
      });
      modalRef.componentInstance.updateSchedule = {
        assessmentScheduleId: schedule.id,
        assessmentName: this.assessmentDetail.name,
        tenantId: schedule.tenantId,
        categoryName: this.categories,
        totalQuestions: this.assessmentDetail.totalQuestions,
        scheduleType: schedule.scheduleType,
        isCloud: this.isCloudAssessment
      };
    }
    else if (!schedule.isActive) {
      this.toastrService.warning(Constants.scheduleIsNotActiveToInviteUsers);
    }
    else {
      this.toastrService.warning(Constants.scheduleHasBeenExpired);
    }
  }

  updateStatus(id: number) {
    let warningMessage = "";
    if (this.assessmentDetail.assessmentStatus === AssessmentStatus.Published) {
      warningMessage = this.assessmentDetail.hasActiveSchedules ? Constants.assessmentHasActiveSchedules : Constants.areYouSureYouWantToMoveToDraft;
    }
    else {
      warningMessage = !this.assessmentDetail.totalSections ? Constants.noQuestionsAdded : Constants.areYouSureYouWantToPublish + this.assessmentDetail.name;
    }

    abp.message.confirm(
      this.l('AssessmentStatusUpdateWarningMessage', `${warningMessage}?`),
      (result: boolean) => {
        if (result) {
          this.statusToUpdate = this.assessmentDetail.assessmentStatus === AssessmentStatus.Published ? AssessmentStatus.Draft : AssessmentStatus.Published;
          let updateAssessmentStatus: AssessmentStatusUpdateDto = {
            assessmentId: id,
            status: this.statusToUpdate
          };
          this.assessmentService.updateAssessmentStatus(updateAssessmentStatus).subscribe(res => {
            if (res.result) {
              this.assessmentDetail.assessmentStatus = this.statusToUpdate;
              this.buttonText = this.assessmentDetail.assessmentStatus === AssessmentStatus.Published ? Constants.draftButtonText : Constants.publishButtonText;
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              let message = this.statusToUpdate === AssessmentStatus.Published ? Constants.assessmentPublished : Constants.assessmentMovedToDraft;
              this.toastrService.success(message);
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });
  }

  deleteSection(assessmentSectionId: number, sectionName: string): void {
    abp.message.confirm(
      this.l('AssessmentSectionDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${sectionName}" ${Constants.section}?`),
      (result: boolean) => {
        if (result) {
          let data: DeleteSectionRequestDto = {
            assessmentId: this.assessmentId,
            assessmentSectionId: assessmentSectionId
          };
          this.assessmentService.deleteSection(data).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.sectionDeletedSuccessfully);
              this.updateAssessmentMode();
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              this.getAssessmentDetail();
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          );
        }
      });
  }

  deleteSectionSkill(assessmentSectionId: number, assessmentSectionSkillId: number, skillName: string): void {
    abp.message.confirm(
      this.l('AssessmentSectionSkillDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${skillName}" ${Constants.skill}?`),
      (result: boolean) => {
        if (result) {
          let data: DeleteSectionSkillRequestDto = {
            assessmentId: this.assessmentId,
            assessmentSectionId: assessmentSectionId,
            assessmentSectionSkillId: assessmentSectionSkillId
          };
          this.assessmentService.deleteSectionSkill(data).subscribe(res => {
            if (res && res.result) {
              this.toastrService.success(Constants.skillDeletedSuccessfully);
              this.updateAssessmentMode();
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              this.getAssessmentDetail();
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });
  }

  updateAssessmentMode(): void {
    this.assessmentService.updateAssessmentMode(this.assessmentId)
      .subscribe(res => {
        if (!res.success || !res.result) {
          this.toastrService.error(this.constants.somethingWentWrongWhileUpdatingAssessmentMode);
        }
      });
  }

  deleteAssessment(id: number): void {
    abp.message.confirm(
      this.l('AssessmentDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${this.assessmentDetail.name}" ${Constants.assessment}?`),
      (result: boolean) => {
        if (result) {
          this.assessmentService.deleteAssessment(id).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.assessmentDeletedSuccessfully);
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              this.router.navigate(['../../list-assessment'], { relativeTo: this.activateRoute });
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          );
        }
      });
  }

  openAssessmentOperation(action: string, assessmentSectionId: number | null = null, assessmentSectionSkillId: number | null = null) {
    const modalRef = this.modalService.open(AssessmentOperationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.assessmentData = {
      action: action,
      assessmentId: this.assessmentId,
      categoryIds: this.assessmentDetail.categories.map(x => x.id),
      assessmentSectionId: assessmentSectionId,
      assessmentSectionSkillId: assessmentSectionSkillId,
      assessmentName: this.assessmentDetail.name,
      categories: this.categories
    };
    modalRef.dismissed.subscribe(result => {
      if (result.action && result.action === Constants.reload) {
        this.reloadAssessmentOperation(result.assessmentData);
      }
      else if (result)
        this.ngOnInit();
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  testPreview() {
    let queryParam = btoa(this.assessmentId.toString());
    let currentTenantName = this.cookieService.get('tenantName');
    window.open(`${currentTenantName}/app/test-taker/test/${queryParam}`);
  }

  viewOrUpdateScheduleDetails(schedule: AssessmentSchedule, isUpdateScheduleAssessment: boolean) {
    this.router.navigate([`../../schedule-assessment`, btoa(JSON.stringify(this.assessmentId)), btoa(JSON.stringify(this.isStackAssessment)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(schedule.tenantId)), btoa(JSON.stringify(isUpdateScheduleAssessment)), btoa(JSON.stringify(this.isCodingAssessment)), btoa(JSON.stringify(this.isMCQAssessment)), btoa(JSON.stringify({ callFromCampaign: false })), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType)), btoa(JSON.stringify(this.isCloneSchedule))], { relativeTo: this.activateRoute });
  }
  extendExamTime(schedule: AssessmentSchedule) {
    this.router.navigate([`../../extra-time`, btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(schedule.tenantId)), btoa(JSON.stringify(false))], { relativeTo: this.activateRoute });
  }


  reloadAssessmentOperation(assessmentData: any) {
    const modalRef = this.modalService.open(AssessmentOperationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.assessmentData = assessmentData;
    modalRef.dismissed.subscribe(result => {
      if (result.action && result.action === Constants.reload) {
        this.reloadAssessmentOperation(result.assessmentData);
      }
      else if (result)
        this.ngOnInit();
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getRegisteredUsers(): void {
    let data: GetRegisteredUsersRequest = {
      assessmentId: this.assessmentId,
      skipCount: (this.registeredUserPageIndex - 1) * this.registeredUserPageSize,
      maxResultCount: this.registeredUserPageSize
    };
    this.assessmentService.getHackathonRegisteredUsers(data).subscribe(res => {
      if (res && res.result) {
        this.registeredUsersResult = res.result;
        this.registeredUsers = res.result.registeredUsers;
        this.registeredUserCount = this.registeredUsersResult.totalCount;
      }
      else {
        this.noActiveSchedules = true;
      }
    }, error => {
      console.error(error);
    })
  }

  getLeaderBoardDetails(): void {
    let data: HackathonLeaderBoardRequest = {
      AssessmentId: this.assessmentId,
      SearchText: this.searchString ? this.searchString.trim() : '',
      SkipCount: (this.leaderBoardPageIndex - 1) * this.leaderBoardPageSize,
      MaxResultCount: this.leaderBoardPageSize
    };
    this.assessmentService.getLeaderBoardDetails(data).subscribe(res => {
      if (res.success) {
        this.leaderBoardCount = res.result.totalCount;
        this.hackathonLeaderBoard = res.result;
        if (res.result.leaderBoardDetails !== null) {
          this.hackathonLeaderBoard.leaderBoardDetails.forEach(item => {
            item['convertedDuration'] = Helper.secondsToHm(item.duration);
          });
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  viewProfile(userId: number, tenantId: number): void {
    let queryParam = userId + '/' + tenantId;
    this.router.navigate(['../../../profile/', btoa(queryParam.toString())], { relativeTo: this.activateRoute });
  }

  search(event?: Event): void {
    this.leaderBoardPageIndex = 1;
    this.searchString = event ? (event.target as HTMLInputElement).value : this.searchString;
    this.getLeaderBoardDetails();
  }

  reset(): void {
    delete this.hackathonLeaderBoard;
    this.leaderBoardPageIndex = 1;
    this.searchString = '';
    this.getLeaderBoardDetails();
  }

  mapIdToProficiency(proficiencyId: number): string {
    let proficiencyLevelName: string;
    switch (proficiencyId) {
      case 1:
        proficiencyLevelName = Constants.beginner;
        break;
      case 2:
        proficiencyLevelName = Constants.intermediate;
        break;
      case 3:
        proficiencyLevelName = Constants.advanced;
        break;
    }
    return proficiencyLevelName;
  }

  getproficiencyLevelIdCount(section: SectionSkills, proficiencyLevelId: number) {
    let config = section?.proficiencyLevelQuestions;
    return config[proficiencyLevelId]?.totalQuestions;
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
  extendUserAttempt(schedule: AssessmentSchedule) {
    this.router.navigate([`../../update-user-attempt`, btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(schedule.tenantId))], { relativeTo: this.activateRoute });
  }

  checkAssessmentTypeToEnableAttemptIncrease(assessmentType: AssessmentType, scheduleType: ScheduleType): boolean {
    return !(assessmentType === this.assessmentType.Hackathon || assessmentType === this.assessmentType.Adaptive);
  }
  cloneSchedule(schedule: AssessmentSchedule) {
    this.isCloneSchedule = true;
    this.router.navigate([`../../schedule-assessment`, btoa(JSON.stringify(this.assessmentId)), btoa(JSON.stringify(this.isStackAssessment)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(schedule.id)), btoa(JSON.stringify(schedule.tenantId)), btoa(JSON.stringify(false)), btoa(JSON.stringify(this.isCodingAssessment)), btoa(JSON.stringify(this.isMCQAssessment)), btoa(JSON.stringify({ callFromCampaign: false })), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType)), btoa(JSON.stringify(this.isCloneSchedule))], { relativeTo: this.activateRoute });
  }
}
