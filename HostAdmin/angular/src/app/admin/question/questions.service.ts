import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Result } from '@app/shared/core-interface/base';
import { BulkUploadHistoryFilter, BulkUploadResults, CategoryDetails, CodingImportDto, CompilerLanguages, CreateCodingQuestionDto, GetProficiencies, GetPlanSize, GetProficiencyMetadata, GetQuestion, GetQuestionTypes, GetSkills, GetStackQuestionDetails, SupportedStackLanguages, UpdateCodingQuestionDto } from '@app/admin/question/question-details';
import { ApiClientService } from '@app/service/common/api-client.service';
import { Helper } from '@app/shared/helper';
import { CategorySkillRequestDto, SkillDetailDto, SubSkillRequestDto, SubSubSkillRequestDto } from '../assessment/assessment';

const routes = {
  getCategories: 'yaksha/Question/GetAllCategories',
  getAllSkills: 'yaksha/Question/GetAllSkills',
  createQuestion: 'yaksha/Question/CreateQuestionAsync',
  getQuestion: 'yaksha/Question/GetQuestion',
  validateMcqQuestions: 'objective/Objective/ObjectiveQuestionUploadValidation',
  uploadMcqQuestions: 'objective/Objective/UploadObjectiveQuestions',
  validateCodingOrCloudQuestions: 'coding/Coding/SingleFileOrCloudQuestionUploadValidation',
  uploadCodingOrCloudQuestions: 'coding/Coding/SingleFileOrCloudQuestionUpload',
  updateQuestion: 'yaksha/Question/UpdateQuestion',
  deleteQuestion: 'yaksha/Question/DeleteQuestion',
  getProficiencies: 'yaksha/Question/GetAllProficiencies',
  getPlanSize: 'yaksha/Question/GetAllPlanSize',
  getProficiencyMetadata: 'yaksha/Question/GetProficiencyMetadata',
  getQuestionTypes: 'yaksha/Question/GetQuestionTypes',
  getAllCompilerLanguages: 'coding/Coding/GetAllCompilerLanguages',
  getCodingQuestion: 'coding/Coding/GetAll',
  createOrUpdateCodingQuestion: 'coding/Coding/CreateorUpdateSingleFileAsync',
  createOrUpdateStackQuestion: 'stack/Stack/CreateOrUpdateStackQuestionDetailsAsync',
  getStackQuestion: 'stack/Stack/GetQuestionStackDetails',
  validateStackQuestions: 'stack/Stack/StackBasedAssessmentUploadValidation',
  uploadStackQuestions: 'stack/Stack/StackBasedAssessmentUpload',
  getAllSupportedStackLanguages: 'stack/Stack/GetAllSupportedStackLanguages',
  getBulkUploadHistory: "yaksha/Question/GetBulkUploadHistory",
  getUserByTenantId: "yaksha/Question/GetUserByTenantId",
  isXmlValid: "stack/Stack/IsScanConfigXMLValid",
  questionsMappedAssessments: "yaksha/Question/QuestionsMappedInAssessment",
  getSkills: "yaksha/Question/GetSkills",
  getSubSkills: "yaksha/Question/GetSubSkills",
  getSubSubSkills: "yaksha/Question/GetSubSubSkills",
  isQuestionMappedInAssessment: "yaksha/Question/IsQuestionMappedInAssessment",
  updateReviewedQuestion: "yaksha/Assessment/UpdateQuestion"
};

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private apiClient: ApiClientService) { }

  getCategories(): Observable<Result<CategoryDetails[]>> {
    return this.apiClient.get(routes.getCategories);
  }

  getQuestion(id: number): Observable<Result<GetQuestion>> {
    return this.apiClient.get(routes.getQuestion + "?questionId=" + id);
  }

  getAllSkills(): Observable<Result<GetSkills>> {
    return this.apiClient.get(routes.getAllSkills);
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

  createQuestion(file: FormData): Observable<Result<boolean>> {
    return this.apiClient.postFile(routes.createQuestion, file);
  }

  validationMcqQuestions(file: FormData): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.validateMcqQuestions, file);
  }

  uploadMcqQuestions(file: FormData): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.uploadMcqQuestions, file);
  }

  validationCodingQuestions(file: FormData, questionType: string): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.validateCodingOrCloudQuestions + "?questionType=" + questionType, file);
  }

  uploadCodingQuestions(file: FormData, questionType: string): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.uploadCodingOrCloudQuestions + "?questionType=" + questionType, file);

  }


  updateQuestion(file: FormData): Observable<Result<boolean>> {
    return this.apiClient.putFile(routes.updateQuestion, file);
  }

  getProficiencies(): Observable<Result<GetProficiencies[]>> {
    return this.apiClient.get(routes.getProficiencies);
  }

  getPlanSize(): Observable<Result<GetPlanSize[]>> {
    return this.apiClient.get(routes.getPlanSize);
  }

  getProficiencyMetadata(): Observable<Result<GetProficiencyMetadata[]>> {
    return this.apiClient.get(routes.getProficiencyMetadata);
  }

  getQuestionTypes(): Observable<Result<GetQuestionTypes[]>> {
    return this.apiClient.get(routes.getQuestionTypes);
  }
  getAllCompilerLanguages(): Observable<Result<CompilerLanguages[]>> {
    return this.apiClient.get(routes.getAllCompilerLanguages);
  }

  createCodingQuestion(data: CreateCodingQuestionDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.createOrUpdateCodingQuestion, data);
  }
  updateCodingQuestion(data: UpdateCodingQuestionDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.createOrUpdateCodingQuestion, data);
  }
  getCodingQuestion(id: number): Observable<Result<CodingImportDto[]>> {
    return this.apiClient.get(routes.getCodingQuestion + "?questionId=" + id);
  }

  deleteQuestion(id: string): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteQuestion + "?questionIds=" + id);
  }

  bulkDeleteQuestion(params: string): Observable<Result<boolean>> {
    return this.apiClient.delete(routes.deleteQuestion + "?questionIds=" + params);
  }

  createUpdateStackQuestions(data: FormData): Observable<Result<boolean>> {
    return this.apiClient.postFile(routes.createOrUpdateStackQuestion, data);
  }

  getStackQuestion(id: number): Observable<Result<GetStackQuestionDetails>> {
    return this.apiClient.get(routes.getStackQuestion + "?questionId=" + id);
  }

  validateStackQuestions(file: FormData): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.validateStackQuestions, file);
  }

  uploadStackQuestions(file: FormData): Observable<Result<string[]>> {
    return this.apiClient.postFile(routes.uploadStackQuestions, file);
  }

  getAllSupportedStackLanguages(): Observable<Result<SupportedStackLanguages[]>> {
    return this.apiClient.get(routes.getAllSupportedStackLanguages);
  }

  getBulkUploadHistory(params: BulkUploadHistoryFilter): Observable<Result<BulkUploadResults>> {
    return this.apiClient.get(routes.getBulkUploadHistory, Helper.httpParamBuilder(params));
  }

  getUserByTenantId(tenantId?: number): Observable<Result<string[] | null>> {
    if (tenantId === undefined) {
      return this.apiClient.get(routes.getUserByTenantId);
    }
    else {
      return this.apiClient.get(routes.getUserByTenantId + "?tenantId=" + tenantId);
    }
  }

  isXMLValid(xmlString: string): Observable<Result<boolean>> {
    return this.apiClient.get(routes.isXmlValid, Helper.httpParamBuilder({ xmlString }));
  }

  isQuestionMappedInAssessment(questionId: number): Observable<Result<boolean>> {
    return this.apiClient.get(routes.isQuestionMappedInAssessment + "?questionId=" + questionId);
  }

  questionsMappedAssessments(questionIds: string): Observable<Result<any>> {
    return this.apiClient.post(routes.questionsMappedAssessments + "?questionIds=" + questionIds);
  }

  updateReviewedQuestion(file: FormData): Observable<Result<boolean>> {
    return this.apiClient.putFile(routes.updateReviewedQuestion, file);
  }
}
