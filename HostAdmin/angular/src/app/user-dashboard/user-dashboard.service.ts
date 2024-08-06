import { Injectable } from '@angular/core';
import { DashboardData, DashboardEmbedData } from '@app/admin/analytics/analytics';
import { SkillScoreDto, UserInput } from '@app/admin/user-profile/my-profile/my-profile';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { Observable } from 'rxjs';
import { ApiClientService } from '../service/common/api-client.service';
import { userProgressData, userAssessmentData, assessmentStatus } from './user-dashboard';

const routes = {
  getUserProgress: "yaksha/Dashboard/GetDashboardData",
  getRecentlyAccessedData: "yaksha/Dashboard/GetUserRecentAccessedAssessment",
  getUserUpcomingAssessment: "yaksha/Dashboard/GetUserUpcomingAssessment",
  getTopSkillAssessments: "yaksha/Dashboard/GetTopSkillAssessments",
  getAssessmentStatus: "yaksha/Dashboard/GetAssessmentStatus",
  skillProficiencyData: "yaksha/UserAssessment/GetSkillWiseScore",
  getDashboard: "yaksha/Dashboard/GetDashboard"
};

@Injectable({
  providedIn: 'root'
})

export class UserDashboardService {

  constructor(private apiClient: ApiClientService) { }

  getUserProgress(): Observable<Result<userProgressData>> {
    return this.apiClient.get(routes.getUserProgress);
  }

  getUserRecentAccessedAssessment(): Observable<Result<userAssessmentData>> {
    return this.apiClient.get(routes.getRecentlyAccessedData);
  }

  getUserUpcomingAssessment(): Observable<Result<userAssessmentData>> {
    return this.apiClient.get(routes.getUserUpcomingAssessment);
  }

  getTopFiveAssessments(): Observable<Result<assessmentStatus>> {
    return this.apiClient.get(routes.getAssessmentStatus);
  }

  getSkillProficiencyScores(input: UserInput, isIncludePublicSchedule: boolean = true): Observable<Result<Array<SkillScoreDto>>> {
    return this.apiClient.get(routes.skillProficiencyData + "?isIncludePublicSchedule=" + isIncludePublicSchedule, Helper.httpParamBuilder(input));
  }

  getDashboard(data: DashboardData): Observable<Result<DashboardEmbedData>> {
    return this.apiClient.get(routes.getDashboard, Helper.httpParamBuilder(data));
  }
}
