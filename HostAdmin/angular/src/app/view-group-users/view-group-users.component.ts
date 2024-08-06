import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, } from '@angular/forms';
import { CatalogDetailsResult, GetUserGroupDetails, GroupDetail, GroupDetailsDto, UpdateStatusDto } from '@app/admin/catalog/catalog-details';
import { ManageTagService } from '@app/admin/manage-tags/manage-tags.service';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '@app/admin/catalog/catalog.service';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'app-view-group-users',
  templateUrl: './view-group-users.component.html',
  styleUrls: ['./view-group-users.component.scss']
})
export class ViewGroupUsersComponent extends AppComponentBase implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  @Input() catalogDetails: CatalogDetailsResult;
  searchValue = new FormControl();
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  userGroupPageSizes: number[] = [10, 20, 30];
  viewUserGroupList: GetUserGroupDetails;
  isFormSubmitTriggered: boolean = false;
  userForm: FormGroup;
  file: File;
  supportedTypes: string[];
  fileTypeGranted: boolean;
  fileName: string;
  groupId: number;
  selectedFileType: string;
  errorMessage: string[];
  showErrors: boolean;
  sampleTemplate: string = "assets/sampleTemplate/CatalogUsers_Template.xlsx";
  constants = Constants;
  catalogId: number;
  tenantId: number;
  isSubmitted: boolean;
  userGroupParams: string;
  noUsers: boolean = false;
  constructor(
    private manageTagService: ManageTagService,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private catalogService: CatalogService,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      this.userGroupParams = param['id'];
      let params = atob(param['id']).split('/');
      this.catalogId = parseInt(params[0]);
      this.groupId = parseInt(params[1]);
      this.tenantId = parseInt(params[2]);
    });
    this.getCatalogAssignedUsers();
  }

  search() {
    this.pageIndex = 1;
    this.getCatalogAssignedUsers();
  }


  changePageSize() {
    this.pageIndex = 1;
    this.getCatalogAssignedUsers();
  }

  changeStatus(user: any, event: any) {
    let message = "";
    if (event)
      message = Constants.areYouSureactiveUser;
    else
      message = Constants.areYouSureInactiveUser;
    abp.message.confirm(
      this.l('TenantDeleteWarningMessage', `${message} (${user.userName})?`),
      (result: boolean) => {
        if (result) {
          let data: UpdateStatusDto = {
            id: user.id,
            status: event
          };
          this.catalogService.updateUserStatus(data).subscribe(res => {
            if (res.success) {
              this.toastrService.success("Staus Updated");
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          );
        }
        else
          user.isActive = !event;
      });
  }

  getCatalogAssignedUsers(): void {
    let data: GroupDetail = {
      catalogId: this.catalogId,
      userName: this.searchValue.value ? this.searchValue.value : '',
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize
    };
    this.manageTagService.getCatalogAssignedUsers(data).subscribe((res) => {
      if (res && res.result && res.result)
        this.viewUserGroupList = res.result;
      if (!this.viewUserGroupList?.totalCount)
        this.noUsers = true;
    });
  }


  openAddUser(targetModal: NgbModal, catalogId: number) {
    this.isFormSubmitTriggered = false;
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static'
    });
  }

  onFileChange(files: File[]) {
    if (files.length > 0) {
      this.selectedFileType = files[0].type;
      this.file = files[0];
      this.supportedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = files[0].name;
      }
      else {
        this.file = undefined;
        this.toastrService.warning(Constants.uploadOnlyExcelFiles);
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseUploadFile);
    }
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
  }

  removeSelectedFile(): void {
    this.fileName = '';
    this.file = undefined;
    this.errorMessage = [];
    this.showErrors = false;
    this.toastrService.warning(Constants.selectedFileWasRemoved);
  }

  save() {
    this.isFormSubmitTriggered = true;
    let data: GroupDetailsDto = {
      tenantId: this.tenantId,
      groupId: this.viewUserGroupList.groupId
    };
    this.errorMessage = [];
    const formData = new FormData();
    if (this.file) {
      formData.append('File', this.file, this.file.name);
    }
    formData.append('Input', JSON.stringify(data));
    this.catalogService.userGroupValidation(formData).pipe().subscribe(res => {
      if (res.success && res.result.isSuccess) {
        this.addUser(formData);
      }
      else {
        this.showErrors = true;
        this.errorMessage = res.result.errorList;
        this.toastrService.error(this.constants.fileUploadFailedCheckError);
        this.isSubmitted = false;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  addUser(formData) {
    this.catalogService.insertOrUpdateGroupUsers(formData).subscribe(result => {
      if (result.result) {
        this.toastrService.success(Constants.userAddInCatalog);
        this.getCatalogAssignedUsers();
        this.closeBtnClick();
        this.isFormSubmitTriggered = false;
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }
}

