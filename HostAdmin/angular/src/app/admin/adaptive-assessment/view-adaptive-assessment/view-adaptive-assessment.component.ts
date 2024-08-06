import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentStatus, AssessmentType, ScheduleType, ViewAssessmentTabs } from '@app/enums/assessment';
import { UserRoles } from '@app/enums/user-roles';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { AdaptiveAssessmentService } from '../adaptive-assessment.service';
import { ToastrService } from 'ngx-toastr';
import { AppSessionService } from '@shared/session/app-session.service';
import { AdaptiveAssessmentSchedule, AdaptiveAssessmentScheduleFilter, ExternalAdaptiveAssessmentDetails } from '../adaptive-assessment';

@Component({
  selector: 'app-view-adaptive-assessment',
  templateUrl: './view-adaptive-assessment.component.html',
  styleUrls: ['./view-adaptive-assessment.component.scss']
})
export class ViewAdaptiveAssessmentComponent implements OnInit {

  constants = Constants;
  assessmentDetail: ExternalAdaptiveAssessmentDetails;
  assessmentStatus = AssessmentStatus;
  assessmentType = AssessmentType;
  skillType: string;
  active: any;
  userRole: string;
  userRoles = UserRoles;
  assessmentId: number;
  categories: string;
  buttonText: string;
  schedulePageIndex: number = 1;
  schedulePageSize: number = 5;
  scheduleCount: number = 0;
  schedulesList: AdaptiveAssessmentSchedule[];
  scheduleType = ScheduleType;
  pageSizes: number[] = [5, 10, 15];
  maxSize: number = 5;

  constructor(private dataService: dataService,
    private activatedRoute: ActivatedRoute,
    private adativeAssessmentService: AdaptiveAssessmentService,
    private toastrService: ToastrService,
    private appSessionService: AppSessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.assessmentId = parseInt(atob(params['id']));
        this.getAdaptiveAssessmentDetail();
      }
      if (params['activePage']) {
        this.active = parseInt(atob(params['activePage']));
        if (this.active === ViewAssessmentTabs.Schedule)
          this.getAdaptiveAssessmentSchedules();
      }
    });
  }

  getAdaptiveAssessmentSchedules() {
    let data: AdaptiveAssessmentScheduleFilter = {
      AdaptiveAssessmentId: this.assessmentId,
      TenantId: this.appSessionService.tenantId,
      SkipCount: (this.schedulePageIndex - 1) * this.schedulePageSize,
      MaxResultCount: this.schedulePageSize
    };

    this.adativeAssessmentService.getAllAdaptiveAssessmentSchedule(data).subscribe(res => {
      if (res.result && res.result.totalCount) {
        this.scheduleCount = res.result.totalCount;
        this.schedulesList = res.result.adaptiveAssessmentSchdeuleDatas;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getAdaptiveAssessmentDetail() {
    this.adativeAssessmentService.getAdaptiveAssessmentDetail(this.assessmentId).subscribe(res => {
      if (res.result) {
        this.assessmentDetail = res.result;
        this.assessmentDetail.assessmentStatus = AssessmentStatus.Published;
        this.skillType = Constants.singleSkill;
        // if (this.assessmentDetail.assessmentStatus === AssessmentStatus.Published) {
        //   this.buttonText = Constants.draftButtonText;
        // }
        // else {
        //   this.buttonText = Constants.publishButtonText;
        // }
        // if (res.result.assessmentSections.length > 0 && res.result.assessmentSections[0].sectionSkills.length > 0) {
        //   this.skillName = res.result.assessmentSections[0].sectionSkills[0].skillName;
        // }
        // if (this.assessmentDetail.assessmentType === AssessmentType.Adaptive) {
        //   this.skillType = (this.assessmentDetail.skillType === AdaptiveAssessmentType.SingleSkill) ? Constants.singleSkill : Constants.multiSkill;
        //   if (this.assessmentDetail.skillType === AdaptiveAssessmentType.SingleSkill) {
        //     this.categories = this.assessmentDetail.categories.map(x => x.name)[0];
        //   }
        // }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  schedule() {
    const assessmentDetails = { id: this.assessmentId };
    this.router.navigate([`../../adaptive-assessment-schedule`, btoa(JSON.stringify(assessmentDetails)),], { relativeTo: this.activatedRoute });
  }

  changePageSize() {
    this.schedulePageIndex = 1;
    this.getAdaptiveAssessmentSchedules();
  }

  loadPage() {
    this.getAdaptiveAssessmentSchedules();
  }

}
