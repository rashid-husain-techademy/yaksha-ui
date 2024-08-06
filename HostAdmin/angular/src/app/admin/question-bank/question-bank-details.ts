import { QuestionBankScope, QuestionBankTypes, QuestionTypes } from "@app/enums/question-bank-type";
export interface QuestionBankFilter {
    TenantId: number | null;
    Name: string | null;
    SkipCount: number;
    MaxResultCount: number;
}

export interface CreateQuestionBank {
    QuestionBankId: number;
    Name: string;
    Type: QuestionBankTypes;
    Scope: QuestionBankScope;
    ConfigJson: null;
    TenantId: number;
}
export interface CreateQuestionBankSkill {
    QuestionBankId: number;
    SkillIds: number[];
    TenantId: number;
    IsVisible: boolean;
}

export interface SkillFilter {
    QuestionBankId: number;
    CategoryId: number | null;
    SkillId: number | null;
    SkillName: string | null;
    SkipCount: number;
    MaxResultCount: number;
}

export interface CategorySkillFilter {
    questionBankId?: number | null;
    categoryId?: number | null;
    skillId?: number | null;
    skillName?: string | null;
}

export interface QuestionFilter {
    QuestionBankId: number;
    categoryId?: number | null;
    SkillId?: number | null;
    SubSkillId?: number | null;
    SearchText?: string | null;
    QuestionIdNumber?: string | null;
    ParentQuestionTypeId?: number | null;
    ProficiencyId?: number | null;
    SkipCount: number;
    MaxResultCount: number;
}

export interface QuestionBankResult {
    totalCount: number;
    questionBanks: QuestionBanks[];
}

export interface QuestionBanks {
    questionBankId: number;
    name: string;
    createdDate: Date;
    skillCount: number;
    questionsCount: string;
    mcqCount: number;
    codingCount: number;
    stackCount: number;
    isVisible: boolean;
    scope: QuestionBankScope;
}

export interface QuestionType {
    id: number;
    name: string;
    config: string;
    questionTypes: QuestionTypes;
    isReviewRequired: boolean;
}

export interface Category {
    id: number;
    name: string;
}

export interface Skill {
    id: number;
    name: string;
}

export interface SkillResult {
    totalCount: number;
    skills: SkillDetails[];
}

export interface SkillDetails {
    id: number;
    name: string;
    imageUrl: string;
    questionCount: string;
    TotalQuestions: number;
    MCQ: number;
    Coding: number;
    Stack: number;
}

export interface QuestionResult {
    totalCount: number;
    proficiencyLevelCount: string;
    questions: Questions[];
}

export interface Questions {
    questionId: number;
    questionText: string;
    questionTypeId: number;
    parentQuestionTypeId: number;
    proficiency: Proficiency;
    questionType: string;
    isChecked: boolean;
}

export interface DeleteQuestionDetails {
    questionId: number;
    isChecked: boolean;
}

export interface Proficiency {
    Name: string;
    Description: string;
}

export interface UpdateTenantQuestionBank {
    QuestionBankId: number;
    TenantId: number;
    IsVisible: boolean;
}

export interface QuestionBankSkillFilter {
    QuestionBankId: number;
    CategoryId: number;
}


export interface QuestionBankSubSkillFilter {
    QuestionBankId: number;
    SkillId: number;
}

export interface QBSearchResult {
    qbQuestionDetails: QbQuestionDetails[],
    totalCount: number
}

export interface QbQuestionDetails {
    categoryName: string,   
    categoryId: number,
    skillName: string,
    skillId: number,
    subSkillName: string,
    subSkillId: string,
    proficiencyId: number,
    proficiencyName: string,
    parentTypeQuestionId: number,
    parentTypeQuestionName: string,
    questionTypeId: number,
    questionTypeName: string,
    questionIdNumber: string,
    questionId: number,
    questionText: string,
    choices: string,
    author: string
}