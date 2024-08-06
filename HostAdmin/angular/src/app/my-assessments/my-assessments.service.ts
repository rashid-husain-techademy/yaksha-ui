import { Injectable } from '@angular/core';
import { Result } from './../shared/core-interface/base';
import { Helper } from './../shared/helper';
import { Observable } from 'rxjs';
import { ApiClientService } from './../service';
import { AssessmentProgressFilter, PagedUserCampaigns, UserAssessmentProgressDetails, UserAssessmentsDetails, UserAssessmentsFilter, UserCampaignAssessment, UserCampaignRequest } from './my-assessments';

const routes = {
  getMyAssessmentsList: 'yaksha/UserAssessment/GetUserAssessments',
  getAssessmentProgress: 'yaksha/UserAssessment/UserAssessmentsProgress',
  getUserCampaigns: 'yaksha/UserAssessment/GetUserCampaigns',
  getCampaignAssessmentProgressDetails: 'yaksha/UserAssessment/UserCampaignAssessmentsProgress',
  getUserCampaignAssessments: 'yaksha/UserAssessment/GetUserCampaignAssessments'
};

@Injectable({
  providedIn: 'root'
})
export class MyAssessmentsService {
  constructor(private apiClient: ApiClientService) { }

  getMyAssessmentsList(data: UserAssessmentsFilter): Observable<Result<UserAssessmentsDetails>> {
    return this.apiClient.get(routes.getMyAssessmentsList, Helper.httpParamBuilder(data));
  }

  getAssessmentProgressDetails(data: AssessmentProgressFilter): Observable<Result<UserAssessmentProgressDetails>> {
    return this.apiClient.get(routes.getAssessmentProgress, Helper.httpParamBuilder(data));
  }

  getUserCampaigns(data: UserCampaignRequest): Observable<Result<PagedUserCampaigns>> {
    return this.apiClient.get(routes.getUserCampaigns, Helper.httpParamBuilder(data));
  }

  getUserCampaignAssessments(campaignId: number, campaignScheduleId: number): Observable<Result<UserCampaignAssessment>> {
    return this.apiClient.get(routes.getUserCampaignAssessments + "?campaignid=" + campaignId + "&campaignScheduleId=" + campaignScheduleId);
  }

}
