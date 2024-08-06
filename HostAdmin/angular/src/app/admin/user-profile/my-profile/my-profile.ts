import { AssessmentType } from "@app/enums/assessment";

export interface SkillScoreDto {
    skillName: string;
    scorePercentage: number;
    totalQuestionCount: number;
    attemptedQuestions: number;
    correctAnswers: number;
    beginnerQuestionCount: number;
    intermediateQuestionCount: number;
    advancedQuestionCount: number;
    beginnerTotalQuestionCount: number;
    intermediateTotalQuestionCount: number;
    advancedTotalQuestionCount: number;
}

export interface SkillMetricsDto {
    skillName: string;
    scorePercentage: number;
    totalQuestionCount: number;
    attemptedQuestions: number;
    correctAnswers: number;
}

export interface SkillProficiencyPercentageDto {
    skillName: string;
    proficiencyPercentage: ProficiencyPercentageDto[]
}

export interface ProficiencyPercentageDto {
    proficiencyId: number;
    percentage: number;
}

export interface UserProfilePageDto {
    id: number;
    name: string;
    surname: string;
    profilePicture: string;
    aboutMe: string;
    emailAddress: string;
    phoneNumber: string;
    totalAssessmentsCompleted: number;
    totalPassedAssessments: number;
    averageAssessmentsScore: number;
    totalAdaptiveAssessmentsTaken: number;
}

export class UserInput {
    userId: number;
    tenantId: number | null;
    AssessmentScheduleId: number | null;
    isUserProfile: boolean;
    catalogId?: number;
}

export class AssessmentProgressInput {
    userId: number;
    tenantId: number | null;
    assessmentScheduleId: number | null;
    isUserProfile: boolean;
    SkipCount: number;
    MaxResultCount: number;
    catalogId?: number;
    assessmentType: AssessmentType;
}

export interface SkillList {
    skillId: number;
    name: string;
}

export interface RubrixFileZipInputDto {
    emailAddress: string;
    blobName: string[];
}

export interface UserRubrixFileResponseDto {
    isSuccess: boolean;
    message: string[];
}

export interface RubrixZipFileResponseDto {
    isSuccess: boolean;
    message: string;
}

export interface CatalogRequest {
    tenantId: number;
    userId: number;
}

export interface CatalogList {
    id: number;
    catalogName: string;
    isActive: boolean;
}

export interface ChoicesDetails {
    choice: string;
    isSelected: boolean;
    isCorrect: boolean;
}

export interface UserAssessmentAtemptResultDto {
    userAssessmentAttemptId: number;
    question: string;
    choicesDetails: ChoicesDetails[];
    assessmentSectionId: number;
    assessmentSectionName: string;
}

export interface ShowAnswerDto {
    assessmentSectionId: number;
    assessmentSectionName: string;
    attemptResult: UserAssessmentAtemptResultDto[]
}

export interface ShowAnswerInput {
    userId: number;
    assessmentScheduleId: number;
}

export interface JobCompatiblityRoleObject {
    name: string;
    value: number;
    description?: string;
}

export interface JobCompatiblityParentResult {
    roleResult: JobCompatiblityRoleObject[],
    eligibleRole: JobCompatiblityRoleObject,
    notEligibleRole: JobCompatiblityRoleObject,
    index: number
}

export interface AIAdaptiveAssessmentRequest {
    userId: number;
    skipCount: number,
    maxResultCount: number,
}

