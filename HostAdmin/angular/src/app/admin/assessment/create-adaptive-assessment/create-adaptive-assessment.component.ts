import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { CategoryDto, CategorySkillRequestDto, CreateAdaptiveAssessmentForm, CreateResultDto, SkillDetailDto, AdaptiveAssessmentQuestionsDetailRequestDto, SkillSectionDto } from '../assessment';
import { AssessmentService } from '../assessment.service';
import { ToastrService } from 'ngx-toastr';
import { QuestionBankScope, AdaptiveAssessmentType } from '@app/enums/assessment';
import { ActivatedRoute, Router } from '@angular/router';
import { AdaptiveAssessmentDetail } from '../assessment';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { GetSkills } from '@app/admin/question/question-details';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { ApiClientService } from '@app/service';
import { Unsaved } from '@app/interface/unsaved-data';
import { Permissions } from '@shared/roles-permission/permissions';

@Component({
  selector: 'app-create-adaptive-assessment',
  templateUrl: './create-adaptive-assessment.component.html',
  styleUrls: ['./create-adaptive-assessment.component.scss']
})

export class CreateAdaptiveAssessmentComponent implements OnInit, Unsaved {

  isMultiSkillType: boolean = false;
  addAdaptiveAssessmentForm: FormGroup;
  saveAdaptiveAssessmentForm: FormGroup;
  isFormSubmitTriggered: boolean = false;
  isSaveFormSubmitTriggered: boolean = false;
  createOrUpdateResult: CreateResultDto;
  assessmentId: number = 0;
  navigatedFrom: string = '';
  isEdit: boolean = false;
  isDelete: boolean = false;
  assessmentData: AdaptiveAssessmentDetail;
  constants = Constants;
  totalLevels: number = 3;
  categories: CategoryDto[] = [];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  categoryDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: Constants.selectAll,
    unSelectAllText: Constants.unSelectAll,
    itemsShowLimit: 1,
    allowSearchFilter: true,
    enableCheckAll: true
  };
  isCategoryDisabled: boolean = false;
  isSkillDisabled: boolean = false;
  skills: GetSkills;
  selectedQuestionBankScope: number;
  searchSkipCount: number = 0;
  searchMaxResultCount: number = 100;
  categoryBasedSkillsForSingle: SkillDetailDto[] = [];
  questionResult: string;
  userRole: string;
  userRoles = UserRoles;
  isSuperAdmin: boolean = false;
  onLoadValue: AdaptiveAssessmentDetail;
  questionBank: string = Constants.yakshaQuestions;
  selectedCategoryIds: string;
  permissions: any;

  constructor(private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dataService: dataService,
    private apiClientService: ApiClientService
  ) { }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    if (this.userRole === UserRoles[1]) {
      this.isSuperAdmin = true;
      this.selectedQuestionBankScope = QuestionBankScope.Global;
    }
    else if (this.permissions[Permissions.assesmentsManageAll]) {
      this.selectedQuestionBankScope = QuestionBankScope.TenantSpecific;
    }

    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.assessmentId = parseInt(atob(params['id']));
        this.getAdaptiveAssessmentDetail();
      }
      if (params['navigatedFrom']) {
        let navigatedFrom = atob(params['navigatedFrom']);
        this.navigatedFrom = navigatedFrom;
      }
    });
    this.getCategories();
    this.initCreateAdaptiveAssessmentForm();
    this.initSaveAdaptiveAssessmentForm();
  }

  toggleAssessment(val: string) {
    if (val === Constants.singleSkill) {
      this.isMultiSkillType = false;
    }
    else {
      this.isMultiSkillType = true;
    }
    this.resetSaveAdaptiveAssessmentForm();
    this.getSkills(this.selectedCategoryIds);
  }

  initCreateAdaptiveAssessmentForm(): void {
    this.addAdaptiveAssessmentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(500), WhiteSpaceValidators.emptySpace()]],
      description: [''],
      instructions: [''],
      skillType: [{ value: '', disabled: false }, [Validators.required]], // Enable once multi skill type is implemented
      category: [{ value: '', disabled: false }, [Validators.required]]
    });
  }

  initSaveAdaptiveAssessmentForm(): void {
    this.saveAdaptiveAssessmentForm = this.formBuilder.group({
      formSkillLists: this.formBuilder.array([
        this.getSkillForm()
      ]),
    });
  }

  getSkillForm() {
    return this.formBuilder.group({
      assessmentSectionId: [0],
      assessmentSectionSkillId: [0],
      assessmentSectionSkillMetadataId: [0],
      skillId: this.formBuilder.control(null, Validators.required),
      beginnerProficiencyLevelId: [Constants.beginner],
      beginnerMcqCount: [null, [Validators.required, Validators.min(1)]],
      beginnerPassPercentage: [null, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
      beginnerTotalQuestions: [0],
      intermediateProficiencyLevelId: [Constants.intermediate],
      intermediateMcqCount: [null, [Validators.required, Validators.min(1)]],
      intermediatePassPercentage: [null, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
      intermediateTotalQuestions: [0],
      advancedProficiencyLevelId: [Constants.advanced],
      advancedMcqCount: [null, [Validators.required, Validators.min(1)]],
      advancedPassPercentage: [null, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
      advancedTotalQuestions: [0]
    });
  }

  addAdaptiveAssessmentFormValidationMessages = {
    name: {
      required: Constants.pleaseEnterTheAssessmentTitle,
      maxLength: Constants.maximumAllowedcharacters,
    },
    skillType: {
      required: Constants.skillType
    }
  }

  saveAdaptiveAssessmentFormValidationMessages = {
    skillId: Constants.pleaseSelectSkill,
    categoryId: Constants.pleaseSelectCategory,
    questionMessage: Constants.invalidData,
    mcqCount: {
      required: Constants.pleaseEntertheMcqCount
    },
    passPercentage: {
      required: Constants.pleaseEnterthePassPercentage
    }
  }

  addAdaptiveAssessmentDetails() {
    this.isFormSubmitTriggered = true;
  }

  saveAdaptiveAssessment() {
    this.isSaveFormSubmitTriggered = true;
    let requestDto: CreateAdaptiveAssessmentForm = {
      id: 0,
      name: this.addAdaptiveAssessmentForm.value.name,
      description: this.addAdaptiveAssessmentForm.value.description,
      instructions: this.addAdaptiveAssessmentForm.value.instructions,
      adaptiveAssessmentType: this.addAdaptiveAssessmentForm.getRawValue().skillType === Constants.singleSkill
        ? AdaptiveAssessmentType.SingleSkill : AdaptiveAssessmentType.MultiSkill,
      skill: [],
      categories: this.selectedCategoryIds?.split(',').map(x => Number(x))
    };
    if (this.assessmentId !== 0) {
      requestDto.id = this.assessmentId;
    }
    let formSkills = this.saveAdaptiveAssessmentForm.value.formSkillLists;
    formSkills?.forEach((obj) => {
      let skillDto: SkillSectionDto = {
        assessmentSectionId: obj.assessmentSectionId || 0,
        assessmentSectionSkillId: obj.assessmentSectionSkillId || 0,
        assessmentSectionSkillMetadataId: obj.assessmentSectionSkillMetadataId || 0,
        skillId: obj.skillId[0].id,
        skillName: obj.skillId[0].name,
        questionBankScope: this.userRole === UserRoles[1] ? QuestionBankScope.Global : this.selectedQuestionBankScope,
        configJson: JSON.stringify({ "codingLanguageId": null }),
        totalQuestions: obj.beginnerMcqCount + obj.intermediateMcqCount + obj.advancedMcqCount,
        levels: []
      };
      skillDto.levels = [{
        "questionsCount": obj.beginnerMcqCount,
        "passPercentage": obj.beginnerPassPercentage,
        "proficiencyId": 1
      },
      {
        "questionsCount": obj.intermediateMcqCount,
        "passPercentage": obj.intermediatePassPercentage,
        "proficiencyId": 2
      },
      {
        "questionsCount": obj.advancedMcqCount,
        "passPercentage": obj.advancedPassPercentage,
        "proficiencyId": 3
      }];
      requestDto.skill.push(skillDto);
    });
    this.createAdaptiveAssessment(requestDto);
  }

  createAdaptiveAssessment(data: CreateAdaptiveAssessmentForm) {
    this.assessmentService.createAdaptiveAssessment(data).subscribe(res => {
      if (res.result) {
        this.createOrUpdateResult = res.result;
        if (this.createOrUpdateResult.isSuccess) {
          this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
          if (!this.isEdit)
            this.toastrService.success(Constants.adaptiveAssessmentCreatedSuccessfully);
          else
            this.toastrService.success(Constants.adaptiveAssessmentUpdatedSuccessfully);
          this.viewAssessment(this.createOrUpdateResult.id);
        }
        else {
          this.toastrService.error(this.createOrUpdateResult.errorMessage);
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  viewAssessment(id: number): void {
    if (this.isEdit) {
      if (this.navigatedFrom === Constants.viewAssessment)
        this.router.navigate(['../../../view-assessment', btoa(id.toString())], { relativeTo: this.activateRoute });
      else if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
    }
    else {
      if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
      else
        this.router.navigate(['../view-assessment', btoa(id.toString())], { relativeTo: this.activateRoute });
    }
  }

  isFormValid(formControlName: string, assessmentForm: any): boolean {
    return !((assessmentForm.get(formControlName).errors?.required || assessmentForm.get(formControlName).errors?.whitespace) && (assessmentForm.get(formControlName).touched ||
      (assessmentForm === this.addAdaptiveAssessmentForm ? this.isFormSubmitTriggered : this.isSaveFormSubmitTriggered)));
  }

  isCountInvalid(formControlName: string, level: any) {
    return (level.get(formControlName).touched || this.isSaveFormSubmitTriggered) && level.get(formControlName).invalid;
  }

  generateLevel() {
    let formSkill = this.saveAdaptiveAssessmentForm.controls.formSkillLists as FormArray;
    formSkill.push(this.getSkillForm());
  }

  updateSkillForm() {
    this.isMultiSkillType = this.assessmentData.skillType === AdaptiveAssessmentType.SingleSkill ? false : true;
    this.selectedQuestionBankScope = this.assessmentData.questionBankScope;
    if (!this.isSuperAdmin)
      this.questionBank = this.setQuestionBankScopeDetailOnEdit(this.assessmentData.questionBankScope);
    this.assessmentData?.categories?.forEach(x => {
      this.selectedCategoryIds = this.selectedCategoryIds ? `${this.selectedCategoryIds},${x.id}` : `${x.id}`;
    });
    this.getSkills(this.selectedCategoryIds);
    const skillLevels = this.assessmentData.assessmentSections.map((section) => {
      let selectedSkill = [{
        id: section.sectionSkills[0].skillId,
        name: section.sectionSkills[0].skillName
      }];
      let proficiencyLevelQuestions = section.sectionSkills[0]?.proficiencyLevelQuestions;
      let totalAvailableQuestions = JSON.parse(section.totalSkillQuestionsCountDetails?.proficiencyLevelConfig);
      let result = this.formBuilder.group({
        assessmentSectionId: [section.id],
        assessmentSectionSkillId: [section.sectionSkills[0].assessmentSectionSkillId],
        skillId: [selectedSkill, Validators.required],
        isNewLevel: [false],
        beginnerProficiencyLevelId: [Constants.beginner],
        beginnerMcqCount: [proficiencyLevelQuestions[0].totalQuestions, [Validators.required, Validators.min(1), Validators.max(totalAvailableQuestions.BeginnerQuestionCount)]],
        beginnerPassPercentage: [proficiencyLevelQuestions[0].passPercentage, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
        beginnerTotalQuestions: [totalAvailableQuestions.BeginnerQuestionCount],
        intermediateProficiencyLevelId: [Constants.intermediate],
        intermediateMcqCount: [proficiencyLevelQuestions[1]?.totalQuestions, [Validators.required, Validators.min(1), Validators.max(totalAvailableQuestions.IntermediateQuestionCount)]],
        intermediatePassPercentage: [proficiencyLevelQuestions[1].passPercentage, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
        intermediateTotalQuestions: [totalAvailableQuestions.IntermediateQuestionCount],
        advancedProficiencyLevelId: [Constants.advanced],
        advancedMcqCount: [proficiencyLevelQuestions[2]?.totalQuestions, [Validators.required, Validators.min(1), Validators.max(totalAvailableQuestions.AdvancedQuestionCount)]],
        advancedPassPercentage: [proficiencyLevelQuestions[2].passPercentage, [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]],
        advancedTotalQuestions: [totalAvailableQuestions.AdvancedQuestionCount],
        isDisable: [false]
      });
      return result;
    });
    this.saveAdaptiveAssessmentForm.setControl('formSkillLists', this.formBuilder.array(skillLevels));
  }

  setQuestionBankScopeDetailOnEdit(questionBankScope: number): string {
    if (questionBankScope === QuestionBankScope.TenantRestricted)
      return Constants.myQuestions;
    else if (questionBankScope === QuestionBankScope.TenantSpecific)
      return Constants.yakshaQuestions;
  }

  getCategories() {
    this.assessmentService.getCategories().subscribe(res => {
      if (res && res.result) {
        this.categories = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  mapIdToProficiency(proficiencyId: number): string {
    let proficiencyLevelName: string;
    switch (proficiencyId) {
      case 1:
        proficiencyLevelName = Constants.beginner;
        break;
      case 2:
        proficiencyLevelName = Constants.intermediate;
        break;
      case 3:
        proficiencyLevelName = Constants.advanced;
        break;
    }
    return proficiencyLevelName;
  }

  getAdaptiveAssessmentDetail() {
    this.assessmentService.getAdaptiveAssessmentDetail(this.assessmentId).subscribe(res => {
      if (res.result) {
        if (this.isDelete) {
          this.assessmentData.assessmentSections = res.result.assessmentSections;
        }
        else {
          this.assessmentData = res.result;
          this.isEdit = true;
          this.isCategoryDisabled = true;
          this.isSkillDisabled = true;
          this.addAdaptiveAssessmentForm.reset();
          this.addAdaptiveAssessmentForm.get('skillType').disable();
          this.addAdaptiveAssessmentForm.patchValue({
            name: res.result.name,
            description: res.result.description,
            instructions: res.result.instructions,
            skillType: (res.result.skillType === AdaptiveAssessmentType.SingleSkill) ? Constants.singleSkill : Constants.multiSkill,
            category: res.result.categories
          });
        }
        this.updateSkillForm();
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  getTotalCount(level) {
    return Number(level.beginnerMcqCount) + Number(level.intermediateMcqCount) + Number(level.advancedMcqCount);
  }

  deleteAdaptiveAssessmentLevel(id: number, index: number) {
    abp.message.confirm(
      this.l('AssessmentDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} ${Constants.level}?`),
      (result: boolean) => {
        if (result) {
          let formSkill = this.saveAdaptiveAssessmentForm.controls.formSkillLists as FormArray;
          formSkill.removeAt(index);
        }
      });
  }

  getSkills(categoryId: string) {
    if (categoryId) {
      let data: CategorySkillRequestDto = {
        CategoryIds: categoryId,
        QuestionBankScope: this.userRole === UserRoles[1] ? QuestionBankScope.Global : this.selectedQuestionBankScope
      };
      this.assessmentService.getSkills(data).subscribe(res => {
        if (res && res?.result?.length) {
          this.categoryBasedSkillsForSingle = res?.result;
        }
        else {
          this.toastrService.warning(Constants.noSkillsFound);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
  }

  onSkillSelect(item: SkillDetailDto, sectionIndex?: number) {
    const selectedCategoryId = this.selectedCategoryIds?.split(',').map(x => Number(x));
    this.resetQuestionCountValuesForSkills(sectionIndex);
    this.getQuestions(selectedCategoryId, item.id, this.saveAdaptiveAssessmentForm.get("formSkillLists")['controls'][sectionIndex]);
  }

  onCategorySelect(item: CategoryDto, sectionIndex?: number) {
    this.selectedCategoryIds = this.selectedCategoryIds ? `${this.selectedCategoryIds},${item.id}` : `${item.id}`;
    this.getSkills(this.selectedCategoryIds);
  }

  onCategoryDeselect(item: CategoryDto) {
    let selectedCategoryIds: string = null;
    this.selectedCategoryIds?.split(',')?.filter(obj => {
      if (obj !== item.id.toString()) {
        selectedCategoryIds = selectedCategoryIds ? `${selectedCategoryIds},${obj}` : `${obj}`;
      }
    });
    this.selectedCategoryIds = selectedCategoryIds;
    this.getSkills(this.selectedCategoryIds);
  }

  clearSkillData(item: SkillDetailDto, sectionIndex?: number): void {
    this.saveAdaptiveAssessmentForm.get("formSkillLists")['controls'][sectionIndex].get('skillId').reset();
    this.resetQuestionCountValuesForSkills(sectionIndex);
  }

  resetQuestionCountValuesForSkills(sectionIndex) {
    const level = this.saveAdaptiveAssessmentForm.get("formSkillLists")['controls'][sectionIndex];
    level.get('beginnerMcqCount').reset();
    level.get('intermediateMcqCount').reset();
    level.get('advancedMcqCount').reset();
    level.get('beginnerPassPercentage').reset();
    level.get('intermediatePassPercentage').reset();
    level.get('advancedPassPercentage').reset();
    level.patchValue({
      beginnerTotalQuestions: 0,
      intermediateTotalQuestions: 0,
      advancedTotalQuestions: 0
    });
  }

  getQuestions(categoryId: number[], skillId: number, currentLevel?: any) {
    let data: AdaptiveAssessmentQuestionsDetailRequestDto = {
      categoryIds: categoryId,
      skillId: skillId,
      parentQuestionTypeId: 1,// only mcq question type id 
      questionBankScope: this.userRole === UserRoles[1] ? QuestionBankScope.Global : this.selectedQuestionBankScope,
    };
    this.assessmentService.getAdaptiveAssessmentQuestionsDetail(data).subscribe
      (res => {
        if (res && res.result) {
          this.questionResult = res.result;
          let proficiencyConfig = JSON.parse(this.questionResult);
          currentLevel.patchValue({
            beginnerTotalQuestions: proficiencyConfig.BeginnerQuestionCount,
            intermediateTotalQuestions: proficiencyConfig.IntermediateQuestionCount,
            advancedTotalQuestions: proficiencyConfig.AdvancedQuestionCount
          });
          currentLevel.get("beginnerMcqCount").setValidators([Validators.required, Validators.min(1), Validators.max(proficiencyConfig.BeginnerQuestionCount)]);
          currentLevel.get("intermediateMcqCount").setValidators([Validators.required, Validators.min(1), Validators.max(proficiencyConfig.IntermediateQuestionCount)]);
          currentLevel.get("advancedMcqCount").setValidators([Validators.required, Validators.min(1), Validators.max(proficiencyConfig.AdvancedQuestionCount)]);
        }
        else {
          this.toastrService.error(Constants.somethingWentWrong);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
  }

  onQBChange(questionBank: string) {
    abp.message.confirm(
      this.l('QuestionBankChangeWarning', `${Constants.doYouWantToChangeQB}? ${Constants.changesYouMadeMayNotBeSaved}?`),
      (result: boolean) => {
        if (result) {
          this.selectedQuestionBankScope = questionBank === Constants.myQuestions ? QuestionBankScope.TenantRestricted : QuestionBankScope.TenantSpecific;
          this.questionBank = questionBank === Constants.yakshaQuestions ? Constants.yakshaQuestions : Constants.myQuestions;
          this.resetSaveAdaptiveAssessmentForm();
          this.getSkills(this.selectedCategoryIds);
        } else {
          this.questionBank = questionBank === Constants.yakshaQuestions ? Constants.myQuestions : Constants.yakshaQuestions;
        }
      });
  }

  resetSaveAdaptiveAssessmentForm() {
    this.saveAdaptiveAssessmentForm.reset();
    this.initSaveAdaptiveAssessmentForm();
  }

  disableSave() {
    return this.saveAdaptiveAssessmentForm.get("formSkillLists").invalid;
  }

  isUnsaved(): boolean {
    if (!(this.isSaveFormSubmitTriggered) && JSON.stringify(this.saveAdaptiveAssessmentForm.value) !== JSON.stringify(this.onLoadValue)) {
      return true;
    }
    return false;
  }

  onAllCategorySelect() {
    this.selectedCategoryIds = '';
    this.categories?.forEach(obj => this.selectedCategoryIds = this.selectedCategoryIds ? `${this.selectedCategoryIds},${obj.id}` : `${obj.id}`);
    this.getSkills(this.selectedCategoryIds);
  }

  onAllCategoryDeSelect() {
    this.selectedCategoryIds = '';
    this.categoryBasedSkillsForSingle = [];
  }

}
