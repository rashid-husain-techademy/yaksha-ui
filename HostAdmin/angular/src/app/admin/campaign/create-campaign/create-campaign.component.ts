import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentCategoryRequestDto, AssessmentTenants, CategoryAssessments, CreateResultDto } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { CategoryDto } from '@app/assessments/assessments';
import { AssessmentStatus, CatalogAssessmentType } from '@app/enums/assessment';
import { UserRoles } from '@app/enums/user-roles';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { ToastrService } from 'ngx-toastr';
import { dataService } from '@app/service/common/dataService';
import { CampaignDetail, CreateOrUpdateCampaignDto, ModuleDto, campaignDetailRequestDto } from '@app/admin/campaign/campaign';
import { CampaignScopeType } from '@app/enums/campaign';
import { CampaignService } from '../campaign.service';
import { UserService } from '@app/admin/users/users.service';
import { AllTenants } from '@app/admin/users/users';
import { tenantDetailsDto } from '@app/admin/tenants/tenant-detail';
import { AppSessionService } from '@shared/session/app-session.service';
import { Unsaved } from '@app/interface/unsaved-data';

@Component({
  selector: 'app-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.scss']
})

export class CreateCampaignComponent implements OnInit, Unsaved {
  createCampaignForm: FormGroup;
  constants = Constants;
  campaignId: number;
  categories: any[] = [];
  category: CategoryDto[] = [];
  assessments: any[] = [];
  assessment: CategoryAssessments[] = [];
  noAssessmentsFound: boolean = false;
  categoryId: number = 0;
  categoryName: string = "";
  isCategorySelected: boolean = false;
  tenantId: number = 0;
  isScheduled: boolean = false;
  userRole: string;
  userRoles = UserRoles;
  catalogAssessmentType = CatalogAssessmentType;
  permissions: any;
  isEdit: boolean = false;
  isFormSubmitTriggered: boolean = false;
  createOrUpdateResult: CreateResultDto;
  tenants: AllTenants[] = [];
  selectedTenantId: tenantDetailsDto[];
  isSuperAdmin: boolean = false;
  campaignDetail: CampaignDetail;
  tenantList: AssessmentTenants[];
  onLoadValue: any;

  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  singleDropdownSettingsAssessment: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'assessmentName',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private dataService: dataService,
    private campaignService: CampaignService,
    private userService: UserService,
    private appSessionService: AppSessionService
  ) {
  }

  get modules(): FormArray {
    return this.createCampaignForm.get('modules') as FormArray;
  }

  ngOnInit() {

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });

    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });

    if (this.userRole === UserRoles[1]) {
      this.isSuperAdmin = true;
      this.getAllTenants();
    }
    else if (this.userRole === UserRoles[2] || this.userRole === UserRoles[7]) {
      this.tenantId = this.appSessionService.tenantId;
    }

    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.campaignId = parseInt(atob(params['id']));
        this.campaignService.getTenantsByCampaignId(this.campaignId).subscribe(res => {
          if (res.result) {
            this.tenantList = res.result;
            this.tenantId = this.tenantList[0].id;
            this.getCampaignDetail();
          }
          else
            this.toastrService.warning(Constants.noTenantsFound);
        },
          error => {
            this.toastrService.error(Constants.somethingWentWrong);
          });
      }
    });

    this.getCategories();
    this.initCreateCampaignForm();
  }

  initCreateCampaignForm(): void {
    this.createCampaignForm = this.formBuilder.group({
      tenantId: [this.appSessionService.tenantId ? this.appSessionService.tenantId : '', [Validators.required]],
      name: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      description: [''],
      instructions: [''],
      modules: this.formBuilder.array([this.createmodule()]),
    });
    this.onLoadValue = this.createCampaignForm.value;
  }

  createmodule(): FormGroup {
    return this.formBuilder.group({
      category: ['', [Validators.required]],
      assessment: ['', [Validators.required]],
      isDisabled: [false],
    });
  }

  addmodule(index: number) {
    this.isFormSubmitTriggered = false;
    this.modules.push(this.createmodule());
    setTimeout(() => {
      this.categories.splice(index, 0, this.category);
    }, 500);
  }

  getCampaignDetail() {
    let data: campaignDetailRequestDto = {
      campaignId: this.campaignId,
      tenantId: this.tenantId,
    };

    this.campaignService.getCampaignDetail(data).subscribe(res => {
      if (res.success) {
        this.campaignDetail = res.result;
        this.isEdit = true;
        this.editCampaign();
      }
    });
  }

  getAllTenants() {
    this.userService.getAllTenants().subscribe(res => {
      if (res.success && res.result) {
        this.tenants = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  onSelectTenant() {
    this.tenantId = this.createCampaignForm.get('tenantId').value[0].id;
    this.clear();
  }

  clear() {
    this.assessments = [];
    this.categories = [];
    for (let i = this.createCampaignForm.get('modules').value.length - 1; this.createCampaignForm.get('modules').value.length > 0; i--) {
      this.modules.removeAt(i);
    }
    this.addmodule(0);
  }

  OnTenantDeselect() {
    this.createCampaignForm.get('tenantId').reset();
    this.tenantId = 0;
    this.clear();
  }

  getCategories() {
    this.assessmentService.getCategories().subscribe(res => {
      if (res && res.result) {
        this.category = res.result;
        this.categories.push(this.category);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getAssessmentsByCategory(event, index: number) {
    this.OnCategoryDeselect(index);
    let i = index;
    this.modules.controls[index].get('assessment').setValue([]);
    this.categoryId = event.id;
    if (this.categoryId !== 0) {
      this.isCategorySelected = true;
    }
    else {
      this.isCategorySelected = false;
    }
    this.getAssessments(i);
  }

  getAssessments(index: number) {
    this.noAssessmentsFound = false;
    if (this.createCampaignForm.get('tenantId').value) {
      let assessmentRequest: AssessmentCategoryRequestDto = {
        TenantId: this.tenantId,
        CategoryId: this.categoryId,
      };
      this.assessmentService.getAssessmentsByCategory(assessmentRequest).subscribe(res => {
        if (res && res.result) {
          this.assessment = res.result;
          this.assessments.splice(index, 1, this.assessment);
        }
        else {
          this.assessments = [];
          this.noAssessmentsFound = true;
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
    else {
      this.toastrService.error(Constants.pleaseSelectTenant);
    }
  }

  OnCategoryDeselect(index: number) {
    this.modules.controls[index].get('assessment').setValue([]);
    this.assessments.splice(index, 1, []);
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  deletemodule(moduleIndex: number, module: any): void {
    abp.message.confirm(
      this.l('DriveAssessmentDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} ${Constants.level} ${moduleIndex + 1}?`),
      (result: boolean) => {
        if (result) {
          if (moduleIndex === 0) {
            if (this.modules.controls[1].status === 'VALID')
              this.deleteAssessment(moduleIndex, module);
            else
              this.toastrService.warning(Constants.driveMustContainAtleastOneLevel);
          }
          else {
            this.deleteAssessment(moduleIndex, module);
          }
        }
      });
  }

  deleteAssessment(moduleIndex: number, module: any) {
    if (module.isDisabled) {
      let data = {
        campaignId: this.campaignId,
        tenantId: this.tenantId,
        scope: 1,
        scopeId: module.assessment[0].id,
        sortOrder: moduleIndex + 1
      };
      this.campaignService.deleteCampaignAssessment(data).subscribe(res => {
        if (res.result && res.result.isSuccess) {
          this.toastrService.success(Constants.levelDeletedSuccessfully);
          this.modules.removeAt(moduleIndex);
          this.categories.splice(moduleIndex, 1);
          this.assessments.splice(moduleIndex, 1);
        }
        else {
          this.toastrService.warning(res.result.errorMessage);
        }
      },
        err => {
          console.error(err);
          this.toastrService.error(Constants.somethingWentWrong);
        }
      );
    }
    else {
      this.modules.removeAt(moduleIndex);
      this.categories.splice(moduleIndex, 1);
      this.assessments.splice(moduleIndex, 1);
    }

  }
  createCampaignFormValidationMessages = {
    tenantId: {
      required: Constants.pleaseSelectTenant
    },
    name: {
      required: Constants.pleaseEnterTheDriveTitle
    },
    categoryId: {
      required: Constants.pleaseSelectTheCategory
    },
    assessment: {
      required: Constants.pleaseSelectAssessment
    },

  }

  editCampaign(): void {
    if (this.createCampaignForm)
      this.createCampaignForm.reset();

    this.createCampaignForm.patchValue({
      tenantId: [{ id: this.tenantList[0].id, name: this.tenantList[0].name },],
      name: this.campaignDetail.name,
      description: this.campaignDetail.description,
      instructions: this.campaignDetail.instructions,
      modules: [],
    });
    this.campaignDetail.campaignAssessmentDetails.forEach((x, index) => {
      if (index > 0) {
        this.addmodule(index);
        this.assessments.push([]);
      }
      let data = {
        id: x.assessmentId,
        assessmentName: x.name
      };
      this.modules.at(index).get('category').patchValue([null]);
      this.modules.at(index).get("assessment").patchValue([data]);
      this.modules.at(index).get("isDisabled").patchValue(true);
    });
    this.onLoadValue = this.createCampaignForm.value;
  }

  isFormValid(formControlName: string): boolean {
    return !(this.createCampaignForm.get(formControlName).errors?.required && (this.createCampaignForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  saveCampaign(formData: CreateOrUpdateCampaignDto) {
    this.isFormSubmitTriggered = true;
    if (this.createCampaignForm.valid) {
      let data: CreateOrUpdateCampaignDto = {
        name: formData.name,
        authorName: '',
        status: AssessmentStatus.Draft,
        id: this.isEdit ? this.campaignId : 0,
        tenantId: this.tenantId,
        description: formData.description,
        instructions: formData.instructions,
        totalModules: JSON.stringify({ Assessments: formData.modules.length }),
        modules: [],
      };
      formData.modules.forEach((value, index) => {
        let module: ModuleDto = {
          scope: CampaignScopeType.Assessment,
          scopeId: value.assessment[0].id,
          campaignId: this.isEdit ? this.campaignId : 0,
          sortOrder: index + 1
        };
        data.modules.push(module);
      });
      this.createOrUpdateCampaign(data);
    }
    else {
      this.toastrService.error(Constants.correctValidationErrors);
    }
  }

  createOrUpdateCampaign(data: CreateOrUpdateCampaignDto) {
    this.campaignService.createOrUpdateCampaign(data).subscribe(res => {
      if (res.result) {
        this.createOrUpdateResult = res.result;
        if (this.createOrUpdateResult.isSuccess) {
          if (!this.isEdit) {
            this.toastrService.success(Constants.driveCreatedSuccessfully);
            this.router.navigate(['../list-drive'], { relativeTo: this.activateRoute });
          }
          else {
            this.toastrService.success(Constants.driveUpdatedSuccessfully);
            this.router.navigate(['../../view-drive', btoa(this.campaignId.toString())], { relativeTo: this.activateRoute });
          }
        }
        else {
          this.toastrService.error(this.createOrUpdateResult.errorMessage);
        }
      }
    });
  }

  cancel() {
    if (!this.isEdit) {
      this.router.navigate(['../list-drive'], { relativeTo: this.activateRoute });
    }
    else {
      let id = btoa(this.campaignId.toString());
      this.router.navigate(['../../view-drive', id], { relativeTo: this.activateRoute });
    }
  }

  isUnsaved(): boolean {
    if (!this.isFormSubmitTriggered && JSON.stringify(this.createCampaignForm.value) !== JSON.stringify(this.onLoadValue)) {
      return true;
    }
    return false;
  }

}
