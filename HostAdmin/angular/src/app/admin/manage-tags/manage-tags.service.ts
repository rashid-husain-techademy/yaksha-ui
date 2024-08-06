import { Injectable } from '@angular/core';
import { Helper } from '@app/shared/helper';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../app/service/common/api-client.service';
import { Result } from '../../../app/shared/core-interface/base';
import { GetUserGroupDetails, GroupDetail } from '../catalog/catalog-details';
import { CategoryImport, CreateCategoryDto, ListCategoryDto, SkillDto } from './manage-tags-detail';

const routes = {
  createOrUpdateCategoryAsync: "yaksha/Category/CreateOrUpdateCategoryAsync",
  getCategoriesById: "yaksha/Category/GetCategoriesById",
  getCategoryDetails: "yaksha/Category/GetCategoryDetails",
  getSkills: "yaksha/Skill/GetSkills",
  isCategoryNameExist: "yaksha/Category/isCategoryNameExist",
  getCatalogAssignedUsers:"yaksha/Catalog/GetCatalogAssignedUsers"
};

@Injectable({
  providedIn: 'root'
})
export class ManageTagService {

  constructor(private apiClient: ApiClientService) { }

  createOrUpdateCategory(category: CreateCategoryDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.createOrUpdateCategoryAsync, category);
  }

  getCategoryDetails(Id: number): Observable<Result<ListCategoryDto>> {
    return this.apiClient.get(routes.getCategoriesById, Helper.httpParamBuilder({ Id }));
  }

  getAllCategories(): Observable<Result<CategoryImport[]>> {
    return this.apiClient.get(routes.getCategoryDetails);
  }

  getSkills(): Observable<Result<SkillDto[]>> {
    return this.apiClient.get(routes.getSkills);
  }

  isCategoryNameExist(categoryData:CreateCategoryDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.isCategoryNameExist,categoryData);
  }
  
  getCatalogAssignedUsers(parms: GroupDetail): Observable<Result<GetUserGroupDetails>> {
    return this.apiClient.get(routes.getCatalogAssignedUsers, Helper.httpParamBuilder(parms));
  }

}
