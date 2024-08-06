import { QuestionBankScope } from "@app/enums/question-bank-type";
import { EnvironmentType } from "@app/enums/test";

export interface CategoryDetails {
    name: string;
    description: string | null
    idNumber: string | null;
    sortOrder: number;
    id: number
}

export interface CategorySkillRequestDto {
    CategoryIds: string,
    QuestionBankScope: QuestionBankScope
}

export interface SkillDetailDto {
    id: number;
    name: string;
    imageUrl?: string;
}

export interface SubSkillRequestDto {
    skillId: number;
    questionBankScope: QuestionBankScope;
}

export interface SubSubSkillRequestDto {
    skillId: number;
    subSkillId: number;
    questionBankScope: QuestionBankScope;
}

export interface GetCategoryDetails {
    category: CategoryDetails[];
    totalCount: number;
}

export interface QuestionHint {
    id: number;
    questionHint: string;
}

export interface GetProficiencies {
    id: number;
    name: string;
    description: string;
}

export interface GetPlanSize {
    id: number;
    name: string;
    description: string;
}

export interface GetProficiencyMetadata {
    proficiencyId: number;
    parentQuestionTypeId: number;
    score: number;
    duration: number;
}

export interface GetQuestionTypes {
    id: number;
    name: string;
    parentQuestionTypeId: number | null;
    config: string;
}

export interface GetSkills {
    skills: Skills[];
    subSkills: SubSkills[];
}

export interface Skills {
    id: number;
    name: string;
    imageUrl: string;
}

export interface SubSkills {
    id: number;
    name: string;
    imageUrl: string;
}

export interface QuestionHints {
    questionId: number
    description: string
}

export interface Skill {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
}

export interface GetQuestion {
    question: GetQuestionsDto;
    questionHints: QuestionHints[];
    skill: Skills;
    subSkill: Skill;
    subSkill2: Skill;
}

export interface EnvironmentTypes {
    id: number;
    name: string;
}

export interface GetQuestionsDto {
    id: number;
    category: CategoryDetails;
    questionText: string;
    questionIdNumber: string;
    questionTypeId: number;
    choices: string[];
    answers: string[];
    proficiencyId: number;
    config: string;
    mark: number;
    categoryId: number;
    author: string;
    duration: number;
    weight: number;
    planSize: number;
    maxCount: number;
    rubrixUrl: string;
}

export interface CreateQuestionDto {
    categoryId: number;
    skillId: number;
    subSkillName: string;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    duration: number;
    mark: number;
    weight: number;
    choices: string[];
    answers: string[];
    questionText: string;
    questionHints: QuestionHint[];
    courseName: string;
    moduleName: string;
    tenantName: string;
}

export interface UpdateQuestionDto {
    questionId: number;
    categoryId: number;
    skillId: number;
    subSkillName: string;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    duration: number;
    mark: number;
    weight: number;
    choices: string[];
    answers: string[];
    questionText: string;
    questionHints: QuestionHint[];
    courseName: string;
    moduleName: string;
    tenantName: string;
    isRubrixRemoved: boolean;
}

export interface TestCase {
    id: number;
    questionId: number;
    testCaseTitle: string;
    standardInput: string;
    expectedOutput: string;
    sortOrder: number;
    score: number;
    maxCpuTime: number | null;
    maxMemoryPermitted: number | null;
}

export interface TestCaseDto {
    id: number;
    questionId: number;
    testCaseTitle: string;
    standardInput: string;
    expectedOutput: string;
    sortOrder: number;
    isCloud: boolean;
    score: number;
    maxCpuTime: number | null;
    maxMemoryPermitted: number | null;
    isInputRequired: boolean;
    isSortOrderEnabled: boolean;
    isHtmlCssSelected: boolean;
    elementName: string;
    elementId: string;
    testCaseConstraints: TestCaseConstraints[];
}
export interface TestCaseConstraints {
    id: number;
    attributeName: string;
    attributeValue: string;
}
export interface QuestionLanguage {
    languageId: number;
    defaultCode: string;
}

export interface CompilerLanguages {
    language: string;
    editorLanguageCode: string;
    compilerLanguageCode: string;
    compilerVersion: string;
    compilerVersionCode: string;
    editorDefaultCode: string;
    id: number;
    isDisabled: boolean;
}

export interface CodingImportDto {
    questionId: number | null;
    questionIdNumber: string;
    questionText: string;
    categoryId: number | null;
    categoryName: string;
    skillId: number | null;
    skillName: string;
    subSkillId: number | null;
    subSkillName: string;
    subSkill2Id: number | null;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    proficiencyName: string;
    duration: number | null;
    score: number;
    author: string;
    testCases: TestCasesDto[]
    questionLanguages: QuestionLanguages[];
    config: string;
}

export interface QuestionLanguages {
    languageId: number;
    defaultCode: string;
    questionId: number;
    id: string;
}

export interface TestCasesDto {
    questionId: number | null
    id: number | null;
    testCaseTitle: string;
    standardInput: string;
    expectedOutput: string;
    sortOrder: number;
    score: number | null;
    maxCpuTime: number | null;
    maxMemoryPermitted: number | null;
    elementName: string;
    elementId: string;
    testCaseConstraints: TestCaseConstraints[];
}
export interface TestCaseConstraints {
    id: number;
    attributeName: string;
    attributeValue: string;
}

export interface CreateCodingQuestionDto {
    categoryId: number;
    skillId: number;
    subSkillName: string;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    duration: number;
    score: number;
    questionText: string;
    questionLanguages: QuestionLanguage[];
    testCases: TestCase[];
    courseName: string;
    moduleName: string;
    tenantName: string;
}

export interface UpdateCodingQuestionDto {
    questionId: number;
    categoryId: number;
    skillId: number;
    subSkillName: string;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    duration: number;
    score: number;
    questionText: string;
    questionLanguages: QuestionLanguage[];
    testCases: TestCase[];
    courseName: string;
    moduleName: string;
    tenantName: string;
}

export interface StackQuestionDetails {
    questionId: number;
    questionIdNumber?: string;
    questionText?: string;
    categoryId: number;
    categoryName?: string;
    skillId: number;
    skillName?: string;
    subSkillId?: number;
    subSkillName: string;
    subSkill2Id?: number;
    subSkill2Name: string;
    questionTypeId: number;
    proficiencyId: number;
    proficiencyName?: string;
    duration: number;
    score: number;
    author?: string;
    createStackDetails: StackDetails;
    courseName: string;
    moduleName: string;
    tenantName: string;
}

export interface StackDetails {
    id: number;
    questionId?: number;
    fileQuestionIdNumber?: string;
    cpuCore: number;
    memorySize: number;
    containerImageUrl?: string;
    skuId: string;
    gitTemplateUrl: string;
    scanConfigXML: string;
    languageId: number;
    TestCaseDetails: TestCaseDetails[];
    score: number;
    planSize: number;
    maxCount: number;
    environmentType: EnvironmentType;
}

export interface TestCaseDetails {
    stackId: number;
    testCaseCount: number;
    score: number;
}
export interface StackData {
    Input: string;
    File: File;
}

export interface GetStackDetails {
    questionId: number,
    instructionDocumentUrl: string,
    sku: string,
    containerImageUrl: string,
    gitTemplateUrl: string,
    scanConfigXML: string,
    language: string,
    languageId: number,
    totalTestCases: number,
    id: number,
    testCaseDetails: string
    type: EnvironmentType;
}

export interface GetStackQuestionDetails {
    question: GetQuestionsDto,
    skill: Skills;
    subSkill: Skill;
    subSkill2: Skill;
    stackDetail: GetStackDetails
}

export interface SupportedStackLanguages {
    language: string;
    id: number;
    languageConfig: string;
    type: EnvironmentType;
}

export interface BulkUploadHistoryFilter {
    tenantId: number;
    emailAddress: string;
    startDateTime?: string | null;
    endDateTime?: string | null;
    skipCount: number;
    maxResultCount: number;
    timeZone: string;
}

export interface BulkHistoryDto {
    userName: string;
    fileName: string;
    uploadedDateTime: string;
    categoryCount: number;
    skillCount: number;
    mcqCount: number;
    codingCount: number;
    stackCount: number;
    cloudCount: number;
}

export interface BulkUploadResults {
    totalQuestions: number;
    totalCount: number;
    totalMcqCount: number;
    totalCodingQuestionCount: number;
    totalStackQuestionCount: number;
    bulkUploadQuestionTrack: BulkHistoryDto[];
}

export interface PuzzleChoiceData {
    clue: string,
    position: number,
    orientation: string,
    startx: number,
    starty: number,
    answerlength: number
}

export interface PuzzleAnswerData {
    answer: string,
    position: number,
    orientation: string
}

export interface puzzleData {
    answer: string,
    clue: string,
    position: number,
    orientation: string,
    startx: number,
    starty: number,
    answerlength: number
}

export interface Orientation {
    name: string,
    value: number
}
