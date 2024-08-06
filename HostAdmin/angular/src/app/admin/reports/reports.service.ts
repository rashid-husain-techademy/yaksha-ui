import { Injectable } from '@angular/core';
import { ApiClientService } from '../../service/common/api-client.service';
import { Result } from '../../shared/core-interface/base';
import { Observable } from 'rxjs';
import { AeyeProctoringReportRequest, AeyeUsageReportDto, AeyeUserFullVideo, AeyeVideoRequestDto, AnalyticsAndTestCaseReportDto, AnalyticsAndTestCaseRequestDto, AssessmentRequest, AssessmentReviewReport, GitCommitHistory, ProctoringReportRequest, ReportData, ReportFilter, StackCodeQualityRequestDto, StackMetricsDto, StackReportData, UserAssessmentDetails, UserStackAssessmentsRequestDto, ProctorStatus } from './reports';
import { Helper } from '@app/shared/helper';

const routes = {
  getReportData: 'yaksha/Report/EmailReportDataAsync',
  emailStackReportDataAsync: 'yaksha/Report/EmailStackReportDataAsync',
  emailWheeboxReportDataAsync: 'yaksha/Report/EmailWheeboxReportDataAsync',
  assignmentReportDataAsync: 'yaksha/Report/AssignmentReportDataAsync',
  getUserAssessmentDetails: 'yaksha/UserAssessment/GetUserAssessmentDetails',
  getReport: 'yaksha/UserAssessment/GetReport',
  getAssessmentReviewReport: 'yaksha/Report/GetAssessmentReviewReport',
  getAeyeUserViolations: 'yaksha/UserAssessment/GetAeyeUserViolations',
  getAeyeReportDetails: 'yaksha/UserAssessment/GetAeyeReportDetails',
  getStackCodeQualityMetrics: 'stack/Stack/GetStackCodeQualityMetrics',
  getAnalyticsAndTestCaseReport: 'stack/Stack/GetAnalyticsAndTestCaseReport',
  getUserStackAssessments: 'stack/Stack/GetUserStackAssessments',
  getGitCommitHistory: 'stack/Stack/GetGitCommitHistory',
  getReviewSessionDetails: 'yaksha/UserAssessment/GetReviewSessionDetails',
  getSessionAlerts: 'yaksha/UserAssessment/GetSessionAlerts',
  getAeyeClipDetails: 'yaksha/UserAssessment/GetAeyeClipDetails',
  exportAeyeUsageReport: 'yaksha/UserAssessment/ExportAeyeUsageReport',
  getUserExamVideo: 'yaksha/UserAssessment/GetUserExamVideo',
  getUserSchedules: 'yaksha/Integration/GetUserSchedules',
  getScheduledAssessments: 'yaksha/Assessment/GetScheduledAssessments',
  updateProctoringStatus: 'yaksha/UserAssessment/UpdateProctoringStatus'
};

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private apiClient: ApiClientService) { }

  getReportData(params: ReportFilter): Observable<Result<ReportData[]>> {
    return this.apiClient.get(routes.getReportData, Helper.httpParamBuilder(params));
  }

  exportReportData(params: ReportFilter): Observable<any> {
    return this.apiClient.getCsvFile(routes.getReportData, Helper.httpParamBuilder(params));
  }


  getStackReportData(params: ReportFilter): Observable<Result<ReportData[]>> {
    return this.apiClient.get(routes.emailStackReportDataAsync, Helper.httpParamBuilder(params));
  }

  exportStackReportData(params: ReportFilter): Observable<AssessmentReviewReport> {
    return this.apiClient.getCsvFile(routes.emailStackReportDataAsync, Helper.httpParamBuilder(params));
  }

  exportWheeboxReportData(params: ReportFilter): Observable<any> {
    return this.apiClient.getCsvFile(routes.emailWheeboxReportDataAsync, Helper.httpParamBuilder(params));
  }

  exportAssingmentReportData(params: any): Observable<any> {
    return this.apiClient.getCsvFile(routes.assignmentReportDataAsync, params);
  }

  getUserAssessmentDetails(params: AssessmentRequest): Observable<Result<UserAssessmentDetails>> {
    return this.apiClient.get(routes.getUserAssessmentDetails, Helper.httpParamBuilder(params));
  }

  getReport(params: ProctoringReportRequest): Observable<Result<string>> {
    return this.apiClient.get(routes.getReport, Helper.httpParamBuilder(params));
  }

  getAssessmentReviewReport(params: ReportFilter): Observable<Result<any>> {
    return this.apiClient.get(routes.getAssessmentReviewReport, Helper.httpParamBuilder(params));
  }

  getScheduledAssessments(tenantId: number): Observable<Result<any>> {
    return this.apiClient.get(routes.getScheduledAssessments + "?tenantId=" + tenantId);
  }

  getStackCodeQualityMetrics(params: StackCodeQualityRequestDto): Observable<Result<StackMetricsDto[]>> {
    return this, this.apiClient.get(routes.getStackCodeQualityMetrics, Helper.httpParamBuilder(params));
  }

  getAnalyticsAndTestCaseReport(params: AnalyticsAndTestCaseRequestDto): Observable<Result<AnalyticsAndTestCaseReportDto[]>> {
    return this, this.apiClient.get(routes.getAnalyticsAndTestCaseReport, Helper.httpParamBuilder(params));
  }

  getUserStackAssessments(params: UserStackAssessmentsRequestDto): Observable<Result<StackReportData[]>> {
    return this.apiClient.get(routes.getUserStackAssessments, Helper.httpParamBuilder(params));
  }

  getGitCommitHistory(userAssessmentAttemptId: number): Observable<Result<GitCommitHistory[]>> {
    return this.apiClient.get(routes.getGitCommitHistory + "?userAssessmentAttemptId=" + userAssessmentAttemptId);
  }

  getAeyeUserViolations(params: AeyeProctoringReportRequest): Observable<Result<string>> {
    return this.apiClient.get(routes.getAeyeUserViolations, Helper.httpParamBuilder(params));
  }

  getAeyeReportDetails(params: AeyeProctoringReportRequest): Observable<Result<string>> {
    return this.apiClient.get(routes.getAeyeReportDetails, Helper.httpParamBuilder(params));
  }

  getSessionAlerts(params: AeyeProctoringReportRequest): Observable<Result<string>> {
    return this.apiClient.get(routes.getSessionAlerts, Helper.httpParamBuilder(params));
  }

  getReviewSessionDetails(params: AeyeProctoringReportRequest): Observable<Result<string>> {
    return this.apiClient.get(routes.getReviewSessionDetails, Helper.httpParamBuilder(params));
  }

  getVideoURL(params: AeyeVideoRequestDto): Observable<Result<string>> {
    return this.apiClient.get(routes.getAeyeClipDetails, Helper.httpParamBuilder(params));
  }

  exportAeyeUsageReportData(params: AeyeUsageReportDto): Observable<Result<string>> {
    return this.apiClient.post(routes.exportAeyeUsageReport, params);
  }

  getFullVideo(params: AeyeUserFullVideo): Observable<Result<string>> {
    return this.apiClient.get(routes.getUserExamVideo, Helper.httpParamBuilder(params));
  }
  getUserScheduleDetails(data): Observable<Blob> {
    return this.apiClient.getBlobFile(routes.getUserSchedules, Helper.httpParamBuilder(data));
  }
  updateProctorStatus(params: ProctorStatus): Observable<Result<string>> {
    return this.apiClient.post(routes.updateProctoringStatus, params);
  }
}
