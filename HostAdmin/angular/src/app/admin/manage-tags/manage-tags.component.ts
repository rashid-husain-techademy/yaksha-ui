import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ManageTagService } from './manage-tags.service';
import { CategoryImport, CreateCategoryDto, ListCategoryDto, SkillDto } from '@app/admin/manage-tags/manage-tags-detail';
import { UserInput } from '../user-profile/my-profile/my-profile';
import { UserProfileService } from '../user-profile/user-profile.service';
import { SkillDetails, SkillImport, SkillsList } from '@app/admin/manage-tags/skill-details';

export interface Skills {
  id: number,
  name: string
}
@Component({
  selector: 'app-manage-tags',
  templateUrl: './manage-tags.component.html',
  styleUrls: ['./manage-tags.component.scss']
})
export class ManageTagsComponent implements OnInit {
  skillForm: FormGroup
  skillTag: boolean = true;
  toggleTag: boolean = true;
  tagModal: boolean = true;
  manageTagForm: FormGroup;
  searchValue: string;
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  tenantId: number;
  toggle: boolean;
  categoryDetails: CategoryImport[];
  categoryFormData: ListCategoryDto;
  selectedSkills = [];
  skillName: SkillDto[];
  allSkills: Skills[] = [];
  dropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; clearSearchFilter: Boolean; enableCheckAll: boolean };
  editAddLabel: string = 'Edit';
  tenantStatus = ['Active', 'InActive'];
  constants = Constants;
  isFormSubmitTriggered: boolean = false;
  tenantPageSizes: number[] = [10, 20, 30];
  isEdit: boolean = false;
  myForm: FormGroup;
  disabled = false;
  showFilter = false;
  limitSelection = false;
  cities: any[] = [];
  selectedItems: any;
  skillList: SkillsList;
  input = new UserInput();
  myFormControl = new FormControl();
  id: number;
  skillPageSizes: number[] = [10, 20, 30];
  skillsList: SkillsList;
  skillDetailsEdit: SkillsList;
  modalOption: number = 0;
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private manageTagService: ManageTagService,
    private toastrService: ToastrService,
    private UserProfileService: UserProfileService,

  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      itemsShowLimit: 5,
      clearSearchFilter: true,
      enableCheckAll: true,
    };
    this.getSkills();
    this.getSkillDetails();
  }

  closeBtnClick(): void {
    this.modalService.dismissAll();
  }

  openAddOrEditSkill(targetModal: NgbModal, tags: string, skillname: string = '', ID: number = 0): void {
    this.isFormSubmitTriggered = false;
    this.initSKillForm();
    if (tags === Constants.category) {
      this.tagModal = true;
      this.isEdit = true;
      this.editAddLabel = 'Edit';
      this.patchSkillFrom(skillname, ID);
    } else {
      this.tagModal = false;
    }
    if (skillname !== undefined) {
      this.patchSkillFrom(skillname, ID);
    }
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static'
    });
    if (ID) {
      this.toggle = true;
      this.isEdit = true;
      this.editAddLabel = 'Edit';
      this.id = ID;
      this.getSkillDetails(true);
    }
    else {
      this.toggle = false;
      this.isEdit = false;
      this.skillForm.patchValue({
        isActive: true
      });
      this.editAddLabel = 'Add';
    }
  }

  initCategoryForm(): void {
    this.manageTagForm = this.formBuilder.group({
      id: [],
      categoryName: ['', [Validators.required, Validators.pattern(".*[a-zA-Z]+.*"), Validators.maxLength(100)]],
      skillName: ['']
    });
  }

  isCategoryFormValid(formControlName: string): boolean {
    if (this.isEdit && formControlName === "skillName")
      return true;
    else
      return !(this.manageTagForm.get(formControlName).errors?.required && (this.manageTagForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  saveCategory(formData: CategoryImport): void {
    this.isFormSubmitTriggered = true;
    if (this.manageTagForm.valid) {
      let data: CreateCategoryDto = {
        Id: this.manageTagForm.get('id').value ? this.manageTagForm.get('id').value : 0,
        Name: this.manageTagForm.get('categoryName').value,
        Description: this.manageTagForm.get('categoryName').value,
        IdNumber: null,
        SkillId: formData.skillName ? formData.skillName.map(x => x.id) : []
      };
      this.manageTagService.isCategoryNameExist(data).subscribe(result => {
        if (result.result) {
          this.toastrService.warning(Constants.categoryAlreadyExist);
        }
        else {
          this.createManageTag(data);
        }
      });
    }
  }

  getCategories(): void {
    this.manageTagService.getAllCategories().subscribe(res => {
      if (res.success) {
        this.categoryDetails = res.result;
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  getSkills() {
    this.manageTagService.getSkills().subscribe(res => {
      if (res && res.result) {
        this.skillName = res.result;
        this.allSkills = res.result;
        if (this.isEdit && this.tenantId) {
          this.selectedSkills = null;
          this.initCategoryForm();
          this.getCategoryDetails(this.isEdit);
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  createManageTag(data) {
    this.manageTagService.createOrUpdateCategory(data).subscribe(result => {
      if (result.result) {
        this.getCategories();
        if (this.isEdit)
          this.toastrService.success(Constants.categoryUpdatedSuccessfully);
        else
          this.toastrService.success(Constants.categoryCreatedSuccessfully);
        this.closeBtnClick();
        this.isFormSubmitTriggered = false;
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  openAddOrEditCategory(targetModal: NgbModal, categoryId: number): void {
    this.selectedItems = targetModal;
    this.isFormSubmitTriggered = false;
    if (categoryId > 0) {
      this.toggle = true;
      this.isEdit = true;
      this.editAddLabel = 'Edit';
      this.tenantId = categoryId;
      this.getSkills();
    }
    else {
      this.toggle = false;
      this.isEdit = false;
      this.editAddLabel = 'Add';
      this.getSkills();
      this.selectedSkills = null;
      this.initCategoryForm();
      this.manageTagForm.reset();
    }

    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static'
    });
  }

  getCategoryDetails(isEdit: boolean = false): void {
    this.isEdit = isEdit;
    let categoryId = isEdit ? this.tenantId : null;
    this.manageTagService.getCategoryDetails(categoryId).subscribe(res => {
      if (res.success) {
        this.categoryFormData = res.result;
        this.displayCategory();
      }
    });
  }

  skillTags(data) {
    if (data === Constants.category) {
      this.skillTag = true;
      this.toggleTag = true;
    } else {
      this.skillTag = false;
      this.toggleTag = false;
    }
  }

  initSKillForm(): void {
    this.skillForm = this.formBuilder.group({
      ID: Number,
      selectedSkillName: ['', [Validators.required]]
    });
  }

  patchSkillFrom(skillname: string, ID: number = 0) {
    this.skillForm.patchValue({ selectedSkillName: skillname, ID: ID });
  }

  search() {
    this.pageIndex = 1;
    this.getSkillDetails();
  }

  getSkillDetails(isEdit: boolean = false): void {
    this.isEdit = isEdit;
    let data: SkillDetails = {
      ID: isEdit ? this.id : null,
      searchString: this.searchValue ? (this.searchValue) : '',
      skipCount: isEdit ? 0 : (this.pageIndex - 1) * this.pageSize,
      maxResultCount: isEdit ? 1 : this.pageSize,
    };
    this.UserProfileService.getAllSkillDetails(data).subscribe(res => {
      if (res.success) {
        if (!isEdit) {
          this.skillsList = res.result;
        }
        else {
          this.skillDetailsEdit = res.result;
          isEdit ? this.displaySkill() : false;
        }
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  displayCategory(): void {
    this.manageTagForm.patchValue({
      id: this.tenantId,
      categoryName: this.categoryFormData.name
    });
    this.selectedSkills = this.categoryFormData.skillDetails;
    let ids = this.selectedSkills.map(c => c.id);
    this.allSkills = this.allSkills.filter(({ id }) => !ids.includes(id));
  }

  displaySkill() {
    let skillDetails = this.skillDetailsEdit.skills[0];
    this.skillForm.patchValue({
      selectedSkillName: skillDetails.name,
    });
  }

  save(): void {
    this.isFormSubmitTriggered = true;
    if (this.skillForm.valid) {
      let data: SkillImport = {
        id: this.skillForm.get('ID').value,
        name: this.skillForm.get('selectedSkillName').value,
      };
      if (!this.isEdit) {
        this.UserProfileService.isskillNameExists(data).subscribe(result => {
          if (result.result) {
            this.toastrService.warning(Constants.skillsAlreadyExist);
          }
          else {
            this.createSkill(data);
          }
        });
      }
      else {
        this.createSkill(data);
      }
    }
  }

  isFormValid(formControlName: string): boolean {
    return !(this.skillForm.get(formControlName).errors?.required && (this.skillForm.get(formControlName).touched || this.isFormSubmitTriggered));
  };

  createSkill(data) {
    this.UserProfileService.createOrUpdateSkill(data).subscribe(result => {
      if (result.result) {
        if (this.toggle)
          this.toastrService.success(Constants.skillUpdatedSuccessfully);
        else
          this.toastrService.success(Constants.skillCreatedSuccessfully);
        this.getSkillDetails();
        this.closeBtnClick();
        this.isFormSubmitTriggered = false;
      }
      else
        this.toastrService.warning(Constants.somethingWentWrong);
    });
  }

  reset(): void {
    this.pageIndex = 1;
    this.searchValue = '';
    this.getSkillDetails();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getSkillDetails();
  }
}
