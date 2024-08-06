export interface TenantRolesResponseDto{
    totalCount: number;
    tenantRoles: TenantRoles[];
}

export interface TenantRoles{
    roleName: string;
    roleId: number;
    permissions: PermissionDto[];
    users: TenantUserListDto[]
}

export interface PermissionDto{
    id: number;
    permissionName: string;
}

export interface TenantRolesRequestDto {
    tenantId: number;
    maxResultCount: number;
    skipCount: number;
}

export interface FeatureList{
    id: number;
    name: string;
    permissionName: string;
}

export interface CreateTenantRoleRequestDto{
    id: number;
    tenantId: number;
    roleName: string;
    permissions: FeatureList[];
}

export interface DeleteRoleRequestDto{
    roleId: number;
}

export interface RoleDto{
    roleName: string;
    roleId: number;
}

export interface TenantUserResponse{
    userDetails: TenantUserListDto[];
    tenantUserRoleId: number | null;
}

export interface TenantUserListDto{
    id: number;
    emailAddress: string;
    roleId: number;
}

export interface AssignUserRoleRequestDto{
    roleId: number;
    users: number[];
    isEdit: boolean;
}

export interface TenantRoleUsersRequestDto{
    skipCount: number,
    maxResultCount: number
}

export interface TenantRoleUsersResponseDto{
    totalCount: number,
    tenantRoleUsers: TenantRoleUsers[];
}

export interface TenantRoleUsers{
    roleId: number;
    roleName: string;
    users: TenantUserListDto[];
}
