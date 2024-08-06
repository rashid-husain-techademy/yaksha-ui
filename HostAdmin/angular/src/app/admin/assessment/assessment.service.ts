import { Injectable } from '@angular/core';
import { ReviewCommentsDto } from '@app/assessment-review/assessment-review';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { AssessmentDetails, AssessmentSchedulePurposeResponseDto, HacakthonScheduleDetailDto, HackathonRegistrationDto, HackathonScheuleRequestDto, ValidateAssessment, ValidateAssessmentResult, ValidateRegistration, ValidateRegistrationResult, WheeboxUrlRequestDto, WheeboxUrlResultDto } from 'account/pre-assessment/pre-assessment-details';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../service/common/api-client.service';
import {
  AssessmentDetail, AssessmentRequestDto, AssessmentResultDto, AssessmentScheduleFilter,
  AssessmentSchedules, AssessmentSkillQuestionDto, AssessmentTenants, AssignResultDto, CategoryDto, CompilerLanguages,
  CreateOrUpdateAssessmentDto, CreateResultDto, CreateSectionSkill, GetAssessmentSchedule,
  ScheduleResultDto, TenantReviewer, UpdateAssessmentSchedule, AssessmentStatusUpdateDto,
  SortOrderUpdateDto, UserInviteValidation, QuestionRequestDto, AssignRequestDto as AssignRequestDto, QuestionResultDto,
  ProficiencyDto, QuestionTypeDto, SkillDetailDto, CategorySkillRequestDto, SubSkillRequestDto,
  SubSubSkillRequestDto, DeleteSectionRequestDto, DeleteSectionSkillRequestDto, AssessmentSkillDto, UpdateAssessmentScheduled,
  TenantScheduleCatalogResultsDto, WheeboxProctor, HackathonLeaderBoard, HackathonLeaderBoardRequest, CreateAdaptiveAssessmentForm, AdaptiveAssessmentDetail,
  ResultScheduleAssessmentDetails, AssessmentScheduleResponseDto, UserGroupInviteValidation, StackTemplateTypeDetails, AdaptiveAssessmentQuestionsDetailRequestDto, UpdateScheduledAssessmentProctorDto, ResultDto, AssessmentTypeDto, RegisteredUsersResult, GetRegisteredUsersRequest, ExportHackathonReportDto, ScheduleStatusDto, AssessmentCategoryRequestDto, CategoryAssessments, CloneAssessmentDto, ExtraTimeUsers,
  ScheduleSlotResultDto,
  AssessmentSlots,
  UpdateUserAttempt, SubSkillForAssessmentRequestDto, SubSubSkillForAssessmentRequestDto, QuestionCountRequestDto, QuestionCountProficiencyResponseDto
} from './assessment';
import { AeyeUserFullVideo } from '../reports/reports';

const routes = {
  getAssessments: "yaksha/Assessment/GetAssessments",
  getAsesssmentsByCategory: "yaksha/Assessment/GetTenantAssessmentsByCategory",
  getAssessmentDetail: "yaksha/Assessment/GetAssessmentDetail",
  createOrUpdateAssessment: "yaksha/Assessment/CreateOrUpdateAssessmentAsync",
  getTenantsByAssessmentId: "yaksha/Assessment/GetTenantsByAssessmentId",
  getTenantReviewers: "yaksha/Assessment/GetReviewersByTenantId",
  userInviteValidation: "yaksha/Assessment/UserInviteValidation",
  scheduleAssessment: "yaksha/Assessment/ScheduleAssessment",
  validateAssessmentScheduleCreation: "yaksha/Assessment/ValidateAssessmentScheduleCreation",
  createSectionSkill: "yaksha/Assessment/CreateSectionSkillAsync",
  updateSectionSkill: "yaksha/Assessment/UpdateSectionSkillAsync",
  updateAssessmentStatus: "yaksha/Assessment/UpdateAssessmentStatusAsync",
  getAllAssessmentSchedules: "yaksha/Assessment/GetAllAssessmentSchedules",
  updateAssessmentScheduleAsync: "yaksha/Assessment/UpdateAssessmentScheduleAsync",
  updateInActiveRemainingSchedulesAsync: "yaksha/Assessment/UpdateInActiveRemainingSchedulesAsync",
  getUserInviteStatusAsync: "yaksha/Assessment/GetUserInviteStatusAsync",
  updateScheduleInvites: "yaksha/Assessment/UpdateScheduleInvites",
  getAssessmentScheduleById: "yaksha/Assessment/GetAssessmentScheduleById",
  updateSectionOrder: "yaksha/Assessment/UpdateSectionOrder",
  getAssessmentSkills: "yaksha/Assessment/GetAssessmentSkills",
  getSectionSkillQuestions: "yaksha/Assessment/GetSectionSkillQuestions",
  assignAssessmentToTenant: "yaksha/Assessment/AssignAssessmentAsync",
  unAssignAssessmentToTenant: "yaksha/Assessment/UnAssignAssessmentAsync",
  deleteAssessmentSectionSkill: "yaksha/Assessment/DeleteSectionSkill",
  deleteAssessmentSection: "yaksha/Assessment/DeleteSection",
  deleteAssessment: "yaksha/Assessment/DeleteAssessment",
  getAssessmentCategory: "yaksha/Assessment/GetAssessmentCategory",
  isAssessmentExists: "yaksha/Assessment/IsAssessmentExists",
  getWheeboxUrlAsync: "yaksha/UserAssessment/GetWheeboxUrlAsync",
  updateScheduledAssessment: "yaksha/Assessment/UpdateScheduleAssessment",
  getAllProctors: "yaksha/Assessment/getAllProctors",
  updateAssessmentModeAsync: "yaksha/Assessment/UpdateAssessmentModeAsync",
  getAssessmentScheduleDetails: "yaksha/Assessment/GetAssessmentScheduleDetails",
  updateScheduledAssessmentProctorStatus: "yaksha/Assessment/UpdateScheduledAssessmentProctorStatus",
  getScheduleStatus: "yaksha/UserAssessment/GetScheduleStatusAsync",
  getSchedulePendingUsers: "yaksha/UserAssessment/GetSchedulePendingUsers",
  getCampaignSchedulePendingUsers: "yaksha/UserAssessment/GetCampaignSchedulePendingUsers",
  updateExtraTime: "yaksha/UserAssessment/UpdateExtraTime",
  cloneAssessment: 'yaksha/Assessment/CloneAssessment',
  getUserAssessmentScheduleInviteEmails: "yaksha/Assessment/GetUserAssessmentScheduleInviteEmails",
  slotSchedule: "yaksha/Assessment/AddScheduleSlot",
  getAssessmentSlots: "yaksha/Assessment/GetSlotListByAssessmentScheduleId",


  // question
  getSkills: "yaksha/Question/GetSkills",
  getSubSkills: "yaksha/Question/GetSubSkills",
  getSubSubSkills: "yaksha/Question/GetSubSubSkills",
  getQuestionTypes: "yaksha/Question/GetParentQuestionTypes",
  getProficiencyLevels: "yaksha/Question/GetAllProficiencies",
  getQuestions: "yaksha/Question/GetQuestionsSearchResults",
  getAdaptiveAssessmentQuestionsDetail: "yaksha/Question/GetAdaptiveAssessmentQuestionsDetail",
  getSubSkillsForAssessment: "yaksha/Question/GetSubSkillsForAssessment",
  getSubSubSkillsForAssessment: "yaksha/Question/GetSubSubSkillsForAssessment",
  getQuestionCountByProficiency: "yaksha/Question/GetQuestionCountByProficiency",

  // categories
  getCategories: "yaksha/Category/GetCategories",

  // coding
  getCompilerLanguages: "coding/Coding/GetAllCompilerLanguages",

  //test-taker
  getAssessmentDetails: 'yaksha/UserAssessment/GetAssessmentDetails',
  validateUserAssessment: 'yaksha/UserAssessment/ValidateUserAssessment',
  getAssessmentQuestions: 'yaksha/UserAssessment/GetUserAssessmentQuestions',

  //catalog
  getTenantCatalogs: 'yaksha/Catalog/GetTenantScheduleCatalog',

  getCatalogByAssessmentScheduleId: 'yaksha/Catalog/GetTenanatCatalogByAssessmentScheduleId',
  scheduleUserGroupValidation: 'yaksha/Assessment/ScheduleUserGroupValidation',
  //Feature
  getTenantScheduleConfigById: 'yaksha/Feature/GetTenantScheduleConfigurationById',
  // Hackathon
  getLeaderBoardDetails: 'yaksha/UserAssessment/GetLeaderBoardDetails',
  getRegisteredUserDetails: 'yaksha/UserAssessment/GetHackathonRegisteredUsersAsync',
  exportHackathonReport: 'yaksha/Report/ExportHackathonReport',
  validateRegistration: 'yaksha/UserAssessment/ValidateRegistrationAsync',
  getHackathonScheduleDetails: 'yaksha/Assessment/GetHackathonScheduleDetailsAsync',
  registerHackathon: 'yaksha/Assessment/UserHackathonRegistrationAsync',

  //AssessmentTemplateDetails
  getAssessmentTemplateDetails: 'yaksha/Assessment/GetStackAssessmentTemplateDetailsAsync',
  getAssessmentQuestionType: 'yaksha/Assessment/GetAssessmentQuestionType',
  isMMLConfigAvailableForTenant: 'yaksha/Assessment/IsMMLConfigurationAvailableForTenant',

  //Adaptive Assessment
  createAdaptiveAssessment: "yaksha/AdaptiveAssessment/CreateOrUpdateAdaptiveAssessmentAsync",
  getAdaptiveAssessmentDetail: "yaksha/AdaptiveAssessment/GetAdaptiveAssessmentDetail",
  deleteAdaptiveAssessmentLevel: "yaksha/AdaptiveAssessment/DeleteLevel",

  //question-review
  insertOrUpdateComments: 'yaksha/AssessmentReview/InsertOrUpdateCommentAsync',

  //sfa-plagiarism
  runPlagiarism: 'yaksha/Plagiarism/RunPlagiarism',

  //mfa-plagiarism
  isAllowedToEnablePlagiarism: 'stack/Stack/IsAllowedToEnablePlagiarismForStackAssessment',

  //Aeye proctoring
  getUserOnboardDetails: 'yaksha/UserAssessment/GetUserOnboardDetails',

  //Bulk Assessment Schedule
  bulkAssessmentSchedule: "yaksha/Assessment/BulkScheduleValidation",
  //Update User Attempt
  getUserAssessmentAttemptDetails: 'yaksha/UserAssessment/GetUserAssessmentAttemptDetails',
  updateUserAssessmentAttemptDetails: 'yaksha/UserAssessment/UpdateUserAssessmentAttempt'
};

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  constructor(private apiClient: ApiClientService) { }

  getTenantScheduleConfigById(tenantId: number): Observable<Result<string>> {
    return this.apiClient.get(routes.getTenantScheduleConfigById + "?tenantId=" + tenantId);
  }
  getAssessments(assessmentRequest: AssessmentRequestDto, isCacheEnabled: boolean = true): Observable<Result<AssessmentResultDto>> {
    return this.apiClient.get(routes.getAssessments, Helper.httpParamBuilder(assessmentRequest), isCacheEnabled);
  }

  getAssessmentsByCategory(data: AssessmentCategoryRequestDto): Observable<Result<CategoryAssessments[]>> {
    return this.apiClient.get(routes.getAsesssmentsByCategory, Helper.httpParamBuilder(data));
  }

  createOrUpdateAssessment(assessment: CreateOrUpdateAssessmentDto): Observable<Result<CreateResultDto>> {
    return this.apiClient.post(routes.createOrUpdateAssessment, assessment);
  }

  deleteAssessment(id: number): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteAssessment + "?id=" + id);
  }

  deleteSection(data: DeleteSectionRequestDto): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteAssessmentSection, Helper.httpParamBuilder(data));
  }

  updateAssessmentMode(assessmentId: number): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateAssessmentModeAsync + "?assessmentId=" + assessmentId);
  }

  getAssessmentDetail(assessmentId: number): Observable<Result<AssessmentDetail>> {
    return this.apiClient.get(routes.getAssessmentDetail + "?assessmentId=" + assessmentId);
  }

  getTenantsByAssessmentId(assessmentId: number): Observable<Result<AssessmentTenants[]>> {
    return this.apiClient.get(routes.getTenantsByAssessmentId + "?assessmentId=" + assessmentId);
  }

  getTenantReviewers(tenantId: number): Observable<Result<TenantReviewer[]>> {
    return this.apiClient.get(routes.getTenantReviewers + "?tenantId=" + tenantId);
  }

  userInviteValidation(file: FormData, tenantId: number, isCloudBased: boolean): Observable<Result<UserInviteValidation>> {
    return this.apiClient.postFile(routes.userInviteValidation + "?tenantId=" + tenantId + "&isCloudBased=" + isCloudBased, file);
  }

  validateAssessmentScheduleCreation(tenantId: number, assessmentId: number, testPurpose: string): Observable<Result<ResultDto>> {
    return this.apiClient.post(routes.validateAssessmentScheduleCreation + "?tenantId=" + tenantId + "&assessmentId=" + assessmentId + "&testPurpose=" + testPurpose);
  }

  scheduleAssessment(data: FormData): Observable<Result<ScheduleResultDto>> {
    return this.apiClient.postFile(routes.scheduleAssessment, data);
  }
  scheduleSlot(data): Observable<Result<ScheduleSlotResultDto>> {
    return this.apiClient.postFile(routes.slotSchedule, data);
  }

  getAllAssessmentSchedule(data: AssessmentScheduleFilter): Observable<Result<AssessmentSchedules>> {
    return this.apiClient.get(routes.getAllAssessmentSchedules, Helper.httpParamBuilder(data));
  }
  getAssessmentSlots(data): Observable<{ result: AssessmentSlots[] }> {
    return this.apiClient.get(routes.getAssessmentSlots, Helper.httpParamBuilder(data));
  }

  updateAssessmentScheduleAsync(data: UpdateAssessmentSchedule): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateAssessmentScheduleAsync, data);
  }

  updateInActiveRemainingSchedulesAsync(data: UpdateAssessmentSchedule): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateInActiveRemainingSchedulesAsync, data);
  }

  getUserInviteStatusAsync(assessmentScheduleId: number): Observable<Result<boolean>> {
    return this.apiClient.get(routes.getUserInviteStatusAsync + "?assessmentScheduleId=" + assessmentScheduleId);
  }

  updateScheduleInvites(data: FormData): Observable<Result<boolean>> {
    return this.apiClient.putFile(routes.updateScheduleInvites, data);
  }

  getAssessmentScheduleById(data: GetAssessmentSchedule): Observable<Result<AssessmentScheduleResponseDto>> {
    return this.apiClient.get(routes.getAssessmentScheduleById, Helper.httpParamBuilder(data));
  }

  updateAssessmentStatus(updateAssessmentStatus: AssessmentStatusUpdateDto): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateAssessmentStatus, updateAssessmentStatus);
  }

  updateSectionSortOrder(updateAssessmentSections: SortOrderUpdateDto[]): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateSectionOrder, updateAssessmentSections);
  }

  getAssessmentSkills(assessmentId: number): Observable<Result<AssessmentSkillDto[]>> {
    return this.apiClient.get(routes.getAssessmentSkills + "?assessmentId=" + assessmentId);
  }

  getSectionSkillQuestions(assessmentSectionSkillId: number): Observable<Result<AssessmentSkillQuestionDto>> {
    return this.apiClient.get(routes.getSectionSkillQuestions + "?assessmentSectionSkillId=" + assessmentSectionSkillId);
  }

  createSectionSkill(data: CreateSectionSkill): Observable<Result<CreateResultDto>> {
    return this.apiClient.post(routes.createSectionSkill, data);
  }

  updateSectionSkill(data: CreateSectionSkill): Observable<Result<CreateResultDto>> {
    return this.apiClient.put(routes.updateSectionSkill, data);
  }

  deleteSectionSkill(data: DeleteSectionSkillRequestDto): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteAssessmentSectionSkill, Helper.httpParamBuilder(data));
  }

  getSkills(data: CategorySkillRequestDto): Observable<Result<SkillDetailDto[]>> {
    return this.apiClient.get(routes.getSkills, Helper.httpParamBuilder(data));
  }

  getSubSkills(data: SubSkillRequestDto): Observable<Result<SkillDetailDto[]>> {
    return this.apiClient.get(routes.getSubSkills, Helper.httpParamBuilder(data));
  }

  getSubSubSkills(data: SubSubSkillRequestDto): Observable<Result<SkillDetailDto[]>> {
    return this.apiClient.get(routes.getSubSubSkills, Helper.httpParamBuilder(data));
  }

  getQuestionTypes(): Observable<Result<QuestionTypeDto[]>> {
    return this.apiClient.get(routes.getQuestionTypes);
  }

  getProficiencyLevels(): Observable<Result<ProficiencyDto[]>> {
    return this.apiClient.get(routes.getProficiencyLevels);
  }

  getQuestions(data: QuestionRequestDto): Observable<Result<QuestionResultDto>> {
    return this.apiClient.get(routes.getQuestions, Helper.httpParamBuilder(data));
  }
  getQuestionCountByProficiency(data: QuestionCountRequestDto): Observable<Result<QuestionCountProficiencyResponseDto>> {
    return this.apiClient.post(routes.getQuestionCountByProficiency, data);
  }

  insertOrUpdateComments(data: ReviewCommentsDto): Observable<Result<any>> {
    return this.apiClient.post(routes.insertOrUpdateComments, data);
  }

  getCategories(): Observable<Result<CategoryDto[]>> {
    return this.apiClient.get(routes.getCategories);
  }

  getCodingLanguages(): Observable<Result<CompilerLanguages[]>> {
    return this.apiClient.get(routes.getCompilerLanguages);
  }

  assignAssessmentToTenant(assessmentAssignmentRequest: AssignRequestDto): Observable<Result<AssignResultDto>> {
    return this.apiClient.post(routes.assignAssessmentToTenant, assessmentAssignmentRequest);
  }

  unAssignAssessmentToTenant(assessmentAssignmentRequest: AssignRequestDto): Observable<Result<AssignResultDto>> {
    return this.apiClient.post(routes.unAssignAssessmentToTenant, assessmentAssignmentRequest);
  }

  getAssessmentCategory(assessmentId: number): Observable<Result<string[] | null>> {
    return this.apiClient.get(routes.getAssessmentCategory + "?assessmentId=" + assessmentId);
  }

  getAssessmentDetails(assessmentScheduleIdNumber: string, emailAddress: string): Observable<Result<AssessmentDetails>> {
    return this.apiClient.get(routes.getAssessmentDetails + "?assessmentScheduleIdNumber=" + assessmentScheduleIdNumber + "&emailAddress=" + emailAddress);
  }

  validateUserAssessment(data: ValidateAssessment): Observable<Result<ValidateAssessmentResult>> {
    return this.apiClient.get(routes.validateUserAssessment, Helper.httpParamBuilder(data));
  }

  isAssessmentExists(tenantId: number, data: string): Observable<Result<AssessmentSchedulePurposeResponseDto>> {
    return this.apiClient.get(routes.isAssessmentExists + "?tenantId=" + tenantId + "&assessmentName=" + data);
  }

  getWheeboxUrlAsync(data: WheeboxUrlRequestDto): Observable<Result<WheeboxUrlResultDto>> {
    return this.apiClient.get(routes.getWheeboxUrlAsync, Helper.httpParamBuilder(data));
  }

  updateScheduledAssessments(data: UpdateAssessmentScheduled): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateScheduledAssessment, data);
  }

  getProctors(): Observable<Result<WheeboxProctor[]>> {
    return this.apiClient.get(routes.getAllProctors);
  }

  getTenantCatalogs(data: number): Observable<Result<TenantScheduleCatalogResultsDto[]>> {
    return this.apiClient.get(routes.getTenantCatalogs + "?tenantId=" + data);
  }

  getCatalogByAssessmentSchduleId(data: number): Observable<Result<TenantScheduleCatalogResultsDto>> {
    return this.apiClient.get(routes.getCatalogByAssessmentScheduleId + "?assessmentScheduleId=" + data);
  }

  getLeaderBoardDetails(data: HackathonLeaderBoardRequest): Observable<Result<HackathonLeaderBoard>> {
    return this.apiClient.get(routes.getLeaderBoardDetails, Helper.httpParamBuilder(data));
  }

  scheduleUserGroupValidation(file: FormData, tenantId: number): Observable<Result<UserGroupInviteValidation>> {
    return this.apiClient.postFile(routes.scheduleUserGroupValidation + "?tenantId=" + tenantId, file);
  }

  createAdaptiveAssessment(assessment: CreateAdaptiveAssessmentForm): Observable<Result<CreateResultDto>> {
    return this.apiClient.post(routes.createAdaptiveAssessment, assessment);
  }

  getAdaptiveAssessmentDetail(assessmentId: number): Observable<Result<AdaptiveAssessmentDetail>> {
    return this.apiClient.get(routes.getAdaptiveAssessmentDetail + "?assessmentId=" + assessmentId);
  }

  deleteAdaptiveAssessmentLevel(levelId: number, assessmentId: number): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteAdaptiveAssessmentLevel + "?assessmentId=" + assessmentId + "&assessmentLevelId=" + levelId);
  }

  getAssessmentScheduleDetails(assessmentId: number): Observable<Result<ResultScheduleAssessmentDetails>> {
    return this.apiClient.get(routes.getAssessmentScheduleDetails + "?assessmentId=" + assessmentId);
  }

  getAssessmentTemplateDetails(assessmentId: number): Observable<Result<StackTemplateTypeDetails[]>> {
    return this.apiClient.get(routes.getAssessmentTemplateDetails + "?assessmentId=" + assessmentId);
  }

  getAssessmentQuestionType(assessmentId: number): Observable<Result<AssessmentTypeDto>> {
    return this.apiClient.get(routes.getAssessmentQuestionType, Helper.httpParamBuilder({ assessmentId }));
  }

  isMMLConfigAvailableForTenant(tenantId: number): Observable<Result<boolean>> {
    return this.apiClient.get(routes.isMMLConfigAvailableForTenant + '?tenantId=' + tenantId);
  }

  getAdaptiveAssessmentQuestionsDetail(data: AdaptiveAssessmentQuestionsDetailRequestDto): Observable<Result<string>> {
    return this.apiClient.post(routes.getAdaptiveAssessmentQuestionsDetail, data);
  }

  updateScheduledAssessmentProctorStatus(data: UpdateScheduledAssessmentProctorDto): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateScheduledAssessmentProctorStatus, data);
  }

  runSchedulePlagiarism(scheduleId: number): Observable<Result<ResultDto>> {
    return this.apiClient.get(routes.runPlagiarism, Helper.httpParamBuilder({ scheduleId }));
  }

  isAllowedToEnablePlagiarismForStackAssessment(assessmentId: number): Observable<Result<boolean>> {
    return this.apiClient.get(routes.isAllowedToEnablePlagiarism, Helper.httpParamBuilder({ assessmentId }));
  }

  checkUserAlreadyOnboarded(params: AeyeUserFullVideo): Observable<Result<string>> {
    return this.apiClient.get(routes.getUserOnboardDetails, Helper.httpParamBuilder(params));
  }

  updateScheduleLogo(path: string, file: FormData): Observable<Result<boolean>> {
    return this.apiClient.putFile(path, file);
  }

  getScheduleStatus(tenantId: number, scheduleId: number): Observable<Result<ScheduleStatusDto[]>> {
    return this.apiClient.get(routes.getScheduleStatus + "?tenantId=" + tenantId + "&scheduleId=" + scheduleId);
  }

  getHackathonRegisteredUsers(data: GetRegisteredUsersRequest): Observable<Result<RegisteredUsersResult>> {
    return this.apiClient.get(routes.getRegisteredUserDetails, Helper.httpParamBuilder(data));
  }

  exportHackathonReport(data: ExportHackathonReportDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.exportHackathonReport, data);
  }

  validateRegistration(data: ValidateRegistration): Observable<Result<ValidateRegistrationResult>> {
    return this.apiClient.post(routes.validateRegistration, data);
  }

  getHackathonScheduleDetails(data: HackathonScheuleRequestDto): Observable<Result<HacakthonScheduleDetailDto>> {
    return this.apiClient.get(routes.getHackathonScheduleDetails, Helper.httpParamBuilder(data));
  }

  registerHackathon(data: HackathonRegistrationDto): Observable<Result<ResultDto>> {
    return this.apiClient.post(routes.registerHackathon, data);
  }

  getSchedulePendingUsers(scheduleId: number, tenantId: number, filterstring: string): Observable<Result<ExtraTimeUsers[]>> {
    return this.apiClient.get(routes.getSchedulePendingUsers + "?scheduleId=" + scheduleId + "&tenantId=" + tenantId + "&filterSearch=" + filterstring);
  }

  getCampaignSchedulePendingUsers(campaignScheduleId: number, tenantId: number, filterstring: string): Observable<Result<ExtraTimeUsers[]>> {
    return this.apiClient.get(routes.getCampaignSchedulePendingUsers + "?campaignScheduleId=" + campaignScheduleId + "&tenantId=" + tenantId + "&filterSearch=" + filterstring);
  }

  updateExtraTime(data: ExtraTimeUsers[]): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateExtraTime, data);
  }

  cloneAssessment(data: CloneAssessmentDto): Observable<Result<any>> {
    return this.apiClient.post(routes.cloneAssessment, data);
  }

  getUserAssessmentScheduleInviteEmails(scheduleId: number, tenantId: number): Observable<Result<any>> {
    return this.apiClient.get(routes.getUserAssessmentScheduleInviteEmails + "?scheduleId=" + scheduleId + "&tenantId=" + tenantId);
  }

  bulkAssessmentSchedule(data: FormData): Observable<Result<any>> {
    return this.apiClient.postFile(routes.bulkAssessmentSchedule, data);
  }

  getUserAssessmentAttemptDetails(scheduleId: number, tenantId: number): Observable<Result<any>> {
    return this.apiClient.get(routes.getUserAssessmentAttemptDetails + "?scheduleId=" + scheduleId + "&tenantId=" + tenantId);
  }

  updateUserAssessmentAttempt(data: UpdateUserAttempt): Observable<Result<any>> {
    return this.apiClient.put(routes.updateUserAssessmentAttemptDetails, data);
  }

  getSubSkillsForAssessment(data: SubSkillForAssessmentRequestDto): Observable<Result<SkillDetailDto[]>> {
    return this.apiClient.get(routes.getSubSkillsForAssessment, Helper.httpParamBuilder(data));
  }

  getSubSubSkillsForAssessment(data: SubSubSkillForAssessmentRequestDto): Observable<Result<SkillDetailDto[]>> {
    return this.apiClient.get(routes.getSubSubSkillsForAssessment, Helper.httpParamBuilder(data));
  }
}
