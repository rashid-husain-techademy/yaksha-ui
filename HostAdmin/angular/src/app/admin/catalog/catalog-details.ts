export interface CreateCatalogDto {
    catalogName: string,
    tenantId: number,
    isActive: boolean,
    Id: number
}

export interface CreateSelfCatalogDto {
    catalogId: number,
    tenantId: number
}

export interface CatalogDetailsResult {
    catalogId: number,
    catalogName: string,
    totalAssessments: number,
    assignedScopeId: number
    catalogStatus: boolean,
    assignedTenantId: number,
    assignedTenantName: string,
    catalogScope: number
}

export interface cataLogList {
    catalogDetails: CatalogDetailsResult[],
    totalCount: number
}

export interface catalogRequest {
    skipCount: number;
    maxResultCount: number;
}

export interface GroupDetail {
    catalogId: number;
    userName: string | null;
    skipCount: number;
    maxResultCount: number;
}

export interface GetUserGroupDetails {
    groupUsers: UserList[];
    groupId: number;
    totalCount: number;
}

export interface UserList {
    id: number,
    userId: number,
    userName: string,
    isActive: boolean
}

export interface UserGroupValidation {
    isSuccess: boolean;
    errorList: string[];
}

export interface GroupDetailsDto {
    tenantId: number,
    groupId: number
}

export interface UpdateStatusDto {
    id: number,
    status: boolean
}

export interface CatalogDataDto {
    id: number;
    catalogName: string;
}

export interface catalogResponseDto {
    errorMessage: string;
    isSuccess: boolean;
}