import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiClientService } from "../../../service/common/api-client.service";
import { CreateTenantRoleRequestDto, DeleteRoleRequestDto, RoleDto, TenantRolesRequestDto, TenantRolesResponseDto, TenantRoleUsersRequestDto, TenantRoleUsersResponseDto, TenantUserResponse } from "./role-data";
import { Helper } from '@app/shared/helper';
import { Result } from '@app/shared/core-interface/base';

const routes = {
    getAllTenantRoles: "yaksha/Role/GetAllTenantRoles",
    createOrUpdateRolePermission: "yaksha/Role/CreateOrUpdateRolePermission",
    deleteUserRolePermissions: "yaksha/Role/DeleteUserRolePermissions",
    getTenantUsersList: "yaksha/Role/GetTenantUsers",
    getTenantUsersListByRole: "yaksha/Role/GetTenantUsersByRole",
    assignUserRolePermission: "yaksha/Role/CreateOrUpdateUserRole",
    getAllTenantRoleUsers: "yaksha/Role/GetAllTenantUserRoles",
    getAllRoles: "yaksha/Role/getAllRoles"
};

@Injectable({
    providedIn: 'root'
})

export class RoleAssignmentService {
    constructor(private apiClient: ApiClientService) { }

    getAllTenantRoles(request: TenantRolesRequestDto): Observable<Result<TenantRolesResponseDto>>{
        return this.apiClient.get(routes.getAllTenantRoles, Helper.httpParamBuilder(request));
    }

    createOrUpdateRolePermission(request: CreateTenantRoleRequestDto): Observable<Result<boolean>>{
        return this.apiClient.post(routes.createOrUpdateRolePermission, request);
    }

    deleteUserRolePermission(request: DeleteRoleRequestDto): Observable<Result<boolean>>{
        return this.apiClient.delete(routes.deleteUserRolePermissions, Helper.httpParamBuilder(request));
    }

    getTenantUsersList(): Observable<Result<TenantUserResponse>>{
        return this.apiClient.get(routes.getTenantUsersList);
    }
    getTenantUsersListByRole(roleName:string): Observable<Result<TenantUserResponse>>{
        return this.apiClient.get(routes.getTenantUsersListByRole+ "?roleName=" + roleName);
    }

    assignUserRole(request: any): Observable<Result<boolean>>{
        return this.apiClient.post(routes.assignUserRolePermission, request);
    }

    getAllTenantRoleUsers(request: TenantRoleUsersRequestDto): Observable<Result<TenantRoleUsersResponseDto>>{
        return this.apiClient.get(routes.getAllTenantRoleUsers, Helper.httpParamBuilder(request));
    }

    getAllRoles(): Observable<Result<Array<RoleDto>>>{
        return this.apiClient.get(routes.getAllRoles);
    }

}
