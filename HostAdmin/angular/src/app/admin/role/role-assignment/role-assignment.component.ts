import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbpSessionService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { RoleAssignmentService } from '../role-assignment/role-assignment.service';
import { TenantRolesRequestDto, FeatureList, CreateTenantRoleRequestDto, DeleteRoleRequestDto, RoleDto, TenantUserListDto, AssignUserRoleRequestDto, TenantRoleUsersRequestDto, TenantRoleUsersResponseDto, TenantRolesResponseDto } from './role-data';
import { AppComponentBase } from '../../../../shared/app-component-base';


@Component({
  selector: 'app-role-assignment',
  templateUrl: './role-assignment.component.html',
  styleUrls: ['./role-assignment.component.scss']
})
export class RoleAssignmentComponent extends AppComponentBase implements OnInit {
  constants = Constants;

  featureList: FeatureList[] =[
    { id: 1, name: 'Questions', permissionName: 'Questions.Manage.All' },
    { id: 2, name: 'Assessments', permissionName: 'Assessments.Manage.All' },
    { id: 3, name: 'Reports', permissionName: 'Reports.Manage.All' },
    { id: 4, name: 'Manage Resource', permissionName: 'ManageResources.Manage.All' },
    { id: 5, name: 'Users', permissionName: 'User.Manage.All' }

  ];

  dropdownSettings={
    defaultOpen: false,
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: this.constants.selectAll,
    unSelectAllText: this.constants.unSelectAll,
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: true
  };

  roleDropDownSettings = {
    defaultOpen: false,
    singleSelection: true,
    idField: 'roleId',
    textField: 'roleName',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  }

  userDropDownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'emailAddress',
    selectAllText: Constants.selectAll,
    unSelectAllText: Constants.unSelectAll,
    itemsShowLimit: 1,
    allowSearchFilter: true,
    enableCheckAll: true
  };

  page: number = 1;
  totalCount: number;
  tenantRoles: TenantRolesResponseDto;
  roleCreationForm: FormGroup;
  selectedPermissions: FeatureList[] = [];
  isSubmitTriggered: boolean = false;
  isEdit: boolean = false;
  editRolePermissionForm: FormGroup;
  edittedPermissions: FeatureList[] = [];
  currentRoleId: number;
  roles: RoleDto[] = [];
  filteredTenantUsers: TenantUserListDto[] = [];
  tenantUsers: TenantUserListDto[] = [];
  tenantUsersByRole:TenantUserListDto[] = [];
  userRoleForm: FormGroup;
  userRoleEditForm: FormGroup;
  isUserRoleEdit: boolean = false;
  currentUserRoleId: number;
  edittedRoleUsers: any;
  selectedUsers: number[] = [];
  tenantRoleUsers: TenantRoleUsersResponseDto;
  selectedRoleName: string;
  roleTotalCount: number;
  roleUserTotalCount: number;
  isNoRolesFound: boolean = false;
  isNoRoleUsersFound: boolean = false;
  rolePageIndex: number = 1;
  pageSize : number = 4;
  maxSize: number = 4;
  maxRoleCount: number =4;
  roleUserPageIndex: number = 1;
  roleDetails: any;
  customUserList: TenantUserListDto[] = [];

  constructor(private modalService: NgbModal,
    private roleAssignmentService: RoleAssignmentService,
    private abpSession: AbpSessionService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    injector: Injector
    )
    {
      super(injector);
    }

  roleCreationFormValidationMessages = {
    roleNameIsRequired: Constants.roleNameShouldNotBeEmpty,
    featuresShouldNotBeEmpty: Constants.pleaseSelectAtLeastOneFeature,
    roleRequired: Constants.pleaseSelectTheRole,
    emailAddressRequired: Constants.pleaseSelectAtLeastOneEmailAddress,
  }

  ngOnInit() {
    this.initRoleCreationForm();
    this.initUserRoleForm();
    this.getAllTenantRoles();
    this.getAllTenantRoleUsers();
    this.getTenantUsers();
    this.getAllRoles();
  }

  getAllTenantRoles() {
    let request: TenantRolesRequestDto = {
      tenantId: this.abpSession.tenantId,
      maxResultCount: this.maxRoleCount,
      skipCount: (this.rolePageIndex - 1) * this.pageSize
    };
    this.roleAssignmentService.getAllTenantRoles(request).subscribe(res => {
      if(res.result && res.result.totalCount > 0){
        this.tenantRoles = res.result;
        this.roleDetails = res.result.tenantRoles;
        this.roleTotalCount = res.result.totalCount;
        this.isNoRolesFound = false;
      }
      else{
        this.isNoRolesFound = true;
        this.tenantRoles.tenantRoles = [];
        this.roleDetails = [];
        this.roleTotalCount = 0;
      }
    });
  }

  getAllRoles(){
    this.roleAssignmentService.getAllRoles().subscribe(res => {
      if(res.result && res.result.length > 0)
        this.roles = res.result;
    },
    err => console.error(err));
  }

  getAllTenantRoleUsers() {
    let request: TenantRoleUsersRequestDto = {
      skipCount : (this.roleUserPageIndex - 1) * this.pageSize,
      maxResultCount: this.maxRoleCount
    };
    this.roleAssignmentService.getAllTenantRoleUsers(request).subscribe(res => {
      if(res.result && res.result.totalCount > 0){
        this.tenantRoleUsers = res.result;
        this.roleUserTotalCount = res.result.totalCount;
        this.isNoRoleUsersFound = false;
      }
      else{
        this.isNoRoleUsersFound = true;
        this.tenantRoleUsers.tenantRoleUsers = [];
        this.roleUserTotalCount = 0;
      }
    },
    err => console.error(err));
  }

  initRoleCreationForm(): void {
    this.roleCreationForm = this.formBuilder.group({
      roleName: ['', [Validators.required, Validators.maxLength(500), WhiteSpaceValidators.emptySpace]],
      features: ['', [Validators.required]],
    });
  }

  initRoleEditForm(): void {
    this.editRolePermissionForm = this.formBuilder.group({
      editRoleName: ['', [Validators.required, Validators.maxLength(500), WhiteSpaceValidators.emptySpace]],
      editFeatures: ['', [Validators.required]],
    });
  }

  initUserRoleForm(): void{
    this.userRoleForm = this.formBuilder.group({
      role: ['', [Validators.required]],
      userList: ['', [Validators.required]]
    });
  }

  initUserRoleEditForm(): void {
    this.userRoleEditForm = this.formBuilder.group({
      editUsers: ['', [Validators.required]]
    });
  }

  addOrUpdateRole(id : number) {
    this.isSubmitTriggered = true;

    let isMatched=false;
    let roleName=this.isEdit ? this.editRolePermissionForm.controls.editRoleName.value : this.roleCreationForm.get('roleName').value ;
    this.roles.forEach(role=>{
      if (role.roleName.toLowerCase()===roleName.toLowerCase() && (!this.currentRoleId || (this.currentRoleId > 0 && role.roleId !== this.currentRoleId))){
        isMatched=true;
        return;
      }
    });

    if(isMatched){
      this.toastrService.error(this.constants.roleWithSameNameExists);

      return;
    }
    let request : CreateTenantRoleRequestDto = {
      id: id,
      tenantId: this.abpSession.tenantId,
      roleName: this.isEdit ? this.editRolePermissionForm.controls.editRoleName.value : this.roleCreationForm.get('roleName').value,
      permissions: this.isEdit ? this.edittedPermissions: this.selectedPermissions
    };
    this.roleAssignmentService.createOrUpdateRolePermission(request).subscribe(res => {
      if(res.result){
        if(!this.isEdit){
          this.toastrService.success(this.constants.roleCreatedSuccessfullywithSelectedFeatures);
          this.resetForm();
          this.isSubmitTriggered = false;
          this.selectedPermissions = [];
        }
        else{
          this.toastrService.success(this.constants.roleAndFeaturesHasBeenUpdatedSuccessfully);
          this.modalService.dismissAll();

          this.edittedPermissions = [];
          this.isSubmitTriggered = false;
          this.resetForm();
        }
        this.getAllTenantRoles();
        this.getAllRoles();
      }
    });
  }

  deleteRolePermission(role){
    abp.message.confirm(
      this.l('roleDeletionConfirmationMessage', `${this.constants.theUsersAssociatedWithThisRoleWillBeMadeTenantUser} . ${this.constants.areYouSureYouWantToDelete}` ),
      (result: boolean) => {
        if (result) {
          let request : DeleteRoleRequestDto = {
          roleId: role.roleId
        };
        this.roleAssignmentService.deleteUserRolePermission(request).subscribe(res => {
          if(res.result){
            this.toastrService.success(this.constants.roleHasBeenDeletedSuccessfully);
            this.getAllTenantRoles();
            this.getAllTenantRoleUsers();
          }
        }, err => console.error(err));
      }
  });
}

  getTenantUsers(){
    this.roleAssignmentService.getTenantUsersList().subscribe(res => {
      if(res.result){
        this.tenantUsers = res.result.userDetails;
        if(res.result.tenantUserRoleId !== null){
          this.filteredTenantUsers =  res.result.userDetails.filter(x => x.roleId === res.result?.tenantUserRoleId);
        }
        else
          this.filteredTenantUsers = res.result.userDetails;
      }
    },
    err => console.error(err)
    );
  }

  assignOrUpdateUserRole() {
    let request : AssignUserRoleRequestDto = {
      isEdit: this.isUserRoleEdit,
      roleId: this.isUserRoleEdit ? this.currentUserRoleId : this.userRoleForm.controls.role.value[0].roleId,
      users: this.isUserRoleEdit? this.userRoleEditForm.controls.editUsers.value.map(x => x.id) : this.userRoleForm.controls.userList.value.map(x => x.id)
     };
    this.roleAssignmentService.assignUserRole(request).subscribe(res => {
      if(res.result){
        this.toastrService.success(this.constants.roleHasBeenUpdatedForSelectedUsers);
        if(this.isUserRoleEdit){
          this.onRoleModalClose();
        }
        else{
          this.resetRoleUserForm();
        }
        this.getAllTenantRoleUsers();
        this.getTenantUsers();
      }
    },
    err => console.error(err));
  }

  updateRolePermission(){
    this.addOrUpdateRole(this.currentRoleId);
  }

  openEditRolePermissionModal(modal: NgbModal, rolePermission: any) {
		this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
    this.initRoleEditForm();
    this.isEdit = true;
    this.currentRoleId = rolePermission.roleId;
    rolePermission.permissions.forEach(data => {
      let permission = this.featureList.find(p => p.permissionName === data.permissionName);
      this.edittedPermissions.push(permission);
    });
    this.editRolePermissionForm.patchValue({
      editRoleName: rolePermission.roleName,
      editFeatures: this.edittedPermissions
    });
	}

  openEditUserRolePermissionModal(modal: NgbModal, roleUsers: any){

    this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
    this.initUserRoleEditForm();
    this.isUserRoleEdit = true;
    this.currentUserRoleId = roleUsers.roleId;
    this.selectedRoleName = roleUsers.roleName;
    this.customUserList = this.customUserList.concat(roleUsers.users);
    this.customUserList = this.customUserList.concat(this.filteredTenantUsers);
    this.userRoleEditForm.patchValue({
      editUsers: roleUsers.users
    });

  }

  onRoleModalClose(){
    this.isEdit = false;
    this.isUserRoleEdit = false;
    this.edittedPermissions = [];
    this.edittedRoleUsers = [];
    this.customUserList = [];
    this.modalService.dismissAll();
  }

  onSelectFeature(event){
    let feature = this.featureList.find(i => i.id === event.id);
    this.selectedPermissions.push(feature);
  }

  onDeSelectFeature(event){
    let feature = this.featureList.find(i => i.id === event.id);
    let index = this.selectedPermissions.indexOf(feature);
    if(index >= 0)
      this.selectedPermissions.splice(index, 1);
  }

  onSelectAllFeature(){
    this.selectedPermissions = this.featureList;
  }

  onDeSelectAllFeature(){
    this.selectedPermissions = [];
  }

  onEditSelectFeature(event){
    let edittedFeature = this.featureList.find(x => x.id === event.id);
    this.edittedPermissions.push(edittedFeature);
  }

  onEditDeSelectFeature(event){
    let feature = this.featureList.find(i => i.id === event.id);
    let index = this.edittedPermissions.indexOf(feature);
    if(index >= 0)
      this.edittedPermissions.splice(index, 1);
  }

  onEditSelectAll(){
    this.edittedPermissions = this.featureList;
  }

  onEditDeSelectAll(){
    this.edittedPermissions = [];
  }

  loadRolePage(){
    this.getAllTenantRoles();
  }

  loadRoleUserPage(){
    this.getAllTenantRoleUsers();
  }

  resetForm(){
    this.roleCreationForm.reset();
  }

  resetRoleUserForm(){
    this.userRoleForm.get('role').setValue('');
    this.userRoleForm.get('userList').setValue('');
    this.userRoleForm.reset();
  }

  isFormValid(formControlName: string, form: FormGroup): boolean {
    return !(form.get(formControlName).errors?.required && (form.get(formControlName).touched || this.isSubmitTriggered));
  }

}
