import { Component, HostListener, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '../../../models/constants';
import { ToastrService } from 'ngx-toastr';
import { Category, DeleteQuestionDetails, Proficiency, QuestionFilter, QuestionResult, Questions, QuestionType, Skill } from '../../question-bank/question-bank-details';
import { QuestionsService } from '../questions.service';
import { QuestionBankService } from '../../question-bank/question-bank.services';
import { AppComponentBase } from '../../../../shared/app-component-base';
import { MultiSelectDropdownSettings } from '../../../interface/multi-select-dropdown';
import { Helper } from '@app/shared/helper';
import { QuestionResultDto, QuestionsDto } from '@app/admin/assessment/assessment';
import { UtilsService } from 'abp-ng2-module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss']
})

export class QuestionListComponent extends AppComponentBase implements OnInit {
    constants = Constants;
    questionBankId: number = 1;
    skillId: number = 0;
    category: number = 0;
    subSkillId: number = 0;
    skills: Skill[] = [];
    filteredSkills: Skill[] = [];
    subSkills: Skill[];
    filteredSubSkills: Skill[] = [];
    questionTypes: QuestionType[];
    questionTypeId: number = 0;
    proficiencyId: number = 0;
    proficiencies: Proficiency;
    categories: Category;
    searchValue: string;
    searchQuestionIdNumber: string;
    questions: Questions[];
    questionResults: QuestionResult;
    pageSizes: number[] = [10, 20, 30];
    pageIndex: number = 1;
    pageSize: number = 10;
    maxSize: number = 5;
    tenantId: number;
    isTenantAdmin: boolean = false;
    isSuperAdmin: boolean = false;
    scope: number = 0;
    selectedSubSkill: Skill;
    selectedSkill: Skill;
    selectedCategory: Category;
    selectedQuestions: DeleteQuestionDetails[] = [];
    isMasterSelected: boolean = false;
    removedQuestionIds: number[] = [];
    manuallySelectedQuestions: QuestionsDto[] = [];
    selectAllQuestion: boolean = false;
    questionResult = {} as QuestionResultDto;
    mappedQuestions: string[] = [];

    singledropdownSettings: MultiSelectDropdownSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        closeDropDownOnSelection: true
    };
    skillDropdownSettings: any = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        closeDropDownOnSelection: true
    };
    subSkillDropdownSettings: any = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        closeDropDownOnSelection: true
    };
    isAnyChangeEventOccurred: boolean = false;
    isSearchValueExist: boolean = false;
    issearchQuestionIdNumberExist: boolean = false;
    skillCurrentPage: number = 0;
    skillItemsPerPage: number = 50;

    @HostListener('window:keydown', ['$event'])
    function(e: KeyboardEvent) {
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
        }
    };

    constructor(private activatedRoute: ActivatedRoute,
        private router: Router,
        private questionService: QuestionsService,
        private questionBankService: QuestionBankService,
        private toastrService: ToastrService,
        private utilsService: UtilsService,
        private modalService: NgbModal,
        injector: Injector) {
        super(injector);
    }
    ngOnInit(): void {
        this.tenantId = this.appSession.tenantId;
        if (this.tenantId !== null)
            this.isTenantAdmin = true;
        else
            this.isSuperAdmin = true;
        this.activatedRoute.paramMap.subscribe(paramMap => {
            if (paramMap.get(Constants.id)) {
                this.questionBankId = +atob(paramMap.get(Constants.id));
                this.scope = +atob(paramMap.get(Constants.scope));
            }
        });
        this.getQuestionTypes();
        this.getCategories();
        this.getAllProficiencies();
        this.getQuestionBankSkillsDetail();
        this.getQuestionBankSubSkillDetail();
        this.setCookieDataIfExists();
        this.removeCookieIfExists();
    }

    getCategories(): void {
        this.questionBankService.getCategories(this.questionBankId).subscribe(res => {
            if (res && res.result) {
                this.categories = res.result;
            }
        },
            error => {
                console.error(error);
            });
    }

    getQuestionBankSkillsDetail() {
        this.questionBankService.getQuestionBankSkill(this.questionBankId).subscribe(res => {
            if (res.success && res.result.length > 0) {
                let sortedSkills = res.result.sort(Helper.sortString<Skill>('name'));
                this.skills = sortedSkills;
                this.displaySkillsFilteredData();
                if (this.skills.length > this.skillItemsPerPage) {
                    this.setSkillDropdownSettings();
                }
            }
        }, error => {
            console.error(error);
        });
    }

    getQuestionTypes() {
        this.questionBankService.getQuestionTypes().subscribe(res => {
            if (res && res.result) {
                let sortedQuestionType = res.result.sort(Helper.sortString<QuestionType>('name'));
                this.questionTypes = sortedQuestionType;
            }
        }, error => {
            console.error(error);
        });
    }

    getAllProficiencies() {
        this.questionBankService.getAllProficiencies().subscribe(res => {
            if (res && res.result) {
                this.proficiencies = res.result;
            }
        }, error => {
            console.error(error);
        });
    }

    selectSkill(event): void {
        this.isAnyChangeEventOccurred = true;
        this.skillId = event.id;
        this.searchQuestions();
    }

    selectCategory(event): void {
        this.isAnyChangeEventOccurred = true;
        this.category = event.id;
        this.questions = [];
        this.searchQuestions();
    }

    categoryDeSelect(): void {
        this.category = 0;
        this.selectedCategory = { name: '', id: 0 };
        this.searchQuestionsByAppliedFilter();
    }

    skillDeSelect(): void {
        this.skillId = 0;
        this.searchQuestionsByAppliedFilter();
    }

    selectSubSkill(event): void {
        this.isAnyChangeEventOccurred = true;
        this.subSkillId = event.id;
        this.searchQuestions();
    }

    subSkillDeSelect(): void {
        this.subSkillId = 0;
        this.searchQuestionsByAppliedFilter();
    }

    selectQuestionType(event): void {
        this.isAnyChangeEventOccurred = true;
        this.questionTypeId = event.target.value;
        this.searchQuestions();
    }

    selectProficiency(event): void {
        this.isAnyChangeEventOccurred = true;
        this.proficiencyId = event.target.value;
        this.searchQuestions();
    }

    search(event: any): void {
        this.searchValue = event.target.value;
        this.searchQuestionsByAppliedFilter();
    }

    searchByQuestionId(event: any): void {
        this.searchQuestionIdNumber = event.target.value;
        this.searchQuestionsByAppliedFilter();
    }

    loadPage() {
        this.searchQuestions();
    }

    changePageSize() {
        if (this.isAnyFilterOnActive()) {
            this.pageIndex = 1;
            this.searchQuestions();
        }
    }


    editQuestion(question) {
        let questionId = btoa(question.questionId);
        let questiontypeId = btoa(question.questiontypeId);
        this.utilsService.deleteCookie(this.constants.questionBankQuestionEdit, abp.appPath);
        let cookieData = btoa(this.setQuestionListPageCookieData());
        this.utilsService.setCookieValue(this.constants.questionBankQuestionEdit, cookieData, undefined, abp.appPath);
        this.router.navigate(['../../../create-question', questionId, questiontypeId], { relativeTo: this.activatedRoute });
    }

    setQuestionListPageCookieData(): string {
        let data = {
            questionBankId: this.questionBankId,
            scope: this.scope,
            category: this.selectedCategory ? this.selectedCategory : { name: '', id: '' },
            skill: this.selectedSkill,
            subSkill: this.selectedSubSkill,
            parentQuestionTypeId: this.questionTypeId > 0 ? this.questionTypeId : null,
            proficiencyId: this.proficiencyId > 0 ? this.proficiencyId : null,
            searchText: this.searchValue ? this.searchValue : '',
            questionIdNumber: this.searchQuestionIdNumber ? this.searchQuestionIdNumber : '',
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
        };
        return JSON.stringify(data);
    }

    bulkDeleteQuestion(targetModal?: NgbModal) {
        let questionsList = this.selectedQuestions.map(x => x.questionId);
        if (!questionsList.length) {
            this.toastrService.error(Constants.pleaseSelectTheQuestionsToDelete);
            return;
        }
        if (questionsList.length) {
            let deleteQuestionId = questionsList.join(',');
            this.questionService.questionsMappedAssessments(deleteQuestionId).subscribe(res => {
                if (res.result != null) {
                    res.result.forEach(element => {
                        this.mappedQuestions.push(this.stripHtml(element));
                        this.displayMessage(targetModal);
                    });
                }
                else {
                    abp.message.confirm(
                        this.l('QuestionDeleteWarningMessage', ` ${Constants.doYouWantToDeleteThisQuestion} ? `),
                        (result: boolean) => {
                            let deleteQuestionId = questionsList.join(',');
                            this.questionService.bulkDeleteQuestion(deleteQuestionId).subscribe(res => {
                                if (res.result) {
                                    if (this.selectedQuestions.length > 1) {
                                        this.toastrService.success(Constants.questionsDeletedSuccessful);
                                        this.searchQuestions();
                                    }
                                    else {
                                        this.toastrService.success(Constants.questionDeletedSuccessful);
                                        this.searchQuestions();
                                    }
                                }
                                else
                                    this.toastrService.warning(Constants.questionDeleteUnsuccessful);
                            });
                        }
                    );
                }
            })
        }
    }

    reset(): void {
        this.isAnyChangeEventOccurred = false;
        this.isSearchValueExist = false;
        this.issearchQuestionIdNumberExist = false;
        this.category = 0;
        this.skillId = 0;
        this.subSkillId = 0;
        this.questionTypeId = 0;
        this.proficiencyId = 0;
        if (this.questionResult)
            this.questionResults.totalCount = 0;
        this.pageIndex = 1;
        this.searchValue = "";
        this.searchQuestionIdNumber = "";
        this.questions = [];
        this.selectedCategory = { name: '', id: 0 };
        this.selectedSkill = { name: '', id: 0 };
        this.selectedSubSkill = { name: '', id: 0 };
    }

    searchQuestions() {
        let data: QuestionFilter = {
            QuestionBankId: this.questionBankId,
            categoryId: this.category > 0 ? this.category : null,
            SkillId: this.skillId > 0 ? this.skillId : null,
            SubSkillId: this.subSkillId > 0 ? this.subSkillId : null,
            ParentQuestionTypeId: this.questionTypeId > 0 ? this.questionTypeId : null,
            ProficiencyId: this.proficiencyId > 0 ? this.proficiencyId : null,
            SearchText: this.searchValue ? encodeURIComponent(this.searchValue) : '',
            QuestionIdNumber: this.searchQuestionIdNumber ? encodeURIComponent(this.searchQuestionIdNumber) : '',
            SkipCount: this.searchQuestionIdNumber ? 0 : (this.pageIndex - 1) * this.pageSize,
            MaxResultCount: this.pageSize
        };
        this.questionBankService.getSearchQuestions(data).subscribe(res => {
            if (res && res.result) {
                this.isSearchValueExist = this.searchValue ? true : false;
                this.issearchQuestionIdNumberExist = this.searchQuestionIdNumber ? true : false;
                this.questionResults = res.result;
                this.questions = res.result.questions;
                this.questions.forEach(question => {
                    if (question.parentQuestionTypeId === this.constants.mcqTypeId)
                        question.questionType = Constants.mcqTitle;
                    else if (question.parentQuestionTypeId === this.constants.codingTypeId)
                        question.questionType = Constants.coding;
                    else if (question.parentQuestionTypeId === this.constants.stackTypeId)
                        question.questionType = Constants.stack;
                    if (question.questionText.includes('<img')) {
                        question.questionText = this.addHeightWidthToImage(question.questionText);
                    }
                });
                this.isMasterSelected = false;
                this.selectedQuestions = [];
            }
            else
                this.toastrService.error(Constants.questionsNotFound);
        });
    }

    selectOrUnselect() {
        this.isMasterSelected = this.questionResults.questions.every(function (item: any) {
            return item.isChecked === true;
        });
    }

    searchCheckedEvent(event, question: Questions) {
        question.isChecked = event.target.checked;
        this.selectOrUnselect();
        if (question.isChecked) {
            this.selectedQuestions.push({
                questionId: question.questionId,
                isChecked: question.isChecked
            });
        }
        else {
            this.selectedQuestions = this.selectedQuestions.filter(x => x.questionId !== question.questionId);
            question.isChecked = false;
        }
    }

    selectAllQuestions(event) {
        this.selectAllQuestion = event.target.checked;
        if (this.selectAllQuestion) {
            this.questionResults.questions.forEach(question => {
                if (!this.selectedQuestions.find(x => x.questionId === question.questionId))
                    this.selectedQuestions.push({
                        questionId: question.questionId,
                        isChecked: question.isChecked
                    });
            });
            this.questionResults.questions.map(x => x.isChecked = true);
        }
        else {
            this.questionResults.questions.forEach(question => {
                this.selectedQuestions = this.selectedQuestions.filter(x => x.questionId !== question.questionId);
                question.isChecked = false;
            });
        }
    }

    questionSpacing(questionText: string) {
        return questionText.replace(/<p>/gi, '<p style=margin-bottom:0px;>');
    }

    getQuestionBankSubSkillDetail() {
        this.questionBankService.getSubSkillsByQuestionBankId(this.questionBankId).subscribe(res => {
            if (res.success && res.result.length > 0) {
                let sortedSubSkills = res.result.sort(Helper.sortString<Skill>('name'));
                this.subSkills = sortedSubSkills;
                this.displaySubSkillsFilteredData();
                if (this.subSkills.length > this.skillItemsPerPage) {
                    this.setSubSkillDropdownSettings();
                }
            }
        }, error => {
            console.error(error);
        });
    }

    setCookieDataIfExists() {
        let encodedData = this.utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
        if (encodedData) {
            let questionListPageData = JSON.parse(atob(encodedData));
            if (this.questionBankId === questionListPageData.questionBankId) {
                if (questionListPageData.category && questionListPageData.category.length) {
                    this.selectedCategory = questionListPageData.category;
                    this.category = questionListPageData.category[0]?.id;
                }
                if (questionListPageData.skill) {
                    this.selectedSkill = questionListPageData.skill;
                    this.skillId = questionListPageData.skill[0]?.id;
                }
                if (questionListPageData.subSkill) {
                    this.selectedSubSkill = questionListPageData.subSkill;
                    this.subSkillId = questionListPageData.subSkill[0]?.id;
                }
                if (questionListPageData.parentQuestionTypeId > 0)
                    this.questionTypeId = questionListPageData.parentQuestionTypeId;
                if (questionListPageData.proficiencyId > 0)
                    this.proficiencyId = questionListPageData.proficiencyId;
                this.searchValue = questionListPageData.searchText;
                this.searchQuestionIdNumber = questionListPageData.questionIdNumber;
                this.pageSize = questionListPageData.pageSize;
                this.searchQuestions();
                this.isAnyChangeEventOccurred = this.category > 0 || this.skillId > 0 || this.subSkillId > 0 || this.proficiencyId > 0 || this.questionTypeId > 0 ? true : false;
            }
        }
    }

    isAnyFilterOnActive(): boolean {
        if (!this.searchValue && !this.searchQuestionIdNumber && !(this.category > 0) && !(this.skillId > 0) && !(this.subSkillId > 0) && !(this.questionTypeId > 0) && !(this.proficiencyId > 0)) {
            return false;
        }
        return true;
    }

    searchQuestionsByAppliedFilter(): void {
        if (this.isAnyFilterOnActive()) {
            this.searchQuestions();
        } else {
            this.reset();
        }
    }

    removeCookieIfExists(): void {
        this.utilsService.deleteCookie(this.constants.questionBankQuestionEdit, abp.appPath);
    }

    displaySubSkillsFilteredData(event: any = null) {
        if (event === null || event === '') {
            this.filteredSubSkills = this.subSkills.slice(this.skillCurrentPage, this.skillItemsPerPage);
        } else {
            let subskills = this.subSkills?.filter(x => x.name.toLocaleLowerCase().includes(event.toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
            if (subskills?.length > 0) {
                this.filteredSubSkills = this.subSkills.filter(x => x.name.toLocaleLowerCase().includes(event.toString().toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
            }
        }
    }

    setSubSkillDropdownSettings() {
        this.subSkillDropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: true,
            closeDropDownOnSelection: true,
            searchPlaceholderText: this.constants.fiftyPlusSubSkillsExistSearchHereToFilter
        };
    }

    displaySkillsFilteredData(event: any = null) {
        if (event === null || event === '') {
            this.filteredSkills = this.skills.slice(this.skillCurrentPage, this.skillItemsPerPage);
        } else {
            let skills = this.skills?.filter(x => x.name.toLocaleLowerCase().includes(event.toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
            if (skills?.length > 0) {
                this.filteredSkills = this.skills.filter(x => x.name.toLocaleLowerCase().includes(event.toLocaleLowerCase())).slice(this.skillCurrentPage, this.skillItemsPerPage);
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

    copyText(idNumber: string): void {
        let copyText = idNumber;
        const selectBox = document.createElement('textarea');
        selectBox.style.position = 'fixed';
        selectBox.style.left = '0';
        selectBox.style.top = '0';
        selectBox.style.opacity = '0';
        selectBox.value = copyText;
        document.body.appendChild(selectBox);
        selectBox.focus();
        selectBox.select();
        document.execCommand('copy');
        document.body.removeChild(selectBox);
        this.toastrService.success(Constants.copiedToClipboard);
    }
    displayMessage(targetModal: NgbModal): void {
        this.modalService.open(targetModal, {
            centered: true,
            backdrop: 'static'
        });
    }

    closeBtnClick(): void {
        this.mappedQuestions = [];
        this.modalService.dismissAll();
    }

    stripHtml(html: string) {
        if (html) {
            var startParagraph = /\<p>/i;
            var remainingParagraph = /\<p>/gi;
            var breakTag = /\<br>/gi;
            var endParagraph = /\<\/p>/gi;
            var div = document.createElement("DIV");
            div.innerHTML = html.replace(startParagraph, "").replace(remainingParagraph, "\n").replace(endParagraph, "").replace(breakTag, "\n");
            let cleanText = div.innerText;
            div = null;
            return cleanText;
        }
        else
            return "";
    }

    addHeightWidthToImage(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const imgElements = doc.querySelectorAll('img');
        imgElements.forEach((imgElement) => {
            imgElement.setAttribute('height', '100%');
            imgElement.setAttribute('width', '100%');
        });
        return doc.body.innerHTML;
    }
}
