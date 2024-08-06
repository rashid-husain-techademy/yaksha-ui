import { AdaptiveAssessmentType, AssessmentStatus, AssessmentType, ScheduleType } from "@app/enums/assessment";

export interface CreateAdaptiveAssessmentForm {
    categories: Category;
    name: string;
    skills: Skill;
    subskills: SubSkill;
    totalQuestionsCount: number;
    tenantList: TenantList[]
}

export interface CategoryDto {
    category: AdaptiveCategoryDto;
}
export interface AdaptiveCategoryDto {
    categoryId: number;
    question_count: number;
    skills: AdaptiveSkillDto[];
    quality: string;
}

export interface AdaptiveSkillDto {
    skillName: string;
    skillId: number;
    question_count: number;
    quality: string;
    sub_skills: AdaptiveSubSkillDto[];
}

export interface AdaptiveSubSkillDto {
    subskillName: string;
    subSkillId: number;
    question_Count: number;
    quality: string;
}

export interface AdaptiveAssessment {
    assessmentName: string;
    cateogryId: number;
    categoryName: string;
    skillName: string;
    skillId: number;
    subSkillName: string;
    subSkillId: number;
    numberOfQuestions: number;
    tenantId: number;
}

export interface TenantList {
    id: number;
    tenancyName: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
}

export interface AdaptiveAssessmentCategory {
    id: number;
    name: string;
}

export interface AdaptiveAssessmentSkill {
    id: number;
    name: string;
}

export interface AdaptiveAssessmentSubSkill {
    id: number;
    name: string;
}

export interface Category {
    category_id: number;
    question_count: number;
    skills: { [key: string]: Skill };
    quality: string;
}
export interface Skill {
    skill_id: number;
    question_count: number;
    quality: string;
    sub_skills: { [key: string]: SubSkill };
}
export interface SubSkill {
    SubSkillId: number;
    question_count: number;
    quality: string;
}

export interface CategoryList {
    [key: string]: Category;
}

export interface SkillList {
    [key: string]: Skill;
}

export interface SubSkillList {
    [key: string]: SubSkill;
}
export interface AdaptiveAssessmentFilter {
    tenantId: number | null;
    skipCount: number;
    maxResultCount: number;
    searchString: string;
}
export interface AdaptiveAssessmentDetails {
    adaptiveAssessments: AdaptiveAssessmentList[];
    totalCount: number;
}

export interface AdaptiveAssessmentList {
    id: number;
    assessmentName: string;
    cateogryId: number;
    categoryName: string;
    skillName: string;
    skillId: number;
    subSkillName: string;
    subSkillId: number;
    numberOfQuestions: number;
    tenantId: number;
    assessmentToken: string;
}
export interface tenantDetailsDto {
    id: number;
    name: string;
}
export enum ViewAdaptiveScheduleTabs {
    Schedule = 1,
    InvitedUser = 2
}
export interface scheduleAdaptiveAssessmentData {
    invitedUserIds: string;
    invitedUserEmails: string;
    adaptiveAssessmentId: number;
    isSendInvite: boolean;
    scheduleType: ScheduleType;
}
export interface SchdeuleAdaptiveAssessmentResponseDto {
    isSuccess: boolean;
    errorMessage: string;
    successMessage: string;
    errorList: string[];
}

export interface AdaptiveAssessmentDetail {
    id: number;
    authorName: string;
    assessmentStatus: AssessmentStatus;
    assessmentType: AssessmentType;
    description: string;
    duration: number;
    instructions: string;
    name: string;
    totalQuestions: number;
    totalSections: number;
    totalSkills: number;
    hasActiveSchedules: boolean;
    categories: CategoryDto[];
    isOwned: boolean;
    assessmentIdNumber: string;
    skillType: AdaptiveAssessmentType;
}

export interface AdaptiveAssessmentSchedules {
    totalCount: number;
    adaptiveAssessmentSchdeuleDatas: AdaptiveAssessmentSchedule[];
}

export interface AdaptiveAssessmentSchedule {
    id: number;
    adaptiveAssessmentId: number;
    adaptiveAssessmentScheduleIdNumber: string;
    link: string;
    isActive: boolean;
    schdeuleType: ScheduleType;
}

export interface AdaptiveAssessmentScheduleFilter {
    AdaptiveAssessmentId: number;
    TenantId: number | null;
    SkipCount: number;
    MaxResultCount: number;
}

export interface CreateAdaptiveAssessmentResultDto {
    isSuccess: boolean;
    id: number;
    errorMessage: string;
}

export interface ExternalAdaptiveAssessmentDetails {
    assessmentName: string;
    categoryName: string;
    skillName: string;
    subSkillName: string;
    categoryId: number;
    skillId: number;
    subSkillId: number;
    numberOfQuestions: number;
    tenantId: string;
    assessmentToken: string;
    assessmentStatus: AssessmentStatus;
}
export interface AIAdaptiveAssessmentResult {
    skill_name: string;
    category_name: string
    estimatedTheta: number[];
    assessment_name: string;
    isResponseCorrect: boolean[];
    administeredQuestionId: number[];
    administeredQuestionDifficulty: number[];
    number_of_questions: number;
    totalCorrect?: number;
    totalIncorrect?: number;
    dataSets?: any;
    resultChartData?: any;
    resultChartOptions?: any;
}

export interface AIAdaptiveAssessmentReportDto {
    totalCount: number;
    aiAdaptiveAssessmentResult: AIAdaptiveAssessmentResult[];
}
