import { Injectable } from '@angular/core';
import { ApiClientService } from '@app/service';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { Observable } from 'rxjs';
import { AssessmentStatus, AssessmentStatusRequest, DashboardAssessmentData, TenantAssessmentData, DashboardQuestionsCount, TopSkillAssessments, QuestionFilters, FilteredSkillProficiency } from './dashboard-details';

const routes = {
  getDashboardData: 'yaksha/Dashboard/GetDashboardData',
  getTenantAssessmentData: 'yaksha/Dashboard/GetTenantAssessmentCount',
  getDashboardQuestionsCount: 'yaksha/Dashboard/GetDashboardQuestionsCount',
  getAssessmentStatus: 'yaksha/Dashboard/GetAssessmentStatus',
  getTopSkillAssessments: 'yaksha/Dashboard/GetTopSkillAssessments',
  getFilteredSkillProficiency:'yaksha/Dashboard/GetFilteredSkillProficiency'
};

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  constructor(private apiClient: ApiClientService) { }

  getTopSkillAssessments(tenantId?: number): Observable<Result<TopSkillAssessments[]>> {
    if (tenantId)
      return this.apiClient.get(routes.getTopSkillAssessments + "?tenantId=" + tenantId);
    else
      return this.apiClient.get(routes.getTopSkillAssessments);
  }

  getDashboardData(): Observable<Result<DashboardAssessmentData>> {
    return this.apiClient.get(routes.getDashboardData);
  }

  getTenantAssessmentData(tenantId): Observable<Result<TenantAssessmentData>> {
    return this.apiClient.get(routes.getTenantAssessmentData + "?tenantId=" + tenantId);
  }

  getDashboardQuestionsCount(data: QuestionFilters): Observable<Result<DashboardQuestionsCount[]>> {
    return this.apiClient.get(routes.getDashboardQuestionsCount, Helper.httpParamBuilder(data));
  }

  getAssessmentStatus(assessmentStatusRequest: AssessmentStatusRequest): Observable<Result<AssessmentStatus>> {
    return this.apiClient.get(routes.getAssessmentStatus, Helper.httpParamBuilder(assessmentStatusRequest));
  }

  getFilteredSkillProficiency(tenantId?: string): Observable<Result<FilteredSkillProficiency[]>> {
    if (tenantId) {
      return this.apiClient.get(routes.getFilteredSkillProficiency + "?tenantId=" + tenantId);
    }
    else {
      return this.apiClient.get(routes.getFilteredSkillProficiency);
    }
  }
}
