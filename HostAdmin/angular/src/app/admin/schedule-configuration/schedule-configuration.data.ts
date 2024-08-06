export interface TenantScheduleConfigRequestDto{
    tenantId: number;
    scheduleConfig: TenantScheduleConfigDto;
}

export interface TenantScheduleConfigDto {
    selectReviewers: boolean;
    executionCount: boolean;
    mockSchedule: boolean;
    enablePlagiarism: boolean;
    customField: boolean;
    publicSchedule: boolean;
    inviteSchedule: boolean;
    selfEnrollment: boolean;
}

export interface TenantConfigurationResponse{
    totalCount: number;
    tenantsScheduleConfig: TenantScheduleConfig[];
}

export interface TenantScheduleConfig{
    tenantName: string;
    tenantId: number;
    scheduleConfig: string;
}

export interface TenantScheduleRequestDto{
    skipCount: number;
    maxResultCount: number;
}