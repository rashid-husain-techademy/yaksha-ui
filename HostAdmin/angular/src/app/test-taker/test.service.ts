import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../service/common/api-client.service';
import {
  EditorCode, ExecutedResult, InsertOrUpdateUserAttemptQuestions, GetPostEvaluationStatus, GetAssessmentQuestions,
  UserAssessmentQuestionsDto, PostAssessmentResult, ProgressFilter, GetCompilerLanguageDefaultCode, TestCaseData, TestcaseResult,
  StackAssessmentEvaluationData, StackLabDetails, LabStatusResponse, LabStatusRequest, sectionDurationDto, bulkInsertSectionDto,
  UpdateAssessmentQuestionDuration, GetEditorCode, EvaluateSectionResult, AutoSaveUserCodingQuestion, ValidateUserAssessmentData,
  ValidateSubmissionResponse, StackSubmissionResponse, ScheduledTemplateDetails, UpdateStackAssessmentTemplateType, MarkAsEvaluationDto,
  ExistingInstanceRequestData, StackMMLLabDetails, MMLLabConnectionResponseDto, MMLLabStatusUpdateDto, VmDetailsRequestData, updateVMDetailsData, CloudCredentialResponseDto, CloudTestCaseResults, ValidateCloudTestCases, GetCurrentQuestionAnswer, subjectiveStatusDto, AssessmentScheduleConfigDto
} from './field';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { TestCaseResultStatus } from '@app/enums/test';
import { GetSubjectiveQuestionDataDto, SubjectiveQuestionData, UploadSubjectiveAnswerResult } from './test-data';

const routes = {
  getUserAssessmentQuestions: "yaksha/UserAssessment/GetUserAssessmentQuestions",
  insertOrUpdateUserAttemptQuestions: "yaksha/UserAssessment/InsertOrUpdateUserAttemptQuestions",
  autoSaveCodingQuestion: "yaksha/UserAssessment/AutoSaveCodingQuestion",
  insertOrUpdateUserAttemptDetails: "yaksha/UserAssessment/InsertOrUpdateUserAttemptDetails",
  executeJdoodleCompiler: "yaksha/UserAssessment/ExecuteJdoodleCompiler",
  evaluateUserAttempt: "yaksha/UserAssessment/EvaluateUserAttempt",
  getPostAssessmentResults: "yaksha/UserAssessment/GetPostAssessmentResults",
  getFeedbackSetting: "yaksha/Assessment/GetFeedbackSetting",
  getPostEvaluationStatus: "yaksha/UserAssessment/GetPostEvaluationStatus",
  getRemainingAttempts: "yaksha/UserAssessment/GetRemainingAttempts",
  executeTestCase: "yaksha/UserAssessment/ExecuteTestcases",
  getCompilerLanguageDefaultCode: "yaksha/UserAssessment/GetCompilerLanguageDefaultCode",
  getSubjectiveQuestionData: "yaksha/UserAssessment/GetSubjectiveQuestionDataAsync",
  getSubjectiveFileSubmission: "yaksha/UserAssessment/GetSubmittedSubjectiveFileAsync",
  uploadSubjectiveAnswerValidation: "yaksha/UserAssessment/UploadSubjectiveQuestionAnswerValidation",
  uploadSubjectiveAnswerViaMobile: "yaksha/UserAssessment/UploadSubjectiveAnswerViaMobile",
  getCurrentQuestionAnswer: "yaksha/UserAssessment/GetCurrentQuestionAnswer",
  getEditorCode: "yaksha/UserAssessment/GetEditorCode",
  getLastSavedTime: "yaksha/UserAssessment/GetLastSavedTime",
  stackAssessmentSubmission: "stack/Stack/StackAssessmentSubmission",
  createLab: "stack/Stack/CreateLab",
  updateStackAssessmentStatus: "stack/Stack/UpdateStackAssessmentStatus",
  getLabStatus: "stack/Stack/GetContainerInstanceStatus",
  getExistingLab: "stack/Stack/GetExistingStackLab",
  insertOrUpdateSectionDuration: "yaksha/UserAssessment/InsertOrUpdateSectionDuration",
  bulkInsertSectionDuration: "yaksha/UserAssessment/BulkInsertSectionDuration",
  updateAssessmentQuestionDuration: "yaksha/UserAssessment/UpdateAssessmentQuestionDuration",
  getAssessmentScheduleDurationDetails: "yaksha/UserAssessment/GetAssessmentScheduleDurationDetails",
  getAssessmentScheduleConfig: "yaksha/UserAssessment/GetAssessmentScheduleConfig",
  markAsEvaluationAsync: "yaksha/UserAssessment/MarkAsEvaluationAsync",
  getScheduledTemplateDetailsAsync: "yaksha/UserAssessment/GetScheduledTemplateDetailsAsync",
  updateStackAssessmentTemplateTypeAsync: "yaksha/UserAssessment/UpdateStackAssessmentTemplateTypeAsync",
  evaluateAdaptiveAssessmentAttempt: "yaksha/UserAssessment/EvaluateAdaptiveAssessmentAttempt",
  validateUserAssessmentSubmission: "stack/Stack/ValidateUserAssessmentSubmission",
  checkPlagiarism: "yaksha/Plagiarism/PlagiarismCheckerAsync",
  getJDoodleAuthToken: "yaksha/UserAssessment/getJDoodleAuthToken",
  GetUnSubmittedCodingQuestions: "yaksha/UserAssessment/GetUnSubmittedCodingQuestions",
  getExtraDurationForAssementAttempt: "yaksha/UserAssessment/GetExtraDurationForAssementAttempt",

  //MML API routes
  createMMLLabAsync: "stack/Stack/CreateMMLLabAsync",
  getVMDetails: "stack/Stack/GetVMDetails",
  getVMTicket: "stack/Stack/GetVMTicket",
  updateVMDetails: "stack/Stack/UpdateVMDetails",
  generateConnectionURL: "stack/Stack/GenerateConnectionURL",
  updateVirtualMachine: "stack/Stack/UpdateVirtualMachine",

  //Cloud based assessment
  getCloudCredentials: "yaksha/UserAssessment/GetCloudCredentials",
  validateTestCases: "yaksha/UserAssessment/ValidateTestCases",

  //Mobile Upload
  updateSubjectiveActiveStatus: "yaksha/UserAssessment/UpdateSubjectiveActiveStatus",
};

@Injectable({
  providedIn: 'root'
})

export class TestService {

  constructor(private apiClient: ApiClientService) { }

  evaluateUserAttempt(params: ProgressFilter): Observable<Result<PostAssessmentResult>> {
    return this.apiClient.post(routes.evaluateUserAttempt, params);
  }

  getPostAssessmentResults(params: ProgressFilter): Observable<Result<PostAssessmentResult>> {
    return this.apiClient.get(routes.getPostAssessmentResults, Helper.httpParamBuilder(params));
  }

  getFeedbackSetting(assssmentScheduleId: number): Observable<Result<boolean>> {
    return this.apiClient.get(routes.getFeedbackSetting + "?assessmentSchduleId=" + assssmentScheduleId);
  }

  evaluateAdaptiveAssessmentAttempt(params: ProgressFilter): Observable<Result<EvaluateSectionResult>> {
    return this.apiClient.post(routes.evaluateAdaptiveAssessmentAttempt, params);
  }

  getUserAssessmentQuestions(data: GetAssessmentQuestions): Observable<Result<UserAssessmentQuestionsDto>> {
    return this.apiClient.get(routes.getUserAssessmentQuestions, Helper.httpParamBuilder(data));
  }

  insertOrUpdateUserAttemptQuestions(userAttemptQuestionData: InsertOrUpdateUserAttemptQuestions): Observable<Result<string>> {
    return this.apiClient.post(routes.insertOrUpdateUserAttemptQuestions, userAttemptQuestionData);
  }

  autoSaveCodingQuestion(userAttemptQuestionData: AutoSaveUserCodingQuestion): Observable<Result<string>> {
    return this.apiClient.post(routes.autoSaveCodingQuestion, userAttemptQuestionData);
  }

  executeJdoodleCompiler(editorCode: EditorCode): Observable<Result<ExecutedResult>> {
    return this.apiClient.post(routes.executeJdoodleCompiler, editorCode);
  }

  getRemainingAttempts(data: GetPostEvaluationStatus): Observable<Result<number>> {
    return this.apiClient.get(routes.getRemainingAttempts, Helper.httpParamBuilder(data));
  }

  executeTestCases(data: TestCaseData): Observable<Result<TestcaseResult[]>> {
    return this.apiClient.post(routes.executeTestCase, data);
  }

  getCompilerLanguageDefaultCode(data: GetCompilerLanguageDefaultCode): Observable<Result<string>> {
    return this.apiClient.get(routes.getCompilerLanguageDefaultCode, Helper.httpParamBuilder(data));
  }

  getEditorCode(data: GetEditorCode): Observable<Result<string>> {
    return this.apiClient.get(routes.getEditorCode, Helper.httpParamBuilder(data));
  }

  getCurrentQuestionAnswer(data: GetCurrentQuestionAnswer): Observable<any> {
    return this.apiClient.get(routes.getCurrentQuestionAnswer, Helper.httpParamBuilder(data));
  }

  getAssessmentScheduleDurationDetails(data: number): Observable<Result<UserAssessmentQuestionsDto>> {
    return this.apiClient.get(routes.getAssessmentScheduleDurationDetails + "?assessmentScheduleId=" + data);
  }

  getAssessmentScheduleConfig(assessmentSchduleId: number): Observable<Result<AssessmentScheduleConfigDto>> {
    return this.apiClient.get(routes.getAssessmentScheduleConfig + "?assessmentScheduleId=" + assessmentSchduleId);
  }

  getScheduledTemplateDetailsAsync(assessmentScheduleId: number, userAssessmentAttemptId: number): Observable<Result<ScheduledTemplateDetails[]>> {
    return this.apiClient.get(routes.getScheduledTemplateDetailsAsync + "?assessmentScheduleId=" + assessmentScheduleId + "&userAssessmentAttemptId=" + userAssessmentAttemptId);
  }

  getLastSavedTime(data: GetEditorCode): Observable<Result<string>> {
    return this.apiClient.get(routes.getLastSavedTime, Helper.httpParamBuilder(data));
  }

  stackAssessmentSubmission(data: StackAssessmentEvaluationData): Observable<Result<StackSubmissionResponse>> {
    return this.apiClient.post(routes.stackAssessmentSubmission, data);
  }

  updateStackAssessmentTemplateTypeAsync(data: UpdateStackAssessmentTemplateType): Observable<Result<StackLabDetails>> {
    return this.apiClient.put(routes.updateStackAssessmentTemplateTypeAsync, data);
  }

  createLab(data: StackAssessmentEvaluationData): Observable<Result<StackLabDetails>> {
    return this.apiClient.post(routes.createLab, data);
  }

  updateStackAssessmentStatus(data: StackAssessmentEvaluationData): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateStackAssessmentStatus, data);
  }

  getLabStatus(request: LabStatusRequest): Observable<Result<LabStatusResponse>> {
    return this.apiClient.get(routes.getLabStatus, Helper.httpParamBuilder(request));
  }

  getExistingInstance(data: ExistingInstanceRequestData): Observable<Result<StackLabDetails>> {
    return this.apiClient.get(routes.getExistingLab, Helper.httpParamBuilder(data));
  }

  insertOrUpdateSectionDuration(userAttemptSectionData: sectionDurationDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.insertOrUpdateSectionDuration, userAttemptSectionData);
  }

  bulkInsertSectionDuration(data: bulkInsertSectionDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.bulkInsertSectionDuration, data);
  }

  updateAssessmentQuestionDuration(data: UpdateAssessmentQuestionDuration): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateAssessmentQuestionDuration, data);
  }

  reviewerEvaluationStatus(markAsEvaluationData: MarkAsEvaluationDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.markAsEvaluationAsync, markAsEvaluationData);
  }

  validateUserAssessmentSubmission(validateUserAssessmentData: ValidateUserAssessmentData): Observable<Result<ValidateSubmissionResponse>> {
    return this.apiClient.post(routes.validateUserAssessmentSubmission, validateUserAssessmentData);
  }

  checkPlagiarism(userAssessmentAttemptId): Observable<Result<boolean>> {
    return this.apiClient.post(routes.checkPlagiarism + "?userAssessmentAttemptId=" + userAssessmentAttemptId);
  }

  getUnSubmittedCodeQuestions(userAssessmentAttemptId): Observable<any> {
    return this.apiClient.get(routes.GetUnSubmittedCodingQuestions + "?userAssessmentAttemptId=" + userAssessmentAttemptId);
  }

  getExtraDurationForAssementAttempt(userAssessmentAttemptId): Observable<any> {
    return this.apiClient.get(routes.getExtraDurationForAssementAttempt + "?userAssessmentAttemptId=" + userAssessmentAttemptId);
  }

  //MML API
  createMMLLab(data: StackAssessmentEvaluationData): Observable<Result<StackMMLLabDetails>> {
    return this.apiClient.post(routes.createMMLLabAsync, data);
  }

  getVMTicket(tenantId): Observable<Result<string>> {
    return this.apiClient.get(routes.getVMTicket + "?tenantId=" + tenantId);
  }

  getVMStatus(data: VmDetailsRequestData): Observable<Result<string>> {
    return this.apiClient.get(routes.getVMDetails, Helper.httpParamBuilder(data));
  }

  updateVMDetails(data: updateVMDetailsData): Observable<Result<string>> {
    return this.apiClient.put(routes.updateVMDetails, data);
  }

  generateConnectionURL(data: VmDetailsRequestData): Observable<Result<MMLLabConnectionResponseDto>> {
    return this.apiClient.post(routes.generateConnectionURL, data);
  }

  updateVirtualMachine(data: MMLLabStatusUpdateDto): Observable<any> {
    return this.apiClient.put(routes.updateVirtualMachine, data);
  }

  getJDoodleAuthToken(): Observable<Result<string>> {
    return this.apiClient.get(routes.getJDoodleAuthToken);
  }

  getCloudCredentials(assessmentScheduleId: number): Observable<Result<CloudCredentialResponseDto>> {
    return this.apiClient.get(routes.getCloudCredentials, Helper.httpParamBuilder({ assessmentScheduleId }));
  }

  validateTestCases(request: ValidateCloudTestCases): Observable<Result<CloudTestCaseResults<TestCaseResultStatus>>> {
    return this.apiClient.post(routes.validateTestCases, request);
  }

  getSubjectiveQuestionData(data: GetSubjectiveQuestionDataDto): Observable<Result<SubjectiveQuestionData>> {
    return this.apiClient.get(routes.getSubjectiveQuestionData, Helper.httpParamBuilder(data));
  }

  uploadSubjectiveAnswerValidation(data: FormData): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.uploadSubjectiveAnswerValidation, data);
  }

  uploadSubjectiveAnswerViaMobile(data: FormData): Observable<Result<UploadSubjectiveAnswerResult>> {
    return this.apiClient.postFile(routes.uploadSubjectiveAnswerViaMobile, data);
  }

  getSubjectiveFileSubmission(data: GetSubjectiveQuestionDataDto): Observable<Result<string>> {
    return this.apiClient.get(routes.getSubjectiveFileSubmission, Helper.httpParamBuilder(data));
  }

  updateSubjectiveActiveStatus(data: subjectiveStatusDto): Observable<Result<string>> {
    return this.apiClient.put(routes.updateSubjectiveActiveStatus, data);
  }
}
