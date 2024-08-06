export interface TenantDetails {
    tenantId: number;
    searchString: string | null;
    skipCount: number;
    maxResultCount: number;
}

export interface GetTenantDetails {
    tenants: TenantList[];
    totalCount: number;
}

export interface TenantList {
    id: number;
    tenancyName: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
    managerEmails: string[];
    managerEmailIds: string;
}

export interface TenantImport {
    tenancyName: string;
    name: string;
    isActive: boolean;
    configJson: string;
    managerEmails: string;
}

export interface TenantsDto {
    id: number;
    tenancyName: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
}

export interface tenantDetailsDto {
    id: number;
    name: string;
}


export interface TenantCustomizationSettings {
    TenantLogoUrl: string;
}