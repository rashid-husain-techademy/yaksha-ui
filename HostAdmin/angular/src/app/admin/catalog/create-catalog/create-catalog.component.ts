import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantsDto } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { CatalogDetailsResult, CreateCatalogDto } from '../catalog-details';
import { CatalogService } from '../catalog.service';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { Permissions } from '@shared/roles-permission/permissions';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';

@Component({
  selector: 'app-create-catalog',
  templateUrl: './create-catalog.component.html',
  styleUrls: ['./create-catalog.component.scss']
})
export class CreateCatalogComponent implements OnInit {
  @Input() catalogDetails: CatalogDetailsResult;
  tenantDetailsList: TenantsDto[];
  selectedTenantId: number;
  catalogName: string;
  constants = Constants;
  catalogForm: FormGroup;
  userRole: string;
  isCloseClick: boolean = false;

  constructor(
    private modalService: NgbModal, private tenantService: TenantsService,
    private catalogService: CatalogService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private appSessionService: AppSessionService,
    private dataService: dataService) { }

  ngOnInit(): void {
    this.initCatalogForm();
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.getAllTenants();
      if (val[Permissions.manageResourcesManageAll] && this.userRole !== UserRoles[1]) {
        this.catalogForm.patchValue({
          selectedTenantId: this.appSessionService.tenantId
        });
        this.catalogForm.get('selectedTenantId').disable();
      }
    });
    if (this.catalogDetails)
      this.patchValue();
  }

  initCatalogForm() {
    this.catalogForm = this.formBuilder.group({
      catalogName: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      description: [''],
      isActive: [false],
      selectedTenantId: ['', Validators.required]
    });
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
  }
  closeMouseDown() {
    this.isCloseClick = true;
  }
  markControlAsUntouched(controlName: string) {
    const control = this.catalogForm.get(controlName);

    if (control) {
      control.markAsUntouched();
    }
  }
  getAllTenants() {
    this.tenantService.getAllTenants().subscribe(res => {
      if (res.success) {
        let sortedTenants = res.result.sort(Helper.sortString<TenantsDto>('name'));
        this.tenantDetailsList = sortedTenants;
      }
    }, error => {
      console.error(error);
    });
  }

  createCatalog() {
    if (this.catalogForm.valid) {
      let request: CreateCatalogDto = {
        Id: 0,
        catalogName: this.catalogForm.get('catalogName').value,
        tenantId: this.catalogForm.get('selectedTenantId').value,
        isActive: this.catalogForm.get('isActive').value
      };

      if (this.catalogDetails)
        request.Id = this.catalogDetails.catalogId;

      this.catalogService.createOrUpdateCatalog(request).subscribe(res => {
        if (res.result.isSuccess) {
          this.modalService.dismissAll(true);
        }
        else {
         this.modalService.dismissAll(false);
          this.toastrService.error(res.result.errorMessage);
        }
      });
    }
    else if (!this.catalogForm.get('selectedTenantId').touched) {
      const control = this.catalogForm.get('selectedTenantId');
      control.markAsTouched();
    }
    else {
      this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
    }
  }

  isFormValid(formControlName: string): boolean {
    if (this.isCloseClick) {
      this.markControlAsUntouched(formControlName);
      return true;
    }
    else
      return !((this.catalogForm.get(formControlName).errors?.required || (this.catalogForm.get(formControlName).errors?.whitespace)) && (this.catalogForm.get(formControlName).touched));
  }

  patchValue() {
    this.catalogForm.patchValue({
      catalogName: this.catalogDetails.catalogName,
      isActive: this.catalogDetails.catalogStatus,
      selectedTenantId: this.catalogDetails.assignedTenantId
    });
    this.catalogForm.get('catalogName').disable();
    this.catalogForm.get('selectedTenantId').disable();
  }
}
