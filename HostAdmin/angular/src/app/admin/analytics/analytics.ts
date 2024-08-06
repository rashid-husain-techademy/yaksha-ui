import { DashboardType, DashboardUserRoles, ProjectType } from '@app/admin/analytics/analytics-details'

export interface DashboardData {
    userId: number;
    tenantId?: number;
    role: DashboardUserRoles;
    dashboardType?: DashboardType;
    projectType: ProjectType;
}

export interface DashboardEmbedData {
    embedUrl: string;
    embedToken: string;
    reportId: string;
    reportName: string;
    errorMessage: string;
}

export interface AnalyticsEmbedComponentData {
    name: string;
    id: number;
    isUserDashboard: boolean;
}