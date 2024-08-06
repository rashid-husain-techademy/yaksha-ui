import { QuestionReviewStatus, ReviewerComment } from "@app/enums/question-bank-type";
import { TestCaseResultStatus } from "../enums/test";

export interface CodingAssessment {
    languageId: number;
    language: string;
    editorLanguage: string;
    compilerLanguage: string;
    compilerVersionCode: string;
    defaultCode: string;
}

export interface TestcasesResult {
    questionId: number;
    id: number;
    testCaseTitle: string;
    standardInput: string;
    expectedOutput: string;
    maxCpuTime: number | null;
    maxMemoryPermitted: number;
    isTestcaseExecuted: boolean;
    actualOutput?: TestCaseResultStatus;
    actualmaxCpuTime?: number;
    actualmaxMemoryPermitted?: number;
}

export interface StackAssessmentDetail {
    instructionDocumentUrl: string;
    language: string;
}

export interface UserToggledAnswers {
    choice: string;
    isSelected: boolean;
}

export interface UserInputAnswers {
    inputId: string;
    givenAnswer: string;
}

export interface RequestAssessmentQuestions {
    tenantAssessmentReviewId: number;
    reviewerId: number;
    tenantId: number;
    reviewCommentStatus: string;
    skillId?: number | null;
    subSkillId?: number | null;
}

export interface ResultReviewAssessmentQuestions {
    tenantAssessmentReviewId: number,
    createdUserRole: string,
    assessmentName: string,
    reviewStatus: number,
    sections: AssessmentSections[],
    errorMessage: string,
    assessmentReviewerId: number,
    assessmentId: number,
    categories: CategoryDto[],
    canSignOff: boolean
}

export interface CategoryDto {
    id: number;
    name: string;
}

export interface Questions {
    assessmentId:number,
    assessmentSectionSkillId: number,
    serialNumber: number,
    questionId: number,
    questionText: string,
    isEnableQuestionEdit: boolean,
    choices: string,
    questionHints: QuestionHints[],
    questionType: QuestionType,
    reviews: QuestionReviews[],
    currentReviewerQuestionStatus?: number|null;
    isEnableFeedbackOptions: boolean,
    expectedCount?: number,
    chosenAnswer?: string,
    duration?: number,
    sectionId: number,
    skillName: string;
    subSkillName: string;
    proficiencyId: number;
    isEnableQuestionDelete?: boolean;
    answers?: string;
    isReviewerLogin: boolean;
    selectedCommentStatus: string;
    isReadOnly?: boolean;
    backgroundColor?: string;
    isReplaceQuestion: boolean;
}

export interface AssessmentSections {
    sectionId: number
    sectionName: string,
    questions: Questions[]
}

export interface QuestionHints {
    id: number,
    description: string
}

export interface QuestionType {
    id: number,
    name: string,
    parentQuestionTypeId: number,
    config: string
}

export interface QuestionReviews {
    reviewCommentId: number,
    questionId: number,
    reviewerId: number,
    reviewerName: string,
    comment: string,
    questionReviewStatus: ReviewerComment,
    enableAdminReply?: boolean,
    adminReply?: AdminReplyDto | null
}

export interface AdminReplyDto {
    reviewerId: number,
    reviewerName: string,
    comment: string,
}

export interface ReviewCommentsDto {
    id: number,
    tenantId: number,
    assessmentReviewerId: number,
    questionId: number,
    comments: string,
    questionReviewStatus: ReviewerComment,
    tenantAssessmentReviewId: number,
    parentReviewCommentId?: number | null
}

export interface UpdateReviewStatusDto {
    tenantAssessmentReviewId: number,
    status: QuestionReviewStatus,
    reviewerName: string
}

export interface ReviewDetailsDto {
    tenant: TenantDto,
    reviewerEmails: UserDto[],
    expiryDateTime: Date,
    adminEmails: UserDto[],
    showAnswer: boolean,
    signOffReviewerEmail: UserDto
}

export interface UpdateReviewDto {
    tenantId: number;
    tenantAssessmentReviewId: number;
    assessmentReviewerId: number;
    expiryDateTime: string;
    timeZone: string;
    reviewers: string[]
}

export interface UserDto {
    id: number;
    userEmail: string;
}

export interface ReviewersDto {
    id: number;
    name: string;
}

export interface ResultDto {
    isSuccess: boolean;
    errorMessage: string;
}

export interface ReviewSignOffResultDto {
    isSuccess: boolean;
    warningMessage: string;
}

export interface AssignAssessmentReviewerDto {
    tenantId: number;
    adminUserIds: number[];
    assessmentId: number;
    linkExpiryDateTime: string;
    timeZone: string;
    reviewersEmail: string[];
    signOffReviewerEmail: string;
    showAnswer: boolean;
}

export interface ReviewQuestionnarieDto {
    tenantId: number;
    assessmentId: number;
    tenantAssessmentReviewId: number;
    assessmentReviewerId: number;
    isUpdate: boolean;
    isReReview: boolean;
}

export interface TenantDto {
    id: number;
    name: string;
}

export interface RequestReviewDetails {
    tenantId: number;
    tenantAssessmentReviewId: number;
}

export interface RequestGetUserEmails {
    tenantId: number;
    roleName: string;
}

export interface RequestReviewerAssigned {
    tenantId: number;
    assessmentId: number;
}

export interface ReviewAssessmentDto {
    tenantId: number;
    tenantAssessmentReviewId: number;
    assessmentId: number;
    assessmentName: string;
    signedOffOn: Date;
    requestedOn: Date;
    createdBy: string;
    reviewStatus: string;
    assessmentReviewerId: number;
    expiryDate: Date;
    signedoffBy: string;
    createdUserRoleName: string;
    reviewedQuestionsDetails: ReviewedQuestionsDetails;
}

export interface ReviewedQuestionsDetails {
    totalQuestions: number;
    accepted: number;
    rejected: number;
    suggested: number;
    pending: number;
}

export interface ResultReviewAssessmentsDto {
    totalCount: number;
    assessmentReviewDetailsDto: ReviewAssessmentDto[];
}

export interface AssessmentRequestDto {
    tenantId: number;
    searchString: string;
    skipCount: number;
    maxResultCount: number;
    categoryId: number;
    reviewerId: number;
    reviewStatus: number;
}

export interface DeleteQuestionDto {
    sectionSkillId: number;
    proficiencyId: number;
    questionId: number;
}

export interface AssessmentReviewerUserDto {
    userId: number;
    assessmentReviewerId: number;
}

export interface ReviewProgressInputDto {
    tenantAssessmentReviewId: number;
    assessmentReviewerId: number;
}

export interface ReviewerCommentCheckDto {
    tenantAssessmentReviewId: number;
    questionId: number;
    assessmentReviewerId: number;
}

export interface DashboardDetailsResponseDto {
    assessmentName: string;
    type: number;
    totalSections: number;
    totalQuestions: number;
    totalCategories: number;
    totalSkills: number;
    startDateTime: Date;
    endDateTime: Date;
    currentProgress: number;
    totalQuestionsDetails: ReviewedQuestionsDetails;
    beginnerQuestionsDetails: ReviewedQuestionsDetails;
    intermediateQuestionsDetails: ReviewedQuestionsDetails;
    advancedQuestionsDetails: ReviewedQuestionsDetails;
    acceptedQuestionsDetail: AcceptedQuestionsDetail[];
    reviewers: string[];
}

export interface AcceptedQuestionsDetail {
    proficiencyLevelId: number;
    requiredAcceptedCount: number;
    currentAcceptedCount: number;
    remainingCount?: number | null;
}

export interface SkillDto {
    id: number;
    name: string;
}

export interface SubSkillRequestDto {
    tenantAssessmentReviewId: number;
    skillId: number;
}

export interface AssessmentSignOffQuestionsDetails {
    totalQuestionsCount: number;
    beginnerQuestionsCount: number;
    intermediateQuestionsCount: number;
    advancedQuestionsCount: number;
}

export interface SectionStatus {
    sectionName: string;
    assessmentSectionId: number;
    approvedQuestionCount: number;
    beginnerQuestions: number;
    intermediateQuestions: number;
    advancedQuestions: number;
}

export interface SectionDto {
    sectionName: string;
    assessmentSectionId: number;
}

export interface SkillStatus {
    skillName: string;
    assessmentSectionId: number;
    approvedQuestionCount: number;
    beginnerQuestions: number;
    intermediateQuestions: number;
    advancedQuestions: number;
}

export interface updateSections {
    assessmentId: number;
    assessmentSectionId: number;
    assessmentSectionSkillId: number;
    removedQuestionId: number;
}

export interface QuestionAttempDetails {
    correctAttempts: number;
    incorrectAttempts: number;
}
