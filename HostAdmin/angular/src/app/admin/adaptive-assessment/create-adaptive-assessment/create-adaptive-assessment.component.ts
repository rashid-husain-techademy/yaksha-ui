import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { AdaptiveAssessment, AdaptiveAssessmentCategory, AdaptiveAssessmentSkill, AdaptiveAssessmentSubSkill, CategoryList, CreateAdaptiveAssessmentForm, SkillList, SubSkillList, TenantList } from '../adaptive-assessment';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { AdaptiveAssessmentService } from '../adaptive-assessment.service';
import { ToastrService } from 'ngx-toastr';
import { tenantDetailsDto } from '@app/admin/tenants/tenant-detail';
import { NavigationService } from '@app/service/common/navigation.service';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { ActivatedRoute, Router } from '@angular/router';

//import { HttpClient } from '@angular/common/http';
//import { TenantHelper } from '@shared/helpers/TenantHelper';
//const BASE_URL = TenantHelper.getEnvironmentBasedValue("adaptiveAssessmentAPIURL");



@Component({
  selector: 'app-create-adaptive-assessment',
  templateUrl: './create-adaptive-assessment.component.html',
  styleUrls: ['./create-adaptive-assessment.component.scss']
})
export class CreateAdaptiveAssessmentComponent implements OnInit {
  constants = Constants;
  createAdaptiveAssessmentForm: FormGroup;
  isEdit: boolean = false;
  isCategoryDisabled: boolean = false;
  categoryDropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  skillDropDownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  subSkillDropDownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  //categories: CategoryDto[];
  adaptiveAssessment: AdaptiveAssessment;
  isFormSubmitTriggered: boolean = false;
  tenantList: TenantList[];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  singleCategoryDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  tenantDetails: tenantDetailsDto[];
  sampleCategoryData: string;
  categories: AdaptiveAssessmentCategory[] = [];
  skills: AdaptiveAssessmentSkill[] = [];
  subskills: AdaptiveAssessmentSubSkill[] = [];
  category: AdaptiveAssessmentCategory[];
  categoryId: number;
  name: string;
  isSkillDisabled: boolean = true;
  isSubSkillDisabled: boolean = true;
  categoryList: CategoryList;
  skillList: SkillList;
  subSkillList: SubSkillList;
  selectedCategoryData: AdaptiveAssessmentCategory;
  selectedSkillData: AdaptiveAssessmentSkill;
  selectedSubSkillData: AdaptiveAssessmentSubSkill;
  availableQuestionCount: number = 0;
  selectedTenant: TenantList;
  isSaving: boolean = false;
  userRole: string;
  userRoles = UserRoles;

  constructor(private formBuilder: FormBuilder,
    private adaptiveAssessmentService: AdaptiveAssessmentService,
    private toastrService: ToastrService,
    private navigationService: NavigationService,
    private dataService: dataService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.categoryDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      enableCheckAll: false
    };
    this.skillDropDownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      enableCheckAll: false
    };

    this.subSkillDropDownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      enableCheckAll: false
    };
    this.getCategorySkills();
    this.getAllTenants();
    this.initCreateAssessmentForm();

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });

  }

  saveAdaptiveAssessment(formData: CreateAdaptiveAssessmentForm) {
    this.isFormSubmitTriggered = true;
    if (this.isSaving) {
      return;
    }
    if ((this.createAdaptiveAssessmentForm.get("totalQuestionsCount").value) > this.availableQuestionCount) {
      this.toastrService.error(Constants.totalQuestionsCannotExceedTheAvailableQuestions);
      return;
    }
    if (this.userRole !== UserRoles[1]) {
      this.createAdaptiveAssessmentForm.get('tenantList').clearValidators();
      this.createAdaptiveAssessmentForm.get('tenantList').updateValueAndValidity();
    }
    if (this.createAdaptiveAssessmentForm.valid) {
      this.isSaving = true;
      let data: AdaptiveAssessment = {
        cateogryId: this.selectedCategoryData.id,
        assessmentName: this.createAdaptiveAssessmentForm.get("name").value,
        categoryName: this.selectedCategoryData.name,
        skillId: this.selectedSkillData.id,
        skillName: this.selectedSkillData.name,
        subSkillId: this.selectedSubSkillData?.id,
        subSkillName: this.selectedSubSkillData?.name,
        tenantId: this.selectedTenant?.id,
        numberOfQuestions: this.createAdaptiveAssessmentForm.get("totalQuestionsCount").value ? this.createAdaptiveAssessmentForm.get("totalQuestionsCount").value : 0
      };
      this.adaptiveAssessmentService.createAdaptiveAssessment(data).subscribe(res => {
        if (res.result.isSuccess) {
          this.router.navigate([`../view-adaptive-assessment`, btoa(JSON.stringify(res.result.id)),], { relativeTo: this.activatedRoute });
          this.toastrService.success("Adaptive Assessment Successfully created");
        } else {
          this.isSaving = false;
          this.toastrService.error(res.result.errorMessage);
        }
      },
        error => {
          this.isSaving = false;
          this.toastrService.error(Constants.somethingWentWrong);
        });
    } else {
      this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
    }

  }
  cancel() {
    this.navigationService.goBack();
  }
  initCreateAssessmentForm(): void {
    this.createAdaptiveAssessmentForm = this.formBuilder.group({
      categories: ['', [Validators.required]],
      name: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      skills: ['', [Validators.required]],
      subskills: [''],
      totalQuestionsCount: [0],
      tenantList: ['', [Validators.required]],
    });
  }

  createAdaptiveAssessmentFormValidationMessages = {
    categoryId: {
      required: Constants.pleaseSelectTheCategory
    },
    name: {
      required: Constants.pleaseEnterTheAssessmentTitle
    },
    skillId: {
      required: Constants.pleaseSelectSkill
    },
    subSkillId: {
      required: Constants.pleaseSelectSubSkill
    },
    tenantId: {
      required: Constants.pleaseSelectTenantId
    },
  }

  getAllTenants() {
    this.adaptiveAssessmentService.getAllTenants().subscribe(res => {
      if (res.success) {
        this.tenantList = res.result;
      }
      else {
        this.toastrService.warning(Constants.noTenantsFound);
      }
    });
  }
  getCategorySkills() {
    this.adaptiveAssessmentService.getCategorySkills().subscribe(res => {
      if (res.result) {
        this.categoryList = JSON.parse(res.result);
        this.categories = Object.keys(this.categoryList).map(category => ({
          id: this.categoryList[category].category_id,
          name: category
        }));

      }
    });
  }
  onTenantSelect(event) {
    this.selectedTenant = event;
  }
  tenantDeselect(event) {

  }
  onCategorySelect(event) {
    const selectedCategory = event.id;
    this.selectedCategoryData = event;
    const category = Object.values(this.categoryList).find(cat => cat['category_id'] === selectedCategory);
    if (category) {
      this.skills = Object.keys(category.skills).map(skill => ({
        id: category.skills[skill].skill_id,
        name: skill
      }));
      this.skillList = category.skills;
      this.availableQuestionCount = category.question_count;
    }
    this.isSkillDisabled = false;
  }

  categoryDeselect(event) {
    // this.selectedSkillId = event.id;
    // this.skillIdArray = this.skillIdArray.filter(id => id !== this.selectedSkillId);
    // this.restrictSubSkill = false;
    // if (this.skillIdArray.length == 0 || this.questionResponse){
    //     this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, true);
    //     this.resetSearchResult();
    // }
  }

  onSkillSelect(event) {
    const selectedSkill = event.id;
    this.selectedSkillData = event;
    const skill = Object.values(this.skillList).find(skill => skill['skill_id'] === selectedSkill);
    if (skill) {
      this.subskills = Object.keys(skill.sub_skills).map(subSkill => ({
        id: skill.sub_skills[subSkill].SubSkillId,
        name: subSkill
      }));
      this.subSkillList = skill.sub_skills;
      this.availableQuestionCount = skill.question_count;
    }
    this.isSubSkillDisabled = false;
  }

  skillDeselect(event) {
    // this.selectedSkillId = event.id;
    // this.skillIdArray = this.skillIdArray.filter(id => id !== this.selectedSkillId);
    // this.restrictSubSkill = false;
    // if (this.skillIdArray.length == 0 || this.questionResponse){
    //     this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, true);
    //     this.resetSearchResult();
    // }
  }

  onSubSkillSelect(event) {
    const selectedSubSkill = event.id;
    this.selectedSubSkillData = event;
    const subSkill = Object.values(this.subSkillList).find(subskill => subskill['SubSkillId'] === selectedSubSkill);
    if (subSkill) {
      this.availableQuestionCount = subSkill.question_count;
    }
  }

  subSkillDeselect(event) {
    // this.selectedSkillId = event.id;
    // this.skillIdArray = this.skillIdArray.filter(id => id !== this.selectedSkillId);
    // this.restrictSubSkill = false;
    // if (this.skillIdArray.length == 0 || this.questionResponse){
    //     this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, true);
    //     this.resetSearchResult();
    // }
  }


  onDropdownClose() {
    // if (!this.restrictSubSkill && this.skillIdArray && this.skillIdArray?.length > 0) {
    //     this.skillIds = this.skillIdArray.join(',');
    //     const data = this.prepateDataForSubSkills();
    //     this.assessmentService.getSubSkillsForAssessment(data).subscribe(res => {
    //         if (res && res.result) {
    //             this.subSkills = res.result;
    //             this.restrictSubSkill = true;
    //             this.isSubSkillDisabled = false;
    //             this.enableQuestionType = true;
    //             this.createSectionSkillForm.get('questionTypeId').enable();
    //         }
    //     },
    //         error => {
    //             this.toastrService.error(Constants.somethingWentWrong);
    //         });
    // }
  }

  sampleCategoryJson(): string {
    var json = {
      "Soft Skills": {
        "category_id": 51,
        "question_count": 1573,
        "skills": {
          "Java": {
            "skill_id": 1052,
            "question_count": 598,
            "quality": "Bronze",
            "sub_skills": {
              "BASIC": {
                "SubSkillId": 20193,
                "question_count": 204,
                "quality": "Bronze"
              },
              "EXPERT": {
                "SubSkillId": 19730,
                "question_count": 336,
                "quality": "Bronze"
              },
              "INTERMEDIATE": {
                "SubSkillId": 18702,
                "question_count": 58,
                "quality": "Bronze"
              }
            }
          },
          "JavaScript": {
            "skill_id": 1060,
            "question_count": 596,
            "quality": "Bronze",
            "sub_skills": {
              "BASIC": {
                "SubSkillId": 20193,
                "question_count": 322,
                "quality": "Bronze"
              },
              "EXPERT": {
                "SubSkillId": 19730,
                "question_count": 35,
                "quality": "Bronze"
              },
              "INTERMEDIATE": {
                "SubSkillId": 18702,
                "question_count": 239,
                "quality": "Bronze"
              }
            }
          },
          "Python": {
            "skill_id": 1173,
            "question_count": 164,
            "quality": "Bronze",
            "sub_skills": {
              "EXPERT": {
                "SubSkillId": 19730,
                "question_count": 164,
                "quality": "Bronze"
              }
            }
          },
          "DotNET": {
            "skill_id": 760,
            "question_count": 215,
            "quality": "Bronze",
            "sub_skills": {
              "BASIC": {
                "SubSkillId": 20193,
                "question_count": 82,
                "quality": "Bronze"
              },
              "EXPERT": {
                "SubSkillId": 19730,
                "question_count": 133,
                "quality": "Bronze"
              }
            }
          }
        },
        "quality": "Silver"
      }
    };

    return JSON.stringify(json);
  }

  isFormValid(formControlName: string): boolean {
    return !(this.createAdaptiveAssessmentForm.get(formControlName)?.errors?.required && (this.createAdaptiveAssessmentForm.get(formControlName).touched) || this.isFormSubmitTriggered);
  }

  preventNegative(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow only numbers and control keys
    if (charCode === 45 || charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove negative sign if present
    if (input.value.includes('-')) {
      input.value = input.value.replace('-', '');
    }
  }

}
