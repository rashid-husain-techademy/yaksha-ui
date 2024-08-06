import { Injectable } from '@angular/core';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { PostAssessmentResult, TestCaseResultDto } from '@app/test-taker/test-data';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../service/common/api-client.service';
import { SkillImport, SkillList, SkillsList } from '../manage-tags/skill-details';
import { AIAdaptiveAssessmentRequest, AssessmentProgressInput, CatalogList, CatalogRequest, RubrixFileZipInputDto, RubrixZipFileResponseDto, ShowAnswerDto, ShowAnswerInput, SkillMetricsDto, SkillProficiencyPercentageDto, UserInput, UserProfilePageDto, UserRubrixFileResponseDto } from './my-profile/my-profile';
import { AIAdaptiveAssessmentReportDto } from '../adaptive-assessment/adaptive-assessment';

const routes = {
  getUserAssessmentMetricsById: 'yaksha/UserAssessment/GetUserAssessmentMetrics',
  getSkillWiseMetrics: 'yaksha/UserAssessment/GetSkillWiseMetrics',
  getSkillProficiencyMetrics: 'yaksha/UserAssessment/GetSkillProficiencyMetrics',
  getUserAssessments: 'yaksha/UserAssessment/UserAssessmentsProgress',
  getUserAssessmentsProgress: 'yaksha/UserAssessment/GetUserAssessmentsProgress',
  getAllSkill: 'yaksha/Skill/GetSkillDetailsByName',
  createOrUpdateSkill: 'yaksha/Skill/CreateOrUpdateSkillAsync',
  isskillNameExists: 'yaksha/Skill/IsSkillExist',
  getSkillDetails: 'yaksha/Skill/SearchSkillDetails',
  updateSkill: 'yaksha/Skill/UpdateSkillAsync',
  getTestCasesResults: 'yaksha/UserAssessment/GetUserAssessmentSFAResult',
  getCandidateRubrixFileUrl: 'yaksha/UserAssessment/GetCandidateRubrixFileUrl',
  getRubrixZipFileUrl: 'yaksha/UserAssessment/GetRubrixZipFile',
  getUserSpecificCatalogs: 'yaksha/Catalog/GetUserSpecificCatalogs',
  getUserAssessmentAnswer: 'yaksha/UserAssessment/GetUserAttemptedQuestionAnswers',
  getUserAIAdaptiveAssessmentReports: 'yaksha/AdaptiveAssessment/GetUserAIAdaptiveAssessmentReports'
};

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(private apiClient: ApiClientService) { }

  getUserAssessmentMetricsById(input: UserInput): Observable<Result<UserProfilePageDto>> {
    return this.apiClient.get(routes.getUserAssessmentMetricsById, Helper.httpParamBuilder(input));
  }
  getSkillWiseMetrics(input: UserInput): Observable<Result<Array<SkillMetricsDto>>> {
    return this.apiClient.get(routes.getSkillWiseMetrics, Helper.httpParamBuilder(input));
  }
  getSkillProficiencyMetrics(input: UserInput): Observable<Result<Array<SkillProficiencyPercentageDto>>> {
    return this.apiClient.get(routes.getSkillProficiencyMetrics, Helper.httpParamBuilder(input));
  }
  getUserAssessments(input: AssessmentProgressInput): Observable<Result<PostAssessmentResult[]>> {
    return this.apiClient.get(routes.getUserAssessments, Helper.httpParamBuilder(input));
  }
  getUserAssessmentsProgress(input: AssessmentProgressInput): Observable<Result<PostAssessmentResult[]>> {
    return this.apiClient.get(routes.getUserAssessmentsProgress, Helper.httpParamBuilder(input));
  }
  getAllSkill(input: UserInput): Observable<Result<Array<SkillList>>> {
    return this.apiClient.get(routes.getAllSkill, Helper.httpParamBuilder(input));
  }
  createOrUpdateSkill(skills: any): Observable<Result<boolean>> {
    let skill = new Array<any>();
    skill.push(skills);
    return this.apiClient.post(routes.createOrUpdateSkill, skill);
  }
  isskillNameExists(skillData: SkillImport): Observable<Result<boolean>> {
    return this.apiClient.post(routes.isskillNameExists, skillData);
  }
  getAllSkillDetails(parms: any): Observable<Result<SkillsList>> {
    return this.apiClient.post(routes.getSkillDetails, parms);
  }
  getTestCasesResult(parms: UserInput): Observable<Result<Array<TestCaseResultDto>>> {
    return this.apiClient.get(routes.getTestCasesResults, Helper.httpParamBuilder(parms));
  }

  GetCandidateRubrixFileUrl(parms: UserInput): Observable<Result<UserRubrixFileResponseDto>> {
    return this.apiClient.get(routes.getCandidateRubrixFileUrl, Helper.httpParamBuilder(parms));
  }

  GetRubrixZipFileUrl(parms: RubrixFileZipInputDto): Observable<Result<RubrixZipFileResponseDto>> {
    return this.apiClient.post(routes.getRubrixZipFileUrl, parms);
  }

  getUserSpecificCatalogs(params: CatalogRequest): Observable<Result<CatalogList>> {
    return this.apiClient.get(routes.getUserSpecificCatalogs, Helper.httpParamBuilder(params));
  }

  getUserAssessmentAnswers(params: ShowAnswerInput): Observable<Result<Array<ShowAnswerDto>>> {
    return this.apiClient.get(routes.getUserAssessmentAnswer, Helper.httpParamBuilder(params));
  }

  getUserAIAdaptiveAssessmentReports(params: AIAdaptiveAssessmentRequest): Observable<Result<AIAdaptiveAssessmentReportDto>> {
    return this.apiClient.get(routes.getUserAIAdaptiveAssessmentReports, Helper.httpParamBuilder(params));
  }
}
