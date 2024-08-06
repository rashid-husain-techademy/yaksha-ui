import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantsDto } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../../models/constants';
import { Category, CategorySkillFilter, CreateQuestionBank, CreateQuestionBankSkill, Skill, SkillDetails } from '../question-bank-details';
import { QuestionBankService } from '../question-bank.services';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { QuestionBankScope, QuestionBankTypes } from '@app/enums/question-bank-type';
import { Helper } from '@app/shared/helper';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
@Component({
  selector: 'app-create-question-bank',
  templateUrl: './create-question-bank.component.html',
  styleUrls: ['./create-question-bank.component.scss']
})
export class CreateQuestionBankComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantDetailsList: TenantsDto[];
  categoryList: Category[];
  questionBankForm: FormGroup;
  filterForm: FormGroup;
  categorySkills: Skill[];
  filteredSkills: Skill[] = [];
  selectedSkillDetails: SkillDetails[] = [];
  skillDetails: SkillDetails[];
  skillIds: number[] = [];
  tenantName: string;
  questionBankName: string;
  dropData: SkillDetails[] = [];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  questionBankId: number = 0;
  edit: boolean = false;
  clone: boolean = false;
  tenantId: number;
  totalSkills: number = 0;
  totalQuestions: number = 0;
  totalMCQ: number = 0;
  totalCoding: number = 0;
  totalStack: number = 0;
  isTenantDisabled: boolean = false;
  skillDropdownSettings: any = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  skillCurrentPage: number = 0;
  skillItemsPerPage: number = 50;

  constructor(private tenantService: TenantsService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private questionBankService: QuestionBankService,
    private toastrService: ToastrService,
    injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.initQuestionBankForm();
    this.activatedRoute.params.subscribe(params => {
      if (params['questionBank']) {
        const questionBank = atob(params['questionBank']).split('/');
        this.questionBankId = parseInt(questionBank[0]);
        this.edit = Boolean(questionBank[1] === "true");
        this.clone = Boolean(questionBank[2] === "true");
        this.questionBankName = String(questionBank[3]);
        this.tenantId = parseInt(questionBank[4]);
        this.tenantName = String(questionBank[5]);
        if (this.edit) {
          this.questionBankForm.patchValue({
            questionBankName: this.questionBankName,
            tenantName: [{ id: this.tenantId, name: this.tenantName }],
          });
          this.isTenantDisabled = true;
          this.questionBankForm.get('tenantName').disable();
        }
      }
    });
    this.initFilterForm();
    if (this.questionBankId) {
      let existingQuestionBank = this.edit ? true : this.clone ? true : false;
      this.getQuestionBankDetails(existingQuestionBank);
    }
    this.filterForm.get('skill').disable();
    this.getTenantDetails();
    this.getAllCategoryDetails();
    this.getAllCategorySkills();
  }

  initQuestionBankForm() {
    this.questionBankForm = this.formBuilder.group({
      questionBankName: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z ]/i)]],
      tenantName: ['', [Validators.required]]
    });
  }

  initFilterForm() {
    this.filterForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      skill: [''],
      searchValue: ['']
    });
  }

  getQuestionBankDetails(isInitialLoad: boolean = false): void {
    let data: CategorySkillFilter = {
      questionBankId: isInitialLoad ? this.questionBankId : null,
      categoryId: this.filterForm.get('category').value,
      skillId: this.filterForm.get('skill').value,
      skillName: this.filterForm.get('searchValue').value
    };
    this.questionBankService.getSkillDetails(data).subscribe(res => {
      if (res.success)
        this.selectedSkillDetails = res.result;
      if (this.selectedSkillDetails !== null && this.selectedSkillDetails.length > 0) {
        this.selectedSkillDetails.forEach(skill => {
          skill.MCQ = skill.Coding = skill.Stack = skill.TotalQuestions = 0;
          let questionCount = JSON.parse(skill.questionCount);
          if (questionCount !== null && questionCount.length > 0) {
            questionCount.forEach(type => {
              if (parseInt(type.QuestionTypeId) === this.constants.mcqTypeId) {
                skill.MCQ = type.Count;
                skill.TotalQuestions += skill.MCQ;
              }
              else if (parseInt(type.QuestionTypeId) === this.constants.codingTypeId) {
                skill.Coding = type.Count;
                skill.TotalQuestions += skill.Coding;
              }
              else
                skill.Stack = type.Count;
              skill.TotalQuestions += skill.Stack;

            });
          }
          this.totalQuestions += skill.TotalQuestions;
          this.totalMCQ += skill.MCQ;
          this.totalCoding += skill.Coding;
          this.totalStack += skill.Stack;
          this.totalSkills += 1;
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<SkillDetails[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.calculateQuestions();
  }

  getCategorySkillDetails(eventId: number = null, isInitialLoad: boolean = false): void {
    let data: CategorySkillFilter = {
      questionBankId: isInitialLoad ? this.questionBankId : null,
      categoryId: eventId ? eventId : this.filterForm.get('category')?.value[0]?.id ? this.filterForm.get('category')?.value[0]?.id : null,
      skillId: this.filterForm.get('skill')?.value[0]?.id ? this.filterForm.get('skill')?.value[0]?.id : null,
      skillName: this.filterForm.get('searchValue').value
    };
    this.questionBankService.getSkillDetails(data).subscribe(res => {
      if (res.success)
        this.skillDetails = res.result;
      if (this.skillDetails !== null && this.skillDetails.length > 0) {
        this.skillDetails.forEach(skill => {
          skill.MCQ = skill.Coding = skill.Stack = skill.TotalQuestions = 0;
          let questionCount = JSON.parse(skill.questionCount);
          if (questionCount !== null && questionCount.length > 0) {
            questionCount.forEach(type => {
              if (parseInt(type.QuestionTypeId) === this.constants.mcqTypeId) {
                skill.MCQ = type.Count;
                skill.TotalQuestions += skill.MCQ;
              }
              if (parseInt(type.QuestionTypeId) === this.constants.codingTypeId) {
                skill.Coding = type.Count;
                skill.TotalQuestions += skill.Coding;
              }
              if (parseInt(type.QuestionTypeId) === this.constants.stackTypeId) {
                skill.Stack = type.Count;
                skill.TotalQuestions += skill.Stack;
              }
            });
          }
        });
      }
      else {
        this.toastrService.warning(this.constants.noDataFound);
      }
    });
  }

  onSkillDeselect() {
    this.filterForm.get('skill').setValue('');
    this.getActiveFilterSkillsDetail();
  }

  getAllCategoryDetails(): void {
    this.questionBankService.getAllCategories().subscribe(res => {
      if (res.success && res.result) {
        let sortedCategory = res.result.sort(Helper.sortString<Category>('name'));
        this.categoryList = sortedCategory;
      }
    });
  }

  reset(): void {
    this.skillDetails = [];
    this.filterForm.get('skill').setValue('');
    this.filterForm.get('category').setValue('');
    this.filterForm.get('searchValue').setValue('');
  }

  onSelectCategory(event): void {
    this.getCategorySkillDetails(event.id);
  }

  onDeSelectCategory() {
    this.getActiveFilterSkillsDetail();
  }

  getAllCategorySkills() {
    this.questionBankService.getAllCategorySkills().subscribe(res => {
      if (res.success && res.result.length > 0) {
        let sortedSkills = res.result.sort(Helper.sortString<Skill>('name'));
        this.categorySkills = sortedSkills;
        this.displaySkillsFilteredData();
        if (this.categorySkills.length > this.skillItemsPerPage) {
          this.setSkillDropdownSettings();
        }
      }
    });
  }

  getTenantDetails(): void {
    this.tenantService.getAllTenants().subscribe(res => {
      if (res.success) {
        this.tenantDetailsList = res.result;
      }
    }, error => {
      console.error(error);
    });
  }

  removeSkill(skillId: number): void {
    this.selectedSkillDetails = this.selectedSkillDetails.filter(res => res.id !== skillId);
    this.calculateQuestions();
  }

  cancel() {
    if (this.edit || this.clone) {
      this.router.navigate(['../../question-bank-operation'], { relativeTo: this.activatedRoute });
    }
    else {

      this.router.navigate(['../question-bank-operation'], { relativeTo: this.activatedRoute });
    }
  }
  calculateQuestions() {
    this.totalSkills = this.totalQuestions = this.totalMCQ = this.totalCoding = this.totalStack = 0;
    this.selectedSkillDetails = Array.from(this.selectedSkillDetails.reduce((m, t) => m.set(t.id, t), new Map()).values());
    this.selectedSkillDetails.forEach(x => {
      this.totalSkills += 1;
      this.totalQuestions += x.TotalQuestions;
      this.totalMCQ += x.MCQ;
      this.totalCoding += x.Coding;
      this.totalStack += x.Stack;
    });
  }

  saveQuestionBank() {
    if (this.questionBankForm.valid) {
      if (this.selectedSkillDetails.length > 0) {
        if (!this.edit)
          this.tenantId = parseInt(this.questionBankForm.get('tenantName').value[0].id);
        let questionBankName = String(this.questionBankForm.get('questionBankName').value);
        this.selectedSkillDetails.forEach(res => {
          let skillId = res.id;
          this.skillIds.push(skillId);
        });
        let uniqueSkillIds = this.skillIds.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        });
        if (this.clone)
          this.questionBankId = 0;
        let data: CreateQuestionBank = {
          QuestionBankId: this.questionBankId > 0 ? this.questionBankId : 0,
          Name: questionBankName,
          TenantId: this.tenantId,
          Scope: QuestionBankScope.TenantSpecific,
          Type: QuestionBankTypes.Skill,
          ConfigJson: null
        };
        this.questionBankService.createQuestionBank(data).subscribe(res => {
          if (res.result !== null) {
            this.questionBankId = res.result.id;
            uniqueSkillIds = uniqueSkillIds.filter(skill => skill !== -1);
            let skillData: CreateQuestionBankSkill = {
              QuestionBankId: this.questionBankId,
              SkillIds: uniqueSkillIds,
              TenantId: this.tenantId,
              IsVisible: true
            };
            this.questionBankService.createQuestionBankSkills(skillData).subscribe(res => {
              if (res.success) {
                if (!this.edit && !this.clone) {
                  this.toastrService.success(this.constants.questionBankCreatedSuccessfully);
                  this.router.navigate(['../question-bank-operation'], { relativeTo: this.activatedRoute });
                }
                else if (this.clone) {
                  this.toastrService.success(this.constants.questionBankClonedSuccessfully);
                  this.router.navigate(['../../question-bank-operation'], { relativeTo: this.activatedRoute });
                }
                else {
                  this.toastrService.success(this.constants.questionBankUpdatedSuccessfully);
                  this.router.navigate(['../../question-bank-operation'], { relativeTo: this.activatedRoute });
                }
              }
              else
                this.toastrService.error(this.constants.questionBankCreateFailed);
            });
          }
          else {
            this.toastrService.error(this.constants.questionBankNameAlreadyExists);
          }
        });
      }
      else {
        this.toastrService.warning(this.constants.pleaseSelectTheSkills);
      }
    }
    else {
      this.toastrService.warning(this.constants.pleaseFillTheMandatoryFields);
    }
  }

  getActiveFilterSkillsDetail() {
    if (!this.filterForm.get('category')?.value[0]?.id && !this.filterForm.get('skill')?.value[0]?.id && !this.filterForm.get('searchValue')?.value) {
      this.reset();
    } else {
      this.getCategorySkillDetails();
    }
  }

  displaySkillsFilteredData(event: any = null) {
    if (event === null || event === '') {
      this.filteredSkills = this.categorySkills.slice(this.skillCurrentPage, this.skillItemsPerPage);
    } else {
      let skills = this.categorySkills?.filter(x => x.name.toLocaleLowerCase().includes(event.toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
      if (skills?.length > 0) {
        this.filteredSkills = this.categorySkills.filter(x => x.name.toLocaleLowerCase().includes(event.toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
      }
    }
  }

  setSkillDropdownSettings() {
    this.skillDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: this.constants.fiftyPlusSkillsExistSearchHereToFilter
    };
  }
}
