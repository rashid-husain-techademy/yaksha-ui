import { Injectable } from '@angular/core';
import { ApiClientService } from '../../service/common/api-client.service';
import { CampaignDetail, CampaignRequestDto, CampaignResultDto, CampaignScheduleDataDto, CampaignScheduleResultDto, CampaignSchedules, CampaignSchedulesListDto, CreateOrUpdateCampaignDto, GetCampaignScheduleDetails, UpdateCampaignSchedule, UpdateCampaignStatusDto, campaignAssessmentDeleteDto, campaignDetailRequestDto, CampaignInput, CampaignResult, UpdateScheduledCampaign, ValidateCampaignRequestDto, ValidateCampaignResultDto, CampaignScheduleDto } from '../campaign/campaign';
import { Observable } from 'rxjs';
import { Result } from '../../shared/core-interface/base';
import { CreateResultDto, ExportHackathonReportDto, CampaignStatusDto, AssessmentTenants, ResultDto } from '../assessment/assessment';
import { Helper } from '@app/shared/helper';



const routes = {
    createOrUpdateCampaign: "yaksha/Campaign/CreateOrUpdateCampaignAsync",
    getCampaigns: "yaksha/Campaign/GetCampaigns",
    getCampaignDetailsByIdAsync: "yaksha/Campaign/GetCampaignDetailsByIdAsync",
    deleteCampaign: "yaksha/Campaign/DeleteCampaign",
    deleteCampaignAssessment: "yaksha/Campaign/DeleteCampaignAssessment",
    updateCampaignStatusAsync: "yaksha/Campaign/UpdateCampaignStatusAsync",
    getUserCampaignResults: "yaksha/UserAssessment/GetUserCampaignResults",
    scheduleCampaign: "yaksha/Campaign/ScheduleCampaign",
    getCampaignSchedules: "yaksha/Campaign/GetCampaignSchedules",
    updateCampaignScheduleStatusAsync: "yaksha/Campaign/UpdateCampaignScheduleStatusAsync",
    getCampaignScheduleDetails: "yaksha/Campaign/GetCampaignScheduleDetails",
    updateScheduledCamapign: "yaksha/Campaign/UpdateCampaignSchedule",
    getTenantByCampaignId: "yaksha/Campaign/GetTenantByCampaignId",
    isCampaignNameExists: "yaksha/Campaign/IsCampaignNameExists",
    UpdateCampaignScheduleInvites: "yaksha/Campaign/UpdateCampaignScheduleInvites",
    validateUserCampaign: "yaksha/UserAssessment/ValidateUserCampaign",
    exportCampaignReport: 'yaksha/Report/ExportCampaignScheduleReport',
    getCampaignScheduleStatus: "yaksha/UserAssessment/GetCampaignScheduleStatusAsync",
    isCloudBasedCampaign: "yaksha/Campaign/IsCloudBasedCampaignAssessmentAsync",
    getUserAssessmentCampaignScheduleInviteEmails: "yaksha/UserAssessment/GetCampaignInviteScheduleEmails"
};

@Injectable({
    providedIn: 'root'
})

export class CampaignService {

    constructor(private apiClient: ApiClientService) { }

    createOrUpdateCampaign(campaign: CreateOrUpdateCampaignDto): Observable<Result<CreateResultDto>> {
        return this.apiClient.post(routes.createOrUpdateCampaign, campaign);
    }

    getCampaigns(campaignRequest: CampaignRequestDto): Observable<Result<CampaignResultDto>> {
        return this.apiClient.get(routes.getCampaigns, Helper.httpParamBuilder(campaignRequest));
    }

    getCampaignDetail(campaignDetailRequest: campaignDetailRequestDto): Observable<Result<CampaignDetail>> {
        return this.apiClient.get(routes.getCampaignDetailsByIdAsync, Helper.httpParamBuilder(campaignDetailRequest));
    }

    deleteCampaign(id: number): Observable<Result<boolean>> {
        return this.apiClient.delete(routes.deleteCampaign + "?campaignId=" + id);
    }

    deleteCampaignAssessment(data: campaignAssessmentDeleteDto): Observable<Result<ResultDto>> {
        return this.apiClient.delete(routes.deleteCampaignAssessment, Helper.httpParamBuilder(data));
    }

    updateCampaignStatusAsync(data: UpdateCampaignStatusDto): Observable<Result<boolean>> {
        return this.apiClient.put(routes.updateCampaignStatusAsync, data);
    }

    getUserCampaignResults(input: CampaignInput): Observable<Result<CampaignResult>> {
        return this.apiClient.get(routes.getUserCampaignResults, Helper.httpParamBuilder(input));
    }
    scheduleCampaign(data: FormData): Observable<Result<CampaignScheduleResultDto>> {
        return this.apiClient.postFile(routes.scheduleCampaign, data);
    }

    getCampaignScheduleList(data: CampaignSchedulesListDto): Observable<Result<CampaignSchedules>> {
        return this.apiClient.get(routes.getCampaignSchedules, Helper.httpParamBuilder(data));
    }

    getCampaignScheduleById(data: GetCampaignScheduleDetails): Observable<Result<CampaignScheduleDataDto>> {
        return this.apiClient.get(routes.getCampaignScheduleDetails, Helper.httpParamBuilder(data));
    }

    updateCampaignScheduleStatus(data: UpdateCampaignSchedule): Observable<Result<CampaignScheduleDto>> {
        return this.apiClient.put(routes.updateCampaignScheduleStatusAsync, data);
    }

    updateScheduledCampaign(data: UpdateScheduledCampaign): Observable<Result<boolean>> {
        return this.apiClient.put(routes.updateScheduledCamapign, data);
    }

    getTenantsByCampaignId(campaignId: number): Observable<Result<AssessmentTenants[]>> {
        return this.apiClient.get(routes.getTenantByCampaignId + "?campaignId=" + campaignId);
    }

    isCampaignNameExists(name: string): Observable<Result<boolean>> {
        return this.apiClient.get(routes.isCampaignNameExists + "?name=" + name);
    }

    UpdateCampaignScheduleInvites(data: FormData): Observable<Result<boolean>> {
        return this.apiClient.putFile(routes.UpdateCampaignScheduleInvites, data);
    }

    validateUserCampaign(data: ValidateCampaignRequestDto): Observable<Result<ValidateCampaignResultDto>> {
        return this.apiClient.post(routes.validateUserCampaign, data);
    }

    exportScheduleReport(data: ExportHackathonReportDto): Observable<Result<boolean>> {
        return this.apiClient.post(routes.exportCampaignReport, data);
    }

    getCampaignScheduleStatus(tenantId: number, scheduleId: number): Observable<Result<CampaignStatusDto[]>> {
        return this.apiClient.get(routes.getCampaignScheduleStatus + "?tenantId=" + tenantId + "&scheduleId=" + scheduleId);
    }

    isCloudBasedCampaign(campaignId: number): Observable<Result<boolean>> {
        return this.apiClient.get(routes.isCloudBasedCampaign + "?campaignId=" + campaignId);
    }

    getUserAssessmentCampaignScheduleInviteEmails(scheduleId: number,tenantId: number): Observable<Result<any>>{
        return this.apiClient.get(routes.getUserAssessmentCampaignScheduleInviteEmails + "?campaignScheduleId="+scheduleId +"&tenantId="+tenantId);
    }

}
