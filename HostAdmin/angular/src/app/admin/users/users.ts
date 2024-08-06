import { UploadType, FileUploadType } from "../../enums/file-upload-type";

export interface FileUploadData {
  title: string;
  sampleTemplatePath: string;
  supportedTypes: string[];
  uploadType: UploadType;
  subUploadType: FileUploadType;
  supportedTypesMessage: string;
  validationApiPath: string;
  uploadApiPath: string;
  errorMessage: string;
  userId?: number;
  existingImageUrl?: Blob;
  fileUploadAccept: string;
  scheduleId?: number;
  tenantId?: number;
}

export interface TenantDetails {
  id: number;
  tenancyName: string;
  name: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilter {
  tenantId: number | null;
  isActive: boolean | null;
  skipCount: number;
  maxResultCount: number;
  searchString: string;
}

export interface UserDetails {
  users: UserList[];
  totalCount: number;
}

export interface UserUpdateList {
  id: number;
  name: string;
  emailAddress: string;
  surName: string;
  profilePicture: string;
  phoneNumber: number;
  facebookProfile: string;
  linkedInProfile: string;
  twitterProfile: string;
}

export interface UserList {
  id: number;
  name: string;
  emailAddress: string;
  surName: string;
  profilePicture: string;
  aboutMe: string;
  idNumber: string;
  phoneNumber: string;
  isActive: boolean;
  businessUnitId: number;
  businessUnitName: string;
  userRoles: UserRoles[];
  surname: string;
  role: string | null;
  isLoginEnabled: boolean;
}

export interface UserRoles {
  roleId: number;
  userId: number;
  role: Role;
}

export interface Role {
  roleName: string;
}

export interface AllTenants {
  id: number;
  tenancyName: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateUserResponse {
  accessToken: string;
  user: UserUploadData;
}

export class UserUploadData {
  email: string;
  tenantId: number | null;
  tenantName: string;
  name: string;
  surName: string;
  phoneNumber: number;
  businessUnitName: string;
  nameOnIdCard: any;
  fatherName: any;
}

export class CreateUserRequest {
  userUpload: UserUploadData;
  isNewUser: boolean;
}

export interface UserDto {
  id: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  phoneNumber: number;
  profilePicture: string;
  socialProfileConfig: string;
  facebookProfile: string;
  linkedInProfile: string;
  twitterProfile: string;
  tenantId: number | null;
  isActive: boolean;
  fullName: string;
  lastLogin: Date | null;
  creationTime: Date | null;
}

export interface UpdateUserLoginEnable {
  id: number;
  isLoginEnabled: boolean;
}