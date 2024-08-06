import { Constants } from '@app/models/constants';
import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { ToastrService } from 'ngx-toastr';
import { GetTenantDetails, TenantDetails, TenantImport } from '@app/admin/tenants/tenant-detail';
import { AppComponentBase } from '@shared/app-component-base';
import { UserService } from '@app/admin/users/users.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent extends AppComponentBase implements OnInit, OnDestroy {
  tenantForm: FormGroup;
  searchValue = new FormControl();
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  tenantId: number;
  toggle: boolean;
  tenantDetailsList: GetTenantDetails;
  tenantDetailsEdit: GetTenantDetails;
  editAddLabel: string = 'Edit';
  tenantStatus = ['Active', 'InActive'];
  constants = Constants;
  isFormSubmitTriggered: boolean = false;
  tenantPageSizes: number[] = [10, 20, 30];
  isEdit: boolean = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private tenantService: TenantsService,
    private toastrService: ToastrService,
    private userService: UserService,
    injector: Injector,
    private router: Router,
    private activateRoute: ActivatedRoute,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getTenantDetails();
  }

  isFormValid(formControlName: string): boolean {
    return !(this.tenantForm.get(formControlName).errors?.required && (this.tenantForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  search() {
    this.pageIndex = 1;
    this.getTenantDetails();
  }

  getTenantDetails(isEdit: boolean = false): void {
    this.isEdit = isEdit;
    let data: TenantDetails = {
      tenantId: isEdit ? this.tenantId : null,
      searchString: this.searchValue.value ? this.searchValue.value : '',
      skipCount: isEdit ? 0 : (this.pageIndex - 1) * this.pageSize,
      maxResultCount: isEdit ? 1 : this.pageSize,
    };
    this.tenantService.getAllTenantDetails(data).subscribe(res => {
      if (res.success) {
        if (!isEdit) {
          this.tenantDetailsList = res.result;
          this.tenantDetailsList.tenants = this.tenantDetailsList.tenants.map(x => {
            if (x.managerEmails.length > 1)
              x.managerEmailIds = `${x.managerEmails[0]},... +${x.managerEmails.length - 1} `;
            else if (x.managerEmails.length)
              x.managerEmailIds = x.managerEmails[0];
            else
              x.managerEmailIds = '';
            return x;
          });
        }
        else {
          this.tenantDetailsEdit = res.result;
          isEdit ? this.displayTenant() : false;
        }
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  initTenantForm(): void {
    this.tenantForm = this.formBuilder.group({
      selectedTenant: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      selectedDisplayName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      selectedManager: [''],
      isActive: ['Active', [Validators.required]]
    });
  }

  private csmEmailValidation() {
    let emails = this.tenantForm.get('selectedManager').value.replace(/\s/g, '').split(",");
    let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    for (let i = 0; i < emails.length; i++) {
      if (emails[i] === "" || !regex.test(emails[i])) {
        return false;
      }
    }
    return true;
  }

  save(): void {
    this.isFormSubmitTriggered = true;
    if (this.tenantForm.get('selectedManager').value)
      if (!this.csmEmailValidation()) {
        this.toastrService.warning(Constants.invalidEmailAddress);
        return;
      }
    if (this.tenantForm.valid) {
      let data: TenantImport = {
        tenancyName: this.tenantForm.get('selectedTenant').value,
        name: this.tenantForm.get('selectedDisplayName').value,
        managerEmails: this.tenantForm.get('selectedManager').value,
        isActive: this.tenantForm.get('isActive').value === this.tenantStatus[0] ? true : false,
        configJson: ""
      };
      if (!this.isEdit) {
        this.tenantService.isTenantNameExists(data.tenancyName).subscribe(result => {
          if (result.result) {
            this.toastrService.warning(Constants.tenantNameAlreadyExist);
          }
          else {
            this.createTenant(data);
          }
        });
      }
      else {
        this.createTenant(data);
      }
    }
  }

  createTenant(data) {
    this.tenantService.createOrUpdateTenant(data).subscribe(result => {
      if (result.result) {
        if (this.toggle)
          this.toastrService.success(Constants.tenantUpdatedSuccessfully);
        else {
          this.toastrService.success(Constants.tenantCreatedSuccessfully);
          this.userService.getAllTenants();
        }
        this.getTenantDetails();
        this.closeBtnClick();
        this.isFormSubmitTriggered = false;
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  displayTenant() {
    let tenantDetails = this.tenantDetailsEdit.tenants[0];
    this.tenantForm.patchValue({
      selectedTenant: tenantDetails.tenancyName,
      selectedDisplayName: tenantDetails.name,
      selectedManager: tenantDetails.managerEmails.join(','),
      isActive: tenantDetails.isActive ? "Active" : "InActive",
    });
  }

  isChecked(status) {
    let tenantDetails = this.tenantDetailsEdit.tenants[0];
    return (status === this.tenantStatus[0]) === tenantDetails.isActive ? true : false;
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getTenantDetails();
  }

  deleteTenant(tenantDetail) {
    abp.message.confirm(
      this.l('TenantDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${tenantDetail.tenancyName}"?`),
      (result: boolean) => {
        if (result) {
          this.tenantService.deleteTenant(tenantDetail.id).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.tenantDeletedSuccessfully);
              this.getTenantDetails();
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
      });
  }

  openAddOrEditTenant(targetModal: NgbModal, tenantId: number): void {
    this.isFormSubmitTriggered = false;
    this.initTenantForm();
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static'
    });

    if (tenantId) {
      this.toggle = true;
      this.isEdit = true;
      this.editAddLabel = 'Edit';
      this.tenantId = tenantId;
      this.getTenantDetails(true);
    }
    else {
      this.tenantForm.reset();
      this.toggle = false;
      this.isEdit = false;
      this.tenantForm.patchValue({
        isActive: true
      });
      this.editAddLabel = 'Add';
    }
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  redirectToCustomize(tenantId: number): void {
    this.router.navigate(['customization', btoa(tenantId.toString())], { relativeTo: this.activateRoute })
  }
}
