import { IssueSeverity, IssueType } from "@app/enums/test";
import { StackReportChartOptions } from "@app/interface/chart";
import { NgbDate } from "@app/shared/helper";
import { AssessmentStatus, ProctorType } from "../../enums/assessment";

export interface ReportFilter {
    assessmentName: string;
    assessmentStatus: AssessmentStatus;
    userName: string;
    assessmentStartDate: string;
    assessmentEndDate: string;
    startDate: NgbDate;
    endDate: NgbDate;
    isExport: boolean;
    tenantName: string;
    tenantId: number;
    timeZone: string;
    isExportSfa?: boolean;
    IsCloudBasedAssessment?: boolean;
    isAdaptiveAssessmentReport?: boolean;
    isCollaborativeAssessmentReport?: boolean;
    selectedTestPurposeScheduleIds: string;
}

export interface assignmentReportFilter {
    tenantId: number,
    userEmail: string,
    startDateUtc: string,
    endDateUtc: string,
    timeZone: string
}

export interface ReportData {
    TenantId: number;
    TenantName: string;
    UserId: number;
    FirstName: string;
    LastName: string;
    FullName: string;
    Email: string;
    AssessmentName: string;
    LinkType: string;
    CutOff: number;
    AttemptNumber: number;
    AttemptDate: Date;
    Duration: number;
    ScorePercentage: number;
    Status: string;
    IsProctoringPassed: string;
}
export interface AssessmentReviewReport {
    file: Blob;
}
export interface TodayDate {
    year: number;
    month: number;
    day: number;
}

export interface UserAssessmentDetails {
    assessmentDetails: AssessmentDetails[];
    totalCount: number;
    tenantId: number;
    userName: string;
    name: string;
    surname: string;
}

export interface AssessmentDetails {
    assessmentName: string;
    attemptNumber: number;
    scheduleIdNumber: string;
    assessmentScheduleId: number;
    proctorType: ProctorType;
}

export interface AssessmentRequest {
    UserId: number;
    SkipCount: number;
    MaxResultCount: number;
}

export interface ProctoringReportRequest {
    student_unique_id: string;
    event_id: string;
    attemptnumber: number;
}

export interface StackCodeQualityRequestDto {
    userId: number,
    userAssessmentAttemptId: number
}

export interface StackMetricsDto {
    instructionDocumentLink: string,
    status: string,
    username: string,
    emailAddress: string,
    infoBugs: number,
    minorBugs: number,
    majorBugs: number,
    criticalBugs: number,
    blockerBugs: number,
    infoCodeSmells: number,
    minorCodeSmells: number,
    majorCodeSmells: number,
    criticalCodeSmells: number,
    blockerCodeSmells: number,
    infoVulnerabilites: number,
    minorVulnerabilities: number,
    majorVulnerabilities: number,
    criticalVulnerabilities: number,
    blockerVulnerabilities: number,
    maintainabilityRating: string,
    reliabilityRating: string,
    securityRating: string,
    duplicatedLines: number,
    duplicatedFiles: number,
    duplicatedBlocks: number,
    commentLines: number,
    customField: string,
    stackId: string,
    language: string,
    codeQualityChartOptions?: Partial<StackReportChartOptions>,
    testCaseStatusChart?: Partial<StackReportChartOptions>,
    userTestCaseStatusChart?: Partial<StackReportChartOptions>,
    testCaseResultsSummary?: TestCaseResultsSummary,
    userTestCaseResults?: UserTestCaseResults[],
    analyticsReport?: AnalyticsReportDto[],
    testCaseResultsReport?: TestCaseResultsReportDto[]
}

export interface AnalyticsAndTestCaseRequestDto {
    userAssessmentAttemptId: number,
    assesmentScheduleId?: number,
    userId?: number,
    isCollaborativeAssessment?: boolean
}

export interface AnalyticsAndTestCaseReportDto {
    testCaseResultsSummary: TestCaseResultsSummary,
    analyticsReport: AnalyticsReportDto[],
    testCaseResultsReport: TestCaseResultsReportDto[],
    language: string,
    stackId: string,
    userTestCaseResults: UserTestCaseResults[]
}
export interface UserTestCaseResults {
    emailAddress: string,
    taskName: string,
    testCasesPassed: number,
    boundaryTestCasesFailed: number,
    boundaryTestCasesPassed: number,
    functionalTestCasesFailed: number,
    functionalTestCasesPassed: number,
    exceptionTestCasesFailed: number,
    exceptionTestCasesPassed: number,
    businessTestCasesFailed: number,
    businessTestCasesPassed: number
}
export interface TestCaseResultsSummary {
    totalTestCases: number,
    testCasesPassed: number,
    boundaryTestCasesFailed: number,
    boundaryTestCasesPassed: number,
    functionalTestCasesFailed: number,
    functionalTestCasesPassed: number,
    exceptionTestCasesFailed: number,
    exceptionTestCasesPassed: number,
    businessTestCasesFailed: number,
    businessTestCasesPassed: number
}

export interface AnalyticsReportDto {
    fileName: string,
    message: string,
    lineNumber: number,
    severity: IssueSeverity
    type: IssueType
}

export interface TestCaseResultsReportDto {
    totalTestCaseCount: number,
    methodType: string,
    methodName: string,
    status: string
}

export interface UserStackAssessmentsRequestDto {
    EmailAddress: string,
    SearchString: string,
    SkipCount: number,
    MaxResultCount: number,
    TenantId: number,
    IsCollaborativeAssessment: boolean,
    startDate: NgbDate,
    endDate: NgbDate,
    timeZone: string,
    assessmentStartDate: string,
    assessmentEndDate: string,
    selectedTestPurposeScheduleIds: string
}

export interface StackReportData {
    emailAddress: string,
    attemptNumber: number,
    userId: number,
    status: string,
    totalCount: number,
    scorePercentage: number,
    assessmentName: string,
    userAssessmentAttemptId: number,
    templateType: string,
    assessmentScheduleId: number,
    userAssessmentStack: UserAssessmentStack[],
    isStackDetails: boolean
}
export interface UserAssessmentStack {
    language: string,
    projectName: string,
    stackId: string
}
export interface GitCommitHistory {
    commitMessage: string,
    commitTime: string,
    authorName: string
}

export interface AeyeProctoringReportRequest {
    scheduleId: number;
    userEmail: string;
    attemptNumber: number;
    skipCount?: number;
    maxResultCount?: number;
}

export interface RuleViolations {
    rule_tag: string;
    violation_count: number;
}

export interface ReportTestTakerData {
    duration: number;
    email_id: string;
    exam_id: string;
    exam_name: string;
    first_name: string;
    last_name: string;
    proctoring_result: string;
    proctoring_score: number;
    proctors: string;
    proctors_comments: string;
    start_at: string;
}

export interface ReportChatHistory {
    created_at: string;
    created_for: string;
    message_text: string;
    message_type: string;
    proctor_name: string;
    test_taker_name: string;
    uuid: string;
}

export interface SessionAlertData {
    alert_message: string;
    alert_title: string;
    alert_type: string;
    created_at: string;
    desktop_blob_name: string;
    exam_id: string;
    media_blob_name: string;
    proctor_id: string;
    rule_tag: string;
    tenant_id: string;
    test_taker_id: string;
    timestamp: string;
    uuid: string;
}

export interface ReviewSessionUserDetails {
    email_id: string;
    exam_end_comment: string;
    exam_name: string;
    first_name: string;
    last_name: string;
    mug_shots_front_image_blob_name: string;
    photo_id_image_blob_name: string;
    proctoring_result: string;
    person_with_id_card_image_blob_name: string;
    proctoring_score: number;
}

export interface AeyeVideoRequestDto {
    scheduleId: number;
    userEmail: string;
    imageName: string;
    attemptNumber: number;
}

export interface AeyeUsageReportDto {
    from_date: string;
    to_date: string;
    email: string;
    tenant_name: string;
}

export interface AeyeUserFullVideo {
    userEmail: string;
    userExamId: number;
}

export interface ProctorStatus {
    scheduleId: number;
    userEmail: string;
    attemptNumber: number;
    proctorStatus: string;
    rejectedReason: string;
}
