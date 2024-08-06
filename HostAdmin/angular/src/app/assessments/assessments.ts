import { AssessmentType } from "@app/enums/assessment";

export interface AssessmentRequestDto {
    tenantId: number | null;
    categoryId: number | null;
    catalogId: number | null;
    userId: number | null;
    searchString: string;
    skipCount: number;
    maxResultCount: number;
    assessmentStatus: string;
}

export interface AssessmentResultDto {
    totalCount: number;
    assessments: AssessmentDetailDto[];
}

export interface AssessmentDetailDto {
    name: string;
    totalSkills: number;
    totalQuestions: number;
    totalMCQQuestions: number;
    totalCodingQuestions: number;
    totalStackQuestions: number;
    assessmentType: AssessmentType;
    id: number;
    assessmentScheduleIdNumber: string;
    categoryName: string;
    totalAttempts: number;
    passPercentage: number;
}

export interface CategoryDto {
    id: number;
    name: string;
}

export interface CategoryDetails {
    name: string;
    description: string | null
    idNumber: string | null;
    sortOrder: number;
    id: number
}