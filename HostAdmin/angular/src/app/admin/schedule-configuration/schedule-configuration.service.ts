import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiClientService } from "@app/service/common/api-client.service";
import { Result } from '@app/shared/core-interface/base';
import { TenantConfigurationResponse, TenantScheduleConfigRequestDto, TenantScheduleRequestDto } from "./schedule-configuration.data";
import { Helper } from "@app/shared/helper";
import { TenantsDto } from "../tenants/tenant-detail";

const routes = {
    getTenantScheduleCofiguration: "yaksha/Feature/GetTenantScheduleConfiguration",
    createOrUpdateTenantScheduleConfig: "yaksha/Feature/CreateOrUpdateTenantScheduleConfiguration",
    getAllTenants: "yaksha/Feature/GetAllTenantsWithoutConfiguration",
    deleteTenantScheduleConfiguration: "yaksha/Feature/DeleteTenantScheduleConfiguration"
}

@Injectable({
    providedIn: 'root'
})

export class ScheduleConfigurationService {
    constructor(private apiClient: ApiClientService) { }

    getAllTenantScheduleConfiguration(request: TenantScheduleRequestDto): Observable<Result<TenantConfigurationResponse>>{
        return this.apiClient.get(routes.getTenantScheduleCofiguration, Helper.httpParamBuilder(request));
    }

    createOrUpdateScheduleConfig(request: TenantScheduleConfigRequestDto): Observable<Result<boolean>>{
        return this.apiClient.post(routes.createOrUpdateTenantScheduleConfig, request);
    }

    getAllTenants(): Observable<Result<TenantsDto[]>>{
        return this.apiClient.get(routes.getAllTenants);
    }

    deleteTenantScheduleConfig(tenantId: number): Observable<Result<boolean>>{
        return this.apiClient.delete(routes.deleteTenantScheduleConfiguration + "?tenantId=" + tenantId);
    }
}