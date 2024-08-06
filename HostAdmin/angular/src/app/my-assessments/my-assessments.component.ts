import { Component, Injector, OnInit, Renderer2 } from '@angular/core';
import { Constants } from '@app/models/constants';
import { Assessment, PagedUserCampaigns, UserAssessmentsDetails, UserAssessmentsFilter, UserCampaignRequest, UserCampaignStatus, UserCampaigns, VmInstanceStatus } from './my-assessments';
import { MyAssessmentsService } from './my-assessments.service';
import { UserAssessmentCompletedStatus, UserAssessmentStatus, UserMyAssessmentStatus, AssessmentType } from '@app/enums/assessment';
import { AppComponentBase } from './../../shared/app-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { Helper } from '@app/shared/helper';
import { dataService } from '@app/service/common/dataService';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-my-assessments',
  templateUrl: './my-assessments.component.html',
  styleUrls: ['./my-assessments.component.scss']
})
export class MyAssessmentsComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  isGuruKashiTenant: boolean = false;
  isCognizantYakshaTenant: boolean = false;
  //common details
  tenantId: number;
  userId: number;
  userAssessmentList: UserAssessmentsDetails;
  status: UserMyAssessmentStatus = 10;
  userMyAssessmentStatus = UserMyAssessmentStatus;
  userCampaignStatus = UserCampaignStatus;
  userAssessmentStatus = UserAssessmentStatus;
  userAssessmentCompletedStatus = UserAssessmentCompletedStatus;
  assessmentType = AssessmentType;
  noAssessmentsFound: boolean = false;
  //Self Entrolled Tab 
  selfEntrolled_SelectedMyAssessmentStatus = null;
  selfEntrolled_SkipCount: number;
  selfEntrolled_MaxResultCount: number;
  selfEntrolled_SearchString: string = "";
  selfEntrolled_PageIndex: number = 1;
  selfEntrolled_PageSize: number = 10;
  selfEntrolled_PageSizes: number[] = [10, 20, 30];
  selfEntrolled_MaxSize: number = 5;
  //Invites Tab
  invites_SelectedMyAssessmentStatus = null;
  invites_SkipCount: number;
  invites_MaxResultCount: number;
  invites_SearchString: string = "";
  invites_PageIndex: number = 1;
  invites_PageSize: number = 10;
  invites_PageSizes: number[] = [10, 20, 30];
  invites_MaxSize: number = 5;
  //Invites Tab
  completed_SelectedMyAssessmentStatus = null;
  completed_SkipCount: number;
  completed_MaxResultCount: number;
  completed_SearchString: string = "";
  completed_PageIndex: number = 1;
  completed_PageSize: number = 10;
  completed_PageSizes: number[] = [10, 20, 30];
  completed_MaxSize: number = 5;
  scheduleId: string;
  emailAddress: string;
  isVisibleFilter: boolean = false;
  isCompletedStatus: boolean = false;
  isExpiredStatus: boolean = false;
  //Campaigns
  campaigns: PagedUserCampaigns;
  campaign_SelectedCampaignStatus = null;
  campaign_SkipCount: number;
  campaign_MaxResultCount: number;
  campaign_SearchString: string = "";
  campaign_PageIndex: number = 1;
  campaign_PageSize: number = 10;
  campaign_PageSizes: number[] = [10, 20, 30];
  campaign_MaxSize: number = 5;
  userCampaign: UserCampaigns;
  userCampaigns: UserCampaigns[];
  noCampaignsFound: boolean = false;
  campaignFilterStatus: any;
  activeId: number = 1;
  constructor(private myAssessmentsService: MyAssessmentsService, injector: Injector, private router: Router, private activateRoute: ActivatedRoute, private renderer: Renderer2, public dataService: dataService, private appSessionService: AppSessionService) { super(injector); }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.isGuruKashiTenant = this.dataService.isGurukashiTenant(this.appSessionService.tenantId);
    this.isCognizantYakshaTenant = this.dataService.isCognizantYakshaTenant(this.appSessionService.tenantId);
    if (this.isGuruKashiTenant) {
      this.activeId = 2;
      this.status = this.userMyAssessmentStatus.Invites;
    }
    const element = document.querySelector('[data-id="zsalesiq"]');
    if (element)
      this.renderer.setStyle(element, 'display', 'none');

    let backTo = localStorage.getItem(Constants.backToMyAssessments);
    this.tenantId = this.appSession.tenantId;
    this.userId = this.appSession.user.id;
    this.emailAddress = this.appSession.user.emailAddress;
    if (backTo && backTo == Constants.drives) {
      this.activeId = 3;
      this.getCampaigns();
      localStorage.removeItem(Constants.backToMyAssessments);
    }
    else {
      this.loadPage();
    }
  }

  getMyAssessmentsByAssessmentStatus(event) {
    this.isVisibleFilter = ((event.target.value === UserAssessmentStatus.Completed.toString()) || (event.target.value === UserAssessmentStatus.Expired.toString())) ? true : false;
    this.isCompletedStatus = event.target.value === UserAssessmentStatus.Completed.toString() ? true : false;
    this.isExpiredStatus = event.target.value === UserAssessmentStatus.Expired.toString() ? true : false;
    this.completed_SelectedMyAssessmentStatus = null;
    this.loadPage();
  }

  getMyAssessmentsByCompletedAssessmentStatus() {
    this.loadPage();
  }

  progressAssessment() {
    let queryParam = this.scheduleId + '/' + this.tenantId + '/' + this.emailAddress;
    queryParam = btoa(queryParam);
    this.router.navigate(['../../account/test-taker/pre-assessment', queryParam], { relativeTo: this.activateRoute });
  }

  retryorcontinueAssessment(assessment: Assessment) {
    this.scheduleId = assessment.assessmentScheduleIdNumber;
    this.progressAssessment();
  }

  changePageSize() {
    if (this.status === this.userMyAssessmentStatus.SelfEnrolled) {
      this.selfEntrolled_PageIndex = 1;
      this.loadPage();
    }
    else if (this.status === this.userMyAssessmentStatus.Invites) {
      this.invites_PageIndex = 1;
      this.loadPage();
    }
  }

  getUserAssessmentsDetails() {
    let data: UserAssessmentsFilter;
    this.noAssessmentsFound = false;
    this.noCampaignsFound = false;
    if (this.status === this.userMyAssessmentStatus.SelfEnrolled) {

      if (this.selfEntrolled_SelectedMyAssessmentStatus === 'null')
        this.selfEntrolled_SelectedMyAssessmentStatus = null;

      data = {
        tenantId: this.tenantId,
        userId: this.userId,
        assessmentStatusFilter: this.selfEntrolled_SelectedMyAssessmentStatus,
        assessmentStatus: this.status,
        skipCount: (this.selfEntrolled_PageIndex - 1) * this.selfEntrolled_PageSize,
        maxResultCount: this.selfEntrolled_PageSize,
        searchString: encodeURIComponent(this.selfEntrolled_SearchString),
        assessmentCompletedStatusFilter: this.completed_SelectedMyAssessmentStatus === 'null' ? null : this.completed_SelectedMyAssessmentStatus
      };
    }
    else if (this.status === this.userMyAssessmentStatus.Invites) {
      if (this.invites_SelectedMyAssessmentStatus === 'null')
        this.invites_SelectedMyAssessmentStatus = null;

      data = {
        tenantId: this.tenantId,
        userId: this.userId,
        assessmentStatusFilter: this.invites_SelectedMyAssessmentStatus,
        assessmentStatus: this.status,
        skipCount: (this.invites_PageIndex - 1) * this.invites_PageSize,
        maxResultCount: this.invites_PageSize,
        searchString: encodeURIComponent(this.invites_SearchString),
        assessmentCompletedStatusFilter: this.completed_SelectedMyAssessmentStatus === 'null' ? null : this.completed_SelectedMyAssessmentStatus
      };
    }
    this.myAssessmentsService.getMyAssessmentsList(data).subscribe(res => {
      if (res.success && res.result.totalCount) {
        this.userAssessmentList = res.result;
        if (this.isGuruKashiTenant) {
          this.userAssessmentList.assessments = this.userAssessmentList.assessments
            .filter(assessment => assessment.noOfAvailedAttempts !== 0 || assessment.status !== 70);
          this.userAssessmentList.assessments.sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

        }
        this.userAssessmentList.assessments.forEach(value => {
          value.isValid = true;
          if (value.startTime !== null) {
            value.startTime = Helper.convertUTCDateToLocalDate(Helper.getFormattedDate(new Date(value.startTime)));
            if (new Date() < new Date(Helper.getFormattedDate(new Date(value.startTime)))) {
              value.isValid = false;
            }
          }
          if (value.endTime !== null) {
            if (value.cutOffTime > 0) {
              let difference = new Date(value.startTime).getMinutes() + (value.cutOffTime);
              var cutOffDate = new Date(value.startTime);
              cutOffDate.setMinutes(difference);
              value.endTime = new Date(cutOffDate);
            }
            else
              value.endTime = Helper.convertUTCDateToLocalDate(Helper.getFormattedDate(new Date(value.endTime)));
          }
        });

      }
      else {
        this.userAssessmentList = res.result;
        this.noAssessmentsFound = true;
        this.noCampaignsFound = false;
        if (this.status === this.userMyAssessmentStatus.SelfEnrolled) {
          this.selfEntrolled_PageIndex = 1;
        }
        else if (this.status === this.userMyAssessmentStatus.Invites) {
          this.invites_PageIndex = 1;
        }
      }
    });
  }

  loadPage() {
    this.getUserAssessmentsDetails();
  }

  loadCampaignPage() {
    this.getCampaigns();
  }

  searchCampaign(): void {
    this.getCampaigns();
  }

  resetCampaign() {
    this.campaignFilterStatus = null;
    this.campaign_PageIndex = 1;
    this.campaign_PageSize = 10;
    this.campaign_SearchString = '';
    this.campaign_SelectedCampaignStatus = null;
    this.getCampaigns();
  }

  search(): void {
    this.loadPage();
  }
  reset(): void {
    if (this.status === this.userMyAssessmentStatus.SelfEnrolled) {
      this.selfEntrolled_SelectedMyAssessmentStatus = null;
      this.selfEntrolled_PageIndex = 1;
      this.selfEntrolled_PageSize = 10;
      this.selfEntrolled_SearchString = '';
    }
    else if (this.status === this.userMyAssessmentStatus.Invites) {
      this.invites_SelectedMyAssessmentStatus = null;
      this.invites_PageIndex = 1;
      this.invites_PageSize = 10;
      this.invites_SearchString = '';
    }
    this.isVisibleFilter = false;
    this.completed_SelectedMyAssessmentStatus = null;
    this.loadPage();
  }
  getMyAssessmentsByStatus(status: UserMyAssessmentStatus) {
    this.status = status;
    this.reset();
    this.getUserAssessmentsDetails();
  }
  viewAssessmentReport(id: number) {
    this.router.navigate(['./assessment-report', btoa(id.toString())], { relativeTo: this.activateRoute });
  }

  getStatusColor(assessment: Assessment): string {
    switch (assessment.status) {
      case UserAssessmentStatus.UpComing:
        return Constants.upComingLC;
        break;
      case UserAssessmentStatus.NotStarted:
        return Constants.notStartedLC;
        break;
      case UserAssessmentStatus.InProgress:
        return Constants.inProgressLC;
        break;
      case UserAssessmentStatus.Completed:
        return Constants.completedLC;
        break;
      case UserAssessmentStatus.Expired:
        if (!this.isGuruKashiTenant) {
          return Constants.expiredLC;
        }
        else if (this.isGuruKashiTenant && assessment.lastAccessed !== null) {
          return Constants.completedLC;
        }
        break;
      default:
        break;
    }
  }

  getCampaignStatusColour(userCampaign): string {
    switch (userCampaign.userCampaignStatus) {
      case UserCampaignStatus.NotStarted:
        return Constants.notStartedLC;
        break;
      case UserCampaignStatus.InProgress:
        return Constants.inProgressLC;
        break;
      case UserCampaignStatus.Completed:
        return Constants.completedLC;
        break;
      case UserCampaignStatus.Failed:
        return Constants.expiredLC;
        break;
      default:
        break;
    }
  }

  getCampaignStatusName(userCampaign): string {
    switch (userCampaign.userCampaignStatus) {
      case UserCampaignStatus.NotStarted:
        return Constants.notStarted;
        break;
      case UserCampaignStatus.InProgress:
        return Constants.inProgress;
        break;
      case UserCampaignStatus.Completed:
        return Constants.completed;
        break;
      case UserCampaignStatus.Failed:
        return Constants.notCleared;
        break;
      default:
        break;
    }
  }

  getStatusName(assessment: Assessment): string {
    switch (assessment.status) {
      case UserAssessmentStatus.UpComing:
        return Constants.upComing;
        break;
      case UserAssessmentStatus.NotStarted:
        return Constants.notStarted;
        break;
      case UserAssessmentStatus.InProgress:
        return Constants.inProgress;
        break;
      case UserAssessmentStatus.Completed:
        return Constants.completed;
        break;
      case UserAssessmentStatus.Expired:
        if (!this.isGuruKashiTenant) {
          return Constants.expired;
        }
        else if (this.isGuruKashiTenant && assessment.lastAccessed !== null) {
          return Constants.completed;
        }
        break;
      default:
        break;
    }
  }


  isCompleted(userAssessment: Assessment): boolean {
    if ((userAssessment.status === UserAssessmentStatus.Completed && (userAssessment.assessmentCompletedStatus !== UserAssessmentCompletedStatus.EvaluationPending))
      || ((userAssessment.status === UserAssessmentStatus.Expired) && userAssessment.completionDate)) {
      return true;
    }
    else
      return false;
  }

  getCampaigns() {
    const params: UserCampaignRequest = {
      skipCount: (this.campaign_PageIndex - 1) * this.campaign_PageSize,
      maxResultCount: this.campaign_PageSize,
      status: this.campaignFilterStatus,
      searchString: encodeURIComponent(this.campaign_SearchString),
    };
    this.myAssessmentsService.getUserCampaigns(params).subscribe(res => {
      this.campaigns = res.result;
      this.userCampaigns = this.campaigns.campaigns;
      if (this.campaigns.totalCount > 0) {
        this.noAssessmentsFound = false;
        this.noCampaignsFound = false;
      }
      else {
        this.noCampaignsFound = true;
        this.noAssessmentsFound = false;
      }
    });
  }

  getCampaignByStatus(event) {
    this.campaignFilterStatus = ((event.target.value)) === "null" ? null : ((event.target.value));
    this.getCampaigns();
  }
  viewCampaignAssessments(campaignScheduleId, campaignId) {
    this.router.navigate([`./drive`, btoa(JSON.stringify(campaignId)), btoa(JSON.stringify(campaignScheduleId))], { relativeTo: this.activateRoute });
  }

  changeCampaignPageSize() {
    this.campaign_PageIndex = 1;
    this.getCampaigns();
  }

  checkForInstanceStatus(userAssessment: Assessment): boolean {
    if (userAssessment.isVMBasedAssessment && userAssessment.vmBasedAssessmentStatus === VmInstanceStatus.DeletionTriggered)
      return true;
    else if (userAssessment.isVMBasedAssessment && userAssessment.vmBasedAssessmentStatus === VmInstanceStatus.StopTriggered)
      return false;
    else
      return false;
  }
}
