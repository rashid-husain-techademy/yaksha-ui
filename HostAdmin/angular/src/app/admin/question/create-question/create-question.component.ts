import { Component, HostListener, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Constants } from '../../../models/constants';
import { CategoryDetails, CodingImportDto, CompilerLanguages, CreateCodingQuestionDto, CreateQuestionDto, GetProficiencies, GetPlanSize, GetProficiencyMetadata, GetQuestion, GetQuestionTypes, GetSkills, QuestionHint, QuestionLanguages, Skills, TestCasesDto, UpdateCodingQuestionDto, UpdateQuestionDto, StackQuestionDetails, GetStackQuestionDetails, SupportedStackLanguages, TestCaseDetails, CategorySkillRequestDto, EnvironmentTypes, SkillDetailDto, SubSkills, PuzzleChoiceData, PuzzleAnswerData, Orientation } from '../question-details';
import { CreateTestCaseComponent } from '../create-test-case/create-test-case.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionsService } from '../questions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Helper } from '@app/shared/helper';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { NavigationService } from '@app/service/common/navigation.service';
import { Unsaved } from '@app/interface/unsaved-data';
import { AppSessionService } from '@shared/session/app-session.service';
import * as _ from 'lodash';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { UtilsService } from 'abp-ng2-module';
import { QuestionBankScope } from '@app/enums/question-bank-type';
import { SkillDto } from '@app/assessment-review/assessment-review';
import { EnvironmentType } from '@app/enums/test';
import { environment } from 'environments/environment';
import '../../../../assets/crossWord/crossword';
import { dataService } from '@app/service/common/dataService';

declare function buildCrosswordPuzzle(entryData: any, identifier: any): any;

export interface select {
  name: string;
  value: number
}
@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})

export class CreateQuestionComponent implements OnInit, Unsaved, OnDestroy {
  constants = Constants;
  choiceForm: FormGroup;
  isFormSubmitTriggered: boolean = false;
  checkList: boolean[];
  optionList: string[] = [];
  matchQuestions: string[] = [];
  matchAnswers: string[] = [];
  isOptionNotEmpty: boolean = false;
  isOptionChecked: boolean = false;
  isMcqSameChoice: boolean = false;
  matcherror: boolean = false;
  answerChecked: number;
  answer: string;
  matchResult: boolean;
  choices: string[] = [];
  puzzleChoices: string;
  puzzleAnswer: string;
  answerIndex: number[] = [];
  questionTypes: GetQuestionTypes[] = [];
  proficiencies: GetProficiencies[] = [];
  planSize: GetPlanSize[] = [];
  proficiencyMetadata: GetProficiencyMetadata[] = [];
  createQuestionDto: CreateQuestionDto;
  updateQuestionDto: UpdateQuestionDto;
  createCodingQuestionDto: CreateCodingQuestionDto;
  codingLanguageDetails: QuestionLanguages[] = [];
  testCaseDetails: TestCasesDto[] = [];
  codingLanguages: CompilerLanguages[] = [];
  selectedCodingLanguages: CompilerLanguages[] = [];
  dropdownSettings: IDropdownSettings = {};
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  updateCodingQuestionDto: UpdateCodingQuestionDto;
  questionHintDto: QuestionHint;
  selectedItems: string[] = [];
  singleselectedItems: string[] = [];
  categories: CategoryDetails[];
  skills: GetSkills;
  primarySkillNames: string[] = [];
  subSkillNames: string[] = [];
  subSkill2Names: string[] = [];
  categorySkills: SkillDetailDto[] = [];
  subSkills: SkillDetailDto[] = [];
  subSubSkills: SkillDetailDto[] = [];
  previousSelectedSkillId: SkillDto;
  previousSelectedSubSkillId: SkillDto;
  previousSelectedSubSubSkillId: SkillDto;
  selectedSubSkillId: number = 0;
  selectedSubSubSkillId: number = 0;
  questionForm: FormGroup;
  question: GetQuestion;
  codingQuestion: CodingImportDto;
  cloudQuestion: CodingImportDto;
  isEdit: boolean = false;
  answers: string[] = [];
  tofTrue: boolean = true;
  tofFalse: boolean = false;
  subTextArea: boolean = true;
  subFileUpload: boolean = false;
  subAnswers: boolean = true;
  isCoding: boolean = false;
  questionId: number;
  subSkill: string = '';
  subSkill2: string = '';
  existingPrimarySkill: { id: number; name: string; }[];
  existingSubSkill: string;
  existingSubSubSkil: string;
  existingProficiency: number;
  isPrimarySkillChange: boolean = false;
  isSubSkillChange: boolean = false;
  isSubSubSkillChange: boolean = false;
  isProficiencyChange: boolean = false;
  sortednames: string;
  isShown: boolean = false;
  stackInstructions: File;
  selectedStackLanguages: CompilerLanguages[] = [];
  stackEnvironmentDropDownSetting: IDropdownSettings = {};
  stackLanguageDropDownSetting: IDropdownSettings = {};
  isCategoryDisabled: boolean = false;
  isSkillDisabled: boolean = false;
  isEnvironmentDisabled: boolean = false;
  htmlCssLanguage: string = 'HTML & CSS';
  note: string = 'Note';
  showPuzzle: boolean = false;
  orientation: Orientation[] = [
    { name: Constants.across, value: 1, },
    { name: Constants.down, value: 2 }
  ];
  puzzleData: string[] = [];
  questionIdNumber: string = '';
  isVirtusaStdTenant: boolean = false;
  isTechavasiTenant: boolean = false;
  isZikshaaTenant: boolean = false;

  @ViewChild('instance', { static: true })
  instance = Object.create(null);
  subSkillFocus$ = new Subject<string>();
  subSkillClick$ = new Subject<string>();
  subSkill2Focus$ = new Subject<string>();
  subSkill2Click$ = new Subject<string>();
  editAddLabel: string = 'Edit';
  tofAnswer: boolean = true;
  existingCodingLanguage: CompilerLanguages[] = [];
  choosenCodingLanguages: CompilerLanguages[] = [];
  stackId: number;
  stackLanguages: SupportedStackLanguages[] = [];
  filteredStackLanguages: SupportedStackLanguages[] = [];
  stackTestCaseDetails: TestCaseDetails[] = [];
  stackTotalScore: number = 0;
  onLoadValue: GetQuestion | CodingImportDto;
  previousPath: string;
  isHtmlCssSelected: boolean;
  environmentType: EnvironmentTypes[] = [{ id: 1, name: "Container" }, { id: 2, name: "VirtualMachine" }];
  isVMEnvironment: boolean = false;
  isCodingEnvironmentSelected: boolean = false;
  stackCodingEnvironment: string;
  isSortOrderEnabled: boolean = false;
  onReviewerRequest: boolean = false;
  isReplaceQuestion: boolean = false;
  isSubSkillDisabled: boolean;
  selectedSkillId: number = 0;
  isSubSubSkillDisabled: boolean;
  isSkillChange: boolean = false;
  isScanConfigXmlValid: boolean = true;
  puzzleMaxLimit: number = 20;
  hasStackInstructions: boolean = false;
  rubrixFile: File;
  supportedTypes: string[];
  @ViewChild('rubrixInput') rubrixInput: ElementRef;

  nextSortOrder: number = 1;
  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };
  assessmentId: number;
  assessmentSectionId: number;
  assessmentSectionSkillId: number;
  isQuestionUpdateFromQRAdmin: boolean;
  questionMappedAssessment: boolean = false;

  constructor(private questionService: QuestionsService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private appSessionService: AppSessionService,
    private _utilsService: UtilsService,
    private dataService: dataService,
  ) { }

  mcq: boolean = false;
  fib: boolean = false;
  mtf: boolean = false;
  tof: boolean = false;
  sub: boolean = false;
  coding: boolean = false;
  stack: boolean = false;
  cloud: boolean = false;
  ots: boolean = false;
  sfdd: boolean = false;
  dragAndDrop: boolean = false;
  puzzle: boolean = false;

  toolbarConfig = {
    toolbar: [
      ['code-block']
    ]
  };

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': '1' }, { 'header': '2' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['direction'],
      [{ 'size': [] }],
      [{ 'header': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }, { 'align': [] }],
      ['clean', 'image'],

    ]
  }

  get questionHint(): FormArray {
    return this.questionForm.get('questionHint') as FormArray;
  }

  get questionLanguages(): FormArray {
    return this.questionForm.get('questionLanguages') as FormArray;
  }
  get questionTestCases(): FormArray {
    return this.questionForm.get('TestCases') as FormArray;
  }

  get testCaseTemplateDetails(): FormArray {
    return this.questionForm.get('testCaseTemplateDetails') as FormArray;
  }

  get crosswordPuzzle(): FormArray {
    return this.questionForm.get('crosswordPuzzle') as FormArray;
  }

  ngOnInit(): void {
    this.previousPath = this._utilsService.getCookieValue(Constants.previousPath);
    this.getQuestionTypes();
    this.getProficiencyMetaData();
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get(Constants.id) && params.get(Constants.typeId)) {
        this.isEdit = true;
        this.onReviewerRequest = (this.previousPath) ? true : false;
        this.questionId = parseInt(atob(params.get(Constants.id)));
        this.isQuestionUpdateFromQRAdmin = (atob(params.get("isQuestionUpdateFromQRAdmin")) === "true") ? true : false;
        if (this.isQuestionUpdateFromQRAdmin) {
          this.assessmentId = parseInt(atob(params.get("assessmentId")));
          this.assessmentSectionId = parseInt(atob(params.get("assessmentSectionId")));
          this.assessmentSectionSkillId = parseInt(atob(params.get("assessmentSectionSkillId")));
        }

        if (parseInt(atob(params.get(Constants.typeId))) === 9) {
          this.isCoding = true;
        }
        else if (parseInt(atob(params.get(Constants.typeId))) === Constants.stackId) {
          this.stack = true;
          this.getAllSupportedStackLanguages();
        }
        else if (parseInt(atob(params.get(Constants.typeId))) === Constants.cloudId) {
          this.cloud = true;
        }
      }
      this.isTechavasiTenant = this.dataService.isTechvasiIdTenant(this.appSessionService.tenantId);
      this.isVirtusaStdTenant = this.dataService.isVirtusastdTenant(this.appSessionService.tenantId);
      this.isZikshaaTenant = this.dataService.isZikshaaTenant(this.appSessionService.tenantId);
    });
    this.initQuestionForm();
    this.getCategories();
    this.getSkills();
    this.getProficiencies();
    this.getPlanSize();
    this.getAllCompilerLanguages();
    this.dropdownSettings = {
      idField: 'id',
      textField: 'language',
      allowSearchFilter: true,
      enableCheckAll: false,
      singleSelection: false,
    };
    this.stackLanguageDropDownSetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'language',
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
    this.stackEnvironmentDropDownSetting = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      closeDropDownOnSelection: true
    };
    this.questionForm.get('questionType').valueChanges.subscribe(value => this.typeCheck(value));
  }

  loadPuzzle() {
    if (this.puzzle)
      this.questionForm.get('questionType').valueChanges.subscribe(value => this.typeCheck(value));
  }
  ngOnDestroy(): void {
    if (this.previousPath)
      this._utilsService.deleteCookie(Constants.previousPath, abp.appPath);
  }

  initQuestionForm(): void {
    this.questionForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      primarySkill: ['', [Validators.required]],
      subSkill: ['', [Validators.required]],
      subSubSkill: [''],
      questionType: ['', [Validators.required]],
      proficiency: ['', [Validators.required]],
      duration: [''],
      score: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern("^[0-9]*$")]],
      planSize: [''],
      maxCount: [''],
      // weight: ['', [Validators.required]],
      question: [null, [Validators.required, this.noWhitespaceValidator]],
      questionHint: this.formBuilder.array([this.createHint()]),
      mcqController: this.formBuilder.group({
        checkbox1: [''],
        checkbox2: [''],
        checkbox3: [''],
        checkbox4: [''],
        checkbox5: [''],
        checkbox6: [''],
        question1: [''],
        question2: [''],
        question3: [''],
        question4: [''],
        question5: [''],
        question6: ['']
      }),
      fibController: this.formBuilder.group({
        question1: [''],
        question2: [''],
        question3: [''],
        question4: [''],
        question5: [''],
        question6: ['']
      }),
      mtfController: this.formBuilder.group({
        question1: [''],
        question2: [''],
        question3: [''],
        question4: [''],
        question5: [''],
        question6: [''],
        answer1: [''],
        answer2: [''],
        answer3: [''],
        answer4: [''],
        answer5: [''],
        answer6: ['']
      }),
      sortOrder: [''],
      testCases: this.formBuilder.array([this.createTestCases()]),
      testCaseTemplateDetails: this.formBuilder.array([]),
      questionLanguages: this.formBuilder.array([this.createQuestionLanguages()]),
      crosswordPuzzle: this.formBuilder.array([this.crossWordPuzzleQuestions()]),
      stackCodingEnvironment: [],
      stackCodingLanguages: [],
      stackNoOfTestCases: [''],
      stackCpuCore: [''],
      stackCpuMemory: [''],
      stackTemplateUrl: [''],
      scanConfigXml: [''],
      skuId: [''],
      courseName: [''],
      moduleName: ['']
    });
    this.questionForm.get('duration').disable();
    this.questionForm.get('score').disable();
    this.onLoadValue = this.questionForm.value;
  }

  createHint(): FormGroup {
    return this.formBuilder.group({
      id: 0,
      hint: ['']
    });
  }

  createQuestionLanguages(): FormGroup {
    return this.formBuilder.group({
      id: 0,
      languageId: [0],
      defaultCode: [''],
      questionId: 0,
    });
  }

  crossWordPuzzleQuestions(): FormGroup {
    return this.formBuilder.group({
      clue: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      answer: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      position: ['', [Validators.required, Validators.pattern(/^\d{0,2}$/), Validators.min(1), Validators.max(this.puzzleMaxLimit)]],
      orientation: ['', [Validators.required]],
      startx: ['', [Validators.required, Validators.pattern(/^\d{0,2}$/), Validators.min(1), Validators.max(this.puzzleMaxLimit)]],
      starty: ['', [Validators.required, Validators.pattern(/^\d{0,2}$/), Validators.min(1), Validators.max(this.puzzleMaxLimit)]],
    });
  }

  keyDownEvent(event) {
    if (event.keyCode === Constants.keyCodeDot || event.keyCode === Constants.keyCodeE || event.keyCode === Constants.keyCodeMinus || event.keyCode === Constants.keyCodePlus) {
      event.preventDefault();
    }
  }

  hideSelectedOption(value) {
    if (value) {
      if (this.isEdit && this.existingCodingLanguage.find(x => x.id === value.id)) {
        return true;
      }
      // eslint-disable-next-line eqeqeq
      let havevalue = this.questionForm.controls.questionLanguages.value.filter(x => x.languageId == value.id);
      if (havevalue.length)
        return true;
      else
        return false;
    }
  }

  createTestCases(): FormGroup {

    return this.formBuilder.group({
      id: 0,
      questionId: [''],
      TestCaseTitle: [''],
      StandardInput: [''],
      ExpectedOutput: [''],
      SortOrder: ['']
    });
  }

  createTestCaseTemplateDetails(): FormGroup {
    if (this.stackCodingEnvironment === this.constants.Container) {
      return this.formBuilder.group({
        stackId: 0,
        language: ['', [Validators.required]],
        stackFolderName: [null],
        testCaseCount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        score: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        testCasePath: [''],
        testCaseHidePath: ['', [Validators.required, Validators.pattern(/^([^\\/.,?:\s|"<>])(?!.*((\s)|(\/\.)|(\.\/)|([?:|"<>])|(\.,)|(,\.)|(\/,)|(,\/)|(,{2,})|(\.{2,})|(\/{2,})|(\\)|[,./\\?:|"<>]$)).*/)]]
      });
    }
    else {
      return this.formBuilder.group({
        stackId: 0,
        language: ['', [Validators.required]],
        stackFolderName: [null],
        testCaseCount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        score: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        testCaseHidePath: ['', [Validators.required, Validators.pattern(/^([^\\/.,?:\s|"<>])(?!.*((\s)|(\/\.)|(\.\/)|([?:|"<>])|(\.,)|(,\.)|(\/,)|(,\/)|(,{2,})|(\.{2,})|(\/{1})|(\\{3})|[,.\\?:|"<>]$)).*/)]],
        testCasePath: ['']
      });
    }
  }

  createTestCaseTemplateDetailsMFA(): FormGroup {
    if (this.stackCodingEnvironment === this.constants.Container) {
      return this.formBuilder.group({
        stackId: 0,
        language: ['', [Validators.required]],
        stackFolderName: ['', [WhiteSpaceValidators.emptySpace(), Validators.required, Validators.pattern('^([a-zA-Z0-9][^*/><?\|:]*)$')]],
        testCaseCount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        score: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        testCasePath: [''],
        testCaseHidePath: ['', [Validators.required, Validators.pattern(/^([^\\/.,?:\s|"<>])(?!.*((\s)|(\/\.)|(\.\/)|([?:|"<>])|(\.,)|(,\.)|(\/,)|(,\/)|(,{2,})|(\.{2,})|(\/{2,})|(\\)|[,./\\?:|"<>]$)).*/)]]
      });
    }
    else {
      return this.formBuilder.group({
        stackId: 0,
        language: ['', [Validators.required]],
        stackFolderName: ['', [WhiteSpaceValidators.emptySpace(), Validators.required, Validators.pattern('^([a-zA-Z0-9][^*/><?\|:]*)$')]],
        testCaseCount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        score: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        testCaseHidePath: ['', [Validators.required, Validators.pattern(/^([^\\/.,?:\s|"<>])(?!.*((\s)|(\/\.)|(\.\/)|([?:|"<>])|(\.,)|(,\.)|(\/,)|(,\/)|(,{2,})|(\.{2,})|(\/{1})|(\\{3})|[,.\\?:|"<>]$)).*/)]],
        testCasePath: ['']
      });
    }
  }

  addHint() {
    this.questionHint.push(this.createHint());
  }

  addQuestionLanguages() {
    this.questionLanguages.push(this.createQuestionLanguages());
  }

  addPuzzleQuestion() {
    this.crosswordPuzzle.push(this.crossWordPuzzleQuestions());
  }

  setErrorStatus(index: number, controlsNames: string[], isError: boolean) {
    controlsNames.forEach(control => {
      if (isError)
        this.questionForm.get("crosswordPuzzle")['controls'][index].get(control).setErrors({ 'invalid': true });
      else
        this.questionForm.get("crosswordPuzzle")['controls'][index].get(control).setErrors(null);
    });
  }

  noWhitespaceValidator(control: FormControl) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(control.value, 'text/html');
    const textContent = htmlDoc.body.textContent;
    return textContent.trim().length === 0 ? { 'whitespace': true } : null;
  }

  onPuzzleCluesChange(index) {
    const crosswordArray = this.crosswordPuzzle.value;
    var currentClue = crosswordArray[index];

    if (currentClue.answer.match(/^[A-Za-z0-9]+$/) && currentClue.orientation && !currentClue.answer.includes(' ') && currentClue.startx > 0 && currentClue.startx <= 20 && currentClue.starty > 0 && currentClue.starty <= 20 && currentClue.position > 0 && currentClue.position <= 20) {
      let isOverLap = false;
      for (let j = 0; j < crosswordArray.length && !isOverLap; j++) {
        var otherClue = crosswordArray[j];
        currentClue = crosswordArray[index];
        if (otherClue.answer.match(/^[A-Za-z0-9]+$/) && otherClue.orientation && !otherClue.answer.includes(' ') && otherClue.startx > 0 && otherClue.startx <= 20 && otherClue.starty > 0 && otherClue.starty <= 20 && otherClue.position > 0 && otherClue.position <= 20) {
          if (index !== j) {
            //check clue duplication
            if (otherClue.position && otherClue.orientation) {
              if (currentClue.position === otherClue.position && currentClue.orientation === otherClue.orientation) {
                this.setErrorStatus(j, ['position', 'orientation'], false);
                this.setErrorStatus(index, ['position', 'orientation'], true);
                this.toastrService.warning(Constants.orientionAndPositionAlreadyExist);
                return;
              }
              else if ((currentClue.position && otherClue.position) && (currentClue.position !== otherClue.position || currentClue.orientation !== otherClue.orientation) && (currentClue.position !== 0 && otherClue.position)) {
                this.setErrorStatus(index, ['position', 'orientation'], false);
                this.setErrorStatus(j, ['position', 'orientation'], false);
              }
            }
            //check clue indexes occurring more than twice
            let indexCount = crosswordArray.filter(obj => obj.startx === currentClue.startx && obj.starty === currentClue.starty);
            if (indexCount.length > 2) {
              this.setErrorStatus(index, ['startx', 'starty'], true);
              this.toastrService.warning(Constants.startingStartxAndStartyShouldNotRepeatMoreThanTwices);
              return;
            }
            else if (!(this.questionForm.get("crosswordPuzzle")['controls'][j].get('startx').hasError('invalid') && this.questionForm.get("crosswordPuzzle")['controls'][j].get('answer').hasError('invalid') && this.questionForm.get("crosswordPuzzle")['controls'][j].get('starty').hasError('invalid')) && (this.questionForm.get("crosswordPuzzle")['controls'][index].get('startx').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('starty').value && (this.questionForm.get("crosswordPuzzle")['controls'][index].get('startx').valid && this.questionForm.get("crosswordPuzzle")['controls'][index].get('starty').valid))) {
              this.setErrorStatus(index, ['startx', 'starty'], false);
              this.setErrorStatus(j, ['startx', 'starty'], false);
            }
            //check position occurring more than twice
            let positionCount = crosswordArray.filter(obj => obj.position === currentClue.position);
            if (positionCount.length > 2) {
              this.setErrorStatus(index, ['position'], true);
              this.toastrService.warning(Constants.positionShouldNotRepeatMoreThanTwices);
              return;
            }
            else if (this.questionForm.get("crosswordPuzzle")['controls'][index].get('position').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('position').valid && this.questionForm.get("crosswordPuzzle")['controls'][j].get('position').value && this.questionForm.get("crosswordPuzzle")['controls'][j].get('position').valid) {
              this.setErrorStatus(index, ['position'], false);
              this.setErrorStatus(j, ['position'], false);
            }
            //check position should be same when indexes same
            if (currentClue.startx === otherClue.startx && currentClue.starty === otherClue.starty && currentClue.orientation !== otherClue.orientation && currentClue.position !== otherClue.position) {
              this.setErrorStatus(index, ['position'], true);
              this.toastrService.warning(Constants.positionShouldBeSameWhenRowAndColumnIndexsAreSame);
              return;
            }
            //check indexes should be same when position same
            if (currentClue.position === otherClue.position && currentClue.orientation !== otherClue.orientation) {
              if ((otherClue.startx && currentClue.startx && currentClue.startx !== otherClue.startx) && (otherClue.starty && currentClue.starty && currentClue.starty !== otherClue.starty)) {
                this.setErrorStatus(index, ['startx', 'starty'], true);
                this.toastrService.warning(Constants.startingColumnIndexAndStartingRowIndexShouldBeSameWhenPositionsAreSame);
                return;
              }
              if (otherClue.startx && currentClue.startx && currentClue.startx !== otherClue.startx) {
                this.setErrorStatus(index, ['startx'], true);
                this.toastrService.warning(Constants.startingColumnIndexShouldBeSameWhenPositionsAreSame);
                return;
              }
              if (otherClue.starty && currentClue.starty && currentClue.starty !== otherClue.starty) {
                this.setErrorStatus(index, ['starty'], true);
                this.toastrService.warning(Constants.startingRowIndexShouldBeSameWhenPositionsAreSame);
                return;
              }
              if ((otherClue.startx && currentClue.startx && currentClue.startx !== otherClue.startx) && (otherClue.starty && currentClue.starty && currentClue.starty !== otherClue.starty)) {
                this.setErrorStatus(index, ['startx', 'starty'], true);
                this.toastrService.warning(Constants.startingColumnIndexAndStartingRowIndexAlreadyExist);
                return;
              }
            }
            //check limit
            if ((currentClue.startx && otherClue.startx && currentClue.starty && otherClue.starty)) {
              let currentAnswer = currentClue.answer.length;
              if (currentClue.orientation === Constants.across) {
                if (((currentClue.startx - 1) + currentAnswer) > this.puzzleMaxLimit) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(Constants.givenClueDoesNotFitIntoOutLimitation);
                  return;

                }
                else if (!(((currentClue.startx - 1) + currentAnswer) > this.puzzleMaxLimit)) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                }
              }
              else if (currentClue.orientation === Constants.down) {
                if (((currentClue.starty - 1) + currentAnswer) > this.puzzleMaxLimit) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(Constants.givenClueDoesNotFitIntoOutLimitation);
                  return;
                }
                else if (!(((currentClue.starty - 1) + currentAnswer) > this.puzzleMaxLimit)) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                }
              }
              //check overlap
              if (currentClue.orientation === Constants.across && otherClue.orientation === Constants.across && (currentClue.starty === otherClue.starty || currentClue.starty !== otherClue.starty)) {
                if (!(currentClue.starty !== otherClue.starty)) {
                  let checkOverLap = false;
                  if (currentClue.startx > otherClue.startx) {
                    var tempClue = currentClue;
                    currentClue = otherClue;
                    otherClue = tempClue;
                    checkOverLap = true;
                  }
                  else if (currentClue.startx < otherClue.startx) { checkOverLap = true; }
                  else if (currentClue.startx === otherClue.startx) {
                    checkOverLap = false;
                    isOverLap = true;
                  }
                  if (checkOverLap) {
                    if (((currentClue.startx - 1) + (currentClue.answer.length - 1)) < (otherClue.startx - 1)) {
                      isOverLap = false;
                    }
                    else if (((currentClue.startx - 1) + (currentClue.answer.length - 1)) > (otherClue.startx - 1)) {
                      var overLapPoint = ((currentClue.startx - 1) + currentClue.answer.length - 1) - (otherClue.startx - 1);
                      if (currentClue.answer.slice((currentClue.answer.length - 1) - overLapPoint) !== otherClue.answer.slice(0, overLapPoint + 1)) {
                        isOverLap = true;
                      }
                      else {
                        isOverLap = false;
                      }
                    }
                    else {
                      if (currentClue.answer.slice(currentClue.answer.length - 1) !== otherClue.answer.slice(0, 1)) {
                        isOverLap = true;
                      }
                      else {
                        isOverLap = false;
                      }
                    }
                  }
                }
                else {
                  isOverLap = false;
                }
                if (isOverLap) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(`${Constants.currentClue} ${index + 1} ${Constants.overlappingWithClue} ${j + 1}`);
                }
                else {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                  this.setErrorStatus(j, ['startx', 'starty', 'answer'], false);
                }
              }
              if (currentClue.orientation === Constants.down && otherClue.orientation === Constants.down && (currentClue.startx === otherClue.startx || currentClue.startx !== otherClue.startx)) {
                if (!(currentClue.startx !== otherClue.startx)) {
                  let checkOverLap = false;
                  if (currentClue.starty > otherClue.starty) {
                    var tempClue = currentClue;
                    currentClue = otherClue;
                    otherClue = tempClue;
                    checkOverLap = true;
                  }
                  else if (currentClue.starty < otherClue.starty) { checkOverLap = true; }
                  else if (currentClue.starty === otherClue.starty) {
                    checkOverLap = false;
                    isOverLap = true;
                  }
                  if (checkOverLap) {
                    if (((currentClue.starty - 1) + (currentClue.answer.length - 1)) < (otherClue.starty - 1)) {
                      isOverLap = false;
                    }
                    else if (((currentClue.starty - 1) + (currentClue.answer.length - 1)) > (otherClue.starty - 1)) {
                      var overLapPoint = ((currentClue.starty - 1) + currentClue.answer.length - 1) - (otherClue.starty - 1);
                      if (currentClue.answer.slice((currentClue.answer.length - 1) - overLapPoint) !== otherClue.answer.slice(0, overLapPoint + 1)) {
                        isOverLap = true;
                      }
                      else {
                        isOverLap = false;
                      }
                    }
                    else {
                      if (currentClue.answer.slice(currentClue.answer.length - 1) !== otherClue.answer.slice(0, 1)) {
                        isOverLap = true;
                      }
                      else {
                        isOverLap = false;
                      }
                    }

                  }
                }
                else {
                  isOverLap = false;
                }
                if (isOverLap) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(`${Constants.currentClue} ${index + 1} ${Constants.overlappingWithClue} ${j + 1}`);
                }
                else {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                  this.setErrorStatus(j, ['startx', 'starty', 'answer'], false);
                }
              }
            }
          }
          else {
            //check limit
            if ((currentClue.startx && currentClue.starty)) {
              let currentAnswer = currentClue.answer.length;
              if (currentClue.orientation === Constants.across) {
                if (((currentClue.startx - 1) + currentAnswer) > this.puzzleMaxLimit) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(Constants.givenClueDoesNotFitIntoOutLimitation);
                  return;

                }
                else if ((!(((currentClue.startx - 1) + currentAnswer) > this.puzzleMaxLimit))) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                }
              }
              else if (currentClue.orientation === Constants.down) {
                if (((currentClue.starty - 1) + currentAnswer) > this.puzzleMaxLimit) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], true);
                  this.toastrService.warning(Constants.givenClueDoesNotFitIntoOutLimitation);
                  return;
                }
                else if ((!(((currentClue.startx - 1) + currentAnswer) > this.puzzleMaxLimit))) {
                  this.setErrorStatus(index, ['startx', 'starty', 'answer'], false);
                }
              }
            }
          }
        }
      }

      if ((this.questionForm.get("crosswordPuzzle")['controls'][index].get('clue').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('answer').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('position').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('orientation').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('startx').value && this.questionForm.get("crosswordPuzzle")['controls'][index].get('starty').value) && this.crosswordPuzzle.valid) {
        this.puzzleData = [];
        this.puzzleData = this.crosswordPuzzle.value.map(obj => {
          return { ...obj, answerlength: obj.answer.length };
        });
        this.showPuzzle = true;
        buildCrosswordPuzzle(this.puzzleData, '#create-Question-puzzle-wrapper');
      }
    }
  }

  onPuzzleAnswerInput(event: Event, i) {
    const input = event.target as HTMLInputElement;
    if (input.value.includes(' ')) {
      event.preventDefault();
    }
    else {
      input.value = input.value.toLowerCase();
      this.onPuzzleCluesChange(i);
    }
  }

  deleteQuestionLanguages(sectionIndex: number): boolean {
    if (this.isEdit && this.existingCodingLanguage.find(x => x.id === this.questionLanguages.controls[sectionIndex].get('languageId').value)) {
      this.toastrService.warning(Constants.alreadyAddedProgrammingLanguagesCantBeRemoved);
      return false;
    }
    else if (sectionIndex !== -1) {
      this.questionLanguages.removeAt(sectionIndex);
      if (this.questionLanguages.controls.length === 0)
        this.addQuestionLanguages();
      return true;
    }
  }

  deletePuzzle(sectionIndex: number): void {
    this.crosswordPuzzle.removeAt(sectionIndex);
    this.puzzleData = [];
    this.puzzleData = this.crosswordPuzzle.value.map(obj => {
      return { ...obj, answerlength: obj.answer.length };
    });
    if (this.puzzleData.length === 1 && !this.crosswordPuzzle.valid) {
      this.showPuzzle = false;
    }
    buildCrosswordPuzzle(this.puzzleData, '#create-Question-puzzle-wrapper');
  }

  deleteHints(sectionIndex: number): void {
    this.questionHint.removeAt(sectionIndex);
  }

  addQuestionTestCases() {
    this.questionTestCases.push(this.createTestCases());
  }

  addTestCaseTemplateDetails() {
    this.testCaseTemplateDetails.push(this.createTestCaseTemplateDetails());
  }

  addTestCaseTemplateDetailsMFA() {
    this.testCaseTemplateDetails.push(this.createTestCaseTemplateDetailsMFA());
  }

  deleteTestCaseTemplateDetails(index: number): void {
    this.testCaseTemplateDetails.removeAt(index);
  }

  deleteAllTestCaseTemplateDetails(): void {
    this.testCaseTemplateDetails.clear();
  }

  questionsValidationMessages = {
    categoryRequired: Constants.pleaseSelectCategory,
    primarySkillRequired: Constants.pleaseSelectSkill,
    subSkillRequired: Constants.pleaseSelectSubSkill,
    subSubSkillRequired: Constants.pleaseSelectSubSkill2,
    questionTypeRequired: Constants.pleaseSelectQuestionType,
    scoreRequired: Constants.pleaseEnterScore,
    validScoreRequired: Constants.pleaseEnterValidMinAndMaxScore,
    proficiencyRequired: Constants.pleaseSelectProficiency,
    durationRequired: Constants.pleaseEnterDuration,
    durationPattern: Constants.pleaseProvideValidDuration,
    weightRequired: Constants.pleaseEnterWeight,
    questionRequired: Constants.pleaseEnterTheQuestion,
    stackCodingEnvironmentRequired: Constants.stackCodingEnvironmentRequired,
    stackLanguageRequired: Constants.pleaseSelectTheCodingLanguages,
    stackCpuCoreRequired: Constants.pleaseEnterTheCpuCore,
    stackCpuMemoryRequired: Constants.pleaseEnterTheMemorySize,
    stackNoOfTestCasesRequired: Constants.pleaseEnterTheNoOfTestCases,
    stackTestCaseScoreRequired: Constants.pleaseEnterTheScore,
    stackSkuIdRequired: Constants.pleaseEntertheSkuId,
    stackGitUrlRequired: Constants.pleaseEnterTheGitTemplateUrl,
    minValue: Constants.minimumValueShouldBeOne,
    urlPattern: Constants.pleaseEnterValidUrl,
    cpuCoreMaxValue: Constants.maximumValueShouldBeFour,
    memoryMaxValue: Constants.maximumValueShouldBeSixteen,
    selectStackLanguage: Constants.pleaseSelectStackLanguage,
    maximumCount: Constants.maximumValueError,
    instanceMaxValue: Constants.maximumInstanceValueError,
    minimumCount: Constants.minimumValueShouldBeOne,
    stackFolderNameRequired: Constants.pleaseEnterTheFolderName,
    stackFolderNamePattern: Constants.pleaseEnterTheValidFolderName,
    planSizeRequired: Constants.pleaseSelectPlanSize,
    maxInstanceCountRequired: Constants.pleaseEnterMaxInstanceCount,
    scanConfigXml: Constants.pleaseEnterValidXML,
    puzzleQuestionRequired: Constants.pleaseEnterClue,
    puzzleAnswerRequired: Constants.pleaseEnterAnswer,
    puzzlePositionRequired: Constants.pleaseEnterPosition,
    puzzleOrientationrRequired: Constants.pleaseEnterOrientation,
    puzzleStartingColumnIndexRequired: Constants.pleaseEnterStartingColumnIndex,
    puzzleStartingRowIndexRequired: Constants.pleaseEnterStartingRowIndex,
    validValueRequired: Constants.pleaseEnterValidnumber,
    puzzleAnswerWhiteSpace: Constants.pleaseEnterValidAnswerWhiteSpaceAndSpecialCharactersAreNotAllowed,
    puzzleLimitMessage: Constants.maximumLimitWillBeTwenty
  };

  getCategories() {
    this.questionService.getCategories()
      .subscribe(res => {
        if (res && res.result) {
          let sortednames = res.result.sort(Helper.sortString<CategoryDetails>('name'));
          this.categories = sortednames;
        }
        else
          this.toastrService.warning(Constants.categoryNotFound);
      });
  };

  getProficiencies() {
    this.questionService.getProficiencies()
      .subscribe(res => {
        if (res && res.result) {
          this.proficiencies = res.result;
        }
        else
          this.toastrService.warning(Constants.proficiencyNotFound);
      });
  }

  getPlanSize() {
    this.questionService.getPlanSize()
      .subscribe(res => {
        if (res && res.result) {
          this.planSize = res.result;
        }
        else
          this.toastrService.warning(Constants.planSizeNotFound);
      });
  }

  getProficiencyMetaData() {
    this.questionService.getProficiencyMetadata().subscribe(res => {
      if (res && res.result) {
        this.proficiencyMetadata = res.result;
      }
      else
        this.proficiencyMetadata = [];
    });
  }

  getDuration() {
    if (this.questionForm.get('proficiency').value && this.questionForm.get('questionType').value) {
      if (this.appSessionService.tenantId != null && this.questionId == undefined) {
        this.questionForm.get('score').enable();
      }
      // eslint-disable-next-line eqeqeq
      let parentQuestionId = this.questionTypes.find(x => x.id == this.questionForm.get('questionType').value).parentQuestionTypeId;
      // eslint-disable-next-line eqeqeq
      let proficiencyMetadata = this.proficiencyMetadata.find(x => x.proficiencyId == this.questionForm.get('proficiency').value && x.parentQuestionTypeId == parentQuestionId);
      if (!this.isEdit || this.isQuestionUpdateFromQRAdmin) {
        this.questionForm.patchValue({
          duration: proficiencyMetadata.duration,
          score: proficiencyMetadata.score
        });
      }
      if (this.isVirtusaStdTenant || this.isZikshaaTenant || this.isTechavasiTenant) {
          this.questionForm.patchValue({
          duration: proficiencyMetadata.duration,
          score: proficiencyMetadata.score
        });
      }
    }
  }

  getQuestionTypes() {
    this.questionService.getQuestionTypes()
      .subscribe(res => {
        if (res && res.result.length) {
          let sortednames = res.result.sort(Helper.sortString<GetQuestionTypes>('name'));
          this.questionTypes = sortednames;
          if (this.isEdit) {
            this.getQuestion();
          }
        }
        else
          this.toastrService.warning(Constants.questionTypeNotFound);
      });
  }

  getSkills() {
    const allSkills = this.questionService.getAllSkills();
    const categorySkills = this.onReviewerRequest ? this.fetchCategorySkills() : of(null);
  
    combineLatest([allSkills, categorySkills]).subscribe(([allSkillsRes, categorySkillsRes]) => {
      if (allSkillsRes && allSkillsRes.result) {
        this.processAllSkills(allSkillsRes.result);
      } else {
        this.toastrService.warning(Constants.skillsNotFound);
      }
  
      if (categorySkillsRes && categorySkillsRes.result && categorySkillsRes.result.length) {
        this.processCategorySkills(categorySkillsRes.result);
      } else if (this.onReviewerRequest) {
        this.toastrService.warning(Constants.noSkillsFound);
      }
    },
    error => {
      this.toastrService.error(Constants.somethingWentWrong);
    });
  }
  
  fetchCategorySkills(): Observable<any> {
    const data: CategorySkillRequestDto = {
      CategoryIds: this.questionForm.get('category')?.value[0]?.id.join(','),
      QuestionBankScope: QuestionBankScope.TenantRestricted
    };
    return this.questionService.getSkills(data);
  }
  
  processAllSkills(allSkills: any) {
    this.skills = allSkills;
    this.skills.skills.sort(Helper.sortString<Skills>('name'));
    this.primarySkillNames = this.skills.skills.map(c => c.name);
    this.skills.subSkills = this.skills.subSkills.sort(Helper.sortString<SubSkills>('name'));
    this.subSkillNames = this.skills.subSkills.map(c => c.name);
    this.subSkill2Names = [...new Set(this.subSkillNames.concat(this.subSkill2Names))];
  }
  
  processCategorySkills(categorySkills: any[]) {
    this.categorySkills = categorySkills;
    this.questionForm.get('primarySkill')?.value[0]?.id.setValue('');
  }

  getQuestion() {
    if (this.isEdit && (this.isCoding || this.cloud)) {
      this.questionForm.removeControl('crosswordPuzzle');
      this.questionService.getCodingQuestion(this.questionId).subscribe(res => {
        if (res && res.result.length) {
          if (this.isCoding) {
            this.codingQuestion = res.result[0];
            this.displayCodingQuestion();
          }
          else {
            this.cloudQuestion = res.result[0];
            this.displayCloudQuestion();
          }
          this.questionIdNumber = res.result[0].questionIdNumber;
          this.questionForm.patchValue({
            duration: res.result[0].duration,
            score: res.result[0].score
          });
        }
        else {
          this.toastrService.warning(Constants.questionsNotFound);
        }
        //his.displayCodingQuestion();
      });
    }
    else if (this.stack) {
      this.questionService.getStackQuestion(this.questionId).subscribe(res => {
        if (res.success && Object.keys(res.result).length) {
          let stackQuestionDetails: GetStackQuestionDetails = res.result;
          if (stackQuestionDetails.question.questionTypeId !== Constants.puzzleId) {
            this.questionForm.removeControl('crosswordPuzzle');
          }
          let sku = JSON.parse(stackQuestionDetails.stackDetail.sku);
          let testCaseTemplateDetails = JSON.parse(stackQuestionDetails.stackDetail.testCaseDetails);
          var language = [this.stackLanguages.find(x => x.id === stackQuestionDetails.stackDetail.languageId)];
          this.stackId = stackQuestionDetails.stackDetail.id;
          const config = JSON.parse(stackQuestionDetails.question.config);
          if (stackQuestionDetails.stackDetail.instructionDocumentUrl) {
            let fileName = stackQuestionDetails.stackDetail.instructionDocumentUrl?.split('/')[4]?.split('?')[0];
            let file = new File([stackQuestionDetails.stackDetail.instructionDocumentUrl], fileName);
            this.stackInstructions = file;
            this.hasStackInstructions = true;
          }
          this.questionIdNumber = stackQuestionDetails.question.questionIdNumber;
          this.questionForm.patchValue({
            category: [{
              id: stackQuestionDetails.question.categoryId,
              name: stackQuestionDetails.question.category.name
            }],
            primarySkill: [{
              id: stackQuestionDetails.skill.id,
              name: stackQuestionDetails.skill.name
            }],
            subSkill: stackQuestionDetails.subSkill ? stackQuestionDetails.subSkill.name : '',
            subSubSkill: stackQuestionDetails.subSkill2 ? stackQuestionDetails.subSkill2.name : '',
            questionType: this.questionTypes.find(x => x.id === stackQuestionDetails.question.questionTypeId).id,
            proficiency: stackQuestionDetails.question.proficiencyId,
            duration: stackQuestionDetails.question.duration,
            question: stackQuestionDetails.question.questionText,
            score: stackQuestionDetails.question.mark,
            stackCodingEnvironment: this.environmentType.filter(x => x.id === stackQuestionDetails.stackDetail.type),
            stackCodingLanguages: language,
            stackCpuCore: sku.CPUCore,
            stackCpuMemory: sku.MemorySize,
            planSize: sku.PlanSize,
            maxCount: sku.MaxCount,
            skuId: sku.SkuId,
            stackNoOfTestCases: stackQuestionDetails.stackDetail.totalTestCases,
            stackTemplateUrl: stackQuestionDetails.stackDetail.gitTemplateUrl,
            scanConfigXml: stackQuestionDetails.stackDetail.scanConfigXML,
            courseName: config.CourseName,
            moduleName: config.ModuleName
          });
          if (this.environmentType.find(x => x.id === stackQuestionDetails.stackDetail.type).id === EnvironmentType.Container) {
            this.isVMEnvironment = false;
            this.disableVMFields();
          }
          else {
            this.isVMEnvironment = true;
            this.disableContainerFields();
          }
          let i = 0;
          var languageDetails = JSON.parse(language[0].languageConfig);
          if (testCaseTemplateDetails.length === 1)
            this.addTestCaseTemplateDetails();
          else
            this.addTestCaseTemplateDetailsMFA();
          testCaseTemplateDetails.forEach(x => {
            this.testCaseTemplateDetails.at(i).get("stackId").patchValue(x.StackId);
            this.testCaseTemplateDetails.at(i).get("testCaseCount").patchValue(x.TestCaseCount);
            this.testCaseTemplateDetails.at(i).get("score").patchValue(x.Score);
            this.testCaseTemplateDetails.at(i).get("stackFolderName").patchValue(x.StackFolderName);
            this.testCaseTemplateDetails.at(i).get("testCaseHidePath").patchValue(x.TestCaseHidePath);
            this.testCaseTemplateDetails.at(i).get("testCasePath").patchValue(x.TestCasePath);
            this.testCaseTemplateDetails.at(i).get("language").patchValue(languageDetails[i].Language);
            if (testCaseTemplateDetails.length > 1 && i < 1) {
              i++;
              this.addTestCaseTemplateDetailsMFA();
            }
          });
          this.disableMandatoryFields();
          this.disableOptionalFields(config);
          this.isCategoryDisabled = true;
          this.isEnvironmentDisabled = true;
        }
      },
        error => console.error(error));
    }
    else {
      this.questionService.getQuestion(this.questionId).subscribe(res => {
        this.question = res.result;
        this.questionIdNumber = this.question.question.questionIdNumber;
        if (this.question.question.questionTypeId !== Constants.puzzleId) {
          this.questionForm.removeControl('crosswordPuzzle');
        }
        this.displayQuestion();
      });
    }
  }

  displayCloudQuestion() {
    const config = JSON.parse(this.cloudQuestion.config);
    this.onChange();
    this.isShown = true;
    this.questionForm.patchValue({
      category: [{
        id: this.cloudQuestion.categoryId,
        name: this.cloudQuestion.categoryName
      }],
      primarySkill: [{
        id: this.cloudQuestion.skillId,
        name: this.cloudQuestion.skillName
      }],
      subSkill: this.cloudQuestion.subSkillName ? this.cloudQuestion.subSkillName : '',
      subSubSkill: this.cloudQuestion.subSkill2Name ? this.cloudQuestion.subSkill2Name : '',
      questionType: this.questionTypes.find(x => x.id === this.cloudQuestion.questionTypeId).id,
      proficiency: this.cloudQuestion.proficiencyId,
      duration: this.cloudQuestion.duration,
      score: this.cloudQuestion.score,
      question: this.cloudQuestion.questionText,
      courseName: config.CourseName,
      moduleName: config.ModuleName
    });
    this.disableMandatoryFields();
    this.disableOptionalFields(config);
    this.isCategoryDisabled = true;
    this.testCaseDetails = this.cloudQuestion.testCases;
    this.onLoadValue = this.questionForm.value;
    if (this.testCaseDetails.length > 0)
      this.questionForm.get('sortOrder').disable();
    if (this.testCaseDetails.find(x => x.sortOrder !== null && x.sortOrder > 0)) {
      this.questionForm.get('sortOrder').setValue(true);
    }
  }

  displayCodingQuestion() {
    const config = JSON.parse(this.codingQuestion.config);
    this.onChange();
    this.isShown = true;
    this.questionForm.patchValue({
      category: [{
        id: this.codingQuestion.categoryId,
        name: this.codingQuestion.categoryName
      }],
      primarySkill: [{
        id: this.codingQuestion.skillId,
        name: this.codingQuestion.skillName
      }],
      subSkill: this.codingQuestion.subSkillName ? this.codingQuestion.subSkillName : '',
      subSubSkill: this.codingQuestion.subSkill2Name ? this.codingQuestion.subSkill2Name : '',
      questionType: this.questionTypes.find(x => x.id === this.codingQuestion.questionTypeId).id,
      proficiency: this.codingQuestion.proficiencyId,
      duration: this.codingQuestion.duration,
      score: this.codingQuestion.score,
      question: this.codingQuestion.questionText,
      courseName: config.CourseName,
      moduleName: config.ModuleName
    });
    this.disableMandatoryFields();
    this.disableOptionalFields(config);
    this.isCategoryDisabled = true;
    this.testCaseDetails = this.codingQuestion.testCases;
    let i = 0;
    this.codingQuestion.questionLanguages.forEach(value => {
      this.selectedCodingLanguages.push(this.codingLanguages.find(x => x.id === value.languageId));
      i === 0 ? '' : this.addQuestionLanguages();
      this.questionLanguages.at(i).get("languageId").patchValue(value.languageId);
      this.questionLanguages.at(i).get("defaultCode").patchValue(value.defaultCode);
      this.questionLanguages.at(i).get("questionId").patchValue(value.questionId);
      this.questionLanguages.at(i).get("languageId").disable();
      i++;
    });

    this.codingLanguages.forEach(language => {
      if (this.selectedCodingLanguages.find(x => x.id === language.id))
        this.existingCodingLanguage.push(language);
    });
    this.choosenCodingLanguages = [...this.existingCodingLanguage];
    this.isHtmlCssSelected = this.choosenCodingLanguages.some(item => item.language === this.htmlCssLanguage);
    this.customDropDownSettings();
    this.onLoadValue = this.questionForm.value;
  }

  displayQuestion() {
    const config = JSON.parse(this.question.question.config);
    if (this.onReviewerRequest) {
      this.existingPrimarySkill = [{
        id: this.question.skill.id,
        name: this.question.skill.name
      }];
      this.existingSubSkill = this.question.subSkill ? this.question.subSkill.name : '';
      this.existingSubSubSkil = this.question.subSkill2 ? this.question.subSkill2.name : '',
        this.existingProficiency = this.question.question.proficiencyId;
    }
    this.questionForm.patchValue({
      category: [{
        id: this.question.question.category.id,
        name: this.question.question.category.name
      }],
      primarySkill: [{
        id: this.question.skill.id,
        name: this.question.skill.name
      }],
      subSkill: this.question.subSkill.name ? this.question.subSkill.name : '',
      subSubSkill: this.question.subSkill2 ? this.question.subSkill2.name : '',
      questionType: this.questionTypes.find(x => x.id === this.question.question.questionTypeId).id,
      proficiency: this.question.question.proficiencyId,
      duration: this.question.question.duration,
      score: this.question.question.mark,
      // weight: this.question.question.weight,
      question: this.question.question.questionText,
      courseName: config.CourseName,
      moduleName: config.ModuleName
    });
    this.disableMandatoryFields();
    this.disableOptionalFields(config);
    this.isCategoryDisabled = true;
    this.isEnvironmentDisabled = true;
    let i = 0;
    this.question.questionHints.forEach(value => {
      i === 0 ? '' : this.addHint();
      this.questionHint.at(i).get("id").patchValue(value.questionId);
      this.questionHint.at(i).get("hint").patchValue(value.description);
      i++;
    });
    this.onChange();
    if (this.fib || this.ots) {
      let i = 1;
      this.question.question.answers.forEach(value => {
        let name = "fibController.question" + i;
        this.questionForm.get(name).patchValue(value);
        i++;
      });
    }
    if (this.ots) {
      let i = 1;
      this.question.question.answers.forEach(value => {
        let name = "fibController.question" + i;
        this.questionForm.get(name).patchValue(value);
        i++;
      });
    }
    if (this.sfdd || this.dragAndDrop) {
      let i = 1;
      this.question.question.choices.forEach(value => {
        let name = "fibController.question" + i;
        this.questionForm.get(name).patchValue(value);
        i++;
      });
    }
    if (this.mcq) {
      this.answerIndex = [];
      let i = 1;
      this.question.question.choices.forEach(value => {
        let name = "mcqController.question" + i;
        this.questionForm.get(name).patchValue(value);
        let answer = this.question.question.answers.find(x => x === value);
        if (answer) {
          this.answerIndex.push(this.question.question.choices.indexOf(value));
        }
        i++;
      });
      this.answerIndex.forEach(index => {
        let name = "mcqController.checkbox" + (index + 1);
        this.questionForm.get(name).patchValue("true");
      });
    }
    if (this.mtf) {
      let i = 1;
      this.question.question.answers.forEach(value => {
        let data = value.split("-", 2);
        let question = "mtfController.question" + i;
        this.questionForm.get(question).patchValue(data[0]);
        let answer = "mtfController.answer" + i;
        this.questionForm.get(answer).patchValue(data[1]);
        i++;
      });
    }
    if (this.tof) {
      if (this.question.question.answers[0].toLowerCase() === Constants.trueLabel.toLowerCase()) {
        this.tofTrue = true;
      }
      else {
        this.tofFalse = true;
      }
    }
    if (this.sub) {
      let rubrixUrl = this.question.question.rubrixUrl;
      if (rubrixUrl) {
        let fileName = rubrixUrl?.split('/')[4]?.split('?')[0];
        let file = new File([rubrixUrl], fileName);
        this.rubrixFile = file;
      }

      if (this.question.question.choices[0].toLowerCase() === Constants.textAreaLabel.toLowerCase()) {
        this.subTextArea = true;
      }
      else {
        this.subFileUpload = true;
      }
    }
    if (this.puzzle) {
      let questionChoice = JSON.parse(this.question.question.choices[0]);
      let questionAnswer = JSON.parse(this.question.question.answers[0]);
      i = 0;
      questionChoice.forEach(choice => {
        i === 0 ? '' : this.addPuzzleQuestion();
        this.crosswordPuzzle.at(i).get("clue").patchValue(choice.clue);
        this.crosswordPuzzle.at(i).get("position").patchValue(choice.position);
        this.crosswordPuzzle.at(i).get("orientation").patchValue(choice.orientation);
        this.crosswordPuzzle.at(i).get("startx").patchValue(choice.startx);
        this.crosswordPuzzle.at(i).get("starty").patchValue(choice.starty);
        i++;
      });
      let j = 0;
      questionAnswer.forEach(answer => {
        this.crosswordPuzzle.at(j).get("answer").patchValue(answer.answer);
        j++;
      });

      this.showPuzzle = true;
      this.puzzleData = this.crosswordPuzzle.value.map(obj => {
        return { ...obj, answerlength: obj.answer.length };
      });
      buildCrosswordPuzzle(this.puzzleData, '#create-Question-puzzle-wrapper');
    }
    this.onLoadValue = this.questionForm.value;
  }


  checkTof(value) {
    this.tofTrue = false;
    this.tofFalse = false;
    this.tofAnswer = value;
  }

  checkSub(value) {
    this.subTextArea = false;
    this.subFileUpload = false;
    this.subAnswers = value;
  }

  answerCheckEnabled(event, id) {
    this.answer = event.target.value;
    if (!this.answer) {
      let element = <HTMLInputElement>document.getElementById(id);
      element.checked = false;
    }
  }

  getAllCompilerLanguages() {
    this.questionService.getAllCompilerLanguages().subscribe(res => {
      // let htmlIndex = res.result.findIndex(x => x.language === this.constants.htmlCss);
      // res.result.splice(htmlIndex, 1);
      let sortednames = res.result.sort(Helper.sortString<CompilerLanguages>('language'));
      this.codingLanguages = sortednames;
    });
  }

  save() {
    this.isFormSubmitTriggered = true;
    this.choices = [];
    this.answers = [];
    this.matchAnswers = [];
    this.matchQuestions = [];

    if (this.puzzle) {
      if (this.questionForm.get('crosswordPuzzle')['controls'].length >= 1) {
        this.questionForm.get('crosswordPuzzle')['controls'].forEach(puzzleData => {
          let puzzleQuestions: PuzzleChoiceData = {
            clue: puzzleData.value.clue.trim(),
            position: puzzleData.value.position,
            orientation: puzzleData.value.orientation,
            startx: puzzleData.value.startx,
            starty: puzzleData.value.starty,
            answerlength: puzzleData.value.answer.length
          };
          this.puzzleChoices = JSON.stringify(puzzleQuestions);
          this.choices.push(this.puzzleChoices);

          let puzzleAnswer: PuzzleAnswerData = {
            answer: puzzleData.value.answer.trim(),
            position: puzzleData.value.position,
            orientation: puzzleData.value.orientation,
          };
          this.puzzleAnswer = JSON.stringify(puzzleAnswer);
          this.answers.push(this.puzzleAnswer);
        });
      }
      else {
        this.toastrService.error(Constants.pleaseProvideCluesForQuestionCreation);
        return;
      }
    }
    if (this.coding) {
      if (this.choosenCodingLanguages.length < 1) {
        this.toastrService.warning(Constants.pleaseSelectTheCodingLanguages);
        return;
      }
      if (this.testCaseDetails.length < 1) {
        this.toastrService.warning(Constants.pleaseAddTestCase);
        return;
      }

      this.codingLanguageDetails = [];
      this.questionForm.get('questionLanguages')['controls'].forEach(questionLanguage => {
        let languageId = Number(questionLanguage.get('languageId').value);
        if (languageId) {
          let data: QuestionLanguages = {
            languageId: languageId,
            defaultCode: questionLanguage.get('defaultCode').value,
            questionId: this.isEdit ? this.questionId : 0,
            id: questionLanguage.get('id').value
          };
          this.codingLanguageDetails.push(data);
        }
      });
      if (this.codingLanguageDetails.find(cl => cl.languageId === this.codingLanguages.find(x => x.language === Constants.sql).id)) {
        if (this.codingLanguageDetails.length > 1) {
          this.toastrService.warning(Constants.multipleProgrammingLanguageWillNotBeSupportedIfSqlLanguageIsChoosen);
          return;
        }
        if (this.testCaseDetails.length > 1) {
          this.toastrService.warning(Constants.sqlbasedQuestionsShouldHaveOnlyOneTestCase);
          return;
        }
      }
      else if (this.codingLanguageDetails.find(cl => cl.languageId === this.codingLanguages.find(x => x.language === Constants.mongoDb)?.id)) {
        if (this.codingLanguageDetails.length > 1) {
          this.toastrService.warning(Constants.multipleProgrammingLanguageWillNotBeSupportedIfMongoDbLanguageIsChoosen);
          return;
        }
        if (this.testCaseDetails.length > 1) {
          this.toastrService.warning(Constants.mongoDbbasedQuestionsShouldHaveOnlyOneTestCase);
          return;
        }
      }
    }
    else if (this.cloud) {
      if (this.isSortOrderEnabled) {
        let isValid = true;
        this.testCaseDetails.forEach(item => {
          if (item.sortOrder || item.sortOrder === 0) {
          } else {

            isValid = false;
            return;
          }

        }

        );
        if (!isValid) {
          this.toastrService.error(this.constants.pleaseAddSortOrderValue);
          return;
        }
      }

      if (this.testCaseDetails.length < 1) {
        this.toastrService.warning(Constants.pleaseAddTestCase);
        return;
      }

      // eslint-disable-next-line eqeqeq
      if (this.codingLanguageDetails.find(cl => cl.languageId === this.codingLanguages.find(x => x.language === Constants.sql).id)) {
        if (this.codingLanguageDetails.length > 1) {
          this.toastrService.warning(Constants.multipleProgrammingLanguageWillNotBeSupportedIfSqlLanguageIsChoosen);
          return;
        }
        if (this.testCaseDetails.length > 1) {
          this.toastrService.warning(Constants.sqlbasedQuestionsShouldHaveOnlyOneTestCase);
          return;
        }
      }
      else if (this.codingLanguageDetails.find(cl => cl.languageId === this.codingLanguages.find(x => x.language === Constants.mongoDb)?.id)) {
        if (this.codingLanguageDetails.length > 1) {
          this.toastrService.warning(Constants.multipleProgrammingLanguageWillNotBeSupportedIfMongoDbLanguageIsChoosen);
          return;
        }
        if (this.testCaseDetails.length > 1) {
          this.toastrService.warning(Constants.mongoDbbasedQuestionsShouldHaveOnlyOneTestCase);
          return;
        }
      }
    }
    else if (this.mcq) {
      this.answerIndex = [];
      if (this.questionForm.get('mcqController.question1').value && this.questionForm.get('mcqController.question1').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question1').value);
        if (this.questionForm.get('mcqController.checkbox1').value)
          this.answerIndex.push(0);
      }
      else if (this.mtf)
        this.matchQuestions.push("");

      if (this.questionForm.get('mcqController.question2').value && this.questionForm.get('mcqController.question2').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question2').value);
        if (this.questionForm.get('mcqController.checkbox2').value)
          this.answerIndex.push(1);
      }

      if (this.questionForm.get('mcqController.question3').value && this.questionForm.get('mcqController.question3').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question3').value);
        if (this.questionForm.get('mcqController.checkbox3').value)
          this.answerIndex.push(2);
      }

      if (this.questionForm.get('mcqController.question4').value && this.questionForm.get('mcqController.question4').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question4').value);
        if (this.questionForm.get('mcqController.checkbox4').value)
          this.answerIndex.push(3);
      }

      if (this.questionForm.get('mcqController.question5').value && this.questionForm.get('mcqController.question5').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question5').value);
        if (this.questionForm.get('mcqController.checkbox5').value)
          this.answerIndex.push(4);
      }

      if (this.questionForm.get('mcqController.question6').value && this.questionForm.get('mcqController.question6').value.length) {
        this.choices.push(this.questionForm.get('mcqController.question6').value);
        if (this.questionForm.get('mcqController.checkbox6').value)
          this.answerIndex.push(5);
      }
    }
    else if (this.fib || this.ots || this.sfdd || this.dragAndDrop) {
      if (this.questionForm.get('fibController.question1').value && this.questionForm.get('fibController.question1').value.length) {
        this.choices.push(this.questionForm.get('fibController.question1').value);
      }

      if (this.questionForm.get('fibController.question2').value && this.questionForm.get('fibController.question2').value.length) {
        this.choices.push(this.questionForm.get('fibController.question2').value);
      }

      if (this.questionForm.get('fibController.question3').value && this.questionForm.get('fibController.question3').value.length) {
        this.choices.push(this.questionForm.get('fibController.question3').value);
      }

      if (this.questionForm.get('fibController.question4').value && this.questionForm.get('fibController.question4').value.length) {
        this.choices.push(this.questionForm.get('fibController.question4').value);
      }

      if (this.questionForm.get('fibController.question5').value && this.questionForm.get('fibController.question5').value.length) {
        this.choices.push(this.questionForm.get('fibController.question5').value);
      }

      if (this.questionForm.get('fibController.question6').value && this.questionForm.get('fibController.question6').value.length) {
        this.choices.push(this.questionForm.get('fibController.question6').value);
      }

      if (this.fib) {
        let choicesLength = this.choices.length;
        let regExp = /{{(\d+)}}/g;
        let inputCount = (this.questionForm.value.question.match(regExp) || []).length;
        if (inputCount !== choicesLength) {
          this.toastrService.error(this.constants.mismatchOfBlanksInQuestionWithTheAnswerOptionsPleaseCheck);
          return;
        }
        for (let i = 0; i < choicesLength; i++) {
          if (!this.questionForm.value.question.includes(`{{${i}}}`) || (this.questionForm.value.question.split(`{{${i}}}`).length - 1) > 1) {
            this.toastrService.error(this.constants.mismatchOfBlanksInQuestionWithTheAnswerOptionsPleaseCheck);
            return;
          }
        }
      }

      if ((this.ots || this.sfdd || this.dragAndDrop) && this.choices.length > 0) {
        let choiceValid: boolean = true;
        let duplicateCheck: boolean = true;
        this.choices.forEach(x => {
          if (x.trim() === '' || null) {
            choiceValid = false;
          }
        });
        if (!choiceValid) {
          this.toastrService.error(this.constants.answerCannotBeEmpty);
          return;
        }

        for (let i of this.choices) {
          if (this.choices.filter(x => x === i).length > 1) {
            duplicateCheck = false;
          }
        }
        if (!duplicateCheck) {
          this.toastrService.error(this.constants.removeDuplicateAnswers);
          return;
        }
      }
    }

    if (this.mcq || this.fib || this.ots || this.sfdd || this.dragAndDrop) {
      if (this.choices.length >= 2 && this.answerIndex.length >= 1 && this.mcq || this.choices.length >= 2 && this.answerIndex.length > 1 && this.isEdit) {
        this.isOptionChecked = false;
        this.isOptionNotEmpty = false;
        this.isMcqSameChoice = false;
        this.choices.forEach(choice => {
          let value = this.choices.filter(x => x === choice);
          if (value && value.length > 1) {
            this.isMcqSameChoice = true;
            this.toastrService.warning(Constants.kindlyValidateSameAnswers);
          }
        });
        if (!this.isMcqSameChoice)
          this.createQuestion();
      }
      else if ((this.choices.length >= 1 && (this.fib || this.dragAndDrop)) || (this.choices.length >= 2 && (this.ots || this.sfdd))) {
        this.isOptionChecked = false;
        this.isOptionNotEmpty = false;
        if (this.sfdd || this.dragAndDrop) {
          let qnText = this.questionForm.value.question;
          if (qnText.length > 1) {
            if (qnText.split('{{0}}').length > 1 || qnText.split('{{}}').length > 1) {
              this.toastrService.error(this.constants.pleaseCheckTheQuestionAnswerValidationErrorOccurred);
              return;
            }
            let isValidQuestion = true;
            let maxChoices = 6;
            for (let choiceInd = this.choices.length; choiceInd < maxChoices; choiceInd++) {
              if (qnText.split(`{{${choiceInd + 1}}`).length > 1) {
                isValidQuestion = false;
                break;
              }
            }
            if (!isValidQuestion || !this.optionQnValidation(qnText)) {
              this.toastrService.error(this.constants.pleaseCheckTheQuestionAnswerValidationErrorOccurred);
              return;
            }
          }
          let correctAnswers = [];
          let qnLength = qnText.length;
          let choiceLength = this.choices.length;
          for (let ch = 1; ch <= choiceLength; ch++) {
            let splitKey = '{{' + ch + '}}';
            for (let i = 0; i < qnLength;) {
              let ind = qnText.indexOf(splitKey, i);
              if (ind === -1)
                break;
              i = ind + 1;
              correctAnswers.push({ index: ind, answer: this.choices[ch - 1] });
            }
          }
          correctAnswers = correctAnswers.sort((a, b) => (a.index < b.index) ? -1 : 1);
          if (correctAnswers?.map(x => x.answer)?.length > 0) {
            this.answers = correctAnswers.map(x => x.answer);
            this.createQuestion();
          }
          else {
            this.toastrService.error(this.constants.pleaseCheckTheQuestionAnswerValidationErrorOccurred);
          }
        }
        else if (this.ots || this.fib) {
          this.createQuestion();
        }
      }
      else if (this.choices.length < 2 && this.mcq || (this.choices.length < 1 && (this.fib || this.dragAndDrop)) || (this.choices.length < 2 && (this.ots || this.sfdd))) {
        this.isOptionNotEmpty = true;
        this.toastrService.warning(Constants.pleaseEnterRequiredField);
      }
      else {
        this.isOptionNotEmpty = false;
        this.isOptionChecked = true;
        this.toastrService.warning(Constants.pleaseEnterRequiredField);
      }
    }

    if (this.mtf) {
      if (this.questionForm.get('mtfController.question1').value && this.questionForm.get('mtfController.question1').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question1').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.question2').value && this.questionForm.get('mtfController.question2').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question2').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.question3').value && this.questionForm.get('mtfController.question3').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question3').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.question4').value && this.questionForm.get('mtfController.question4').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question4').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.question5').value && this.questionForm.get('mtfController.question5').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question5').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.question6').value && this.questionForm.get('mtfController.question6').value.length) {
        this.matchQuestions.push(this.questionForm.get('mtfController.question6').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.answer1').value && this.questionForm.get('mtfController.answer1').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer1').value);
      }
      else
        this.matchQuestions.push("");
      if (this.questionForm.get('mtfController.answer2').value && this.questionForm.get('mtfController.answer2').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer2').value);
      }
      else
        this.matchAnswers.push("");
      if (this.questionForm.get('mtfController.answer3').value && this.questionForm.get('mtfController.answer3').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer3').value);
      }
      else
        this.matchAnswers.push("");
      if (this.questionForm.get('mtfController.answer4').value && this.questionForm.get('mtfController.answer4').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer4').value);
      }
      else
        this.matchAnswers.push("");
      if (this.questionForm.get('mtfController.answer5').value && this.questionForm.get('mtfController.answer5').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer5').value);
      }
      else
        this.matchAnswers.push("");
      if (this.questionForm.get('mtfController.answer6').value && this.questionForm.get('mtfController.answer6').value.length) {
        this.matchAnswers.push(this.questionForm.get('mtfController.answer6').value);
      }
      else
        this.matchAnswers.push("");
      const i = this.matchQuestions.filter(value => value).length;
      let j = 0;
      this.matchResult = true;
      this.matchQuestions.forEach(x => {
        if (!(this.matchQuestions[j] === '' && this.matchAnswers[j] === '') && (this.matchQuestions[j] === '' || this.matchAnswers[j] === '')) {
          this.matchResult = false;
        }
        j++;
      });

      if (this.matchResult && i > 1) {
        this.matcherror = false;
        this.isOptionNotEmpty = false;
        this.createQuestion();
      }
      else if (i <= 1) {
        this.isOptionNotEmpty = true;
        this.matcherror = false;
        this.toastrService.warning(Constants.pleaseEnterRequiredField);
      }
      else {
        this.matcherror = true;
        this.isOptionNotEmpty = false;
        this.toastrService.warning(Constants.pleaseEnterRequiredField);
      }
    }
    if (this.tof || this.sub || this.coding || this.cloud) {
      this.createQuestion();
    }

    if (this.puzzle) {
      this.createQuestion();
    }

    // Stack
    if (this.stack) {
      if (this.questionForm.valid) {
        if ((this.stackInstructions && this.isVMEnvironment) || !this.isVMEnvironment) {
          let details = this.questionForm.get("testCaseTemplateDetails").value;
          details.forEach(x => {
            let data = {
              stackId: x.stackId,
              testCaseCount: x.testCaseCount,
              score: x.score,
              stackFolderName: x.stackFolderName,
              testCaseHidePath: x.testCaseHidePath,
              testCasePath: x.testCasePath
            };
            this.stackTotalScore += x.score;
            this.stackTestCaseDetails.push(data);
          });
          const formData = new FormData();

          let stackDetails: StackQuestionDetails = {
            questionId: this.isEdit ? this.questionId : 0,
            questionText: this.questionForm.controls.question.value,
            categoryId: this.questionForm.get('category')?.value[0]?.id,
            skillId: this.questionForm.get('primarySkill')?.value[0]?.id,
            subSkillName: this.questionForm.controls.subSkill.value,
            subSkill2Name: this.questionForm.controls.subSubSkill.value,
            questionTypeId: this.questionForm.controls.questionType.value,
            proficiencyId: this.questionForm.controls.proficiency.value,
            duration: this.questionForm.controls.duration.value,
            score: this.questionForm.controls.score.value,
            createStackDetails: {
              id: this.isEdit ? this.stackId : 0,
              cpuCore: this.questionForm.controls.stackCpuCore.value !== "" ? this.questionForm.controls.stackCpuCore.value : 0,
              memorySize: this.questionForm.controls.stackCpuMemory.value !== "" ? this.questionForm.controls.stackCpuMemory.value : 0,
              skuId: this.questionForm.controls.skuId.value,
              gitTemplateUrl: this.questionForm.controls.stackTemplateUrl.value,
              scanConfigXML: this.isNullOrEmpty(this.questionForm.controls.scanConfigXml.value) ? null : this.questionForm.controls.scanConfigXml.value,
              languageId: this.questionForm.controls.stackCodingLanguages.value.map(x => x.id)[0],
              questionId: this.isEdit ? this.questionId : 0,
              TestCaseDetails: this.stackTestCaseDetails,
              score: this.stackTotalScore,
              planSize: this.questionForm.controls.planSize.value !== "" ? this.questionForm.controls.planSize.value : 0,
              maxCount: this.questionForm.controls.maxCount.value !== "" ? this.questionForm.controls.maxCount.value : 0,
              environmentType: this.questionForm.controls.stackCodingEnvironment.value[0].name === this.constants.Container ? EnvironmentType.Container : EnvironmentType.VirtualMachine
            },
            courseName: this.questionForm.controls.courseName.value,
            moduleName: this.questionForm.controls.moduleName.value,
            tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : 'IIHT'
          };
          if (this.stackInstructions) {
            if (!this.stackInstructions.type) {
              formData.append('File', null);
            }
            else {
              formData.append('File', this.stackInstructions, this.stackInstructions.name);
            }
          }
          else {
            formData.append('File', null);
          }
          formData.append('Input', JSON.stringify(stackDetails));

          if (this.questionForm.controls.scanConfigXml.value && this.questionForm.controls.scanConfigXml.value.trim()) {
            this.validateXMLAndCreateOrUpdateStackQuestion(this.questionForm.controls.scanConfigXml.value, formData);
          } else {
            this.createOrUpdateStackQuestion(formData);
          }
        }
        else {
          if (this.isVMEnvironment) {
            this.toastrService.error(Constants.pleaseUploadStackInstructions);
          }
        }
      }
      else {
        this.toastrService.error(Constants.pleaseEnterRequiredField);
      }
    }
  }

  createOrUpdateStackQuestion(formData: FormData) {
    this.questionService.createUpdateStackQuestions(formData).subscribe(res => {
      if (res.success && res.result) {
        if (this.isEdit) {
          this.toastrService.success(Constants.questionsUpdatedSuccessfully);
          let encodedData = this._utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
          if (encodedData) {
            this.navigateToQuestionsListPage(encodedData);
          } else {
            this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
          }
        }
        else {
          this.toastrService.success(Constants.questionCreateSuccessful);
          this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
        }
      }
      else {
        this.isEdit ? this.toastrService.warning(Constants.questionUpdateFailed) : this.toastrService.warning(Constants.questionCreationFailed);
      }
    },
      error => console.error(error));
  }

  createQuestion() {
    if (!this.isSortOrderEnabled || !this.cloud) {

      this.testCaseDetails.forEach(item => {
        item.sortOrder = 0;
      });

    }
    let questionHints: QuestionHint[] = [];
    if (this.mcq) {
      this.answers = [];
      this.answerIndex.forEach(index => {
        this.answers.push(this.choices[index]);
      });
    }
    if (this.fib) {
      this.answers = [];
      this.answers = this.choices;
      this.choices = [];
    }
    if (this.ots) {
      this.answers = [];
      this.answers = this.choices;
      this.choices = _.shuffle(this.choices);
    }
    if (this.sfdd || this.dragAndDrop) {
      this.choices = this.choices;
    }
    if (this.mtf) {
      this.choices = [];
      this.matchQuestions = this.matchQuestions.filter(x => x !== '');
      this.matchAnswers = this.matchAnswers.filter(x => x !== '');
      let i = 0;
      this.matchQuestions.forEach(x => {
        this.answers.push(this.matchQuestions[i] + "-" + this.matchAnswers[i]);
        i++;
      });
      this.matchAnswers = _.shuffle(this.matchAnswers);
      this.choices.concat(this.matchAnswers);
      let values = (this.matchQuestions.filter(x => x !== '')).concat(this.matchAnswers.filter(x => x !== ''));
      this.choices = values;
    }
    if (this.tof) {
      this.choices = [];
      this.answers = [];
      if (this.tofTrue)
        this.tofAnswer = true;
      if (this.tofFalse)
        this.tofAnswer = false;
      this.answers.push(this.tofAnswer.toString());
    }
    if (this.sub) {
      this.choices = [];
      this.answers = [];
      let answer;
      if (this.subAnswers === true) {
        answer = Constants.textAreaLabel;
      }
      else {
        answer = Constants.fileUploadLabel;
      }
      this.choices.push(answer);
    }

    if (!this.onReviewerRequest && (this.existingProficiency !== this.questionForm.get('proficiency').value || this.existingSubSkill !== this.questionForm.get('subSkill').value || this.existingPrimarySkill[0].id !== this.questionForm.get('primarySkill')?.value[0]?.id || this.existingSubSubSkil !== this.questionForm.get('subSubSkill')?.value)) {
      // this.isEdit = false;
      this.questionForm.value.questionHint.forEach(value => {
        let questionHintDto: QuestionHint = {
          id: 0,
          questionHint: value.hint
        };
        questionHints.push(questionHintDto);
      });
    }
    else {
      this.questionForm.value.questionHint.forEach(value => {
        let questionHintDto: QuestionHint = {
          id: value.id,
          questionHint: value.hint
        };
        questionHints.push(questionHintDto);
      });
    }
    if (this.questionForm.valid) {
      const formData = new FormData();
      if (this.isEdit && (this.isCoding || this.cloud)) {
        if (this.isCoding) {
          this.updateCodingQuestionDto = {
            questionId: this.codingQuestion.questionId,
            categoryId: this.questionForm.get('category')?.value[0]?.id,
            skillId: this.questionForm.get('primarySkill')?.value[0]?.id,
            subSkillName: this.questionForm.get('subSkill').value,
            subSkill2Name: this.questionForm.get('subSubSkill').value,
            questionTypeId: this.questionForm.get('questionType').value,
            proficiencyId: this.questionForm.get('proficiency').value,
            duration: this.questionForm.get('duration').value,
            score: this.questionForm.get('score').value,
            questionText: this.questionForm.value.question,//.replace(/<p>/gi, '<p style=margin-bottom:0px;>'),
            testCases: this.testCaseDetails,
            questionLanguages: this.codingLanguageDetails,
            courseName: this.questionForm.get('courseName').value || "",
            moduleName: this.questionForm.get('moduleName').value || "",
            tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : this.constants.iiht
          };
        }
        else {
          this.updateCodingQuestionDto = {
            questionId: this.cloudQuestion.questionId,
            categoryId: this.questionForm.get('category')?.value[0]?.id,
            skillId: this.questionForm.get('primarySkill')?.value[0]?.id,
            subSkillName: this.questionForm.get('subSkill').value,
            subSkill2Name: this.questionForm.get('subSubSkill').value,
            questionTypeId: this.questionForm.get('questionType').value,
            proficiencyId: this.questionForm.get('proficiency').value,
            duration: this.questionForm.get('duration').value,
            score: this.questionForm.get('score').value,
            questionText: this.questionForm.value.question,
            testCases: this.testCaseDetails,
            questionLanguages: this.codingLanguageDetails,
            courseName: this.questionForm.get('courseName').value || "",
            moduleName: this.questionForm.get('moduleName').value || "",
            tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : 'IIHT'
          };
        }
        this.questionService.updateCodingQuestion(this.updateCodingQuestionDto).subscribe(res => {
          if (res.result) {
            this.toastrService.success(Constants.questionUpdateSuccessful);
            if (this.isEdit) {
              let encodedData = this._utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
              if (encodedData) {
                this.navigateToQuestionsListPage(encodedData);
              } else {
                this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
              }
            }
            else {
              this.router.navigate(['../../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
            }
          }
          else
            this.toastrService.warning(Constants.questionUpdateFailed);
        });
      }
      else if (this.coding || this.cloud) {
        this.createCodingQuestionDto = {
          categoryId: this.questionForm.value.category[0]?.id,
          skillId: this.questionForm.value.primarySkill[0]?.id,
          subSkillName: this.questionForm.value.subSkill,
          subSkill2Name: this.questionForm.value.subSubSkill,
          questionTypeId: this.questionForm.value.questionType,
          proficiencyId: this.questionForm.value.proficiency,
          duration: this.questionForm.get('duration').value,
          score: this.questionForm.get('score').value,
          questionText: this.questionForm.value.question,//.replace(/<p>/gi, '<p style=margin-bottom:0px;>'),
          testCases: this.testCaseDetails,
          questionLanguages: this.codingLanguageDetails,
          courseName: this.questionForm.value.courseName,
          moduleName: this.questionForm.value.moduleName,
          tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : 'IIHT'
        };
        this.questionService.createCodingQuestion(this.createCodingQuestionDto)
          .subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.questionCreateSuccessful);
              this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
            }
            else
              this.toastrService.warning(Constants.questionCreationFailed);
          });
      }
      else if (this.isEdit && !this.isCoding) {
        this.updateQuestionDto = {
          questionId: this.questionId,
          categoryId: this.questionForm.get('category')?.value[0]?.id,
          skillId: this.questionForm.get('primarySkill')?.value[0]?.id,
          subSkillName: this.questionForm.get('subSkill').value,
          subSkill2Name: this.questionForm.get('subSubSkill').value,
          questionTypeId: this.questionForm.get('questionType').value,
          proficiencyId: this.questionForm.get('proficiency').value,
          duration: this.questionForm.get('duration').value,
          mark: this.questionForm.get('score').value,
          weight: this.questionForm.value.weight,
          choices: this.choices.filter(x => x !== '' && x !== undefined && x !== '-'),
          answers: this.sub ? this.choices : this.answers.filter(x => x !== '-' && x !== undefined),
          questionText: this.questionForm.value.question,//.replace(/<p>/gi, '<p style=margin-bottom:0px;>'),
          questionHints: questionHints,
          courseName: this.questionForm.get('courseName').value || "",
          moduleName: this.questionForm.get('moduleName').value || "",
          tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : 'IIHT',
          isRubrixRemoved: this.rubrixFile ? false : true
        };

        if (this.rubrixFile) {
          if (!this.rubrixFile.type) {
            formData.append('File', null);
          }
          else {
            formData.append('File', this.rubrixFile, this.rubrixFile.name);
          }
        }
        else {
          formData.append('File', null);
        }
        formData.append('Input', JSON.stringify(this.updateQuestionDto));
        if (this.isQuestionUpdateFromQRAdmin) {
          formData.append('AssessmentId', this.assessmentId.toString());
          formData.append('AssessmentSectionId', this.assessmentSectionId.toString());
          formData.append('AssessmentSectionSkillId', this.assessmentSectionSkillId.toString());
          this.questionService.updateReviewedQuestion(formData).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.questionUpdateSuccessful);
              let encodedData = this._utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
              if (this.onReviewerRequest && (this.existingProficiency !== this.questionForm.get('proficiency').value || this.existingSubSkill !== this.questionForm.get('subSkill').value || this.existingPrimarySkill[0].id !== this.questionForm.get('primarySkill')?.value[0]?.id || this.existingSubSubSkil !== this.questionForm.get('subSubSkill')?.value)) {
                if (this.previousPath) {
                  this._utilsService.deleteCookie(Constants.previousPath, abp.appPath);
                  //   this.isReplaceQuestion = true;
                  this.isSkillChange = this.existingPrimarySkill[0].id !== this.questionForm.get('primarySkill')?.value[0]?.id ? true : false;
                  this._utilsService.setCookieValue(this.constants.isSkillChange, this.isSkillChange.toString(), undefined, abp.appPath);
                  this._utilsService.setCookieValue(this.constants.isReplaceQuestion, this.isReplaceQuestion.toString(), undefined, abp.appPath);
                  this.navigationService.goBack();
                }
              } else if (encodedData) {
                this.navigateToQuestionsListPage(encodedData);
              }
              else {
                this.router.navigate(['../../../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
              }
            }
            else
              this.toastrService.warning(Constants.questionUpdateFailed);
          });
        } else {
          this.questionService.updateQuestion(formData).subscribe(res => {
            if (res.result) {
              this.toastrService.success(Constants.questionUpdateSuccessful);
              let encodedData = this._utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
              if (this.previousPath) {
                this._utilsService.deleteCookie(Constants.previousPath, abp.appPath);
                this.navigationService.goBack();
              } else if (encodedData) {
                this.navigateToQuestionsListPage(encodedData);
              } else {
                this.router.navigate(['../../../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });
              }
            }
            else
              this.toastrService.warning(Constants.questionUpdateFailed);
          });
        }
      }
      else {
        this.createQuestionDto = {
          categoryId: this.questionForm.get('category')?.value[0]?.id,
          skillId: this.questionForm.value.primarySkill[0]?.id,
          subSkillName: this.questionForm.value.subSkill,
          subSkill2Name: this.questionForm.value.subSubSkill,
          questionTypeId: this.questionForm.get('questionType').value,
          proficiencyId: this.questionForm.value.proficiency,
          duration: this.questionForm.get('duration').value,
          mark: this.questionForm.get('score').value,
          weight: this.questionForm.value.weight,
          choices: this.choices,
          answers: this.sub ? this.choices : this.answers.filter(x => x !== '-' && x !== undefined),
          questionText: this.questionForm.value.question,//.replace(/<p>/gi, '<p style=margin-bottom:0px;>'),
          questionHints: questionHints,
          courseName: this.questionForm.value.courseName,
          moduleName: this.questionForm.value.moduleName,
          tenantName: this.appSessionService.tenantName ? this.appSessionService.tenantName : 'IIHT'
        };

        if (this.rubrixFile) {
          if (!this.rubrixFile.type) {
            formData.append('File', null);
          }
          else {
            formData.append('File', this.rubrixFile, this.rubrixFile.name);
          }
        }
        else {
          formData.append('File', null);
        }
        formData.append('Input', JSON.stringify(this.createQuestionDto));

        this.questionService.createQuestion(formData).subscribe(res => {
          if (res.result) {
            this.toastrService.success(Constants.questionCreateSuccessful);
            this.router.navigate(['../../question-bank/question-bank-operation'], { relativeTo: this.activatedRoute });

          }
          else
            this.toastrService.warning(Constants.questionBankCreateFailed);
        });
      }
    }
    else {
      this.toastrService.error(Constants.pleaseEnterRequiredField);
    }
  }

  openTestCase(): void {
    let isInputRequired: boolean = false;
    if (!this.cloud) {
      isInputRequired = true;
    }
    this.questionForm.get('questionLanguages')['controls'].forEach(questionLanguage => {
      // eslint-disable-next-line eqeqeq
      if (questionLanguage.get('languageId').value === this.codingLanguages.find(x => x.language === Constants.sql)?.id || questionLanguage.get('languageId').value === this.codingLanguages.find(x => x.language === Constants.mongoDb)?.id)
        isInputRequired = false;
    });

    const modalRef = this.modalService.open(CreateTestCaseComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.testCaseDetails = this.testCaseDetails;
    modalRef.componentInstance.testCaseData = {
      testCaseTitle: "",
      standardInput: "",
      expectedOutput: "",
      sortOrder: this.testCaseDetails.length + 1,
      maxMemoryPermitted: "",
      maxCpuTime: "",
      isInputRequired: isInputRequired,
      isSortOrderEnabled: this.isSortOrderEnabled,
      isCloud: this.cloud,
      isHtmlCssSelected: this.isHtmlCssSelected
    };
    modalRef.dismissed.subscribe(result => {
      if (result) {
        this.testCaseDetails.push(result);
        this.nextSortOrder++;
      }
      if (this.cloud && this.testCaseDetails.length > 0)
        this.questionForm.get('sortOrder').disable();
    });

  }

  editTestCase(item) {
    let isInputRequired: boolean = true;
    this.questionForm.get('questionLanguages')['controls'].forEach(questionLanguage => {
      if (questionLanguage.get('languageId').value === this.codingLanguages.find(x => x.language === Constants.sql)?.id || questionLanguage.get('languageId').value === this.codingLanguages.find(x => x.language === Constants.mongoDb)?.id)
        isInputRequired = false;
    });

    const modalRef = this.modalService.open(CreateTestCaseComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.testCaseDetails = this.testCaseDetails;
    modalRef.componentInstance.indexOfCurrentItem = this.testCaseDetails?.indexOf(item);
    modalRef.componentInstance.testCaseData = {
      id: item.id,
      questionId: item.questionId,
      score: item.score,
      testCaseTitle: item.testCaseTitle,
      standardInput: item.standardInput,
      expectedOutput: item.expectedOutput,
      sortOrder: item.sortOrder,
      maxMemoryPermitted: item.maxMemoryPermitted,
      maxCpuTime: item.maxCpuTime,
      elementName: item.elementName,
      elementId: item.elementId,
      testCaseConstraints: item.testCaseConstraints,
      isInputRequired: isInputRequired,
      isSortOrderEnabled: this.isSortOrderEnabled,
      isCloud: this.cloud,
      isHtmlCssSelected: this.isHtmlCssSelected
    };
    modalRef.dismissed.subscribe(result => {
      if (result) {
        let index = this.testCaseDetails.indexOf(item);
        this.testCaseDetails[index] = result;
      }
    });
  }

  deleteTestCase(item) {
    this.testCaseDetails = this.testCaseDetails.filter(obj => obj.sortOrder !== item.sortOrder);
    if (this.cloud && this.testCaseDetails.length === 0)
      this.questionForm.get('sortOrder').enable();
    this.testCaseDetails.forEach((tc, i) => {
      tc.sortOrder = i + 1;

    });

    this.nextSortOrder--;
  }


  onItemSelect(item: CompilerLanguages) {
    if (!this.selectedCodingLanguages.some(selectedItem => selectedItem.id === item.id)) {
      this.selectedCodingLanguages.push(item);
    }
    setTimeout(() => {
      if (this.selectedCodingLanguages.length === 1) {
        this.questionLanguages.controls[0].get('languageId').setValue(item.id);
        this.isShown = true;
      }
      this.customDropDownSettings();
    }, 100);
  }

  onItemDeSelect(item: CompilerLanguages) {
    if (!this.existingCodingLanguage.find(x => x.id === item.id))
      this.selectedCodingLanguages = this.selectedCodingLanguages.filter(obj => obj.id !== item.id);
    setTimeout(() => {
      this.customDropDownSettings();
      if (this.selectedCodingLanguages.length === 0) {
        this.selectedCodingLanguages = [];
        this.isShown = false;
      }
      else {
        let index = this.existingCodingLanguage.findIndex(x => x.id === item.id);
        // eslint-disable-next-line eqeqeq
        let selectedLanguageOptions = this.questionForm.get('questionLanguages')['controls'].filter(x => x.get('languageId').value == item.id);
        let selectedOptions = this.questionForm.get('questionLanguages')['controls'].indexOf(selectedLanguageOptions[0]);
        let isDeleted = this.deleteQuestionLanguages(selectedOptions);
        if (isDeleted)
          this.choosenCodingLanguages = this.choosenCodingLanguages.filter(x => x.id !== item.id);
        else if (this.isEdit) {
          this.choosenCodingLanguages.splice(index, 0, item);
          this.choosenCodingLanguages = [...this.choosenCodingLanguages];
        }
      }
      this.customDropDownSettings();
    }, 100);
  }

  customDropDownSettings(): void {
    this.isHtmlCssSelected = this.choosenCodingLanguages.some(item => item.language === this.htmlCssLanguage);
    if (this.isHtmlCssSelected) {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: 1 });
      if (!this.isEdit && this.testCaseDetails.length && this.testCaseDetails.some(item => item.standardInput)) {
        this.testCaseDetails = [];
      }
    }
    else {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: 50 });
      this.codingLanguages.forEach(item => {
        if (item.language === this.htmlCssLanguage) {
          item.isDisabled = true;
        }
        this.codingLanguages = [...this.codingLanguages];
      });
    }
    if (this.choosenCodingLanguages.length === 0) {
      this.codingLanguages = this.codingLanguages.map(item => {
        if (item.language === this.htmlCssLanguage) {
          item.isDisabled = false;
        }
        return item;
      });
    }
    if (!this.isEdit && this.testCaseDetails.length && this.testCaseDetails.some(item => item.elementName)) {
      this.testCaseDetails = [];
    }
  }

  isFormValid(formControlName: string): boolean {
    return !(this.questionForm.get(formControlName).errors?.required && (this.questionForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  isScoreValid(): boolean {
    let score = this.questionForm.get("score").value;
    if (score === "")
      return true;
    else if (score !== "" && (score > 0 && score <= 100))
      return true;
    else
      return false;
  }

  subSkillSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.subSkillClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.subSkillFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.subSkillNames : this.subSkillNames.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  };

  subSkill2Search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.subSkill2Click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.subSkill2Focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.subSkill2Names : this.subSkill2Names.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  };

  onChange() {
    this.getDuration();
    let deviceValue;
    this.isSortOrderEnabled = false;
    if (this.isEdit && this.isCoding) {
      deviceValue = this.codingQuestion.questionTypeId.toString();
    }
    else if (this.isEdit && this.cloud) {
      deviceValue = this.cloudQuestion.questionTypeId.toString();
    }
    else if (this.isEdit) {
      deviceValue = this.question.question.questionTypeId.toString();
    }
    else {
      deviceValue = this.questionForm.value.questionType;
    }
    this.mcq = false;
    this.fib = false;
    this.mtf = false;
    this.tof = false;
    this.sub = false;
    this.coding = false;
    this.stack = false;
    this.cloud = false;
    this.ots = false;
    this.sfdd = false;
    this.dragAndDrop = false;
    this.puzzle = false;
    if ((deviceValue === (this.constants.multipleChoiceId.toString())) || (deviceValue === (this.constants.mcqcodesnippets.toString())) || (deviceValue === (this.constants.mcqscenario.toString()))) {
      this.mcq = true;
      this.choices = [];
      this.isOptionChecked = false;
      this.isOptionNotEmpty = false;
    }
    if (deviceValue === this.constants.fillInTheBlankId.toString()) {
      this.fib = true;
      this.checkList = [];
      this.choices = [];
      this.isOptionChecked = false;
      this.isOptionNotEmpty = false;
    }
    if (deviceValue === this.constants.orderTheSequenceId.toString()) {
      this.ots = true;
      this.checkList = [];
      this.choices = [];
      this.isOptionChecked = false;
      this.isOptionNotEmpty = false;
    }
    if (deviceValue === this.constants.selectFromDropDownId.toString()) {
      this.sfdd = true;
      this.checkList = [];
      this.choices = [];
      this.isOptionChecked = false;
      this.isOptionNotEmpty = false;
    }
    if (deviceValue === this.constants.dragAndDropId.toString()) {
      this.dragAndDrop = true;
      this.checkList = [];
      this.choices = [];
      this.isOptionChecked = false;
      this.isOptionNotEmpty = false;
    }
    if (deviceValue === this.constants.matchTheFollowingId.toString()) {
      this.mtf = true;
      this.matcherror = false;
      this.isOptionNotEmpty = false;
      this.choices = [];
    }
    if (deviceValue === this.constants.trueOrfalseId.toString()) {
      this.tof = true;
      this.checkList = [];
      this.optionList = [];
    }
    if (deviceValue === this.constants.subjectiveId.toString()) {
      this.sub = true;
    }
    else if (this.rubrixFile) {
      this.rubrixInput.nativeElement.value = '';
      this.rubrixFile = null;
    }
    if (deviceValue === this.constants.codingId.toString()) {
      this.coding = true;
    }
    if (deviceValue === this.constants.stackId.toString()) {
      this.stack = true;
    }
    if (deviceValue === this.constants.cloudId.toString()) {
      this.cloud = true;
    }
    if (deviceValue === this.constants.puzzleId.toString()) {
      const newCrosswordPuzzle = this.formBuilder.array([this.crossWordPuzzleQuestions()]);
      if (this.questionForm.controls['crosswordPuzzle']) {
        this.questionForm.setControl('crosswordPuzzle', newCrosswordPuzzle);
      } else {
        this.questionForm.addControl('crosswordPuzzle', newCrosswordPuzzle);
      }
      this.puzzle = true;
      this.loadPuzzle();
    }
    if (!this.isEdit && (this.fib || this.sfdd || this.ots || this.dragAndDrop)) {
      this.resetFIBController();
    }
    if (!this.isEdit && !this.puzzle)
      this.questionForm.removeControl('crosswordPuzzle');
  }

  resetFIBController() {
    this.questionForm.get('fibController.question1').setValue('');
    this.questionForm.get('fibController.question2').setValue('');
    this.questionForm.get('fibController.question3').setValue('');
    this.questionForm.get('fibController.question4').setValue('');
    this.questionForm.get('fibController.question5').setValue('');
    this.questionForm.get('fibController.question6').setValue('');
  }

  disableMandatoryFields() {
    if (!this.onReviewerRequest) {
      if (environment.questionMetadataEditableTenantId === this.appSessionService.tenantId) {
        this.questionService.isQuestionMappedInAssessment(this.questionId).subscribe(res => {
          if (res && res.result) {
            this.isSkillDisabled = true;
            this.questionForm.get('subSkill').disable();
            this.questionForm.get('subSubSkill').disable();
            this.questionForm.get('primarySkill').disable();
          }
        });
      }
      else {
        this.questionForm.get('proficiency').disable();
        this.isSkillDisabled = true;
        this.questionForm.get('subSkill').disable();
        this.questionForm.get('subSubSkill').disable();
        this.questionForm.get('primarySkill').disable();
        if (this.isVirtusaStdTenant || this.isZikshaaTenant || this.isTechavasiTenant) {
          this.questionService.isQuestionMappedInAssessment(this.questionId).subscribe((res) => {
            if (res && !res.result) {
              this.isSkillDisabled = false;
              this.questionForm.get("proficiency").enable();
              this.questionForm.get("subSkill").enable();
              this.questionForm.get("subSubSkill").enable();
            } else {
              this.questionMappedAssessment = true;
            }
          });
        }
      }
    }
    this.questionForm.get('category').disable();
    this.questionForm.get('questionType').disable();
  }

  disableOptionalFields(config) {
    if (config.CourseName) { this.questionForm.get('courseName').disable(); }
    if (config.ModuleName) { this.questionForm.get('moduleName').disable(); }
  }

  disableContainerFields() {
    let stackCpuCore = this.questionForm.get('stackCpuCore');
    let stackCpuMemory = this.questionForm.get('stackCpuMemory');
    let planSize = this.questionForm.get('planSize');
    let appCount = this.questionForm.get('maxCount');
    stackCpuCore.clearValidators();
    stackCpuMemory.clearValidators();
    planSize.clearValidators();
    appCount.clearValidators();
    stackCpuCore.updateValueAndValidity();
    stackCpuMemory.updateValueAndValidity();
    planSize.updateValueAndValidity();
    appCount.updateValueAndValidity();

  }

  disableVMFields() {
    let sku = this.questionForm.get('skuId');
    sku.clearAsyncValidators();
  }

  isDisabled(snippetCount: number) {
    return snippetCount >= this.choosenCodingLanguages.length;
  }

  typeCheck(value: string): void {
    // Stack
    const stackCodingLanguages = this.questionForm.get('stackCodingLanguages');
    const stackCpuCore = this.questionForm.get('stackCpuCore');
    const stackCpuMemory = this.questionForm.get('stackCpuMemory');
    const stackTemplateUrl = this.questionForm.get('stackTemplateUrl');
    const question = this.questionForm.get('question');
    const stackCodingEnvironment = this.questionForm.get('stackCodingEnvironment');
    // eslint-disable-next-line eqeqeq
    if (value == Constants.stackId.toString()) {
      stackCodingEnvironment.setValidators([Validators.required]);
      stackCodingLanguages.disable();
      stackCodingLanguages.setValidators([Validators.required]);
      stackTemplateUrl.setValidators([Validators.required, Validators.pattern('https://.*')]);
      if (this.stackLanguages.length === 0) {
        this.getAllSupportedStackLanguages();
      }
    }
    else {
      stackCodingLanguages.clearValidators();
      stackCpuCore.clearValidators();
      stackCpuMemory.clearValidators();
      stackTemplateUrl.clearValidators();
      stackCodingEnvironment.clearValidators();
      this.removeInstructions();
    }
    stackCodingLanguages.updateValueAndValidity();
    stackCpuCore.updateValueAndValidity();
    stackCpuMemory.updateValueAndValidity();
    stackTemplateUrl.updateValueAndValidity();
    stackCodingEnvironment.updateValueAndValidity();
    question.updateValueAndValidity();
  }

  onStackFileChange(fileList: FileList): void {
    const supportedTypes: string[] = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"];
    if (fileList.length > 0) {
      this.stackInstructions = fileList[0];
      const selectedFileType = this.stackInstructions.type;
      let isFileTypeSupported = supportedTypes.some(x => x === selectedFileType);
      if (!isFileTypeSupported) {
        this.removeInstructions();
        this.toastrService.warning(Constants.onlyDocPdfFilesAreAccepted);
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseUploadFile);
    }
  }

  removeInstructions(): void {
    this.stackInstructions = undefined;
  }

  onStackLanguageSelect(item: CompilerLanguages): void {
    this.deleteAllTestCaseTemplateDetails();
    var languageDetails = JSON.parse(this.stackLanguages.find(x => x.id === item.id).languageConfig);
    if (languageDetails.length === 1)
      this.addTestCaseTemplateDetails();
    else
      languageDetails.forEach(x => { this.addTestCaseTemplateDetailsMFA(); });
    let i = 0;
    languageDetails.forEach(x => {
      this.testCaseTemplateDetails.at(i).get("stackId").patchValue(x.StackId);
      this.testCaseTemplateDetails.at(i).get("language").patchValue(x.Language);
      if (x.DefaultTestCaseHidePath) {
        this.testCaseTemplateDetails.at(i).get("testCaseHidePath").patchValue(x.DefaultTestCaseHidePath);
      }
      else {
        this.testCaseTemplateDetails.at(i).get("testCaseHidePath").patchValue("");
      }
      if (x.DefaultTestCasePath) {
        this.testCaseTemplateDetails.at(i).get("testCasePath").patchValue(x.DefaultTestCasePath);
      }
      else {
        this.testCaseTemplateDetails.at(i).get("testCasePath").patchValue("");
      }
      i++;
    });
    this.selectedStackLanguages.push(item);
  }

  onStackLanguageDeSelect(item: CompilerLanguages): void {
    this.deleteAllTestCaseTemplateDetails();
    this.selectedStackLanguages = this.selectedStackLanguages.filter(value => value.id !== item.id);
  }

  onStackCodingEnvironmentChange() {
    const stackCodingLanguages = this.questionForm.get('stackCodingLanguages');
    stackCodingLanguages.enable();
    stackCodingLanguages.setValidators([Validators.required]);
    this.selectedStackLanguages = [];
    stackCodingLanguages.setValue(0);
    this.isCodingEnvironmentSelected = true;
    const stackCpuCore = this.questionForm.get('stackCpuCore');
    const stackCpuMemory = this.questionForm.get('stackCpuMemory');
    const planSize = this.questionForm.get('planSize');
    const maxCount = this.questionForm.get('maxCount');
    const skuId = this.questionForm.get('skuId');
    this.stackCodingEnvironment = this.questionForm.controls.stackCodingEnvironment.value[0].name;
    if (this.stackCodingEnvironment === this.constants.Container) {
      stackCpuCore.clearValidators();
      stackCpuMemory.clearValidators();
      planSize.clearValidators();
      maxCount.clearValidators();
      stackCpuCore.setValidators([Validators.required, Validators.min(1), Validators.max(4)]);
      stackCpuMemory.setValidators([Validators.required, Validators.min(1), Validators.max(16)]);
      planSize.setValidators([Validators.required]);
      maxCount.setValidators([Validators.required]);
      this.filteredStackLanguages = this.stackLanguages.filter(x => x.type === EnvironmentType.Container);
      this.isVMEnvironment = false;
      skuId.clearValidators();
      skuId.updateValueAndValidity();
      stackCpuCore.updateValueAndValidity();
      stackCpuMemory.updateValueAndValidity();
      planSize.updateValueAndValidity();
      maxCount.updateValueAndValidity();
    }
    else {
      this.filteredStackLanguages = this.stackLanguages.filter(x => x.type === EnvironmentType.VirtualMachine);
      this.isVMEnvironment = true;
      stackCpuCore.clearValidators();
      stackCpuMemory.clearValidators();
      planSize.clearValidators();
      maxCount.clearValidators();
      stackCpuCore.updateValueAndValidity();
      stackCpuMemory.updateValueAndValidity();
      planSize.updateValueAndValidity();
      maxCount.updateValueAndValidity();
      this.questionForm.get('skuId').setValidators(Validators.required);
    }
  }

  getAllSupportedStackLanguages(): void {
    this.questionService.getAllSupportedStackLanguages().subscribe(res => {
      if (res.success && res.result.length) {
        this.stackLanguages = res.result;
        this.filteredStackLanguages = this.stackLanguages;
      }
    },
      error => console.error(error));
  }

  truncate(input) {
    if (input.length > 10) {
      return input.substring(0, 10) + '...';
    }
    return input;
  }

  back(): void {
    let encodedData = this._utilsService.getCookieValue(this.constants.questionBankQuestionEdit);
    if (encodedData) {
      this.navigateToQuestionsListPage(encodedData);
    } else {
      this.navigationService.goBack();
    }
  }

  isUnsaved(): boolean {
    if (!this.isFormSubmitTriggered && JSON.stringify(this.questionForm.value) !== JSON.stringify(this.onLoadValue)) {
      return true;
    }
    return false;
  }

  optionQnValidation(question: string): boolean {
    let isQuestionValid = true;
    let res;
    let regExp = /{{(\d+)}}/g;
    while ((res = regExp.exec(question)) !== null) {
      if (Number(res[1]) > 6) {
        isQuestionValid = false;
        break;
      }
    }
    return isQuestionValid;
  }

  validateXMLAndCreateOrUpdateStackQuestion(xml: string, formdata: FormData = null) {
    if (!this.isNullOrEmpty(xml)) {
      this.questionService.isXMLValid(xml).subscribe(res => {
        if (res.success) {
          if (res.result) {
            this.isScanConfigXmlValid = true;
            if (formdata === null) {
              this.toastrService.success(this.constants.validXML);
            }
            else {
              this.createOrUpdateStackQuestion(formdata);
            }
          } else {
            this.isScanConfigXmlValid = false;
            this.toastrService.warning(this.constants.XMLIsNotValid);
          }
        } else {
          this.toastrService.error(this.constants.somethingWentWrong);
        }
      });
    } else {
      this.toastrService.warning(this.constants.scanConfigXMLCannotBeEmpty);
    }
  }

  isNullOrEmpty(input: string): boolean {
    if (input === null || input === '' || input.trim() === '') {
      return true;
    } else {
      return false;
    }
  }

  navigateToQuestionsListPage(data: string) {
    let previousPathData = JSON.parse(atob(data));
    if (previousPathData?.questionBankId > 0) {
      let idString = btoa(previousPathData.questionBankId.toString());
      let scopeString = btoa(previousPathData.scope.toString());
      this.router.navigate(['../../../question-list', idString, scopeString], { relativeTo: this.activatedRoute });
    }
  }

  onRubrixFileChange(files) {
    if (files.length > 0) {
      const selectedFileType = files[0].type;
      this.rubrixFile = files[0];
      this.supportedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === selectedFileType);
      if (isFileTypeSupported) {
        this.toastrService.success(Constants.fileUploaded);
      }
      else {
        this.rubrixFile = undefined;
        this.toastrService.warning(Constants.uploadOnlyExcelFiles);
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseUploadFile);
    }
  }

  removeRubrix(): void {
    this.rubrixInput.nativeElement.value = '';
    this.rubrixFile = null;
    this.toastrService.warning(Constants.selectedFileWasRemoved);
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
}
