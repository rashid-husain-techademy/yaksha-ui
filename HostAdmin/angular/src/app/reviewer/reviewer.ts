import { AssessmentSections } from '../admin/assessment/assessment';
import { ReviewerEvaluationStatus } from '../enums/reviewer';

export interface ReviewerAssessmentsFilter {
    reviewerAssessmentStatus: number;
    skipCount: number;
    maxResultCount: number;
    searchString: string
}

export interface ReviewerAssessmentsDetails {
    assessmentList: Assessment[];
    totalCount: number;
}

export interface Assessment {
    assessmentScheduleId: number,
    AssessmentIdNumber: string,
    assessmentName: string,
    categoryName: string,
    startTime: Date,
    endTime: Date,
    totalSubmissions: number,
    totalReviwed: number
}

export interface AssessmentsCount {
    totalAssessment: number,
    totalReviewed: number,
    totalPending: number
}

export interface AssessmentsReviewProgress {
    assessmentName: string,
    assessmentId: number,
    reviewProgressPercentage: number,
    passedAssessmentPercentage: number,
    failedAssessmentPercentage: number,
}

export interface ReviewerScheduleData {
    year: number,
    month: number,
    noOfAssessmentsScheduled: number
}

export interface ReviewerAssessmentRequest {
    AssessmentScheduleId: number;
    IsAssessmentDetails: boolean;
    IsAssessmentSectionDetails: boolean;
    IsCandidateList: boolean;
    SkipCount: number;
    MaxResultCount: number;
    SearchString: string;
}

export class ReviewQuestionsRequest {
    scheduleId: number;
    userId: number;
}

export interface ReviewerAssessmentResponse {
    assessmentDetails: AssessmentDetails;
    assessmentSectionDetails: AssessmentSections[];
    assessmentCandidateDetails: AssessmentCandidates[];
    candidateTotalCount: number;
}

export interface AssessmentDetails {
    assessmentName: string;
    categoryName: string;
    authorName: string;
    noOfAttempts: number;
    startTime: Date | null;
    endTime: Date | null;
    totalSubmissions: number;
    totalReviewed: number;
    description: string;
    instructions: string;
}

export interface AssessmentCandidates {
    userId: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    submissionDate: Date | null;
    attempt: number;
    evaluationStatus: ReviewerEvaluationStatus;
}

export interface ReviewQuestionsResponse {
    userAssessmentMappingId: number;
    userAssessmentAttemptId: number;
    totalAttempts: number;
    questionDetails: QuestionDetails[];
}

export interface QuestionDetails {
    userAssessmentAttemptQuestionId: number;
    questionText: string;
    answer: string;
    questionScore: number;
    language: string;
    totalAttempts: number;
    questionTypeId: number;
    compilerVersionCode: string;
    defaultCode: string;
    isSubjectiveUrl: boolean;
    fileName: string;
    score: number;
    rubrixUrl: string;
    reviewerRubrixUrl: string;
}

export interface UpdateQuestionReviews {
    userAssessmentAttemptQuestionId: number;
    score: number;
}

export interface SubjectiveAnswers {
    answer: string;
    fileName: string;
}

export interface ReviewedQuestionsResponse {
    isSuccess: boolean;
    message: string;
}