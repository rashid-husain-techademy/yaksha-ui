import { AssessmentStatus, CampaignValidationErrors, CatalogAssessmentType, CustomFieldType, ScheduleTarget, ScheduleType, UserAssessmentStatus, } from "../../enums/assessment";
import { CampaignScopeType } from "../../enums/campaign";

export interface CreateOrUpdateCampaignDto {
    id: number,
    name: string,
    authorName: string,
    description: string,
    instructions: string,
    status: AssessmentStatus,
    totalModules: string,
    tenantId: number,
    modules: ModuleDto[],
}

export interface ModuleDto {
    assessment?: Assessment;
    scope: CampaignScopeType,
    scopeId: number,
    campaignId: number
    sortOrder: number,
}

export interface Assessment {
    id: number,
    name: string
}

export interface CampaignRequestDto {
    TenantId: number | null;
    CampaignStatus: AssessmentStatus;
    SearchString: string;
    SkipCount: number;
    MaxResultCount: number;
}

export interface CampaignResultDto {
    totalCount: number;
    campaigns: CampaignDetailDto[];
}

export interface CampaignDetailDto {
    id: number,
    name: string,
    authorName: string,
    description: string,
    instructions: string,
    status: AssessmentStatus,
    totalModules: string,
    tenantId: number,
    isOwned: boolean | null;
    type: CatalogAssessmentType;
    assessments?: number,
    virtutors?: number,
    hasActiveSchedules: boolean;
}

export interface CampaignDetail {
    id: number,
    name: string,
    description: string,
    instructions: string,
    status: AssessmentStatus,
    totalModules: string,
    hasActiveSchedule: boolean,
    scheduleIdNumber: string,
    activeScheduleId: number | null;
    isOwned: boolean | null;
    campaignAssessmentDetails: campaignAssessmentDetail[],
}

export interface campaignAssessmentDetail {
    name: string,
    assessmentId: number,
    assessmentScheduleId: number;
    link: string,
    scheduleIdNumber: string,
    isActive: true,
    duration: number;
    startDateTime: string;
    endDateTime: string;
    cutOffDateTime: string;
    scheduleType: ScheduleType
}

export interface campaignDetailRequestDto {
    campaignId: number,
    tenantId?: number,
}

export interface campaignAssessmentDeleteDto {
    campaignId: number,
    tenantId: number,
    scope: CampaignScopeType,
    scopeId: number,
    sortOrder: number
}

export interface UpdateCampaignStatusDto {
    campaignId: number,
    status: AssessmentStatus
}

export interface CampaignResult {
    totalCount: number;
    isExpand: boolean;
    campaignData: CampaignData[]; //data
}

export interface CampaignData {
    campaignId: number;
    campaignName: string;
    campaignScheduleId: number;
    status: UserAssessmentStatus;
    campaignAssessmentResults: CampaignAssessmentResults[]; //x
}

export interface CampaignAssessmentResults {
    assessmentId: number,
    assessmentScheduleId: number,
    userAssessmentMappingId: number,
    assessmentName: string,
    completionDate: string;
    blobNames: string[];
}

export class CampaignInput {
    userId: number;
    tenantId: number | null;
    SkipCount: number;
    MaxResultCount: number;
    catalogId?: number;
}
export interface ScheduleCampaign {
    campaignId: number,
    campaignName: string,
    tenantId: number,
    totalAttempts: number,
    duration: number,
    startDateTime: string,
    endDateTime: string,
    timeZone: string,
    scheduleTarget: ScheduleTarget,
    restrictToDomain: string,
    invitedUserEmails: string,
    scheduleType: ScheduleType,
    hasCloudBasedAssessment: boolean,
    scheduleCustomFields: CampaignScheduleCustomField[],
    testPurpose: string
}

export interface UpdateCampaignScheduled {
    campaignId: number,
    campaignScheduleId: number,
    endDateAndTime: string,
    timeZone: string,
    tenantId: number,
    endDateISOString: string
}

export interface CampaignScheduleResultDto {
    scheduleLink: string;
    scheduleId: number;
}

export interface CampaignScheduleCustomField {
    fieldLabel: string,
    scheduleId?: number,
    fieldType: CustomFieldType,
    defaultValue?: string,
    isMandatory: boolean,
    scope: CampaignScopeType
}

export interface CampaignSchedulesListDto {
    campaignId: number;
    skipCount: number;
    maxResultCount: number;
}

export interface CampaignSchedules {
    totalCount: number;
    campaignSchedules: CampaignSchedule[];
}

export interface UpdateCampaignSchedule {
    campaignScheduleId: number,
    tenantId?: number,
    isActive: boolean,
    isUpdateMetadata?: boolean;
}

export interface CampaignSchedule {
    id: number;
    tenantId: number | null;
    tenancyName: string;
    scheduleTarget: ScheduleTarget;
    startDateTime: Date | null;
    endDateTime: Date | null;
    isActive: boolean;
    scheduleLink: string;
    scheduleType: ScheduleType;
    testPurpose: string;
}

export interface GetCampaignScheduleDetails {
    campaignScheduleId: number;
}

export interface CampaignScheduleDataDto {
    campaignId: number;
    startDateTime: Date | null;
    endDateTime: Date | null;
    totalAttempts: string;
    duration: string;
    link: string;
    target: ScheduleTarget;
    scheduleType: ScheduleType;
    restrictToDomain: string;
    scheduleCustomFields: CampaignScheduleCustomField[];
    testPurpose: string;
}

export interface CampaignScheduleDto {
    id: number;
    tenantId: number;
    campaignId: number;
    scheduleIdNumber: string;
    startDateTime: Date | null;
    endDateTime: Date | null;
    duration: number;
    link: string;
    isActive: boolean;
}

export interface ScheduleCampaignPageInputData {
    tenantId: number;
    scheduleId: number;
    campaignId: number;
    campaignName: string;
    duration?: number;
    isUpdate?: boolean;
    campaignDate?: CampaignDate;
}

export interface UpdateScheduledCampaign {
    tenantId: number,
    campaignScheduleId: number,
    endDateTime: string,
    timeZone: string
}

export interface tenantsByCampaign {
    id: number,
    name: string,
    tenancyName: string
}
export interface ValidateCampaignRequestDto {
    tenantId: number;
    scheduleIdNumber: string;
    emailAddress: string;
    assessmentScheduleIdNumber?: string;
}

export interface ValidateCampaignResultDto {
    isAvailable: boolean;
    assessmentLink: string;
    errorCode: CampaignValidationErrors;
    startDateTime: string;
    endDateTime: string;
}

export interface CampaignDate {
    startDateTime: string;
    endDateTime: string;
}
