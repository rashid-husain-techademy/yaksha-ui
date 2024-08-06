import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../app/service/common/api-client.service';
import { GetTenantDetails, TenantDetails, TenantsDto } from './tenant-detail';
import { Helper } from '@app/shared/helper';
import { Result } from '@app/shared/core-interface/base';

const routes = {
  createOrUpdateTenant: "yaksha/Tenant/CreateOrUpdateTenantAsync",
  getTenantDetails: "yaksha/Tenant/GetTenantDetails",
  deleteTenant: "yaksha/Tenant/DeleteTenantAsync",
  getAllTenant: "yaksha/Tenant/GetAllTenants",
  isTenantNameExists: "yaksha/Tenant/IsTenantExist",
  updateTenantLogo: "yaksha/Feature/UpdateTenantLogo",
  getTenantCustomizationSettings: "yaksha/Tenant/GetTenantCustomizationSettings"
};

@Injectable({
  providedIn: 'root'
})

export class TenantsService {

  constructor(private apiClient: ApiClientService) { }

  createOrUpdateTenant(tenants): Observable<Result<boolean>> {
    return this.apiClient.post(routes.createOrUpdateTenant, tenants);
  }

  isTenantNameExists(tenancyName): Observable<Result<boolean>> {
    return this.apiClient.post(routes.isTenantNameExists + "?tenancyName=" + tenancyName);
  }

  getAllTenantDetails(parms: TenantDetails): Observable<Result<GetTenantDetails>> {
    return this.apiClient.get(routes.getTenantDetails, Helper.httpParamBuilder(parms));
  }

  getAllTenants(): Observable<Result<TenantsDto[]>> {
    return this.apiClient.get(routes.getAllTenant);
  }

  deleteTenant(tenantId: number): Observable<Result<boolean>> {
    return this.apiClient.delete(`${routes.deleteTenant}?tenantId=${tenantId}`);
  }

  uploadTenantLogo(tenantId: number, file: FormData): Observable<Result<boolean>> {
    return this.apiClient.putFile(routes.updateTenantLogo + "?tenantId=" + tenantId, file);
  }

  getTenantCustomizationSettings(tenantId: number): Observable<Result<string>> {
    return this.apiClient.get(routes.getTenantCustomizationSettings + "?tenantId=" + tenantId);
  }
}

