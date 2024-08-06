import { Injectable } from '@angular/core';
import { ApiClientService } from '@app/service';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { Observable } from 'rxjs';
import { RequestAssessmentQuestions, ResultReviewAssessmentQuestions, ReviewCommentsDto, UpdateReviewStatusDto, ReviewDetailsDto, UpdateReviewDto, AssignAssessmentReviewerDto, UserDto, ResultDto, RequestGetUserEmails, RequestReviewDetails, RequestReviewerAssigned, ResultReviewAssessmentsDto, AssessmentRequestDto, DeleteQuestionDto, AssessmentReviewerUserDto, ReviewProgressInputDto, Questions, DashboardDetailsResponseDto, SkillDto, SubSkillRequestDto, AssessmentSignOffQuestionsDetails, ReviewSignOffResultDto, ReviewerCommentCheckDto, SectionStatus, SkillStatus, updateSections } from './assessment-review';


const routes = {
  getAssessmentReviewQuestions: 'yaksha/AssessmentReview/GetReviewAssessmentQuestionsAsync',
  insertOrUpdateComments: 'yaksha/AssessmentReview/InsertOrUpdateCommentAsync',
  updateReviewStatus: 'yaksha/AssessmentReview/UpdateReviewStatusAsync',
  getReviewDetails: 'yaksha/AssessmentReview/GetReviewDetails',
  assignReReview: 'yaksha/AssessmentReview/AssignReReviewAsync',
  updateReviewExpiry: 'yaksha/AssessmentReview/UpdateReviewExpiryAsync',

  //Review Questionnaire
  getUserEmails: 'yaksha/AssessmentReview/GetUserEmailsByTenantIdAndRole',
  assignAssessmentReviewer: 'yaksha/AssessmentReview/AssignAssessmentReviewer',
  IsReviewerAlreadyAssigned: 'yaksha/AssessmentReview/IsReviewerAlreadyAssigned',
  getTenantAssessmentReviews: 'yaksha/AssessmentReview/GetTenantAssessmentReviews',
  deleteTenantAssessmentReview: 'yaksha/AssessmentReview/DeleteTenantAssessmentReview',
  deleteAssessmentReviewQuestion: 'yaksha/AssessmentReview/DeleteAssessmentReviewQuestion',
  getAllTenantAssessmentReviewers: 'yaksha/AssessmentReview/GetAllTenantAssessmentReviewers',
  isReviewInProgress: 'yaksha/AssessmentReview/IsReviewInProgress',
  getReviewAssessmentDashboardDetails: 'yaksha/AssessmentReview/GetReviewAssessmentDashboardDetails',
  checkReviewSignOffCriteria: 'yaksha/AssessmentReview/CheckReviewSignOffCriteria',
  getAssessmentSkills: 'yaksha/AssessmentReview/GetAssessmentSkills',
  getAssessmentSubSkills: 'yaksha/AssessmentReview/GetAssessmentSubSkills',
  getAssessmentSignOffCriteriaDetails: 'yaksha/AssessmentReview/GetAssessmentSignOffCriteriaDetails',
  isAllowedToAddReviewerComment: 'yaksha/AssessmentReview/IsAllowedToAddReviewerComment',
  getSectionStatus: 'yaksha/Assessment/GetAssessmentSectionReviewStatus',
  getSkillBySection: 'yaksha/Assessment/GetAssessmentSectionSkillReviewStatus',
  updateSectionQuestionsAsync: 'yaksha/Assessment/UpdateSectionSkillQuestionsAsync'
};

@Injectable({
  providedIn: 'root'
})
export class AssessmentReviewService {

  lastSelectedQuestion: Questions;
  constructor(private apiClient: ApiClientService) { }

  getReviewAssessmentQuestions(data: RequestAssessmentQuestions): Observable<Result<ResultReviewAssessmentQuestions>> {
    return this.apiClient.get(routes.getAssessmentReviewQuestions, Helper.httpParamBuilder(data));
  }

  insertOrUpdateComments(data: ReviewCommentsDto): Observable<Result<any>> {
    return this.apiClient.post(routes.insertOrUpdateComments, data);
  }

  updateReviewStatus(data: UpdateReviewStatusDto): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateReviewStatus, data);
  }

  getReviewDetails(data: RequestReviewDetails): Observable<Result<ReviewDetailsDto>> {
    return this.apiClient.get(routes.getReviewDetails, Helper.httpParamBuilder(data));
  }

  assignReReview(data: UpdateReviewDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.assignReReview, data);
  }

  updateReviewExpiryAsync(data: UpdateReviewDto): Observable<Result<ResultDto>> {
    return this.apiClient.put(routes.updateReviewExpiry, data);
  }

  assignAssessmentReviewer(data: AssignAssessmentReviewerDto): Observable<Result<ResultDto>> {
    return this.apiClient.post(routes.assignAssessmentReviewer, data);
  }

  getUserEmails(data: RequestGetUserEmails): Observable<Result<UserDto[]>> {
    return this.apiClient.get(routes.getUserEmails, Helper.httpParamBuilder(data));
  }

  isReviewerAssigned(data: RequestReviewerAssigned): Observable<Result<boolean>> {
    return this.apiClient.get(routes.IsReviewerAlreadyAssigned, Helper.httpParamBuilder(data));
  }

  getAssessmentsOnReview(data: AssessmentRequestDto): Observable<Result<ResultReviewAssessmentsDto>> {
    return this.apiClient.get(routes.getTenantAssessmentReviews, Helper.httpParamBuilder(data));
  }

  deleteAssessmentReview(tenantAssessmentReviewId: number): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteTenantAssessmentReview, Helper.httpParamBuilder({ tenantAssessmentReviewId }));
  }

  deleteAssessmentReviewQuestion(params: DeleteQuestionDto): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteAssessmentReviewQuestion, Helper.httpParamBuilder(params));
  }

  getAllTenantAssessmentReviewers(tenantAssessmentReviewId: number): Observable<Result<AssessmentReviewerUserDto[]>> {
    return this.apiClient.get(routes.getAllTenantAssessmentReviewers, Helper.httpParamBuilder({ tenantAssessmentReviewId }));
  }

  getCurrentReviewStatus(data: ReviewProgressInputDto): Observable<Result<boolean>> {
    return this.apiClient.get(routes.isReviewInProgress, Helper.httpParamBuilder(data));
  }

  getReviewDashboardDetails(tenantAssessmentReviewId: number): Observable<Result<DashboardDetailsResponseDto>> {
    return this.apiClient.get(routes.getReviewAssessmentDashboardDetails, Helper.httpParamBuilder({ tenantAssessmentReviewId }));
  }

  checkReviewSignOffCriteria(tenantAssessmentReviewId: number): Observable<Result<ReviewSignOffResultDto>> {
    return this.apiClient.get(routes.checkReviewSignOffCriteria, Helper.httpParamBuilder({ tenantAssessmentReviewId }));
  }

  getAssessmenSkills(tenantAssessmentReviewId: number): Observable<Result<SkillDto[]>> {
    return this.apiClient.get(routes.getAssessmentSkills, Helper.httpParamBuilder({ tenantAssessmentReviewId }));
  }

  getAssessmenSubSkills(data: SubSkillRequestDto): Observable<Result<SkillDto[]>> {
    return this.apiClient.get(routes.getAssessmentSubSkills, Helper.httpParamBuilder(data));
  }

  getSignOffCriteriaDetails(assessmentId: number): Observable<Result<AssessmentSignOffQuestionsDetails>> {
    return this.apiClient.get(routes.getAssessmentSignOffCriteriaDetails, Helper.httpParamBuilder({ assessmentId }));
  }

  isAllowedToAddReviewerComment(data: ReviewerCommentCheckDto): Observable<Result<ResultDto>> {
    return this.apiClient.put(routes.isAllowedToAddReviewerComment, data);
  }

  getSectionStatus(assessmentId: number): Observable<Result<SectionStatus[]>> {
    return this.apiClient.get(routes.getSectionStatus, Helper.httpParamBuilder({ assessmentId }));
  }

  getskillBySection(assessmentId: number, assessmentSectionId: number): Observable<Result<SkillStatus[]>> {
    return this.apiClient.get(routes.getSkillBySection, Helper.httpParamBuilder({ assessmentId, assessmentSectionId }));
  }

  updateSectionQuestionsAsync(data: updateSections): Observable<Result<ResultDto>> {
    return this.apiClient.put(routes.updateSectionQuestionsAsync, data);
  }

}
