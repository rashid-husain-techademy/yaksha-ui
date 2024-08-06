import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRoles } from '@app/enums/user-roles';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { CampaignDate, CampaignDetail, CampaignDetailDto, CampaignRequestDto, CampaignResultDto, CampaignSchedule, CampaignSchedulesListDto, UpdateCampaignSchedule, campaignDetailRequestDto } from '../campaign';
import { AppSessionService } from '@shared/session/app-session.service';
import { CampaignService } from '../campaign.service';
import { AssessmentStatus, CatalogAssessmentType } from '@app/enums/assessment';
import { ToastrService } from 'ngx-toastr';
import { ApiClientService } from '@app/service';
import { UserService } from '@app/admin/users/users.service';
import { AllTenants } from '@app/admin/users/users';
import { tenantDetailsDto } from '@app/admin/tenants/tenant-detail';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Permissions } from '@shared/roles-permission/permissions';
import { Helper } from '@app/shared/helper';

@Component({
  selector: 'app-list-campaign',
  templateUrl: './list-campaign.component.html',
  styleUrls: ['./list-campaign.component.scss']
})
export class ListCampaignComponent implements OnInit {
  pageSize: number = 15;
  maxSize: number = 5;
  allPageIndex: number = 1;
  allSkipCount: number = 0;
  allMaxResultCount: number = 15;
  allTotalCount: number = 0;
  scheduledPageIndex: number = 1;
  scheduledSkipCount: number = 0;
  scheduledMaxResultCount: number = 15;
  scheduledTotalCount: number = 0;
  publishedPageIndex: number = 1;
  publishedSkipCount: number = 0;
  publishedMaxResultCount: number = 15;
  publishedTotalCount: number = 0;
  draftPageIndex: number = 1;
  draftSkipCount: number = 0;
  draftMaxResultCount: number = 15;
  draftTotalCount: number = 0;
  totalCount: number = 0;
  viewCount: number = 0;
  noCampaignsFound: boolean = false;
  searchString: string = "";
  constants = Constants;
  isGridView: boolean = true;
  dropdownList = [];
  status: AssessmentStatus = null;
  userRole: string;
  userRoles = UserRoles;
  permissions: any;
  tenantId: number;
  campaignsData: CampaignResultDto;
  campaigns: CampaignDetailDto[] = [];
  assessmentStatus = AssessmentStatus;
  isScheduled: boolean;
  tenants: AllTenants[] = [];
  tenantDetails: tenantDetailsDto[];
  campaignType = CatalogAssessmentType;
  campaignDetail: CampaignDetail;
  showMasterSchedule: boolean = false;
  campaignsOverAllDuration: number;
  campaignDate: CampaignDate;
  currentDate: string = new Date().toISOString();
  campaignId: number;
  scheduleCount: number = 0;
  schedulesList: CampaignSchedule[];

  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dataService: dataService,
    private appSessionService: AppSessionService,
    private campaignService: CampaignService,
    private toastrService: ToastrService,
    private apiClientService: ApiClientService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    if (this.userRole === UserRoles[1]) {
      this.getAllTenants();
    }
    else if (this.userRole === UserRoles[2]) {
      this.tenantId = this.appSessionService.tenantId;
    }
    this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
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

  tenantSelection(event) {
    this.tenantId = event.id;
    this.getCampaignsBySearchString();
  }

  getCampaigns(skipCount: number, maxResultCount: number, pageIndex: number) {
    this.campaigns = [];
    let status = this.status;
    if (this.isScheduled) {
      status = AssessmentStatus.Scheduled;
    }
    let campaignRequest: CampaignRequestDto = {
      TenantId: this.tenantId,
      CampaignStatus: status,
      SearchString: encodeURIComponent(this.searchString),
      SkipCount: skipCount,
      MaxResultCount: maxResultCount,
    };
    this.campaignService.getCampaigns(campaignRequest).subscribe(res => {
      this.campaignsData = res.result;
      if (res.result) {
        if (this.userRole === UserRoles[1]) {
          this.campaignsData.campaigns.forEach(x => {
            x.isOwned = !this.tenantId ? true : x.type === this.campaignType.Shared ? true : false;
            let modules = JSON.parse(x.totalModules);
            x.assessments = modules.Assessments ? modules.Assessments : 0;
            x.virtutors = modules.virtutors ? modules.virtutors : 0;
            this.campaigns.push(x);
          });
        }
        else if (this.permissions[Permissions.assesmentsManageAll]) {
          this.campaignsData.campaigns.forEach(x => {
            x.isOwned = x.type === this.campaignType.Owned ? true : false;
            let modules = JSON.parse(x.totalModules);
            x.assessments = modules.Assessments ? modules.Assessments : 0;
            x.virtutors = modules.virtutors ? modules.virtutors : 0;
            this.campaigns.push(x);
          });
        }

        if (this.isScheduled)
          this.scheduledTotalCount = res.result.totalCount;
        else if (this.status === AssessmentStatus.Published && !this.isScheduled)
          this.publishedTotalCount = res.result.totalCount;
        else if (this.status === AssessmentStatus.Draft)
          this.draftTotalCount = res.result.totalCount;
        else {
          this.allTotalCount = res.result.totalCount;
        }

        if (res.result.campaigns.length === maxResultCount) {
          this.viewCount = maxResultCount * pageIndex;
        }
        else if (res.result.campaigns.length < maxResultCount) {
          this.viewCount = ((pageIndex - 1) * maxResultCount) + (res.result.campaigns.length % maxResultCount);
        }
        if (res.result.totalCount === 0) {
          this.noCampaignsFound = true;
        }
        else {
          this.noCampaignsFound = false;
        }
      }
      else {
        this.noCampaignsFound = true;
        this.campaigns = [];
        if (this.isScheduled)
          this.scheduledTotalCount = 0;
        else if (this.status === AssessmentStatus.Published && !this.isScheduled)
          this.publishedTotalCount = 0;
        else if (this.status === AssessmentStatus.Draft)
          this.draftTotalCount = 0;
        else {
          this.allTotalCount = 0;
        }
        this.viewCount = 0;
      }
    });
  }
  hideEllipses(campaign) {
    return campaign.status === this.assessmentStatus.Published ||
      (campaign.isOwned && campaign.status === this.assessmentStatus.Draft) ||
      (campaign.isOwned && campaign.status === this.assessmentStatus.Published) ||
      (this.userRole === this.userRoles[1] && !this.tenantId && campaign.status === this.assessmentStatus.Published) ||
      (this.userRole === this.userRoles[1] && this.tenantId && campaign.isOwned);
  }

  changePage() {
    if (this.isScheduled) {
      this.scheduledSkipCount = (this.scheduledPageIndex - 1) * this.pageSize;
      this.scheduledMaxResultCount = this.pageSize;
      this.getCampaigns(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = (this.publishedPageIndex - 1) * this.pageSize;
      this.publishedMaxResultCount = this.pageSize;
      this.getCampaigns(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = (this.draftPageIndex - 1) * this.pageSize;
      this.draftMaxResultCount = this.pageSize;
      this.getCampaigns(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else {
      this.allSkipCount = (this.allPageIndex - 1) * this.pageSize;
      this.allMaxResultCount = this.pageSize;
      this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  getCampaignsBySearchString() {
    this.clear();
  }

  clear() {
    if (this.isScheduled) {
      this.scheduledSkipCount = 0;
      this.scheduledMaxResultCount = 15;
      this.scheduledPageIndex = 1;
      this.getCampaigns(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = 0;
      this.publishedMaxResultCount = 15;
      this.publishedPageIndex = 1;
      this.getCampaigns(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = 0;
      this.draftMaxResultCount = 15;
      this.draftPageIndex = 1;
      this.getCampaigns(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else {
      this.allSkipCount = 0;
      this.allMaxResultCount = 15;
      this.allPageIndex = 1;
      this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  reset() {
    this.campaigns = [];
    this.searchString = "";
    this.tenantId = 0;
    this.tenantDetails = [];
    this.clear();
  }

  onKey(event: any): void {
    if (!event.target.value)
      this.clear();
  }

  updateStatus(campaign: CampaignDetailDto, assessmentStatus: AssessmentStatus) {
    let warningMessage = "";
    if (assessmentStatus === AssessmentStatus.Draft) {
      warningMessage = campaign.hasActiveSchedules ? Constants.driveHasActiveSchedules : Constants.areYouSureYouWantToMoveToDraft + campaign.name + " " + Constants.toDraft;
    }
    else {
      warningMessage = Constants.areYouSureYouWantToPublish + campaign.name;
    }
    abp.message.confirm(
      this.l('DriveStatusUpdateWarningMessage', `${warningMessage}?`),
      (result: boolean) => {
        if (result) {
          let data = {
            campaignId: campaign.id,
            status: assessmentStatus
          };
          this.campaignService.updateCampaignStatusAsync(data).subscribe(res => {
            if (res.result) {
              this.apiClientService.reloadCache("");
              this.status = assessmentStatus;
              let message = assessmentStatus === this.assessmentStatus.Published ? Constants.drivePublishedSuccessfully : Constants.driveMovedToDraftSuccessfully;
              this.toastrService.success(message);
              this.updateView();
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });
  }

  editCampaign(id: number) {
    this.router.navigate(['../create-drive', btoa(id.toString())], { relativeTo: this.activateRoute });
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  deleteCamapign(campaign: CampaignDetailDto): void {
    abp.message.confirm(
      this.l('DriveDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${campaign.name}" ${Constants.drive}?`),
      (result: boolean) => {
        if (result) {
          this.campaignService.deleteCampaign(campaign.id).subscribe(res => {
            if (res.result) {
              this.apiClientService.reloadCache("");
              this.toastrService.success(Constants.driveDeletedSuccessfully);
              this.updateView();
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

  getCampaignsByStatus(status: AssessmentStatus, isScheduled: boolean = false) {
    this.status = !status ? null : status;
    this.isScheduled = false;
    if (isScheduled) {
      this.isScheduled = true;
      this.getCampaigns(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !isScheduled)
      this.getCampaigns(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    else if (this.status === AssessmentStatus.Draft)
      this.getCampaigns(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    else
      this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
  }

  updateView(isDelete: boolean = false) {
    this.totalCount = 0;
    this.campaigns = [];
    if (!this.status && isDelete) {
      this.allSkipCount = 0;
      this.allMaxResultCount = 15;
      this.allPageIndex = 1;
      this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
    else if (this.isScheduled) {
      this.scheduledSkipCount = 0;
      this.scheduledMaxResultCount = 15;
      this.scheduledPageIndex = 1;
      this.getCampaigns(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = 0;
      this.publishedMaxResultCount = 15;
      this.publishedPageIndex = 1;
      this.getCampaigns(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = 0;
      this.draftMaxResultCount = 15;
      this.draftPageIndex = 1;
      this.getCampaigns(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else {
      this.allSkipCount = 0;
      this.allMaxResultCount = 15;
      this.allPageIndex = 1;
      this.getCampaigns(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  getCampaignSchedules(id: number) {
    let data: CampaignSchedulesListDto = {
      campaignId: id,
      skipCount: (this.scheduledPageIndex - 1) * this.scheduledPageIndex,
      maxResultCount: this.scheduledPageIndex
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

  scheduleCampaign(campaign, isUpdate: boolean) {
    if (this.showMasterSchedule) {
      if (this.campaignDate.endDateTime == this.currentDate) {
        this.toastrService.warning(this.constants.pleaseExtendTheScheduleValidityOfAssessmentsOrReSchedule);
        return;
      }
      if (campaign.hasActiveSchedules) {
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
                    this.router.navigate([`../schedule-drive`, btoa(JSON.stringify(campaign.id)), btoa(JSON.stringify(campaign.name)), btoa(JSON.stringify(isUpdate)), btoa(JSON.stringify(this.campaignsOverAllDuration)), btoa(JSON.stringify(null)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(this.campaignDate))], { relativeTo: this.activateRoute });
                  }, 1000);

                }
              },
                error => {
                  this.toastrService.error(Constants.somethingWentWrong);
                });
            }
          });
      } else {
        this.router.navigate([`../schedule-drive`, btoa(JSON.stringify(campaign.id)), btoa(JSON.stringify(campaign.name)), btoa(JSON.stringify(isUpdate)), btoa(JSON.stringify(this.campaignsOverAllDuration)), btoa(JSON.stringify(null)), btoa(JSON.stringify(this.tenantId)), btoa(JSON.stringify(this.campaignDate))], { relativeTo: this.activateRoute });
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseCreateSchedulesForAllTheDriveAssessmentsToScheduleTheDrive);
    }
  }
  getCampaignDetail(campaign) {
    if (this.userRole === UserRoles[1])
      this.getTenantId(campaign.id);
    this.getCampaignSchedules(campaign.id);
    let data: campaignDetailRequestDto = {
      campaignId: campaign.id,
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
        this.scheduleCampaign(campaign, false);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getTenantId(id: number) {
    this.campaignService.getTenantsByCampaignId(id).subscribe(res => {
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

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  createCampaign() {
    this.router.navigate(['../create-drive'], { relativeTo: this.activateRoute });
  }

  redeirectToAssignCampaign() {
    this.router.navigate(['../list-drive'], { relativeTo: this.activateRoute });
  }

  viewCampaign(id: number) {
    this.router.navigate(['../view-drive', btoa(id.toString())], { relativeTo: this.activateRoute });
  }
}
