import { Constants } from '@app/models/constants';
import { FileUploadType, UploadType } from './../../../enums/file-upload-type';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileUploadComponent } from '@app/admin/shared/file-upload/file-upload.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../users.service';
import { Helper } from '@app/shared/helper';
import { UserRoles } from '@app/enums/user-roles';
import { FormGroup } from '@angular/forms';
import { AllTenants, UpdateUserLoginEnable, UserDetails, UserFilter, UserList } from '../users';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { tenantDetailsDto } from '@app/admin/tenants/tenant-detail';
import { AnalyticsEmbedComponent } from '@app/admin/analytics/analytics-embed/analytics-embed.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  tenantList: AllTenants[];
  userList: UserDetails;
  userRoles = UserRoles;
  pageSizes: number[] = [10, 20, 30];
  pageIndex = 1;
  pageSize = 10;
  maxSize: number = 5;
  selectedTenantId: number | null = null;
  editAddLabel: string = 'Edit';
  constants = Constants;
  selectedTenant: any;
  userRole: string;
  tenantForm: FormGroup;
  tenant: any;
  helper = Helper;
  searchString: string = "";
  userFilter: UserFilter;
  tenantDetails: tenantDetailsDto[];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private toastrService: ToastrService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private appSessionService: AppSessionService,
    private dataService: dataService,
  ) {
  }

  ngOnInit(): void {
    this.getAllTenants();
    this.getUserDetails();
  }

  getAllTenants() {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });

    if (this.userRole === UserRoles[1]) {
      this.userService.getAllTenants().subscribe(res => {
        if (res.success) {
          this.tenantList = res.result;
        }
        else {
          this.toastrService.warning(Constants.noTenantsFound);
        }
      });
    }
    else {
      this.selectedTenantId = this.appSessionService.tenantId;
      this.getUserDetails();
    }
  }

  getTenantUsers(event: any) {
    let tenantId = event.id;
    this.tenantDetails = [{
      id: event.id,
      name: event.name
    }];
    if (tenantId && tenantId !== this.constants.selectTenant) {
      this.selectedTenantId = tenantId;
    }
    else
      this.selectedTenantId = null;
    this.getUserDetails();
  }

  reset(): void {
    this.selectedTenantId = null;
    this.tenantDetails = [];
    this.pageIndex = 1;
    this.searchString = '';
    this.getAllTenants();
    this.getUserDetails();
  }

  getUserDetails() {
    let data: UserFilter = {
      tenantId: this.selectedTenantId,
      isActive: null,
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      searchString: this.searchString
    };
    this.userService.getUserDetails(data).subscribe(res => {
      if (res.success) {
        this.userList = res.result;
        this.userList?.users.map(x => x.role = (x.userRoles[0].role.roleName.toUpperCase() === UserRoles[5] ? Constants.user :
          (x.userRoles[0].role.roleName.toUpperCase() === UserRoles[2] ? Constants.admin : x.userRoles[0].role.roleName)));
      }
      else {
        this.pageIndex = 1;
      }
    });
  }

  loadPage() {
    this.getUserDetails();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getUserDetails();
  }

  openUpload(): void {
    const modalRef = this.modalService.open(FileUploadComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.fileUploadData = {
      title: "User Upload",
      sampleTemplatePath: this.userRole === UserRoles[1] ? "assets/sampleTemplate/Users_Bulk_Upload.xlsx" : "assets/sampleTemplate/Users_Bulk_Upload_TA.xlsx",
      supportedTypes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      uploadType: UploadType.FileUpload,
      subUploadType: FileUploadType.User,
      supportedTypesMessage: Constants.onlyExcelFilesAreSupported,
      validationApiPath: "yaksha/User/UserUploadValidation",
      uploadApiPath: "yaksha/User/UploadUserAsync",
      errorMessage: Constants.uploadOnlyExcelFiles,
      fileUploadAccept: ".xls,.xlsx"
    };
    modalRef.dismissed.subscribe(result => {
      if (result)
        this.ngOnInit();
    });
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
    this.ngOnInit();
  }

  search(event: any): void {
    this.pageIndex = 1;
    this.searchString = event.target.value;
    this.getUserDetails();
  }

  userProfile(userId: number, emailAddress: string) {
    var queryParam = btoa(userId + '/' + this.selectedTenantId + '/' + emailAddress);
    this.router.navigate(['../profile', queryParam], { relativeTo: this.activateRoute });
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  deleteUser(user: UserList): void {
    abp.message.confirm(
      this.l('UserDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${user.name}"?`),
      (result: boolean) => {
        if (result) {
          this.userService.deleteUser(user.id).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.userDeletedSuccessfully);
              this.getUserDetails();
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
              console.error(error);
            });
        }
      });
  }

  openUserDashboardOperation(user: any) {
    const modalRef = this.modalService.open(AnalyticsEmbedComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.embedData = {
      name: "User Dashboard",
      id: user.id,
      isUserDashboard: true
    };
    modalRef.dismissed.subscribe(result => {

    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  proctoringReport(user: UserList): void {
    this.router.navigate(['../reports/proctoring', btoa(user.id.toString()), btoa(user.emailAddress.toString())], { relativeTo: this.activateRoute });
  }

  updateUserLoginEnable(user: UserList) {
    abp.message.confirm(
      this.l('UserLoginEnableWarningMessage', `${Constants.areYouSureYouWantToEnableOrDisableUserLogin}`),
      (result: boolean) => {
        if (result) {
          let data: UpdateUserLoginEnable = {
            id: user.id,
            isLoginEnabled: !user.isLoginEnabled
          };
          this.userService.updateUserLoginEnable(data).subscribe(res => {
            if (res && res.result) {
              user.isLoginEnabled = !user.isLoginEnabled;
              if (user.isLoginEnabled)
                this.toastrService.success(this.constants.userLoginEnabledSuccessfully);
              else
                this.toastrService.success(this.constants.userLoginDisabledSuccessfully);
            }
            else {
              const checkboxes = document.getElementsByClassName("loginenabledisable_" + user.id);
              for (let i = 0; i < checkboxes.length; i++) {
                const checkbox = checkboxes[i] as HTMLInputElement;
                checkbox.checked = user.isLoginEnabled;
              }
              this.toastrService.error(Constants.somethingWentWrong);
            }

          });
        }
        else {
          const checkboxes = document.getElementsByClassName("loginenabledisable_" + user.id);
          for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i] as HTMLInputElement;
            checkbox.checked = user.isLoginEnabled;
          }
        }
      }
    );
  }
}
