import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentSections } from '@app/admin/assessment/assessment';
import { ReviewerAssessmentTabs, ReviewerEvaluationStatus } from '@app/enums/reviewer';
import { Constants } from '@app/models/constants';
import { ReviewerAssessmentRequest, ReviewerAssessmentResponse } from '@app/reviewer/reviewer';
import { ReviewerService } from '@app/reviewer/reviewer.service';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {

  assessmentId: number;
  assessmentScheduleId: number;
  searchString: string;
  candidate_searchString: string = '';
  skipCount: number = 0;
  assessment: ReviewerAssessmentResponse;
  constants = Constants;
  assessmentSectionDetails: AssessmentSections[];
  reviewStatus = ReviewerEvaluationStatus;
  requestData: ReviewerAssessmentRequest;
  activeTab: number = ReviewerAssessmentTabs.CandidateList;
  candidatePageIndex: number = 1;
  candidatePageSize: number = 5;
  candidateMaxSize: number = 5;
  candidateTotalCount: number = 0;
  candidatePageSizes: number[] = [5, 10, 15, 20, 25, 30];

  constructor(
    public reviewerService: ReviewerService,
    public activatedRoute: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(res => {
      let data = atob(res['assessment']).split('/');
      this.assessmentScheduleId = parseInt(data[0]);
    });
    this.requestData = {
      AssessmentScheduleId: this.assessmentScheduleId,
      IsAssessmentDetails: true,
      IsAssessmentSectionDetails: false,
      IsCandidateList: true,
      SkipCount: this.skipCount,
      SearchString: this.searchString,
      MaxResultCount: this.candidateMaxSize
    };
    this.getAssessments();
  }

  getAssessments() {
    this.reviewerService.getReviewerAssessmentDetails(this.requestData).subscribe(res => {
      if (res) {
        if (this.requestData.IsAssessmentDetails) {
          this.assessment = res.result;
          this.candidateTotalCount = res.result.candidateTotalCount;
        }
        else if (this.requestData.IsCandidateList) {
          this.assessment.assessmentCandidateDetails = res.result.assessmentCandidateDetails;
          this.candidateTotalCount = res.result.candidateTotalCount;
        }
        else if (this.requestData.IsAssessmentSectionDetails) {
          this.assessmentSectionDetails = res.result.assessmentSectionDetails;
        }
      }
    });
  }

  getSectionDetails() {
    this.requestData.IsAssessmentSectionDetails = true;
    this.requestData.IsAssessmentDetails = false;
    this.requestData.IsCandidateList = false;
    this.getAssessments();
  }

  pageChange() {
    this.requestData.SkipCount = (this.candidatePageIndex - 1) * this.candidatePageSize;
    this.requestData.MaxResultCount = this.candidatePageSize;
    this.requestData.IsAssessmentDetails = false;
    this.requestData.IsCandidateList = true;
    this.requestData.IsAssessmentSectionDetails = false;
    this.getAssessments();
  }

  getCandidateDetails() {
    this.requestData.SearchString = '';
    this.candidate_searchString = '';
    this.requestData.IsCandidateList = true;
    this.requestData.IsAssessmentSectionDetails = false;
    this.requestData.IsAssessmentDetails = false;
    this.getAssessments();
  }

  changePageSize() {
    this.candidatePageIndex = 1;
    this.pageChange();
  }

  search() {
    this.requestData.SearchString = this.candidate_searchString;
    this.requestData.IsCandidateList = true;
    this.requestData.IsAssessmentSectionDetails = false;
    this.requestData.IsAssessmentDetails = false;
    this.getAssessments();
  }

  reset(): void {
    this.requestData.SearchString = '';
    this.candidate_searchString = '';
    this.getAssessments();
  }

  formattedDateTime(date: Date) {
    if (date) {
      return formatDate(date.toString(), 'MMM d, y, h:mm a', 'en_US');
    }
    else
      return "-";
  }

  reviewQuestions(candidate: any) {
    let queryParam = candidate.userId + '/' + candidate.firstName + '/' + candidate.lastName + '/' + candidate.emailAddress + '/'
      + candidate.submissionDate.toString() + '/' + candidate.evaluationStatus.toString() + '/' + candidate.attempt.toString()
      + '/' + this.assessmentScheduleId;
    this.router.navigate(['../../review-candidate', btoa(queryParam)], { relativeTo: this.activatedRoute });
  }
}