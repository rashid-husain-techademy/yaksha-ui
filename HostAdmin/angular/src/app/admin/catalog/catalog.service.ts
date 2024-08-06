import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../shared/core-interface/base';
import { ApiClientService } from '../../service/common/api-client.service';
import { CatalogDataDto, cataLogList, catalogRequest, catalogResponseDto, CreateCatalogDto, UpdateStatusDto, UserGroupValidation } from './catalog-details';
import { Helper } from '@app/shared/helper';


const routes = {
  getCatalogDetails: "yaksha/Catalog/GetCatalogDetails",
  createOrUpdateCatalog: "yaksha/Catalog/CreateOrUpdateCatalogAsync",
  deleteCatalog: "yaksha/Catalog/DeleteCatalog",
  assignCatalogAsync: "yaksha/Catalog/AssignCatalogAsync",
  userGroupValidation: "yaksha/Catalog/UserGroupValidation",
  insertOrUpdateGroupUsers: "yaksha/Catalog/InsertOrUpdateGroupUsers",
  updateActiveStatusAsync: "yaksha/Catalog/UpdateActiveStatusAsync",
  getAssignedCatalogs: "yaksha/Catalog/GetAssignedCatalogs"
};

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private apiClient: ApiClientService) { }

  getCatalog(data: catalogRequest): Observable<Result<cataLogList>> {
    return this.apiClient.get(routes.getCatalogDetails, Helper.httpParamBuilder(data));
  }

  createOrUpdateCatalog(params: CreateCatalogDto): Observable<Result<catalogResponseDto>> {
    return this.apiClient.post(routes.createOrUpdateCatalog, params);
  }

  deleteCatalog(catalogId: number, tenantId: number): Observable<Result<boolean>> {
    return this.apiClient.delete(`${routes.deleteCatalog}?catalogId=${catalogId}&tenantId=${tenantId}`);
  }

  assignCatalogAsync(data: FormData): Observable<Result<boolean>> {
    return this.apiClient.postFile(routes.assignCatalogAsync, data);
  }

  userGroupValidation(data: FormData): Observable<Result<UserGroupValidation>> {
    return this.apiClient.postFile(routes.userGroupValidation, data);
  }

  insertOrUpdateGroupUsers(data: FormData): Observable<Result<boolean>> {
    return this.apiClient.postFile(routes.insertOrUpdateGroupUsers, data);
  }

  updateUserStatus(data: UpdateStatusDto): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateActiveStatusAsync, data);
  }

  getAssignedCatalogs(): Observable<Result<CatalogDataDto[]>> {
    return this.apiClient.get(routes.getAssignedCatalogs);
  }
}
