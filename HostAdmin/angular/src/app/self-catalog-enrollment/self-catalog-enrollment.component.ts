import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '@app/models/constants';
import { TenantsDto } from '@app/admin/tenants/tenant-detail';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { ToastrService } from 'ngx-toastr';
import { UserRoles } from '@app/enums/user-roles';
import { Permissions } from '@shared/roles-permission/permissions';
import { CatalogDetailsResult, CreateSelfCatalogDto } from '@app/admin/catalog/catalog-details';
import { CatalogService } from '@app/admin/catalog/catalog.service';

@Component({
  selector: 'app-self-catalog-enrollment',
  templateUrl: './self-catalog-enrollment.component.html',
  styleUrls: ['./self-catalog-enrollment.component.scss']
})
export class SelfCatalogEnrollmentComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  @Input() catalogDetails: CatalogDetailsResult;
  selfCatologEnrollment: FormGroup;
  tenantDetailsList: TenantsDto[];
  constants = Constants;
  userRole: string;
  catalogId: number;
  selectedFileType: string;
  file: File;
  supportedTypes: string[];
  fileTypeGranted: boolean;
  fileName: string;
  errorMessage: string[];
  showErrors: boolean;
  errorLength: number = 99;
  isSubmitted: boolean = false;
  sampleTemplate: string = "assets/sampleTemplate/CatalogUsers_Template.xlsx";

  constructor(
    private modalService: NgbModal,
    private catalogService: CatalogService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private appSessionService: AppSessionService,
    private dataService: dataService
  ) { }

  ngOnInit(): void {
    //this.initSelfCatalogForm();
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      if (val[Permissions.manageResourcesManageAll] && this.userRole !== UserRoles[1]) {
        this.selfCatologEnrollment.patchValue({
          selectedTenantId: this.appSessionService.tenantId
        });
      }
    });
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
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

  removeSelectedFile(): void {
    this.fileInput.nativeElement.value = '';
    this.fileName = '';
    this.file = undefined;
    this.errorMessage = [];
    this.showErrors = false;
    this.toastrService.warning(Constants.selectedFileWasRemoved);
  }

  save() {
    let data: CreateSelfCatalogDto = {
      catalogId: this.catalogDetails.catalogId,
      tenantId: this.catalogDetails.assignedScopeId
    };
    this.errorMessage = [];
    const formData = new FormData();
    if (this.file) {
      formData.append('File', this.file, this.file.name);
    }
    formData.append('Input', JSON.stringify(data));
    this.catalogService.userGroupValidation(formData).pipe().subscribe(res => {
      if (res.success && res.result.isSuccess) {
        this.constructData();
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

  constructData() {
    let data: CreateSelfCatalogDto = {
      catalogId: this.catalogDetails.catalogId,
      tenantId: this.catalogDetails.assignedScopeId
    };
    const formData = new FormData();
    if (this.file) {
      formData.append('File', this.file, this.file.name);
    }
    else {
      formData.append('File', null);
    }
    formData.append('Input', JSON.stringify(data));
    this.catalogService.assignCatalogAsync(formData).subscribe((res: any) => {
      if (res.success) {
        this.modalService.dismissAll(true);
      }
    });
  }

  initSelfCatalogForm() {
    this.selfCatologEnrollment = this.formBuilder.group({
      isActive: false
    });
  }

}
