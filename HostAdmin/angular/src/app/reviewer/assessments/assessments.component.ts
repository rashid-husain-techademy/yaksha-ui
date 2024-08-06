import { Component, Injector, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';
import { Assessment, AssessmentsCount, ReviewerAssessmentsDetails, ReviewerAssessmentsFilter } from '../reviewer';
import { ReviewerAssessmentStatus } from '@app/enums/assessment';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/app-component-base';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { ReviewerService } from '../reviewer.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent extends AppComponentBase implements OnInit {
  //Common details
  constants = Constants;
  reviewerAssessmentList: ReviewerAssessmentsDetails;
  status: ReviewerAssessmentStatus = 10;
  reviewerAssessmentStatus = ReviewerAssessmentStatus;
  noAssessmentsFound: boolean = false;
  assessmentsCount: AssessmentsCount;
  userRole: string;
  userRoles = UserRoles;
  //In Progress Tab 
  inProgress_SkipCount: number;
  inProgress_MaxResultCount: number;
  inProgress_SearchString: string = "";
  inProgress_PageIndex: number = 1;
  inProgress_PageSize: number = 10;
  inProgress_PageSizes: number[] = [10, 20, 30];
  inProgress_MaxSize: number = 5;
  //Upcoming Tab
  upcoming_SkipCount: number;
  upcoming_MaxResultCount: number;
  upcoming_SearchString: string = "";
  upcoming_PageIndex: number = 1;
  upcoming_PageSize: number = 10;
  upcoming_PageSizes: number[] = [10, 20, 30];
  upcoming_MaxSize: number = 5;
  //Completed Tab
  completed_SkipCount: number;
  completed_MaxResultCount: number;
  completed_SearchString: string = "";
  completed_PageIndex: number = 1;
  completed_PageSize: number = 10;
  completed_PageSizes: number[] = [10, 20, 30];
  completed_MaxSize: number = 5;

  constructor(private reviewerService: ReviewerService,
    injector: Injector,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dataService: dataService) { super(injector); }

  ngOnInit(): void {
    this.loadPage();
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.reviewerService.getAssessmentsCount().subscribe(res => {
      if (res && res.success && res.result !== null) {
        this.assessmentsCount = res.result;
      }
    });
  }

  viewAssessmentDetail(assessment: Assessment) {
    let queryParam = assessment.assessmentScheduleId + '/' + assessment.AssessmentIdNumber;
    queryParam = btoa(queryParam);
    this.router.navigate(['../assessments', queryParam], { relativeTo: this.activateRoute });
  }

  changePageSize() {
    if (this.status === this.reviewerAssessmentStatus.InProgress) {
      this.inProgress_PageIndex = 1;
    }
    else if (this.status === this.reviewerAssessmentStatus.Upcoming) {
      this.upcoming_PageIndex = 1;
    }
    else if (this.status === this.reviewerAssessmentStatus.Completed) {
      this.completed_PageIndex = 1;
    }
    this.loadPage();
  }

  getAssessmentsDetails() {
    let data: ReviewerAssessmentsFilter;
    this.noAssessmentsFound = false;
    if (this.status === this.reviewerAssessmentStatus.InProgress) {
      data = {
        reviewerAssessmentStatus: this.status,
        skipCount: (this.inProgress_PageIndex - 1) * this.inProgress_PageSize,
        maxResultCount: this.inProgress_PageSize,
        searchString: this.inProgress_SearchString
      };
    }
    else if (this.status === this.reviewerAssessmentStatus.Upcoming) {
      data = {
        reviewerAssessmentStatus: this.status,
        skipCount: (this.upcoming_PageIndex - 1) * this.upcoming_PageSize,
        maxResultCount: this.upcoming_PageSize,
        searchString: this.upcoming_SearchString
      };
    }
    else if (this.status === this.reviewerAssessmentStatus.Completed) {
      data = {
        reviewerAssessmentStatus: this.status,
        skipCount: (this.completed_PageIndex - 1) * this.completed_PageSize,
        maxResultCount: this.completed_PageSize,
        searchString: this.completed_SearchString
      };
    }
    this.reviewerService.getAssessmentsList(data).subscribe(res => {
      if (res.success && res.result.totalCount) {
        this.reviewerAssessmentList = res.result;
      }
      else {
        this.reviewerAssessmentList = res.result;
        this.noAssessmentsFound = true;
        if (this.status === this.reviewerAssessmentStatus.InProgress) {
          this.inProgress_PageIndex = 1;
        }
        else if (this.status === this.reviewerAssessmentStatus.Upcoming) {
          this.upcoming_PageIndex = 1;
        }
        else if (this.status === this.reviewerAssessmentStatus.Completed) {
          this.completed_PageIndex = 1;
        }
      }
    });
  }

  loadPage() {
    this.getAssessmentsDetails();
  }

  search(): void {
    this.loadPage();
  }

  reset(): void {
    if (this.status === this.reviewerAssessmentStatus.InProgress) {
      this.inProgress_PageIndex = 1;
      this.inProgress_PageSize = 10;
      this.inProgress_SearchString = '';
    }
    else if (this.status === this.reviewerAssessmentStatus.Upcoming) {
      this.upcoming_PageIndex = 1;
      this.upcoming_PageSize = 10;
      this.upcoming_SearchString = '';
    }
    else if (this.status === this.reviewerAssessmentStatus.Completed) {
      this.completed_PageIndex = 1;
      this.completed_PageSize = 10;
      this.completed_SearchString = '';
    }
    this.loadPage();
  }

  getAssessmentsByStatus(status: ReviewerAssessmentStatus) {
    this.status = status;
    this.reset();
  }
}