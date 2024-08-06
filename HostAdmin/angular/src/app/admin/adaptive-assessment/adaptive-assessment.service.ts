import { Injectable } from '@angular/core';
import { AdaptiveAssessment, AdaptiveAssessmentDetails, AdaptiveAssessmentFilter, AdaptiveAssessmentScheduleFilter, AdaptiveAssessmentSchedules, CreateAdaptiveAssessmentResultDto, ExternalAdaptiveAssessmentDetails, SchdeuleAdaptiveAssessmentResponseDto, TenantList } from '../adaptive-assessment/adaptive-assessment';
import { Result } from '@app/shared/core-interface/base';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../service/common/api-client.service';
import { Helper } from '@app/shared/helper';


const routes = {

  getAllTenants: 'yaksha/Tenant/GetAllTenants',
  getCategorySkills: 'yaksha/AdaptiveAssessment/GetCategorySkills',
  createAdaptiveAssessment: 'yaksha/AdaptiveAssessment/CreateAdaptiveAssessment',
  getAdaptiveAssessment: 'yaksha/AdaptiveAssessment/GetAdaptiveAssessments',
  scheduleAdaptiveAssessment: 'yaksha/AdaptiveAssessment/ScheduleAndInviteAdaptiveAssessment',
  getExternalAdaptiveAssessmentDetailById: "yaksha/AdaptiveAssessment/GetExternalAdaptiveAssessmentDetailById",
  getAllAdaptiveAssessmentSchedules: "yaksha/AdaptiveAssessment/GetAdaptiveAssessmentSchedule",
  getUserAdaptiveAssessmentScheduleInviteDetails: "yaksha/AdaptiveAssessment/GetUserAdaptiveAssessmentScheduleInviteDetails"
};

@Injectable({
  providedIn: 'root'
})
export class AdaptiveAssessmentService {

  constructor(private apiClient: ApiClientService) { }
  getAllTenants(): Observable<Result<TenantList[]>> {
    return this.apiClient.get(routes.getAllTenants);
  }
  getCategorySkills(): Observable<Result<string>> {
    return this.apiClient.get(routes.getCategorySkills);
  }
  createAdaptiveAssessment(adaptiveAssessment: AdaptiveAssessment): Observable<Result<CreateAdaptiveAssessmentResultDto>> {
    return this.apiClient.post(routes.createAdaptiveAssessment, adaptiveAssessment);
  }
  getAdaptiveAssessment(data: AdaptiveAssessmentFilter): Observable<Result<AdaptiveAssessmentDetails>> {
    return this.apiClient.get(routes.getAdaptiveAssessment, Helper.httpParamBuilder(data));
  }
  scheduleAdaptiveAssessment(data: FormData): Observable<Result<SchdeuleAdaptiveAssessmentResponseDto>> {
    return this.apiClient.postFile(routes.scheduleAdaptiveAssessment, data);
  }

  getAdaptiveAssessmentDetail(assessmentId: number): Observable<Result<ExternalAdaptiveAssessmentDetails>> {
    return this.apiClient.get(routes.getExternalAdaptiveAssessmentDetailById + "?assessmentId=" + assessmentId);
  }

  getAllAdaptiveAssessmentSchedule(data: AdaptiveAssessmentScheduleFilter): Observable<Result<AdaptiveAssessmentSchedules>> {
    return this.apiClient.get(routes.getAllAdaptiveAssessmentSchedules, Helper.httpParamBuilder(data));
  }

  getUserAdaptiveAssessmentScheduleInviteDetails(data: AdaptiveAssessmentScheduleFilter): Observable<Result<AdaptiveAssessmentSchedules>> {
    return this.apiClient.get(routes.getUserAdaptiveAssessmentScheduleInviteDetails, Helper.httpParamBuilder(data));
  }
}
