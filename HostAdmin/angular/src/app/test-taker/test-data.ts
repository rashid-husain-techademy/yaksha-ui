import { SubjectiveUploadErrors } from "@app/enums/test";
import { AssessmentResultChartOptions, proficiencyChartMetrics } from "./post-assessment-page-view/post-assessment-page-view.component";
import { AssessmentType } from "@app/enums/assessment";
import { JobCompatiblityParentResult } from "@app/admin/user-profile/my-profile/my-profile";

export interface ProgressFilter {
    tenantId: number;
    userId: number;
    assessmentScheduleId: number;
}

export interface PostAssessmentResult {
    assessmentId: number;
    userId: number;
    userEmailAddress: string;
    assessmentScheduleId: number
    assessmentTitle: string;
    assessmentTotalQuestions: number;
    assessmentTotalScore: number;
    assessmentDuration: number;
    passPercentage: number;
    userEarnedPercentage: number;
    cutOffMark: number;
    maxAttempts: number;
    availedAttempts: number;
    userAssessmentMappingStatus: UserAssessmentStatus;
    userLatestAttemptStatus: UserAssessmentStatus | null;
    userLatestAttemptStatusString: string;
    userEarnedScore: number | null;
    completionDate: string;
    userAssessmentDuration: number | null;
    userAssessmentDurationString: string;
    averageQuestionDuration: number | null;
    averageQuestionDurationString: string;
    totalAnswered: number | null;
    totalMarkedForReview: number | null;
    totalCorrect: number | null;
    assessmentProficiencies: string;
    assessmentSections: string;
    assessmentSkills: string;
    questionsSkipped: number;
    assessmentPercentage: number | null;
    totalBeginnerQuestions: number | null;
    correctBeginnerQuestions: number | null;
    totalIntermediateQuestions: number | null;
    correctIntermediateQuestions: number | null;
    totalAdvancedQuestions: number | null;
    correctAdvancedQuestions: number | null;
    cutOffPercentage?: number;
    earnedPercentage?: number;
    remainingAttempts?: number;
    retryUrl: string;
    assessmentScheduleIdNumber: string;
    isAssessmentPassed: boolean;
    skillScore: SkillsScore[];
    sectionScore: SectionScore[];
    chartData: AssessmentResultChartOptions | null;
    totalTestCases?: number;
    testCasesPassed?: number;
    testCasesResult: TestCaseResultDto[];
    questions: AssesmentQuestionDto[];
    isExpand: boolean;
    assessmentType: AssessmentType;
    sectionRecentAttempts: string;
    beginnerPercentage?: number | null;
    intermediatePercentage?: number | null;
    advancedPercentage?: number | null;
    proficiencyJourney: string;
    proficiencyChartMetrics: proficiencyChartMetrics;
    adaptiveAssessmentSectionResults?: string;
    adaptiveSkillResults?: any;
    hideResultStatus: boolean;
    mfaPlagiarismScore: string;
    mfaPlagiarismScanResult: string;
    isMFAAssessment: boolean;
    assessmentName: string;
    userAssessmentMappingId: number;
    blobNames: string[];
    showAnswers: boolean;
    roleAnalysisResult: any;
    jobCompatibilityResult: JobCompatiblityParentResult;
}

export interface SkillsScore {
    SkillName: string,
    TotalQuestions: number,
    TotalCorrect: number,
    TotalScore: number,
    UserEarnedScore: number,
    EarnedScorePercentage: number
}

export interface SectionScore {
    sectionName: string,
    totalQuestions: number,
    totalCorrect: number,
    totalScore: number,
    userEarnedScore: number
    scorePercentage: number,
    earnedScorePercentage: number,
    userSectionalScorePercentage?: number;
    sectionPercentage?: number;
}

export enum UserAssessmentStatus {
    InProgress = 10,
    Passed = 20,
    NotCleared = 30,
    EvaluationPending = 40,
    Terminated = 50,
    Completed = 60
}

export interface ViolationLog {
    violationName: string,
    violationTime: Date
}

export interface TestCaseResultDto {
    assessmentId: number;
    assessmentScheduleId: number;
    userId: number;
    questionId: number;
    plagiarismScore: string;
    plagiarismScanResult: string;
    evaluationResultJson: string;
    answer: string;
    testCaseTitle: string;
    testCaseStatus: string;
    questionText: string;
    questionTypeId: number;
    subSkill: string;
}

export interface AssesmentQuestionDto {
    questionId: number,
    question: string,
    testCasesResults: TestCaseResultDto[]
}

export interface EvaluationResultJsonDto {
    MemoryUtilized: number,
    CpuTime: number,
}
export interface WheeboxPageTypePayload {
    student_unique_id: string;
    custom_logo: string;
    custom_title: string;
    return_url: string;
    event_id: string;
    param: string;
    pagetype: string;
    autoapproval: boolean;
    attemptnumber: number;
    captureimage: string;
    dob?: string;
    father_name?: string;
    fullname?: string;
}

export interface GetSubjectiveQuestionDataDto {
    assessmentId?: number | null;
    userAssessmentAttemptId: number;
    questionId: number;
}

export interface SubjectiveQuestionData {
    assessmentName: string;
    sectionName: string;
    questionText: string;
    prevUploadedFile: string;
}

export interface SubjectiveAnswerUserData {
    userId: number;
    userAssessmentAttemptId: number;
    questionId: number;
    uploadCode: string;
}

export interface UploadSubjectiveAnswerResult {
    isSuccess: boolean;
    errorCode: SubjectiveUploadErrors;
}