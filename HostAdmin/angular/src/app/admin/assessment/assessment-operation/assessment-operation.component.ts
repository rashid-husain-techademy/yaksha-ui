import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Constants } from '../../../models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentService } from '../assessment.service';
import {
    AutomatedConfig, CreateMultiSectionSkill, Skill, ConfigJson, SkillMetadata, SkillDto, AssessmentSkillQuestionDto, CompilerLanguages, QuestionRequestDto, ProficiencyDto,
    QuestionTypeDto, SkillDetailDto, AssessmentData, QuestionResultDto, QuestionsDto, CategorySkillRequestDto, SubSkillRequestDto, SubSubSkillRequestDto, AssessmentSkillDto, ProficiencyLevelConfig, AssessmentDetail, SectionSkills, AssessmentSections, SubSkillForAssessmentRequestDto, SubSubSkillForAssessmentRequestDto, QuestionCountRequestDto, QuestionCountProficiencyResponseDto
} from '../assessment';
import { QuestionBankScope, QuestionType } from '@app/enums/assessment';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ViewQuestionComponent } from '../view-question/view-question.component';
import { ApiClientService } from '@app/service';
import { Helper } from '@app/shared/helper';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ExtendedMultiSelectDropdownSettings  } from '@app/interface/multi-select-dropdown';
import { Skills } from '@app/admin/question/question-details';
import { Permissions } from '@shared/roles-permission/permissions';
import { UtilsService } from 'abp-ng2-module';
import { ReviewCommentsDto } from '@app/assessment-review/assessment-review';
import { AnalyticsEmbedComponent } from '@app/admin/analytics/analytics-embed/analytics-embed.component';


@Component({
    selector: 'app-assessment-operation',
    templateUrl: './assessment-operation.component.html',
    styleUrls: ['./assessment-operation.component.scss']
})

export class AssessmentOperationComponent implements OnInit {
    @Input() public assessmentData: AssessmentData;
    questionBank: string;
    userRole: string;
    userRoles = UserRoles;
    isSuperAdmin: boolean = false;
    constants = Constants;
    searchSkipCount: number = 0;
    searchMaxResultCount: number = 100;
    searchResultPageIndex: number = 1;
    searchResultPageSize: number = 100;
    selectedQuestionPageIndex: number = 1;
    selectedQuestionPageSize: number = 100;
    maxSize: number = 5;
    isShowModal: boolean = false;
    action: string = "";
    categoryIds: number[] = [];
    assessmentSectionSkillId: number = 0;
    assessmentSectionSkill: SectionSkills[];
    questionBankScope = QuestionBankScope;
    selectedQuestionBankScope: number;
    skills: SkillDetailDto[] = [];
    subSkills: SkillDetailDto[] = [];
    subSubSkills: SkillDetailDto[] = [];
    proficiencyLevels: ProficiencyDto[] = [];
    questionTypes: QuestionTypeDto[] = [];
    assessmentSkills: AssessmentSkillDto[] = [];
    codingLanguages: CompilerLanguages[] = [];
    selectedCodingLanguages: CompilerLanguages[] = [];
    createSectionSkill = {} as CreateMultiSectionSkill;
    skillList: Skill[]=[];
    skillListManualQuestions: Skill[]=[];
    questionType = QuestionType;
    questionResult = {} as QuestionResultDto;
    viewSelectedQuestions: boolean = false;
    totalCount: number = 0;
    selectManually: boolean = false;
    selectedQuestions: QuestionsDto[] = [];
    removedQuestionIds: number[] = [];
    skillMetadata: SkillMetadata[] = [];
    automatedConfigs: AutomatedConfig[] = [];
    automatedConfigMap: Map<number, [AutomatedConfig, SkillMetadata]> = new Map();
    manuallySelectedQuestions: QuestionsDto[] = [];
    existingSkillQuestions: QuestionsDto[] = [];
    paginatedSelectedQuestions: QuestionsDto[] = [];
    assessmentDetails: AssessmentDetail;
    assessmentAddedSectionDetails: AssessmentSections[];
    isSectionExist: boolean = false;
    isAutomated: boolean = false;
    isViewSelected: boolean = false;
    viewButtonName: string = Constants.viewSelected;
    selectedSkillId: number = 0;
    previousSelectedSkillId: SkillDto;
    previousSelectedSubSkillId: SkillDto;
    previousSelectedSubSubSkillId: SkillDto;
    selectedSubSkillId: number = 0;
    selectedSubSubSkillId: number = 0;
    existingSkillId: number;
    createSectionSkillForm: FormGroup;
    isSubmitted: boolean = false;
    sectionSkillQuestions: AssessmentSkillQuestionDto;
    sectionSkillDetails: AssessmentSkillQuestionDto[] = [];
    isChanged: boolean = false;
    helper = Helper;
    selectAllQuestion: boolean = false;
    removeAllQuestion: boolean = false;
    enableSearch: boolean = false;
    headerTitle: string = "";
    isEdit: boolean = false;
    isFormSubmitTriggered: boolean = false;
    total: number = 0;
    dropdownSettings: IDropdownSettings = {};
    isSearchFilterChanged: boolean = false;
    singleDropdownSettings: ExtendedMultiSelectDropdownSettings  = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        closeDropDownOnSelection: true,
        itemsShowLimit: 1,
        selectAllText: '',
        unSelectAllText: '',
        enableCheckAll:false
    };
    selectedSubSkill: Skills;
    isSkillDisabled: boolean = false;
    isSubSkillDisabled: boolean = true;
    isSubSubSkillDisabled: boolean = true;
    permissions: any

    sectionSkillFormValidationMessages = {
        sectionName: {
            required: Constants.enterSectionName
        },
        skillId: {
            required: Constants.selectSkill
        },
        questionTypeId: {
            required: Constants.selectQuestionType
        },
        programmingLanguageId: {
            required: Constants.selectProgrammingLanguage
        }
    }
    isStack: boolean;
    isAdminQuestionReviewer: boolean = false;
    adminReplacedQuestionCount: number = 0;
    isSaveDisabled: boolean = false;
    reviewCommentId: number;
    replacedQuestion: QuestionsDto[] = [];
    isRemoveDisabled: boolean = false;
    isReplaceQuestion: boolean = false;
    isSkillChange: boolean = false;
    skill: Skill;
    onRemoveExistingSkillQuestion: boolean = false;
    isNewSkillChange: boolean;
    removedQuestion: QuestionsDto;
    subjectiveQuestionsCount: number = 0;
    activeScheduleWithShowAnswer: boolean = false;
    skillIds: string;
    subSkillIds: string;
    subSubSkillIds:string;
    skillDetails: number;
    skillIdArray: number[];
    subskillIdArray: number[];
    subskill2IdArray: number[];
    restrictSubSkill:boolean=false;
    restrictSubSubSkill:boolean=false;
    enableQuestionType:boolean=false;
    questionResponse:boolean=false;
    questionCountResponse = {} as QuestionCountProficiencyResponseDto;
    countMap = new Map<number, { beginnerCount: number, intermediateCount: number, advancedCount: number, skillName: string, subSkillName: string, subSkill2Name: string, skillId: number, subSkillId: number, subSkill2Id:number}>();

    @HostListener('window:keydown', ['$event'])
    function(e: KeyboardEvent) {
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
        }
    };

    constructor(
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private assessmentService: AssessmentService,
        private apiClientService: ApiClientService,
        private toastrService: ToastrService,
        private dataService: dataService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        this.isReplaceQuestion = this.utilsService.getCookieValue(this.constants.isReplaceQuestion) === 'true' ? true : false;
        this.isSkillChange = this.utilsService.getCookieValue(this.constants.isSkillChange) === 'true' ? true : false;
        this.reviewCommentId = parseInt(this.utilsService.getCookieValue(this.constants.reviewCommentId));
        this.dataService.userRole.subscribe(val => {
            this.userRole = val;
        });
        this.dataService.userPermissions.subscribe(data => {
            this.permissions = data;
        });
        this.questionBank = this.assessmentData.questionBank ?? Constants.yakshaQuestions;
        if (this.userRole === UserRoles[1]) {
            this.isSuperAdmin = true;
            this.headerTitle = Constants.addQuestions;
        }
        else if (this.permissions[Permissions.questionsManageAll]) {
            this.isSuperAdmin = false;
            this.headerTitle = Constants.addQuestionFrom;
        }
        if (this.assessmentData) {
            this.getAssessmentAddedSectionDetails(this.assessmentData.assessmentId);
            this.action = this.assessmentData.action;
            this.createSectionSkill.assessmentId = this.assessmentData.assessmentId;
            this.categoryIds = this.assessmentData.categoryIds;
            if (this.action === Constants.addSkill) {
                this.createSectionSkill.assessmentSectionId = this.assessmentData.assessmentSectionId;
            }
            else if (this.action === Constants.editSkill) {
                this.createSectionSkill.assessmentSectionId = this.assessmentData.assessmentSectionId;
                this.createSectionSkill.assessmentSectionSkillId = this.assessmentData.assessmentSectionSkillId;
            }
            if (this.assessmentData?.callFrom === Constants.adminQuestionReviewer) {
                this.isAdminQuestionReviewer = true;
            }
        }
        this.isShowModal = true;
        this.initCreateSectionSkillForm();
        this.getQuestionTypes();
        if (this.action !== Constants.editSkill) {
            this.getSkills();
            this.getAssessmentSkills();
        }
        if (this.isReplaceQuestion) {
            this.isSaveDisabled = true;
            this.isRemoveDisabled = true;
            if (this.isSkillChange) {
                this.getAssessmentSectionSkills();
            }
            this.setQuestionBankScope(Constants.myQuestions);
        }

        this.getProficiencyLevels();
        this.dropdownSettings = {
            idField: 'id',
            textField: Constants.language.toLowerCase(),
            itemsShowLimit: 1,
            allowSearchFilter: true,
            enableCheckAll: this.action !== this.constants.editSkill
        };
        this.createSectionSkillForm.get("courseName").valueChanges.subscribe(courseName => {
            if (courseName) {
                this.createSectionSkillForm.get('moduleName').setValidators([Validators.required]);
                this.createSectionSkillForm.get('moduleName').enable();
            }
            else {
                this.createSectionSkillForm.get('moduleName').clearValidators();
                this.createSectionSkillForm.get('moduleName').setValue('');
                this.createSectionSkillForm.get('moduleName').disable();
            }
        });

    }
    setQuestionBankScope(questionBank: string) {
        if (this.skillMetadata.length || this.createSectionSkillForm.dirty || this.createSectionSkillForm.get('skillId').disabled) {
            this.showCancelWarning(questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheQuestionBank);
        }
        else {
            this.selectedQuestionBankScope = questionBank === Constants.myQuestions ? QuestionBankScope.TenantRestricted : QuestionBankScope.TenantSpecific;
            this.getSkills();
        }
    }

    getAssessmentAddedSectionDetails(assessmentId: number) {
        this.assessmentService.getAssessmentDetail(assessmentId).subscribe(res => {
            if (res.result) {
                this.assessmentAddedSectionDetails = res.result.assessmentSections;
                this.activeScheduleWithShowAnswer = res.result.activeScheduleWithShowAnswer;
            }
        });
    }

    checkSectionExist(event) {
        this.isSectionExist = false;
        if (this.assessmentAddedSectionDetails.some(section => section.sectionName.trim().toLowerCase() == event.target.value.trim().toLowerCase())) {
            this.isSectionExist = true;
            this.createSectionSkillForm.get('sectionName').setErrors({ 'invalid': true });
        }
        else {
            if (!this.isFormValid('sectionName') == false) {
                this.createSectionSkillForm.get('sectionName').setErrors(null);
            }
        }
    }

    isFormValid(formControlName: string): boolean {
        return !(this.createSectionSkillForm.get(formControlName).errors?.required && (this.createSectionSkillForm.get(formControlName).touched || this.isFormSubmitTriggered));
    }

    showCancelWarning(questionBank: string, warningMessage: string, isSkillReload: boolean = false, isSkillChange: boolean = false) {
        abp.message.confirm(
            this.l('QuestionBankChangeWarning', warningMessage),
            (result: boolean) => {
                if (result) {
                    this.assessmentData.questionBank = questionBank;
                    this.assessmentData.skillId = this.createSectionSkillForm.get('skillId')?.value[0]?.id;
                    this.assessmentData.skillName = this.createSectionSkillForm.get('skillId')?.value[0]?.name;
                    this.assessmentData.subSkillId = this.createSectionSkillForm.get('subSkillId')?.value[0]?.id;
                    this.assessmentData.subSubSkillId = this.createSectionSkillForm.get('subSubSkillId')?.value[0]?.id;
                    if (isSkillChange) {
                        this.assessmentData.sectionName = this.createSectionSkillForm.get('sectionName')?.value;
                        this.assessmentData.isSkillChange = isSkillChange;
                    }
                    let data = {
                        action: Constants.reload,
                        assessmentData: this.assessmentData
                    };
                    this.modalService.dismissAll(data);
                }
                else if (isSkillReload) {
                    this.createSectionSkillForm.get('skillId').setValue([this.previousSelectedSkillId]);
                    this.createSectionSkillForm.get('subSkillId').setValue([this.previousSelectedSubSkillId]);
                    this.createSectionSkillForm.get('subSubSkillId').setValue([this.previousSelectedSubSubSkillId]);
                }
                else
                    this.questionBank = questionBank === Constants.yakshaQuestions ? Constants.myQuestions : Constants.yakshaQuestions;
            });
    }

    showSubSkillCancelWarning(questionBank: string, warningMessage: string, isSkillReload: boolean = false) {
        abp.message.confirm(
            this.l('QuestionBankChangeWarning', warningMessage),
            (result: boolean) => {
                if (result) {
                    this.createSectionSkillForm.get('subSubSkillId').patchValue('');
                    this.createSectionSkillForm.get('questionTypeId').patchValue('');
                    this.createSectionSkillForm.get('programmingLanguageId').patchValue('');
                    this.createSectionSkillForm.get('searchString').patchValue('');
                    this.createSectionSkillForm.get('searchBySKU').patchValue('');
                    this.createSectionSkillForm.get('courseName').patchValue('');
                    this.createSectionSkillForm.get('moduleName').patchValue('');
                    this.createSectionSkillForm.get('proficiencyLevelId').patchValue('');
                    this.createSectionSkillForm.get('proficiencyLevelId').disable();
                    this.resetSearchResult();
                    this.getSelectedSubSubSkills();
                }
                else if (isSkillReload) {
                    this.createSectionSkillForm.get('subSkillId').setValue([this.previousSelectedSubSkillId]);
                    this.createSectionSkillForm.get('subSubSkillId').setValue([this.previousSelectedSubSubSkillId]);
                }
                else
                    this.questionBank = questionBank === Constants.yakshaQuestions ? Constants.myQuestions : Constants.yakshaQuestions;
            });
    }

    l(key: string, ...args: any[]): string {
        return abp.utils.formatString.apply(this, args);
    }

    initCreateSectionSkillForm(): void {
        this.createSectionSkillForm = this.formBuilder.group({
            sectionName: [''],
            executionCount: [''],
            skillId: ['', [Validators.required]],
            subSkillId: [''],
            subSubSkillId: [''],
            questionTypeId: ['', [Validators.required]],
            programmingLanguageId: ['', [Validators.required]],
            proficiencyLevelId: [{ value: '', disabled: true }],
            searchString: [''],
            searchBySKU: [''],
            courseName: [''],
            moduleName: [{ value: '', disabled: true }],
            searchResult: this.formBuilder.group({
                beginnerCount: [''],
                intermediateCount: [''],
                advancedCount: ['']
            }),
            count: this.formBuilder.array([
                this.formBuilder.group({
                    beginnerCount: [''],
                    intermediateCount: [''],
                    advancedCount: ['']
                },[Validators.required])
            ])
        });
        if (this.action === this.constants.addSection) {
            this.createSectionSkillForm.get('sectionName').setValidators([Validators.required]);
            this.createSectionSkillForm.patchValue({
                skillId: this.assessmentData.skillId
            });
        }
        if (this.action === this.constants.editSkill) {
            if (this.isReplaceQuestion) {
                this.selectedQuestionBankScope = this.questionBank === Constants.myQuestions ? QuestionBankScope.TenantRestricted : QuestionBankScope.TenantSpecific;
            }
            this.getSectionSkillQuestions();
        }
        else {
            if (!this.isSuperAdmin) {
                this.selectedQuestionBankScope = this.questionBank === Constants.myQuestions ? QuestionBankScope.TenantRestricted : QuestionBankScope.TenantSpecific;
            }
            else {
                this.selectedQuestionBankScope = QuestionBankScope.Global;
            }
            this.createSectionSkillForm.get('questionTypeId').disable();
        }
        if (!this.isReplaceQuestion) {
            this.createSectionSkillForm.get('subSkillId').disable();
            this.createSectionSkillForm.get('subSubSkillId').disable();
        }
    }
   
    addCountControl(): void {
        this.count.push(this.formBuilder.group({
            beginnerCount: [''],
            intermediateCount: [''],
            advancedCount: ['']
        }));
    }
    closeBtnClick() {
        this.isShowModal = false;
        this.utilsService.deleteCookie(this.constants.isReplaceQuestion, abp.appPath);
        this.utilsService.deleteCookie(this.constants.reviewCommentId, abp.appPath);
        this.utilsService.deleteCookie(this.constants.isSkillChange, abp.appPath);
        this.modalService.dismissAll(this.isChanged);
    }

    changeSearchResultPage() {
        this.selectedQuestions = [];
        this.searchSkipCount = (this.searchResultPageIndex - 1) * this.searchResultPageSize;
        this.searchMaxResultCount = this.searchResultPageSize;
        this.getQuestions();
    }

    changeSelectedQuestionPage() {
        let beginIndex = (this.selectedQuestionPageIndex - 1) * this.selectedQuestionPageSize;
        let endIndex = beginIndex + this.selectedQuestionPageSize;
        this.paginatedSelectedQuestions = this.manuallySelectedQuestions.slice(beginIndex, endIndex);
        this.paginatedSelectedQuestions.map(x => x.isChecked = false);
        this.removeAllQuestion = false;
    }

    getSectionSkillQuestions() {
        this.assessmentService.getSectionSkillQuestions(this.createSectionSkill.assessmentSectionSkillId).subscribe(res => {
            if (res && res.result) {
                this.sectionSkillQuestions = res.result;
                if (!this.isReplaceQuestion) {
                    this.isEdit = true;
                    this.pacthSkill();
                }
                if (this.isReplaceQuestion && this.isSkillChange) {
                    this.existingSkillId = this.sectionSkillQuestions.skillId;
                }
                this.questionBank = res.result.questionBankScope === QuestionBankScope.TenantSpecific ? Constants.yakshaQuestions : Constants.myQuestions;
                this.selectedQuestionBankScope = res.result.questionBankScope;
                this.createSectionSkill.totalQuestions = res.result.totalQuestions;
                res.result.skillMetadata.forEach(metadata => {
                    let configJson = JSON.parse(metadata.configJson) as ConfigJson;
                    metadata.codingLanguageId = configJson.codingLanguageId;
                    this.skillMetadata.push(metadata);
                    if (metadata.isAutomated) {
                        let automatedConfig: AutomatedConfig = {
                            parentQuestionTypeId: metadata.parentQuestionTypeId,
                            codingLanguageId: metadata.codingLanguageId,
                            typeName: metadata.parentQuestionTypeId === this.constants.mcqTypeId ? this.constants.mcqType :
                                metadata.parentQuestionTypeId === this.constants.codingTypeId ? this.constants.codingType :
                                    this.constants.stackType,
                            beginnerCount: metadata.proficiencyLevelQuestions.find(x => x.proficiencyLevelId === this.constants.beginnerId).totalQuestions,
                            intermediateCount: metadata.proficiencyLevelQuestions.find(x => x.proficiencyLevelId === this.constants.intermediateId).totalQuestions,
                            advancedCount: metadata.proficiencyLevelQuestions.find(x => x.proficiencyLevelId === this.constants.advancedId).totalQuestions,
                        };
                        this.automatedConfigs.push(automatedConfig);
                    }
                });
                this.manuallySelectedQuestions = res.result.questions;
                this.initSelectedQuestionPage();
                this.isViewSelected = true;
                this.viewButtonName = Constants.viewSearchResults;
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    pacthSkill() {
        this.skills.push({
            id: this.sectionSkillQuestions.skillId,
            name: this.sectionSkillQuestions.skillName
        });
        this.createSectionSkillForm.patchValue({
            skillId: [{
                id: this.sectionSkillQuestions.skillId,
                name: this.sectionSkillQuestions.skillName
            }],
        });
        if (!this.isReplaceQuestion) {
            this.createSectionSkillForm.get('skillId').disable();
        }
        this.selectedSkillId = this.sectionSkillQuestions.skillId;
        if (this.sectionSkillQuestions.subSkillId) {
            this.subSkills.push({
                id: this.sectionSkillQuestions.subSkillId,
                name: this.sectionSkillQuestions.subSkillName
            });
            this.createSectionSkillForm.patchValue({
                subSkillId: [{
                    id: this.sectionSkillQuestions.subSkillId,
                    name: this.sectionSkillQuestions.subSkillName
                }],
            });
            this.selectedSubSkillId = this.sectionSkillQuestions.subSkillId;
        }
        if (this.sectionSkillQuestions.subSubSkillId) {
            this.subSubSkills.push({
                id: this.sectionSkillQuestions.subSubSkillId,
                name: this.sectionSkillQuestions.subSubSkillName
            });
            this.createSectionSkillForm.patchValue({
                subSubSkillId: [{
                    id: this.sectionSkillQuestions.subSubSkillId,
                    name: this.sectionSkillQuestions.subSubSkillName
                }],
            });
            this.selectedSubSubSkillId = this.sectionSkillQuestions.subSubSkillId;
        }
        if (!this.isReplaceQuestion) {
            this.isSkillDisabled = true;
        }
    }

    getAssessmentSectionSkills() {
        this.assessmentService.getAssessmentDetail(this.createSectionSkill.assessmentId).subscribe(res => {
            if (res.result) {
                this.assessmentDetails = res.result;
                this.assessmentSectionSkill = this.assessmentDetails.assessmentSections.map(x => x.sectionSkills)[0];
                this.assessmentDetails.assessmentSections.filter(x => x.id === this.createSectionSkill.assessmentSectionId).forEach(sectionsSkill => {
                    sectionsSkill.sectionSkills.forEach(sectionSkillIds => {
                        this.assessmentService.getSectionSkillQuestions(sectionSkillIds.assessmentSectionSkillId).subscribe(res => {
                            this.sectionSkillDetails.push(res.result);
                        });
                    });
                });
            }
        });
    }
    getQuestionTypes() {
        this.assessmentService.getQuestionTypes().subscribe(res => {
            if (res && res.result) {
                this.questionTypes = res.result;
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    getProficiencyLevels() {
        this.assessmentService.getProficiencyLevels().subscribe(res => {
            if (res && res.result) {
                this.proficiencyLevels = res.result;
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    getAssessmentSkills() {
        this.assessmentService.getAssessmentSkills(this.createSectionSkill.assessmentId).subscribe(res => {
            if (res && res.result.length) {
                this.assessmentSkills = res.result;
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    getSkills() {
        let data: CategorySkillRequestDto = {
            CategoryIds: this.categoryIds.join(','),
            QuestionBankScope: this.selectedQuestionBankScope
        };
        this.assessmentService.getSkills(data).subscribe(res => {
            if (res && res.result.length) {
                this.skills = res.result;
                if (this.assessmentData.skillId) {
                    this.createSectionSkillForm.get('skillId').setValue(this.assessmentData.skillId);
                    this.getSubSkills();
                }
                else
                    this.createSectionSkillForm.get('skillId').setValue('');
            }
            else {
                this.skills = [];
                this.toastrService.warning(Constants.noSkillsFound);
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    getSubSkills() {
        this.isSubSkillDisabled = false;
        if (this.selectedSkillId && !this.createSectionSkillForm.get('skillId').disabled && !this.isReplaceQuestion) {
            let isSkillReload = true;
            let isSkillChange = true;
            this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, isSkillReload, isSkillChange);
        }
        else if (+this.createSectionSkillForm.get('skillId')?.value[0]?.id || this.assessmentData.isSkillChange) {
            if (this.assessmentData.isSkillChange) {
                this.selectedSkillId = +this.assessmentData.skillId;
            }
            else {
                this.selectedSkillId = +this.createSectionSkillForm.get('skillId')?.value[0]?.id;
            }
            let questionTypeControl = this.createSectionSkillForm.get('questionTypeId');
            questionTypeControl.enable();
            questionTypeControl.setValidators([Validators.required]);
            this.createSectionSkillForm.get('subSkillId').enable();
            this.createSectionSkillForm.get('subSubSkillId').disable();
            this.subSkills = [];
            this.previousSelectedSkillId = {
                id: this.createSectionSkillForm.get('skillId')?.value[0]?.id,
                name: this.createSectionSkillForm.get('skillId')?.value[0]?.name
            };
            if (this.assessmentData.isSkillChange) {
                this.previousSelectedSkillId = {
                    id: this.assessmentData.skillId,
                    name: this.assessmentData.skillName
                };
                this.createSectionSkillForm.get('skillId').setValue([this.previousSelectedSkillId]);
                this.createSectionSkillForm.get('sectionName').setValue(this.assessmentData.sectionName);
                this.assessmentService.getAssessmentDetail(this.assessmentData.assessmentId).subscribe(res => {
                    if (res.result) {
                        if (res.result.assessmentSections.some(section => section.sectionName.trim().toLowerCase() == this.assessmentData.sectionName.trim().toLowerCase())) {
                            this.isSectionExist = true;
                            this.createSectionSkillForm.get('sectionName').setErrors({ 'invalid': true });
                        }
                    }
                });
            }
            let data: SubSkillRequestDto = {
                skillId: this.selectedSkillId,
                questionBankScope: this.selectedQuestionBankScope
            };
            this.assessmentService.getSubSkills(data).subscribe(res => {
                if (res && res.result) {
                    this.subSkills = res.result;
                    if (this.assessmentData.subSkillId) {
                        this.createSectionSkillForm.get('subSkillId').setValue(this.assessmentData.subSkillId);
                        this.getSubSubSkills();
                    }
                    else
                        this.createSectionSkillForm.get('subSkillId').setValue('');
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });
        }
    }

    getSubSubSkills() {
        this.isSubSubSkillDisabled = false;
        if (this.selectedSubSkillId && !this.createSectionSkillForm.get('subSkillId').disabled && !this.isReplaceQuestion) {
            let isSkillReload = true;
            this.showSubSkillCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSubSkill, isSkillReload);
        }
        else if (+this.createSectionSkillForm.get('subSkillId')?.value[0]?.id) {
            this.previousSelectedSubSkillId = {
                id: this.createSectionSkillForm.get('subSkillId')?.value[0]?.id,
                name: this.createSectionSkillForm.get('subSkillId')?.value[0]?.name
            };
            this.getSelectedSubSubSkills();
        }
    }

    getSelectedSubSubSkills() {
        this.selectedSubSkillId = +this.createSectionSkillForm.get('subSkillId')?.value[0]?.id;
        this.subSubSkills = [];
        this.createSectionSkillForm.get('subSubSkillId').enable();
        let data: SubSubSkillRequestDto = {
            skillId: this.selectedSkillId,
            questionBankScope: this.selectedQuestionBankScope,
            subSkillId: this.createSectionSkillForm.get('subSkillId')?.value[0]?.id
        };
        if (this.selectedSubSkillId === -1) {
            this.isSubSubSkillDisabled = true;
        } else {
            this.assessmentService.getSubSubSkills(data).subscribe(res => {
                if (res && res.result) {
                    this.subSubSkills = res.result;
                    if (this.assessmentData.subSubSkillId)
                        this.createSectionSkillForm.get('subSubSkillId').setValue(this.assessmentData.subSubSkillId);
                    else
                        this.createSectionSkillForm.get('subSubSkillId').setValue('');
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });
        }
    }


    onSubSubSkillSelected() {
        if (this.selectedSubSubSkillId && !this.createSectionSkillForm.get('subSubSkillId').disabled) {
            let isSkillReload = true;
            this.showSubSubSkillCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSubSubSkill, isSkillReload);
        }
        else if (+this.createSectionSkillForm.get('subSubSkillId')?.value[0]?.id) {
            this.previousSelectedSubSubSkillId = {
                id: this.createSectionSkillForm.get('subSubSkillId')?.value[0]?.id,
                name: this.createSectionSkillForm.get('subSubSkillId')?.value[0]?.name
            };
            this.selectedSubSubSkillId = +this.createSectionSkillForm.get('subSubSkillId')?.value[0]?.id;
        }
    }

    onSubSubSkillDeSelect(event) {
        this.previousSelectedSubSubSkillId = event;
        this.selectedSubSubSkillId = event.id;
        this.showSubSubSkillCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSubSubSkill, true);
        this.selectedSubSubSkillId = 0;
    }

    showSubSubSkillCancelWarning(questionBank: string, warningMessage: string, isSkillReload: boolean = false) {
        abp.message.confirm(
            this.l('QuestionBankChangeWarning', warningMessage),
            (result: boolean) => {
                if (result) {
                    this.createSectionSkillForm.get('questionTypeId').patchValue('');
                    this.createSectionSkillForm.get('programmingLanguageId').patchValue('');
                    this.createSectionSkillForm.get('searchString').patchValue('');
                    this.createSectionSkillForm.get('searchBySKU').patchValue('');
                    this.createSectionSkillForm.get('courseName').patchValue('');
                    this.createSectionSkillForm.get('moduleName').patchValue('');
                    this.createSectionSkillForm.get('proficiencyLevelId').patchValue('');
                    this.createSectionSkillForm.get('proficiencyLevelId').disable();
                    this.resetSearchResult();
                }
                else if (isSkillReload) {
                    this.createSectionSkillForm.get('subSubSkillId').setValue([this.previousSelectedSubSubSkillId]);
                }
                else
                    this.questionBank = questionBank === Constants.yakshaQuestions ? Constants.myQuestions : Constants.yakshaQuestions;
            });
    }

    getCodingLanguages(selectedQuestionTypeId: number) {
        this.assessmentService.getCodingLanguages().subscribe(res => {
            if (res && res.result.length) {
                let sortednames = res.result.sort(Helper.sortString<CompilerLanguages>('language'));
                this.codingLanguages = sortednames;
                this.patchProgrammingLanguages(selectedQuestionTypeId);
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    patchProgrammingLanguages(selectedQuestionTypeId: number) {
        let programmingLanguageIdControl = this.createSectionSkillForm.get('programmingLanguageId');
        programmingLanguageIdControl.setValidators([Validators.required]);
        let existingMetadata = this.skillMetadata.find(x => x.parentQuestionTypeId === selectedQuestionTypeId);
        if (existingMetadata) {
            this.enableSearch = true;
            this.selectedCodingLanguages = [];
            existingMetadata.codingLanguageId.forEach(codingLanguage => {
                let language = this.codingLanguages.find(x => x.id === codingLanguage);
                language.isDisabled = this.isEdit;
                this.selectedCodingLanguages.push(language);
            });
            programmingLanguageIdControl.patchValue(this.selectedCodingLanguages);
            this.createSectionSkillForm.get('programmingLanguageId').disable();
        }
    }

    onQuestionTypeChange() {
        let selectedQuestionTypeId = +this.createSectionSkillForm.get('questionTypeId').value;
        this.isStack = selectedQuestionTypeId === this.constants.stackTypeId ? true : false;
        if (selectedQuestionTypeId) {
            this.enableSearch = false;
            this.selectManually = false;
            this.isSubmitted = false;
            this.selectedQuestions = [];
            this.removedQuestionIds = [];
            this.createSectionSkillForm.get('searchString').patchValue('');
            this.createSectionSkillForm.get('searchBySKU').patchValue('');
            this.createSectionSkillForm.get('courseName').patchValue('');
            this.createSectionSkillForm.get('moduleName').patchValue('');
            this.createSectionSkillForm.get('proficiencyLevelId').enable();
            this.createSectionSkillForm.get("searchResult.beginnerCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.intermediateCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.advancedCount").patchValue(0);
            if (selectedQuestionTypeId === this.constants.codingTypeId) {
                if (!this.codingLanguages.length) {
                    this.getCodingLanguages(selectedQuestionTypeId);
                }
                else
                    this.patchProgrammingLanguages(selectedQuestionTypeId);
            }
            else {
                this.enableSearch = true;
                let programmingLanguageIdControl = this.createSectionSkillForm.get('programmingLanguageId');
                programmingLanguageIdControl.clearValidators();
                programmingLanguageIdControl.patchValue('');
            }
        }
        if (this.isStack) {
            this.selectManually = true;
        }
        this.resetSearchResult();
    }

    truncate(questionText: string) {
        if (questionText) {
            //return (questionText.length <= 200) ? questionText : questionText.substr(0, 200).replace(/<p>/gi, '<p style="margin-bottom:0px;">') + '...';
            return (questionText.length <= 200) ? questionText : questionText.substr(0, 200) + '...';
        }
    }

    getQuestions() {
        this.isFormSubmitTriggered = true;
        this.subjectiveQuestionsCount = 0;
        if (this.createSectionSkillForm.valid) {
            let formData = this.createSectionSkillForm.getRawValue();
            this.selectedSkillId = formData.skillId[0]?.id;
            if(this.skillIds==null){
                this.skillIds=this.selectedSkillId.toString(); 
            }
            let data: QuestionRequestDto = {
                searchText: encodeURIComponent(formData.searchString),
                searchQuestionSKUId: formData.searchBySKU,
                parentQuestionTypeId: formData.questionTypeId,
                skillIds: this.skillIds,
                subSkillIds: this.subSkillIds,
                subSkill2Ids: this.subSubSkillIds,
                proficiencyId: formData.proficiencyLevelId,
                codingLanguageId: formData.programmingLanguageId ? formData.programmingLanguageId.map(x => x.id).join(',') : '',
                categoryIds: this.assessmentData.categoryIds.join(','),
                questionBankScope: this.selectedQuestionBankScope,
                skipCount: this.searchSkipCount,
                maxResultCount: this.searchMaxResultCount,
                moduleNameSearchText: encodeURIComponent(formData.moduleName),
                courseNameSearchText: encodeURIComponent(formData.courseName)
            };
            this.assessmentService.getQuestions(data).subscribe
                (res => {
                    this.isSubmitted = true;
                    this.isSearchFilterChanged = false;
                    if (res && res.result && res.result.totalCount) {
                        this.questionResult = res.result;
                        this.questionResponse=true;
                        let selectedQuesionIds = this.manuallySelectedQuestions.map(x => x.questionId);
                        this.questionResult.questions.forEach(question => {
                            question.isChecked = false;
                            if (selectedQuesionIds.includes(question.questionId)) {
                                question.isSelected = question.isChecked = true;
                            }
                        });
                        this.selectAllQuestion = this.questionResult.questions.every(x => x.isChecked === true);
                        let proficiencyConfig = JSON.parse(res.result.proficiencyLevelCount);
                        this.questionResult.beginnerLevelCount = proficiencyConfig.BeginnerQuestionCount;
                        this.questionResult.intermediateLevelCount = proficiencyConfig.IntermediateQuestionCount;
                        this.questionResult.advancedLevelCount = proficiencyConfig.AdvancedQuestionCount;
                        let totalQuestionsCount = proficiencyConfig.BeginnerQuestionCount + proficiencyConfig.IntermediateQuestionCount + proficiencyConfig.AdvancedQuestionCount;
                        if (totalQuestionsCount != res.result.totalCount) {
                            this.subjectiveQuestionsCount = res.result.totalCount - totalQuestionsCount;
                        }
                        this.createSectionSkillForm.get("searchResult.beginnerCount").setValidators([Validators.min(0), Validators.max(proficiencyConfig.BeginnerQuestionCount)]);
                        this.createSectionSkillForm.get("searchResult.intermediateCount").setValidators([Validators.min(0), Validators.max(proficiencyConfig.IntermediateQuestionCount)]);
                        this.createSectionSkillForm.get("searchResult.advancedCount").setValidators([Validators.min(0), Validators.max(proficiencyConfig.AdvancedQuestionCount)]);

                        let existingSkillMetadata = this.skillMetadata.find(x => x.parentQuestionTypeId === +formData.questionTypeId);
                        if (existingSkillMetadata) {
                            if (existingSkillMetadata.isAutomated) {
                                let existingAutomatedConfig = this.automatedConfigs.find(x => x.parentQuestionTypeId === +formData.questionTypeId);
                                if (existingAutomatedConfig) {
                                    this.createSectionSkillForm.get("searchResult.beginnerCount").patchValue(existingAutomatedConfig.beginnerCount);
                                    this.createSectionSkillForm.get("searchResult.intermediateCount").patchValue(existingAutomatedConfig.intermediateCount);
                                    this.createSectionSkillForm.get("searchResult.advancedCount").patchValue(existingAutomatedConfig.advancedCount);
                                }
                            }
                            else {
                                this.selectManually = true;
                            }
                        }
                    }
                    else {
                        this.questionResult = res.result;
                    }
                    if (this.isViewSelected) {
                        this.isViewSelected = false;
                    }
                },
                    error => {
                        this.toastrService.error(Constants.somethingWentWrong);
                    });
            ;
            if (this.skillIdArray == null || this.skillIdArray?.length === 0) {
                const skillArray: number[] = [];
                skillArray.push(this.selectedSkillId);
                this.skillIdArray = skillArray;
            }
                        let countformData: QuestionCountRequestDto = {
                        searchText: encodeURIComponent(formData.searchString),
                        parentQuestionTypeId: formData.questionTypeId,
                        skillIds: this.skillIdArray,
                        subSkillIds: this.subskillIdArray,
                        subsubskillIds: this.subskill2IdArray,
                        proficiencyId: formData.proficiencyLevelId,
                        codingLanguageId: formData.programmingLanguageId ? formData.programmingLanguageId.map(x => x.id).join(',') : '',
                        categoryIds: this.assessmentData.categoryIds.join(','),
                        questionBankScope: this.selectedQuestionBankScope,
                        moduleNameSearchText: encodeURIComponent(formData.moduleName),
                        courseNameSearchText: encodeURIComponent(formData.courseName),
                        searchQuestionSKUId: formData.searchBySKU } 
         this.assessmentService.getQuestionCountByProficiency(countformData).subscribe(res=>{
            if(res.result){
                this.questionCountResponse=res.result;
                for (let i = 0; i < this.questionCountResponse.questionData.length; i++) {
                    this.addCountControl();
                }
            }},
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
        }
    }

    validateSkillConfig() {
        this.isFormSubmitTriggered = true;
        if (this.createSectionSkillForm.valid) {
            if (this.assessmentSkills) {
                let validSkillConfig = true;
                this.assessmentSkills.forEach(skillData => {
                    if (skillData.skillId && !skillData.subSkillId && !skillData.subSubSkillId) {
                        if (this.selectedSkillId === skillData.skillId) {
                            this.toastrService.warning(Constants.selectedSkillAlreadyExistsInAssessment);
                            validSkillConfig = false;
                        }
                    }
                    else if (skillData.skillId && skillData.subSkillId && !skillData.subSubSkillId) {
                        if (this.selectedSkillId === skillData.skillId
                            && (this.selectedSubSkillId === skillData.subSkillId || !this.selectedSubSkillId)) {
                            this.toastrService.warning(Constants.selectedSkillAlreadyExistsInAssessment);
                            validSkillConfig = false;
                        }
                    }
                    else if (skillData.skillId && skillData.subSkillId && skillData.subSubSkillId) {
                        if (this.selectedSkillId === skillData.skillId
                            && (this.selectedSubSkillId === skillData.subSkillId || !this.selectedSubSkillId)
                            && (this.selectedSubSubSkillId === skillData.subSubSkillId || !this.selectedSubSubSkillId)) {
                            this.toastrService.warning(Constants.selectedSkillAlreadyExistsInAssessment);
                            validSkillConfig = false;
                        }
                    }
                });
                if (validSkillConfig)
                    this.getQuestions();
            }
            else {
                this.getQuestions();
            }
        }
        else {
            this.toastrService.warning(Constants.correctValidationErrors);
        }
    }

    searchCheckedEvent(event, question: QuestionsDto) {
        if (this.isAdminQuestionReviewer) {
            if (this.assessmentData.questionId === question.questionId) {
                question.isChecked = event.target.checked = false;
                this.toastrService.warning(Constants.pleaseDoNotSelectTheQuestionToRemove);
                return;
            } else {
                if (!event.target.checked && this.adminReplacedQuestionCount > 0) {
                    this.adminReplacedQuestionCount = 0;
                } else if (this.adminReplacedQuestionCount === 0 && event.target.checked) {
                    this.adminReplacedQuestionCount = this.adminReplacedQuestionCount + 1;
                } else {
                    question.isChecked = event.target.checked = false;
                    this.toastrService.warning(Constants.youAreAllowedToSelectOneQuestionForReplacement);
                }
            }
        }
        if (!this.isStack) {
            question.isChecked = event.target.checked;
            if (question.isChecked) {
                this.selectedQuestions.push(question);
            }
            else {
                this.selectedQuestions = this.selectedQuestions.filter(x => x.questionId !== question.questionId);
                this.removedQuestionIds.push(question.questionId);
            }
            this.selectAllQuestion = this.questionResult.questions.every(x => x.isChecked === true);
        }
        else {
            this.questionResult.questions.map(x => x.isChecked = false);
            question.isChecked = event.target.checked;
            if (question.isChecked) {
                this.selectedQuestions = [];
                this.selectedQuestions.push(question);
            }
            else {
                this.selectedQuestions = [];
            }
            this.manuallySelectedQuestions = this.selectedQuestions;
        }
    }

    selectAllQuestions(event) {
        this.selectAllQuestion = event.target.checked;
        if (this.selectAllQuestion) {
            this.questionResult.questions.forEach(question => {
                if (!this.selectedQuestions.find(x => x.questionId === question.questionId))
                    this.selectedQuestions.push(question);
            });
            this.questionResult.questions.map(x => x.isChecked = true);
        }
        else {
            this.questionResult.questions.forEach(question => {
                this.selectedQuestions = this.selectedQuestions.filter(x => x.questionId !== question.questionId);
                if (!this.removedQuestionIds.find(x => x === question.questionId))
                    this.removedQuestionIds.push(question.questionId);
                question.isChecked = false;
            });
        }
    }

    selectedQuestionsCheckedEvent(event, question: QuestionsDto) {
        question.isChecked = event.target.checked;
        if (question.isChecked) {
            this.removedQuestion = question;
            this.removedQuestionIds.push(question.questionId);
        }
        else
            this.removedQuestionIds = this.removedQuestionIds.filter(x => x !== question.questionId);
        this.removeAllQuestion = this.paginatedSelectedQuestions.every(x => x.isChecked === true);
    }

    removeAllSelectedQuestions(event) {
        this.removeAllQuestion = event.target.checked;
        if (this.removeAllQuestion) {
            this.paginatedSelectedQuestions.forEach(question => {
                if (!this.removedQuestionIds.find(x => x === question.questionId))
                    this.removedQuestionIds.push(question.questionId);
            });
            this.paginatedSelectedQuestions.map(x => x.isChecked = true);
        }
        else {
            this.paginatedSelectedQuestions.forEach(question => {
                this.removedQuestionIds = this.removedQuestionIds.filter(x => x !== question.questionId);
                question.isChecked = false;
            });
        }
    }

    removeSelectedManualQuestions() {
        if (this.removedQuestionIds.length === this.createSectionSkill.totalQuestions) {
            this.toastrService.warning(Constants.atleastOneQuestionNeedToBeInTheAssessment);
            return;
        }
        if (!this.removedQuestionIds.length) {
            this.toastrService.warning(Constants.noQuestionsSelectedToRemove);
            return;
        }
        this.manuallySelectedQuestions = this.manuallySelectedQuestions.filter(x => !this.removedQuestionIds.includes(x.questionId));
        if (this.isSkillChange) {
            this.existingSkillQuestions = this.manuallySelectedQuestions;
        }
        if (this.questionResult.questions && this.questionResult.questions.length) {
            let removedQuestions = this.questionResult.questions.filter(x => this.removedQuestionIds.includes(x.questionId));
            removedQuestions.forEach(question => {
                question.isSelected = question.isChecked = false;
            });
        }
        let manualQuestionTypes = this.skillMetadata.filter(x => !x.isAutomated).map(x => x.parentQuestionTypeId);
        manualQuestionTypes.forEach(questionTypeId => {
            let questionsCount = this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId === questionTypeId).length;
            if (!questionsCount) {
                this.skillMetadata = this.skillMetadata.filter(x => x.parentQuestionTypeId !== questionTypeId);
            }
            else {
                let existingMetadata = this.skillMetadata.find(x => x.parentQuestionTypeId === questionTypeId);
                existingMetadata.totalQuestions = questionsCount;
            }
        });
        this.updateTotalSelectedQuestions();
        if (!this.isSkillChange) {
            this.removedQuestionIds = [];
        }
        let beginIndex = 0;
        let endIndex = this.selectedQuestionPageSize;
        this.paginatedSelectedQuestions = this.manuallySelectedQuestions.slice(beginIndex, endIndex);
        this.paginatedSelectedQuestions.map(x => x.isChecked = false);
        this.removeAllQuestion = false;
        this.isSaveDisabled = false;
    }

    addAutomaticConfig(index:number) {
        this.selectedQuestions = [];
        this.addNewObjectForMultiSkill(index);
        if (this.createSectionSkillForm.invalid) {
            this.toastrService.warning(Constants.enteredDataIsInvalid);
            return;
        }
        let formData = this.createSectionSkillForm.getRawValue();
        const questionCount=this.countMap.get(index);
        let totalQuestions = +questionCount.beginnerCount + +questionCount.intermediateCount + +questionCount.advancedCount;
        if (!totalQuestions) {
            this.toastrService.warning(Constants.enterNumberOfQuestionsToAdd);
            return;
        }
        let automatedConfig: AutomatedConfig = {
            parentQuestionTypeId: +formData.questionTypeId,
            codingLanguageId: +formData.questionTypeId === this.constants.codingTypeId ? formData.programmingLanguageId.map(x => x.id) : null,
            typeName: +formData.questionTypeId === this.constants.mcqTypeId ? this.constants.mcqType :
                +formData.questionTypeId === this.constants.codingTypeId ? this.constants.codingType :
                    this.constants.stackType,
            beginnerCount: +questionCount.beginnerCount,
            intermediateCount: +questionCount.intermediateCount,
            advancedCount: +questionCount.advancedCount
        };
        if (this.action === Constants.editSkill){
            let existingConfigIndex = this.automatedConfigs.findIndex(x => x.parentQuestionTypeId === +formData.questionTypeId);
            if (existingConfigIndex >= 0) {
                this.automatedConfigs[existingConfigIndex] = automatedConfig;
            }
            else {
                this.automatedConfigs.push(automatedConfig);
            }
        }
        let skillMetadata: SkillMetadata = {
            parentQuestionTypeId: +formData.questionTypeId,
            isAutomated: true,
            totalQuestions: automatedConfig.beginnerCount + automatedConfig.intermediateCount + automatedConfig.advancedCount,
            codingLanguageId: +formData.questionTypeId === Constants.codingTypeId ? formData.programmingLanguageId.map(x => x.id) : null,
            configJson: "",
            proficiencyLevelQuestions: []
        };
        if(this.action === Constants.addSection || this.action === Constants.addSkill){
            this.automatedConfigMap.set(index, [automatedConfig,skillMetadata]);
            this.addSkillMetadataForMultiSkill(this.automatedConfigMap,index,questionCount.skillId,questionCount.subSkillId,questionCount.subSkill2Id);
        }
        if(this.action === Constants.editSkill){
            this.addSkillMetadata(skillMetadata);
        }
        this.toastrService.info(Constants.questionsAddedPleaseClickOnViewSelectedAndSaveTheChanges);
        const mapSize = this.countMap.size;
        if(mapSize>0){
            this.isSaveDisabled=false;
        }
    }
    

    deleteAutomaticConfig(parentQuestionTypeId: number) {
        let totalQuestion = this.skillMetadata.find(x => x.parentQuestionTypeId === parentQuestionTypeId).totalQuestions;
        this.total = totalQuestion - this.manuallySelectedQuestions.length;
        if (this.total === this.createSectionSkill.totalQuestions) {
            this.toastrService.warning(Constants.atleastOneQuestionNeedToBeInTheAssessment);
            return;
        }
        this.automatedConfigs = this.automatedConfigs.filter(x => x.parentQuestionTypeId !== parentQuestionTypeId);
        this.skillMetadata = this.skillMetadata.filter(x => x.parentQuestionTypeId !== parentQuestionTypeId);
        if (+this.createSectionSkillForm.value.questionTypeId === parentQuestionTypeId) {
            this.createSectionSkillForm.get("searchResult.beginnerCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.intermediateCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.advancedCount").patchValue(0);
        }
        this.updateTotalSelectedQuestions();
        this.toastrService.info(Constants.questionsRemovedPleaseSaveChanges);
    }

    updateTotalSelectedQuestions() {
        if (this.skillMetadata.length && this.countMap.size === 0) {
            let totalQuestions = this.skillMetadata.map(x => x.totalQuestions);
            this.createSectionSkill.totalQuestions = totalQuestions.reduce((tq1, tq2) => tq1 + tq2);
        }
        else if (this.countMap.size > 0) {
            let totalBeginnerCount = 0;
            let totalIntermediateCount = 0;
            let totalAdvancedCount = 0;
            for (const [, value] of this.countMap) {
                totalBeginnerCount += value.beginnerCount;
                totalIntermediateCount += value.intermediateCount;
                totalAdvancedCount += value.advancedCount;
            }
            this.createSectionSkill.totalQuestions = totalBeginnerCount + totalIntermediateCount + totalAdvancedCount;
        }
        else {
            this.createSectionSkill.totalQuestions = 0;
        }
    }

    addManualQuestions() {
        if (!this.selectedQuestions.length) {
            this.toastrService.warning(Constants.noQuestionsSelectedToAdd);
            return;
        }
        if (this.isReplaceQuestion) {
            this.isRemoveDisabled = false;
            this.replacedQuestion = this.selectedQuestions;
        }
        let uniqueSelectedQuestions = Array.from(new Set(this.selectedQuestions.map(a => a.questionId)))
            .map(questionId => {
                return this.selectedQuestions.find(a => a.questionId === questionId);
            });
        let existingQuestionIds = this.manuallySelectedQuestions.map(x => x.questionId);
        uniqueSelectedQuestions.forEach(question => {
            if (!existingQuestionIds.includes(question.questionId)) {
                this.manuallySelectedQuestions.push(question);
                let selectedQuestion = this.questionResult.questions.find(x => x.questionId === question.questionId);
                if (selectedQuestion)
                    selectedQuestion.isSelected = true;
            }
        });
        let formData = this.createSectionSkillForm.getRawValue();
        let skillMetadata: SkillMetadata = {
            parentQuestionTypeId: +formData.questionTypeId,
            isAutomated: false,
            totalQuestions: this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId === +formData.questionTypeId).length,
            codingLanguageId: +formData.questionTypeId === Constants.codingTypeId ? formData.programmingLanguageId.map(x => x.id) : null,
            configJson: "",
            proficiencyLevelQuestions: []
        };
        this.addSkillMetadata(skillMetadata);
        this.toastrService.info(Constants.questionsAddedPleaseClickOnViewSelectedAndSaveTheChanges);
    }

    removeManualQuestions() {
        if (this.removedQuestionIds.length === this.createSectionSkill.totalQuestions) {
            this.toastrService.warning(Constants.atleastOneQuestionNeedToBeInTheAssessment);
            return;
        }
        if (!this.removedQuestionIds.length) {
            this.toastrService.warning(Constants.noQuestionsUnselectedToAdd);
            return;
        }
        this.manuallySelectedQuestions = this.manuallySelectedQuestions.filter(x => !this.removedQuestionIds.includes(x.questionId));
        let removedQuestions = this.questionResult.questions.filter(x => this.removedQuestionIds.includes(x.questionId));
        removedQuestions.forEach(question => {
            question.isSelected = question.isChecked = false;
        });
        this.updateMetadata();
        this.removedQuestionIds = [];
        this.toastrService.info(Constants.questionsRemovedPleaseSaveChanges);
    }

    addSkillMetadata(skillMetadata: SkillMetadata) {
        let existingSkillMetadataIndex = this.skillMetadata.findIndex(x => x.parentQuestionTypeId === +this.createSectionSkillForm.value.questionTypeId);
        if (existingSkillMetadataIndex >= 0) {
            let existingSkillMetadata = this.skillMetadata[existingSkillMetadataIndex];
            if (existingSkillMetadata.isAutomated && !skillMetadata.isAutomated) {
                this.automatedConfigs = this.automatedConfigs.filter(x => x.parentQuestionTypeId !== +this.createSectionSkillForm.value.questionTypeId);
            }
            else if (!existingSkillMetadata.isAutomated && skillMetadata.isAutomated) {
                this.manuallySelectedQuestions = this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId !== +this.createSectionSkillForm.value.questionTypeId);
            }
            this.skillMetadata[existingSkillMetadataIndex] = skillMetadata;
        }
        else {
            this.skillMetadata.push(skillMetadata);
        }
        this.updateTotalSelectedQuestions();
    }

    toggleManualSelection() {
        this.selectManually = !this.selectManually;
        if (this.selectManually) {
            this.createSectionSkillForm.get("searchResult.beginnerCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.intermediateCount").patchValue(0);
            this.createSectionSkillForm.get("searchResult.advancedCount").patchValue(0);
            this.automatedConfigMap.clear();
            this.countMap.clear();
        }
        else if(!this.selectManually){
            this.manuallySelectedQuestions = [];
        }
    }

    saveSkillQuestions() {
        if (this.activeScheduleWithShowAnswer && this.questionBank == Constants.yakshaQuestions) {
            this.toastrService.warning(Constants.cannotAddYakshaQuestion);
            return;
        }
        if(this.countMap.size>0 && this.action !== Constants.editSkill){
            this.saveDataForMultiSkill();
            return;
        }
        this.createSectionSkill.sectionName = this.createSectionSkillForm.value.sectionName;
        if (this.isSkillChange) {
            this.isNewSkillChange = !this.assessmentDetails.assessmentSections.map(x => x.sectionSkills).map(x => x.map(x => x.skillId))[0].includes(this.selectedSkillId);
            if (this.isNewSkillChange) {
                this.createSectionSkill.questionIds = this.replacedQuestion.map(x => x.questionId);
                this.updateMetadata();
                this.skill = {
                    skillId: +this.selectedSkillId,
                    subSkillId: +this.selectedSubSkillId >= 1 ? +this.selectedSubSkillId : 0,
                    subSubSkillId: +this.selectedSubSubSkillId >= 1 ? +this.selectedSubSubSkillId : 0,
                    questionBankScope: this.isSuperAdmin ? QuestionBankScope.Global : this.selectedQuestionBankScope,
                    skillMetadata: this.getSkillMetadata(),
                    questionIds:null,
                };
            }
            else {
                let skillQuestions = this.sectionSkillDetails.filter(x => x.skillId === this.selectedSkillId).map(x => x.questions)[0];
                skillQuestions.push(this.replacedQuestion[0]);
                this.manuallySelectedQuestions = skillQuestions;
                this.createSectionSkill.questionIds = this.manuallySelectedQuestions.map(x => x.questionId);
                this.createSectionSkill.assessmentSectionSkillId = this.assessmentDetails.assessmentSections.map(x => x.sectionSkills)[0].filter(x => x.skillId === this.selectedSkillId)[0].assessmentSectionSkillId;
            }
        }
        else {
            if (this.onRemoveExistingSkillQuestion) {
                if (!this.isNewSkillChange) {
                    let existingSkillQuestions = this.sectionSkillDetails.filter(x => x.skillId === this.existingSkillId).map(x => x.questions)[0];
                    this.manuallySelectedQuestions = existingSkillQuestions.filter(x => x.questionId !== this.removedQuestion.questionId);
                    this.createSectionSkill.questionIds = this.manuallySelectedQuestions.map(x => x.questionId);
                    this.createSectionSkill.assessmentSectionSkillId = this.assessmentDetails.assessmentSections.map(x => x.sectionSkills)[0].filter(x => x.skillId === this.existingSkillId)[0].assessmentSectionSkillId;
                }
                else {
                    this.isNewSkillChange = false;
                    this.manuallySelectedQuestions = this.existingSkillQuestions.filter(x => !this.replacedQuestion.map(x => x.questionId).includes(x.questionId));
                }
            };
            this.createSectionSkill.questionIds = this.manuallySelectedQuestions.map(x => x.questionId);
        }
        if (!this.isNewSkillChange) {
            if (this.isReplaceQuestion) {
                this.updateMetadata();
            }
            this.skill = {
                skillId: this.onRemoveExistingSkillQuestion ? +this.existingSkillId : +this.selectedSkillId,
                subSkillId: this.onRemoveExistingSkillQuestion ? 0 : +this.selectedSubSkillId >= 1 ? +this.selectedSubSkillId : 0,
                subSubSkillId: this.onRemoveExistingSkillQuestion ? 0 : +this.selectedSubSubSkillId >= 1 ? +this.selectedSubSubSkillId : 0,
                questionBankScope: this.isSuperAdmin ? QuestionBankScope.Global : this.selectedQuestionBankScope,
                skillMetadata: this.getSkillMetadata(),
                questionIds:null,
            };
        }
        this.createSectionSkill.skill = this.skill;
        let isStackContains: boolean = this.createSectionSkill.skill.skillMetadata.some(x => x.parentQuestionTypeId === Constants.stackTypeId);
        if (isStackContains) {
            if (this.createSectionSkill.skill.skillMetadata.length > 1) {
                this.toastrService.warning(Constants.pleaseDontAddStackTypeQuestionsWithOtherTypesOfQuestions);
                return;
            }
        }
        if (this.action !== Constants.editSkill || this.isNewSkillChange) {
            if (this.isNewSkillChange) {
                this.createSectionSkill.skill.skillMetadata[0].totalQuestions = 1;
            }
            if (this.action !== Constants.addSkill && (this.createSectionSkill.sectionName == null || this.createSectionSkill.sectionName == undefined || this.createSectionSkill.sectionName.trim() === '')) {
                this.toastrService.warning("Section Name Should not be empty");
                return;
            }

            let skillItem = null;
            this.manuallySelectedQuestions.forEach(question => {
                if (question.subSkillId != null && question.subSkill2Id != null && this.skillListManualQuestions?.length > 0) {
                    skillItem = this.skillListManualQuestions.find(skill =>
                    (skill.skillId === question.skillId &&
                        skill.subSkillId === question.subSkillId &&
                        skill.subSubSkillId === question.subSkill2Id)
                    );
                }
                else if (question.subSkillId != null && question.subSkill2Id == null && this.createSectionSkill.skillList?.length > 0) {
                    skillItem = this.skillListManualQuestions.find(skill =>
                    (skill.skillId === question.skillId &&
                        skill.subSkillId === question.subSkillId)
                    );
                }
                else if(question.subSkillId == null && question.subSkill2Id == null && this.skillListManualQuestions?.length > 0) {
                    skillItem = this.skillListManualQuestions.find(skill =>
                        (skill.skillId === question.skillId)
                    );
                }

                if (!skillItem) {
                    skillItem = {
                        skillId: question.skillId,
                        subSkillId: question.subSkillId || 0,
                        subSubSkillId: question.subSkill2Id || 0,
                        questionIds: [],
                        questionBankScope: this.selectedQuestionBankScope,
                        skillMetadata: []
                    };
                    this.skillListManualQuestions.push(skillItem);
                    skillItem.questionIds.push(question.questionId);
                    const proficiencyLevelQuestions = [];
                    if (question.proficiency && question.proficiency.id === Constants.beginnerId) {
                        proficiencyLevelQuestions.push({
                            proficiencyLevelId: Constants.beginnerId,
                            totalQuestions: 1
                        },
                            {
                                proficiencyLevelId: Constants.intermediateId,
                                totalQuestions: 0,
                            },
                            {
                                proficiencyLevelId: Constants.advancedId,
                                totalQuestions: 0,
                            });
                    }
                    else if (question.proficiency && question.proficiency.id === Constants.intermediateId) {
                        proficiencyLevelQuestions.push({
                            proficiencyLevelId: Constants.beginnerId,
                            totalQuestions: 0
                        },
                            {
                                proficiencyLevelId: Constants.intermediateId,
                                totalQuestions: 1,
                            },
                            {
                                proficiencyLevelId: Constants.advancedId,
                                totalQuestions: 0,
                            });
                    }
                    else if (question.proficiency && question.proficiency.id === Constants.advancedId) {
                        proficiencyLevelQuestions.push({
                            proficiencyLevelId: Constants.beginnerId,
                            totalQuestions: 0
                        },
                            {
                                proficiencyLevelId: Constants.intermediateId,
                                totalQuestions: 0,
                            },
                            {
                                proficiencyLevelId: Constants.advancedId,
                                totalQuestions: 1,
                            });
                    }
                    let formData = this.createSectionSkillForm.getRawValue();
                    const codingLanguageIds = +formData.questionTypeId === Constants.codingTypeId ? formData.programmingLanguageId.map(x => x.id) : null;
                    skillItem.skillMetadata.push({
                        parentQuestionTypeId: question.parentQuestionTypeId,
                        isAutomated: false,
                        totalQuestions: 1,
                        codingLanguageId: codingLanguageIds,
                        configJson: JSON.stringify({ codingLanguageId: codingLanguageIds }),
                        proficiencyLevelQuestions: proficiencyLevelQuestions
                    });
                }
               
                else {
                    if (skillItem) {
                        skillItem.questionIds.push(question.questionId);
                        skillItem.skillMetadata[0].totalQuestions++;
                        const proficiency = skillItem.skillMetadata[0].proficiencyLevelQuestions.find(level => level.proficiencyLevelId === question.proficiency.id);
                        if (proficiency) {
                            proficiency.totalQuestions++;
                        }
                        const index = this.skillListManualQuestions.indexOf(skillItem);
                        if (index !== -1) {
                            this.skillListManualQuestions[index] = skillItem;
                        } 
                    }
                }
            });
           this.createSectionSkill.skillList=this.skillListManualQuestions;
           this.createSectionSkill.questionIds=[];
            this.assessmentService.createSectionSkill(this.createSectionSkill).subscribe(res => {
                if (res && res.result && res.result.isSuccess) {
                    this.toastrService.success(Constants.questionsAddedSuccessfully);
                    this.updateAssessmentMode();
                    this.isChanged = true;
                    if (this.isSkillChange) {
                        this.isSkillChange = false;
                        this.onRemoveExistingSkillQuestion = true;
                        this.saveSkillQuestions();
                    }
                    this.modalService.dismissAll(this.isChanged);
                    this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });
        }
        else {
            this.updateTotalSelectedQuestions();
            this.assessmentService.updateSectionSkill(this.createSectionSkill).subscribe(res => {
                if (res && res.result && res.result.isSuccess) {
                    this.updateAssessmentMode();
                    if (this.isReplaceQuestion) {
                        if (this.isSkillChange && !this.isNewSkillChange) {
                            this.isSkillChange = false;
                            this.onRemoveExistingSkillQuestion = true;
                            this.saveSkillQuestions();
                        }
                        this.updateReviewCommentQuestion();
                        this.utilsService.deleteCookie(this.constants.isReplaceQuestion, abp.appPath);
                        this.utilsService.deleteCookie(this.constants.isSkillChange, abp.appPath);
                        this.toastrService.success(Constants.questionsUpdatedSuccessfully);
                    }
                    this.isChanged = true;
                    this.removedQuestionIds = [];
                    this.modalService.dismissAll(this.isChanged);
                    this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });
        }
    }

    updateReviewCommentQuestion() {
        let data: ReviewCommentsDto = {
            questionId: this.replacedQuestion[0].questionId,
            id: this.reviewCommentId,
            tenantId: 0,
            assessmentReviewerId: 0,
            comments: '',
            questionReviewStatus: 0,
            tenantAssessmentReviewId: 0
        };
        this.assessmentService.insertOrUpdateComments(data).subscribe(res => {
            if (res.success) {
                this.utilsService.deleteCookie(this.constants.reviewCommentId, abp.appPath);
            }
        });
    }

    updateMetadata() {
        let selectedTypeQuestionsCount = this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId
            === +this.createSectionSkillForm.value.questionTypeId).length;
        if (!selectedTypeQuestionsCount) {
            this.skillMetadata = this.skillMetadata.filter(x => x.parentQuestionTypeId !== +this.createSectionSkillForm.value.questionTypeId);
        }
        else {
            let existingMetadata = this.skillMetadata.find(x => x.parentQuestionTypeId === +this.createSectionSkillForm.value.questionTypeId);
            existingMetadata.totalQuestions = selectedTypeQuestionsCount;
        }
        this.updateTotalSelectedQuestions();
    }

    getSkillMetadata() {
        if (this.isStack) {
            let formData = this.createSectionSkillForm.getRawValue();
            let skillMetadata: SkillMetadata = {
                parentQuestionTypeId: +formData.questionTypeId,
                isAutomated: false,
                totalQuestions: this.selectedQuestions.filter(x => x.parentQuestionTypeId === +formData.questionTypeId).length,
                codingLanguageId: +formData.questionTypeId === Constants.codingTypeId ? formData.programmingLanguageId.map(x => x.id) : null,
                configJson: "",
                proficiencyLevelQuestions: []
            };
            this.addSkillMetadata(skillMetadata);
        }
        let configJson: ConfigJson;
        let proficiencyLevelQuestions: ProficiencyLevelConfig[];
        this.skillMetadata.forEach(metadata => {
            if (metadata.isAutomated) {
                let automatedConfig = this.automatedConfigs.find(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId);
                configJson = {
                    codingLanguageId: metadata.codingLanguageId
                };
                proficiencyLevelQuestions = [{
                    proficiencyLevelId: Constants.beginnerId,
                    totalQuestions: automatedConfig.beginnerCount
                },
                {
                    proficiencyLevelId: Constants.intermediateId,
                    totalQuestions: automatedConfig.intermediateCount
                },
                {
                    proficiencyLevelId: Constants.advancedId,
                    totalQuestions: automatedConfig.advancedCount
                }];
            }
            else {
                configJson = {
                    codingLanguageId: metadata.codingLanguageId
                };
                if (this.isNewSkillChange) {
                    proficiencyLevelQuestions = [{
                        proficiencyLevelId: Constants.beginnerId,
                        totalQuestions: this.replacedQuestion.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.beginnerId).length
                    },
                    {
                        proficiencyLevelId: Constants.intermediateId,
                        totalQuestions: this.replacedQuestion.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.intermediateId).length
                    },
                    {
                        proficiencyLevelId: Constants.advancedId,
                        totalQuestions: this.replacedQuestion.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.advancedId).length
                    }];
                }
                else {
                    proficiencyLevelQuestions = [{
                        proficiencyLevelId: Constants.beginnerId,
                        totalQuestions: this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.beginnerId).length
                    },
                    {
                        proficiencyLevelId: Constants.intermediateId,
                        totalQuestions: this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.intermediateId).length
                    },
                    {
                        proficiencyLevelId: Constants.advancedId,
                        totalQuestions: this.manuallySelectedQuestions.filter(x => x.parentQuestionTypeId === metadata.parentQuestionTypeId
                            && x.proficiency.id === this.constants.advancedId).length
                    }];
                }
            }
            metadata.configJson = JSON.stringify(configJson);
            metadata.proficiencyLevelQuestions = proficiencyLevelQuestions;
        });
        return this.skillMetadata;
    }

    updateAssessmentMode(): void {
        this.assessmentService.updateAssessmentMode(this.createSectionSkill.assessmentId)
            .subscribe(res => {
                if (!res.success || !res.result) {
                    this.toastrService.error(this.constants.somethingWentWrongWhileUpdatingAssessmentMode);
                }
            });
    }

    toggleViewSelected() {
        this.isViewSelected = !this.isViewSelected;
        this.removedQuestionIds = [];
        this.viewButtonName = this.isViewSelected ? Constants.viewSearchResults : Constants.viewSelected;
        if (this.isViewSelected) {
            this.initSelectedQuestionPage();
        }
        else {
            this.manuallySelectedQuestions.forEach(selectedQuestion => {
                let question = this.questionResult.questions.find(x => x.questionId === selectedQuestion.questionId);
                if (question)
                    question.isSelected = question.isChecked = true;
            });
            this.selectAllQuestion = this.questionResult.questions.every(x => x.isChecked === true);
            this.selectedQuestions = [];
        }
    }

    initSelectedQuestionPage() {
        this.selectedQuestionPageIndex = 0;
        let beginIndex = 0;
        let endIndex = this.selectedQuestionPageSize;
        this.paginatedSelectedQuestions = this.manuallySelectedQuestions.slice(beginIndex, endIndex);
        this.paginatedSelectedQuestions.map(x => x.isChecked = false);
        this.removeAllQuestion = false;
    }

    viewQuestion(questionText: string, choices: string[] = [], questiontypeId = 0) {
        choices = choices.map((choice) => choice.replace(/<p>/gi, '<p style="margin-bottom:0px">'));
        const modalRef = this.modalService.open(ViewQuestionComponent, {
            centered: true,
            backdrop: 'static',
            size: 'md'
        });
        modalRef.componentInstance.questionText = questionText;
        modalRef.componentInstance.choices = choices;
        modalRef.componentInstance.isMcq = questiontypeId === this.constants.multipleChoiceId ? true : false;
    }

    onLanguageChange(enableSearch: boolean) {
        this.resetSearchResult();
        this.enableSearch = enableSearch;
    }

    onItemDeSelect() {
        this.resetSearchResult();
        this.enableSearch = this.createSectionSkillForm.get('programmingLanguageId').value.length;
    }

    resetSearchResult() {
        this.isSearchFilterChanged = true;
        if (this.questionResult.totalCount) {
            this.questionResult = {
                totalCount: 0,
                questions: [],
                proficiencyLevelCount: "",
                beginnerLevelCount: 0,
                intermediateLevelCount: 0,
                advancedLevelCount: 0,
            };
            this.isSubmitted = false;
        }
    }

    openQuestionPerformanceDashboard(id: number) {
        const modalRef = this.modalService.open(AnalyticsEmbedComponent, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
        });
        modalRef.componentInstance.embedData = {
            name: "Question Performance",
            id: id
        };
    }

    onSkillSelect() {
        const skillIds = this.createSectionSkillForm.get('skillId')?.value;
        this.skillIdArray = skillIds.map((skill: any) => skill.id);
        this.restrictSubSkill = false;
        if (this.questionResponse) {
            this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, true);
            this.resetSearchResult();
        }

    }

    skillDeselect(event) {
        this.selectedSkillId = event.id;
        this.skillIdArray = this.skillIdArray.filter(id => id !== this.selectedSkillId);
        this.restrictSubSkill = false;
        if (this.skillIdArray.length == 0 || this.questionResponse){
            this.showCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSkill, true);
            this.resetSearchResult();
        }
    }

    onDropdownClose() {
        if (!this.restrictSubSkill && this.skillIdArray && this.skillIdArray?.length > 0) {
            this.skillIds = this.skillIdArray.join(',');
            const data = this.prepateDataForSubSkills();
            this.assessmentService.getSubSkillsForAssessment(data).subscribe(res => {
                if (res && res.result) {
                    this.subSkills = res.result;
                    this.restrictSubSkill = true;
                    this.isSubSkillDisabled = false;
                    this.enableQuestionType = true;
                    this.createSectionSkillForm.get('questionTypeId').enable();
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });
        }
    }

    prepateDataForSubSkills(): SubSkillForAssessmentRequestDto {
        let data: SubSkillForAssessmentRequestDto = {
            skillIds: this.skillIds,
            questionBankScope: this.selectedQuestionBankScope
        };
        return data;
    };

    onSubSkillSelect() {
        const subSkillIds = this.createSectionSkillForm.get('subSkillId')?.value;
        this.subskillIdArray = subSkillIds.map((skill: any) => skill.id)
        this.restrictSubSubSkill=false;
        if (this.subskillIdArray.length == 0 || this.questionResponse) {
            this.showSubSkillCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSubSkill, true);
            this.isSubSubSkillDisabled = true;
        }
    }

    subSkillDeSelect(event) {
        this.previousSelectedSubSkillId = event;
        this.selectedSubSkillId = event.id;
        this.subskillIdArray = this.subskillIdArray.filter(id => id !== this.selectedSubSkillId);
        this.restrictSubSubSkill=false;
        if (this.subskillIdArray.length == 0 || this.questionResponse) {
            this.showSubSkillCancelWarning(this.questionBank, Constants.unsavedChangesWillBeDiscardedDoYouWantToSwitchTheSubSkill, true);
            this.isSubSubSkillDisabled = true;
        }
    }
    subSkillDropdownClose() {
        if (!this.restrictSubSubSkill && this.subskillIdArray && this.subskillIdArray?.length > 0) {
            this.subSkillIds = this.subskillIdArray.join(',');
            const data = this.prepateDataForSubSubSkills();
            this.assessmentService.getSubSubSkillsForAssessment(data).subscribe(res => {
                if (res && res.result) {
                    this.restrictSubSubSkill = true;

                    this.subSubSkills = res.result;
                    if (this.subskillIdArray.length > 0) {
                        this.isSubSubSkillDisabled = false;
                    }
                    else {
                        this.isSubSubSkillDisabled = true;
                    }
                    if (this.assessmentData.subSubSkillId)
                        this.createSectionSkillForm.get('subSubSkillId').setValue(this.assessmentData.subSubSkillId);
                    else
                        this.createSectionSkillForm.get('subSubSkillId').setValue('');
                }
            },
                error => {
                    this.toastrService.error(Constants.somethingWentWrong);
                });

        }
    }

    prepateDataForSubSubSkills(): SubSubSkillForAssessmentRequestDto {
        let data: SubSubSkillForAssessmentRequestDto = {
            skillIds: this.skillIds,
            subSkillIds: this.subSkillIds,
            questionBankScope: this.selectedQuestionBankScope
        };
        return data;
    }

    subSubSkillSelect() {
        const subSubSkill = this.createSectionSkillForm.get('subSubSkillId')?.value;
        this.subskill2IdArray = subSubSkill.map((skill: any) => skill.id)
        if (this.subskill2IdArray?.length > 0) {
            this.subSubSkillIds = this.subskill2IdArray.join(',');
        }
    }

    get count() {
        return this.createSectionSkillForm.get('count') as FormArray;
    }

    addNewObjectForMultiSkill(index: number) {
        const formArray = this.createSectionSkillForm.get('count') as FormArray;
        if (formArray.controls[index] && !this.createSectionSkillForm.invalid) {
            const beginnerCount = formArray.controls[index].get('beginnerCount').value == "" ? 0 : formArray.controls[index].get('beginnerCount').value;
            const intermediateCount = formArray.controls[index].get('intermediateCount').value == "" ? 0 : formArray.controls[index].get('intermediateCount').value;
            const advancedCount = formArray.controls[index].get('advancedCount').value == "" ? 0 : formArray.controls[index].get('advancedCount').value;
            const question = this.questionCountResponse.questionData[index] as any;
            const skillName = question.skillName;
            const subSkillName = question.subSkillName;
            const subSkill2Name = question.subSkill2Name;
            const skillId = question.skillId;
            const subSkillId = question.subSkillid;
            const subSkill2Id = question.subskill2Id;

            if (beginnerCount !== 0 || intermediateCount !== 0 || advancedCount !== 0) {
                this.countMap.set(index, { beginnerCount, intermediateCount, advancedCount, skillName, subSkillName, subSkill2Name, skillId, subSkillId, subSkill2Id });
            }
            else {
                this.toastrService.warning(Constants.invalidData);
                return;
            }
        }
        else {
            this.toastrService.warning(Constants.invalidData);
            return;
        }
        this.updateTotalSelectedQuestions()
    }

    addSkillMetadataForMultiSkill(map: Map<number, [AutomatedConfig, SkillMetadata]>, index: number, skillId1: number, subskillId1: number, subSkill2Id1: number) {
        const newSkill: Skill = {
            skillId: 0,
            subSkillId: 0,
            subSubSkillId: 0,
            questionBankScope: 0,
            questionIds: [],
            skillMetadata: []
        };
        const [automatedConfig, skillMetadata] = map.get(index)
        skillMetadata.proficiencyLevelQuestions = [{
            proficiencyLevelId: Constants.beginnerId,
            totalQuestions: automatedConfig.beginnerCount,
        },
        {
            proficiencyLevelId: Constants.intermediateId,
            totalQuestions: automatedConfig.intermediateCount,
        },
        {
            proficiencyLevelId: Constants.advancedId,
            totalQuestions: automatedConfig.advancedCount,
        }];
        newSkill.skillId = skillId1
        newSkill.subSkillId = subskillId1 ? subskillId1 : 0;
        newSkill.subSubSkillId = subSkill2Id1 ? subSkill2Id1 : 0;
        newSkill.questionBankScope = this.selectedQuestionBankScope
        newSkill.skillMetadata[0] = skillMetadata;
        newSkill.skillMetadata[0].codingLanguageId = automatedConfig.codingLanguageId;
        const codingLanguageId = automatedConfig.codingLanguageId || null;
        newSkill.skillMetadata[0].configJson = JSON.stringify({ codingLanguageId });
        this.skillList[index] = newSkill;
    }

    saveDataForMultiSkill() {
        let totalBeginnerCount = 0;
        let totalIntermediateCount = 0;
        let totalAdvancedCount = 0;

        for (const [, value] of this.countMap) {
            totalBeginnerCount += value.beginnerCount;
            totalIntermediateCount += value.intermediateCount;
            totalAdvancedCount += value.advancedCount;
        }
        this.createSectionSkill.assessmentId = this.assessmentData.assessmentId
        this.createSectionSkill.totalQuestions = totalBeginnerCount + totalAdvancedCount + totalIntermediateCount;
        this.createSectionSkill.sectionName = this.createSectionSkillForm.value.sectionName;
        this.createSectionSkill.questionIds = [];
        this.createSectionSkill.skillList = this.skillList.filter(skill => skill !== null);
        this.assessmentService.createSectionSkill(this.createSectionSkill).subscribe(res => {
            if (res && res.result && res.result.isSuccess) {
                this.toastrService.success(Constants.questionsAddedSuccessfully);
                this.updateAssessmentMode();
                this.isChanged = true;
                if (this.isSkillChange) {
                    this.isSkillChange = false;
                    this.onRemoveExistingSkillQuestion = true;
                    this.saveSkillQuestions();
                }
                this.modalService.dismissAll(this.isChanged);
                this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    deleteAutoConfig(index: number) {
        const mapArray = Array.from(this.countMap.entries());
        const [key,] = mapArray[index];
        this.automatedConfigMap.delete(key);
        this.countMap.delete(key);
        this.skillList.splice(key, 1);
        const mapSize = this.countMap.size;
        if (mapSize == 0) {
            this.isSaveDisabled = true;
        }
        else
            this.isSaveDisabled = false;
            this.updateTotalSelectedQuestions()
    }

}
