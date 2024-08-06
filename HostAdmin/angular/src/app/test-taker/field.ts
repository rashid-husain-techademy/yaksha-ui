import { AdaptiveAssessmentType, AssessmentType, ProctorType } from "@app/enums/assessment";
import { ProctoringSetting, QuestionStatus, ScheduleResultType, UserAssessmentStatus, MarkedForReviewStatus, TestCaseResultStatus, EnvironmentType, MmlStatus, InstanceStatus } from "@app/enums/test";

export interface UserAssessmentQuestionsDto {
    assessmentId: number;
    assessmentName: string;
    assessmentScheduleId: number;
    userAssessmentMappingId: number;
    userAssessmentAttemptId: number;
    totalQuestions: number;
    totalSections: number;
    assessmentSections: AssessmentSections[];
    assessmentInstructions: string;
    isReviewerAssigned: boolean;
    startDateTime: Date | null;
    endDateTime: Date | null;
    cutOffTime: number | null;
    duration: number;
    enableCalculator: boolean;
    submitEnableDuration: number;
    isProctoringEnabled: boolean;
    isShuffleMcqOptions: boolean;
    proctoringConfig: string;
    isPreview: boolean;
    resultType: ScheduleResultType;
    redirectURL: string;
    enableWheeboxProctoring: boolean;
    enablePlagiarism: boolean;
    wheeboxProctoringConfig: string;
    availedAttempts: number;
    maximumExecutionCount: number;
    configJson: string;
    sectionDuration: SectionBasedDuration[];
    assessmentType: AssessmentType;
    availableProgression: number;
    availableRegression: number;
    currentSectionId: number | null;
    proficiencyJourney: string;
    isCollaborativeAssessment: boolean;
    currentProficiencyId: number;
    skillType: AdaptiveAssessmentType;
    attemptNumber: number;
    enableSFATestcase: boolean;
    proctorType: ProctorType;
    campaignScheduleId?: number | null;
    extraTime: number;
    isCopyPasteEnabledForCoding?: boolean;
}

export interface AssessmentSections {
    assessmentSectionId: number;
    assessmentSectionName: string;
    questions: QuestionDetailDto[];
    sortOrder: number;
    proficiencyId: number | null;
}

export interface SectionAttemptDto {
    scorePercentage: number;
    status: UserAssessmentStatus;
}

export interface QuestionDetailDto {
    isCollaborativeAssessment: boolean;
    userAssessmentMappingId: number;
    skillId: number;
    assessmentSectionSkillId: number;
    assessmentSkillConfig: string;
    assessmentSectionName: string;
    assessmentSectionId: number;
    assessmentScheduleId: number;
    assessmentId: number;
    userEmail: string;
    questionId: number;
    serialNumber: number;
    questionText: string;
    choices: string;
    chosenAnswer: string;
    hintsAvailedJson: string;
    hintsAvailed: number;
    questionHints: QuestionHint[];
    questionType: QuestionType;
    isMarkedForReview: MarkedForReviewStatus;
    isSkipped: boolean;
    isCodeSubmitted: boolean;
    lastModificationTime: string;
    questionStatus: QuestionStatus;
    duration: number;
    chosenLanguage: CodingAssessment;
    codingAssessment: CodingAssessment[];
    codeBasedSubSkill: string;
    testCases: TestcasesResult[];
    userAssessmentAttemptId: number;
    isPreview: boolean;
    statusClass: string;
    isPreventCopyPaste?: boolean;
    expectedCount?: number;
    stackAssessmentDetail: StackAssessmentDetail;
    executionCount: number;
    givencount: number;
    configJson: string;
    countExceed: boolean;
    isShuffleMcqOptions: boolean;
    enableSFATestcase: boolean;
    campaignScheduleId?: number | null;
    isCopyPasteEnabledForCoding?: boolean;
    durationMilliSeconds: number;
    isProctorEnabled?: boolean;
}

export interface SectionBasedDuration {
    sectionName: string,
    duration: number,
    assessmentSectionId: number
}

export interface GetAssessmentQuestions {
    assessmentScheduleIdNumber: string;
    emailAddress: string;
    assessmentId: number | null;
    isPreview: boolean;
    externalArgs?: string;
    customField: string;
    wheeboxAttemptId: number | null;
    campaignScheduleIdNumber?: string;
}

export interface CodingAssessment {
    languageId: number;
    language: string;
    editorLanguage: string;
    compilerLanguage: string;
    compilerVersionCode: string;
    defaultCode: string;
}

export interface QuestionHint {
    id: number;
    questionId: number;
    description: string;
    isViewed?: boolean;
}

export interface QuestionType {
    id: number;
    name: string;
    config: string;
    parentQuestionTypeId: number;
}

export interface InsertOrUpdateUserAttemptQuestions {
    tenantId: number;
    userId: number;
    questionId: number;
    assessmentId: number;
    assessmentScheduleId: number;
    campaignScheduleId?: number | null;
    userAssessmentAttemptId: number;
    parentQuestionTypeId: number;
    questionTypeId: number;
    questionTypeName: string;
    answer: string;
    isMarkedForReview: MarkedForReviewStatus;
    hintsAvailedJson: string;
    userEmailAddress: string;
    userAssessmentMappingId: number;
    duration: number;
    durationMilliSeconds: number;
    reviewerId: number;
    languageId: number | null;
    hintsAvailed: number;
    isCodeSubmitted: boolean;
    isSkipped: boolean;
    executedCount: number;
    timeZone: string;
    isAssessmentSubmitted: boolean;
    IsAdaptiveSectionSubmit?: boolean;
}

export interface AutoSaveUserCodingQuestion {
    tenantId: number;
    userId: number;
    questionId: number;
    userAssessmentAttemptId: number;
    answer: string;
    duration: number;
    durationMilliSeconds: number;
    languageId: number | null;
    timeZone: string;
}

export interface EditorCode {
    script: string;
    args: string;
    stdin: string;
    libs: string[];
    hasInputFiles: boolean;
    language: string;
    versionIndex: string;
    clientId?: string;
    clientSecret?: string;
}

export interface ExecutedResult {
    output: string;
    statusCode: 0;
    memory: string;
    cpuTime: string;
    errorWarningLines: string;
}

export interface TestCaseData {
    attemptId: number;
    questionId: number;
    testCaseId: number | null;
    answer: string;
    language: string;
    versionIndex: string;
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

export interface TestcaseResult {
    output: TestCaseResultStatus;
    memory: number;
    cpuTime: number;
    id: number;
}

export interface GetPostEvaluationStatus {
    tenantId: number,
    userId: number,
    assessmentScheduleId: number,
    userAssessmentMappingId: number,
    isProctoringViolated: boolean,
    violatedProctoringSetting: ProctoringSetting,
    attemptId?: number | null,
    attemptNumber?: number | null,
    isRetry: boolean;
    aeyeTestTakerId?: string;
    aeyeExamId?: string;
    campaignScheduleIdNumber?: string;
}

export interface GetCompilerLanguageDefaultCode {
    questionId: number;
    languageId: number;
}

export interface GetCurrentQuestionAnswer {
    userAssessmentAttemptId: number;
    questionId: number;
}

export interface GetEditorCode {
    tenantId: number;
    userId: number;
    questionId: number;
    assessmentId: number;
    assessmentScheduleId: number;
    timeZone: string;
}

export interface UserInputAnswers {
    inputId: string;
    givenAnswer: string;
}

export interface UserToggledAnswers {
    choice: string;
    isSelected: boolean;
}

export interface ProgressFilter {
    tenantId: number;
    userId: number;
    assessmentScheduleId: number;
    userAssessmentMappingId?: number | null;
    attemptId?: number | null;
    attemptNumber?: number | null;
    assessmentSectionId?: number | null;
    isProctoringViolated?: boolean | null;
    violatedProctoringSetting?: ProctoringSetting | null;
    isSubmitAdaptiveAssessment?: boolean | null;
    proficiencyLevelId?: number;
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
    proficiencyJourney: string;
    passPercentage: number;
    cutOffMark: number;
    maxAttempts: number;
    availedAttempts: number;
    userAssessmentMappingStatus: UserAssessmentStatus;
    userLatestAttemptStatus: UserAssessmentStatus | null;
    userEarnedScore: number | null;
    completionDate: string;
    userAssessmentDuration: number | null;
    averageQuestionDuration: number | null;
    totalAnswered: number | null;
    totalMarkedForReview: number | null;
    totalCorrect: number | null;
    totalIncorrect: number | null;
    assessmentProficiencies: string;
    sectionRecentAttempts: string;
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
    totalTestCases?: number;
    testCasesPassed?: number;
    isExternalAssessment: boolean | null;
    sourceOfSchedule: string;
    isMockSchedule: boolean;
    beginnerPercentage?: number | null;
    intermediatePercentage?: number | null;
    advancedPercentage?: number | null;
    achievedProficiency: string;
    assessmentType: number;
    adaptiveAssessmentSectionResults: any;
    hideResultStatus: boolean;
    isMFAAssessment: boolean;
}

export interface SkillsScore {
    SkillName: string,
    TotalQuestions: number,
    TotalCorrect: number,
    TotalScore: number,
    UserEarnedScore: number,
    EarnedScorePercentage: number
}

export interface ProficiencyChartData {
    x: number;
    y: string;
    z: string;
}

export interface SectionScore {
    SectionName: string,
    TotalQuestions: number,
    TotalCorrect: number,
    TotalScore: number,
    UserEarnedScore: number
    ScorePercentage: number,
    EarnedScorePercentage: number,
    UserSectionalScorePercentage?: number;
    SectionPercentage?: number;
}

export interface UserDetail {
    student_unique_id: string;
    student_name: string;
    attemptId: number;
}

export interface StackAssessmentDetail {
    instructionDocumentUrl: string;
    language: string;
    environmentType: EnvironmentType;
}

export interface StackAssessmentEvaluationData {
    tenantId: number;
    userId: number;
    emailAddress: string;
    assessmentScheduleId: number;
    userAssessmentMappingId: number;
    userAssessmentAttemptId: number;
    questionId: number;
    type: number;
    campaignScheduleIdNumber?: string;
}

export interface ExistingInstanceRequestData {
    tenantId: number;
    userAssessmentAttemptId: number;
    questionId: number;
    type: number;
}

export interface StackSubmissionDetails {
    userInputData: StackAssessmentEvaluationData,
}

export interface UpdateAssessmentQuestionDuration {
    userAssessmentAttemptId: number;
    currentDuration: number;
    durationMilliSeconds: number;
    questionId: number;
}

export class StackLabDetails {
    labLaunchUrl: string;
    labPassword: string;
    configJson: string;
    instanceStatus: InstanceStatus;
}

export interface LabStatusRequest {
    userAssessmentAttemptId: number;
    questionId: number;
    tenantId: number | null;
    containerName: string;
}

export interface LabStatusResponse {
    labLaunchUrl: string;
    labPassword: string;
    status: string;
    containername: string;
}

export interface sectionDurationDto {
    userAssessmentAttemptDetailId: number;
    userId: number;
    assessmentSectionId: number;
    duration: number;
    timeTaken: number;
}

export interface bulkInsertSectionDto {
    userAssessmentAttemptDetailId: number;
    tenantId: number;
    userId: number;
    scoreUpdate: boolean;
}

export interface MarkAsEvaluationDto {
    tenantId: number;
    userId: number;
    assessmentScheduleId: number;
    isAutoSubmit: boolean
}

export interface ScheduledTemplateDetails {
    id: number;
    name: string;
    imageUrl: string;
    isStackAttempted: boolean;
}

export interface UpdateStackAssessmentTemplateType {
    userAssessmentAttemptId: number;
    templateTypeId: number;
}

export interface EvaluateSectionResult {
    isAssessmentSubmitted: boolean;
    isSuccess: boolean;
    errorMessage: string;
    remainingAttempts: number;
    resultMessage: string;
    proficiencyJourneyResult: string;
}

export interface ValidateUserAssessmentData {
    tenantId: number;
    userId: number;
    emailAddress: string;
    assessmentScheduleId: number;
    userAssessmentMappingId: number;
    userAssessmentAttemptId: number;
    questionId: number;
}

export interface ValidateSubmissionResponse {
    isUsersSubmitted: boolean,
    userDetails: UserDetails[];
    isValid: boolean
}

export interface UserDetails {
    emailAddress: string;
    userId: number;
}

export interface StackSubmissionResponse {
    remainingAttempts: number;
    isCollaborativeMember: boolean;
}

export class LabInstanceConfig {
    Volume: string;
    MountPath: string;
    LabLaunchUrl: string;
    DeploymentParameterUrl: string;
    LabPassword: string;
    ResourceGroupName: string;
    AppServicePlan: string;
    InstanceName: string;
    DeploymentRequestId: string;
    DeploymentMessage: string;
    DeploymentStatus: MmlStatus;
    TotalDuration: number;
    LabStatus: string;
    IpAddress: string;
    LabName: string;
    LabId: string;
    RemainingDuration: number;
    Validity: Date;
}

export interface StackMMLLabDetails {
    isSuccess: boolean;
    virtualMachineId: string;
    errorMessage: string;
}

export interface MMLLabConnectionResponseDto {
    isSuccess: boolean;
    stage: number;
    connectionToken: any;
    errorMessage: string;
}

export interface MMLLabStatusUpdateDto {
    status: number;
    virtualMachineId: string;
    tenantId: number;
}

export interface VmDetailsRequestData {
    vmId: string;
    tenantId: number;
}

export interface updateVMDetailsData {
    virtualMachineId: string;
    userAssessmentAttemptId: number;
    questionId: number;
    tenantId: number;
}

export interface VmConnectionRequestData {
    vmId: string;
    tenantId: number;
    stageValue: number;
}

export interface CloudCredentialResponseDto {
    cloudUserName: string;
    cloudPassword: string;
}

export interface CloudTestCaseResults<T> {
    [Key: number]: T
}

export interface ValidateCloudTestCases {
    userAssessmentAttemptId: number;
    questionId: number;
    timeZone: string;
    cloudUserName: string;
}

export interface subjectiveStatusDto {
    isActive: boolean;
    userAssessmentAttemptId: number;
    questionId: number;
}

export interface AssessmentScheduleConfigDto {
    enableShuffling: boolean;
    isCutOffTimeEnabled: boolean;
    cutOffTime: number | null;
    resultType: ScheduleResultType;
    redirectURL: string;
    executionCount: number | null;
    isShuffleMcqOptions: boolean;
    enablePlagiarism: boolean;
    tenantLogoUrl: string;
    getFeedback: boolean;
    qrValidTime: number | null;
}
