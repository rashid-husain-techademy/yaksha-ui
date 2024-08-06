import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProctorType } from '@app/enums/assessment';
import { Constants } from '@app/models/constants';
import { AssessmentDetails, AssessmentRequest, ProctoringReportRequest, UserAssessmentDetails } from '../reports';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-proctoring',
  templateUrl: './proctoring.component.html',
  styleUrls: ['./proctoring.component.scss']
})
export class ProctoringComponent implements OnInit {
  constants = Constants;
  userId: number;
  assessmentDetails: AssessmentDetails[];
  userAssessmentDetails: UserAssessmentDetails;
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  pageSizes: number[] = [10, 20, 30];
  fullName: string;
  userEmail: string;
  proctorType = ProctorType;

  constructor(
    private reportService: ReportsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.get(Constants.id) && paramMap.get(Constants.emailId)) {
        this.userId = +atob(paramMap.get(Constants.id));
        this.userEmail = atob(paramMap.get(Constants.emailId));
      }
      this.getUserAssessmentDetails();
    });
  }

  getUserAssessmentDetails(): void {
    const params: AssessmentRequest = {
      UserId: this.userId,
      SkipCount: (this.pageIndex - 1) * this.pageSize,
      MaxResultCount: this.pageSize
    };

    this.reportService.getUserAssessmentDetails(params).subscribe(res => {
      if (res.success && res.result) {
        this.userAssessmentDetails = res.result;
        this.fullName = `${this.userAssessmentDetails.name} ${this.userAssessmentDetails.surname}`;
        this.assessmentDetails = res.result.assessmentDetails;
      }
    },
      error => console.error(error));
  }

  loadPage(): void {
    this.getUserAssessmentDetails();
  }

  changePageSize(): void {
    this.pageIndex = 1;
    this.getUserAssessmentDetails();
  }

  getWheeboxProctoringReport(assessmentDetail: AssessmentDetails): void {
    const params: ProctoringReportRequest = {
      student_unique_id: `${this.userId}/${this.userAssessmentDetails.tenantId}`,
      event_id: assessmentDetail.scheduleIdNumber,
      attemptnumber: assessmentDetail.attemptNumber
    };

    this.reportService.getReport(params).subscribe(res => {
      if (res.success && res.result) {
        window.open(res.result, '_blank');
      }
    },
      error => console.error(error));
  }

  getProctoringReport(assessmentDetail: AssessmentDetails) {
    if (assessmentDetail.proctorType === ProctorType.Wheebox) {
      this.getWheeboxProctoringReport(assessmentDetail);
    } else if (assessmentDetail.proctorType === ProctorType.Aeye) {
      this.openReportsModal(assessmentDetail);
    }
  }

  openReportsModal(assessmentDetail: AssessmentDetails): void {
    let reportDetails = {
      scheduleId: assessmentDetail.assessmentScheduleId,
      attemptNumber: assessmentDetail.attemptNumber,
      userEmail: this.userEmail
    };
    this.router.navigate(['../../../user-reports', btoa(JSON.stringify(reportDetails))], { relativeTo: this.activatedRoute });
  }
}