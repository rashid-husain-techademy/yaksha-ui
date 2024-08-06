import { Injectable } from '@angular/core';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { WheeboxPageTypePayload } from '@app/test-taker/test-data';
import { ForgatPasswordResultDto, ForgotPasswordDto } from 'account/forgotpassword/model/forgotpassworddto';
import { ResetPasswordDto } from 'account/resetpassword/model/resetpassworddto';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../service/common/api-client.service';
import { AllTenants, CreateUserRequest, CreateUserResponse, UserDetails, UserFilter, UserDto, ChangePassword, UserUpdateList, UpdateUserLoginEnable } from './users';

const routes = {
  getUserDetails: 'yaksha/User/GetUserDetails',
  updateUserDetails: 'yaksha/User/UpdateUserDetails',
  uploadProfilePicture: 'yaksha/User/UploadProfilePicture',
  deleteUser: 'yaksha/User/DeleteUserAsync',
  userUpload: 'yaksha/User/UploadUserAsync',
  userUploadValidation: 'yaksha/User/UserUploadValidation',
  getAllTenants: 'yaksha/Tenant/GetAllTenants',
  forgotPassword: 'yaksha/User/ForgotPassword',
  resetPassword: 'yaksha/User/ResetPassword',
  onboardUser: 'yaksha/User/OnboardUserAsync',
  getUser: 'yaksha/User/GetUser',
  // getLoginUserStatus: "yaksha/User/GetLoginUserStatus",
  getAuthToken: 'platform/Tenant/CreateUserOrGenerateTokenAsync',
  getMe: 'platform/User/GetMe',
  changePassword: 'yaksha/User/ChangePassword',
  updateUserLoginEnable: 'yaksha/User/UpdateUserLoginEnable',
  generatePageUrlWheebox: "yaksha/UserAssessment/GeneratePageUrlWheebox",
};

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private apiClient: ApiClientService) { }

  getUserDetails(data: UserFilter): Observable<Result<UserDetails>> {
    return this.apiClient.get(routes.getUserDetails, Helper.httpParamBuilder(data));
  }

  updateUserDetails(user: UserUpdateList): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateUserDetails, user);
  }

  uploadProfilePicture(path: string, file: FormData): Observable<Result<boolean>> {
    return this.apiClient.postFile(path, file);
  }

  fileUpload<T>(path: string, file: FormData): Observable<Result<T>> {
    return this.apiClient.postFile(path, file);
  }

  getAllTenants(): Observable<Result<AllTenants[]>> {
    return this.apiClient.get(routes.getAllTenants);
  }

  forgotPassword(data: ForgotPasswordDto): Observable<Result<ForgatPasswordResultDto>> {
    return this.apiClient.post(routes.forgotPassword, data);
  }

  resetNewPassword(data: ResetPasswordDto): Observable<Result<boolean>> {
    return this.apiClient.post(routes.resetPassword, data);
  }

  changePassword(data: ChangePassword): Observable<Result<boolean>> {
    return this.apiClient.post(routes.changePassword, data);
  }

  onboardUser(userInfo: CreateUserRequest): Observable<Result<string>> {
    return this.apiClient.post(routes.onboardUser, userInfo);
  }

  getMe(): Observable<UserDto> {
    return this.apiClient.platformGet(routes.getMe);
  }

  generateAuthToken(data: CreateUserRequest): Observable<CreateUserResponse> {
    return this.apiClient.platformPost(routes.getAuthToken, data);
  }

  deleteUser(userId: number): Observable<Result<boolean>> {
    return this.apiClient.delete(`${routes.deleteUser}?userId=${userId}`);
  }

  getUser(cacheEnabled: boolean): Observable<Result<UserDto>> {
    return this.apiClient.get(routes.getUser, null, cacheEnabled);
  }

  generatePageUrlWheebox(data: WheeboxPageTypePayload): Observable<Result<string>> {
    return this.apiClient.post(routes.generatePageUrlWheebox, data);
  }

  updateUserLoginEnable(user: UpdateUserLoginEnable): Observable<Result<boolean>> {
    return this.apiClient.put(routes.updateUserLoginEnable, user);
  }

  // getLoginUserStatus(data:any):Observable<Result<boolean>>{
  //   return this.apiClient.get(routes.getLoginUserStatus,Helper.httpParamBuilder(data))
  // }
}
