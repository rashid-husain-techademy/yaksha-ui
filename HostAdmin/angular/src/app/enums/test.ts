export enum fieldTypes {
    checkBox = 10,
    input = 20,
    radioButton = 30,
    textArea = 40
}

export enum QuestionStatus {
    Unread = 0,
    Attempted = 1,
    MarkedForReview = 2,
    Skipped = 3
}

export enum UserAssessmentStatus {
    InProgress = 10,
    Passed = 20,
    Failed = 30,
    EvaluationPending = 40,
    Terminated = 50
}

export enum ProctoringSetting {
    FullScreen = 10,
    BrowserWindowViolation = 20,
    InternetStatus = 30,
    FaceCheck = 40,
    SuspiciousObjectCheck = 50,
    TwoFaces = 60,
    NoFace = 70,
    ScreenSharing = 80
}

export enum ScheduleResultType {
    Hidden = 1,
    Detailed = 2,
    Partial = 3,
    Redirect = 4
}

export enum MarkedForReviewStatus {
    UnMarked = 1,
    Marked = 2,
    MarkedAndRemoved = 3
}

export enum TestCaseResultStatus {
    Fail = 10,
    Pass = 20
}

export enum IssueSeverity {
    Blocker = 1,
    Critical = 2,
    Major = 3,
    Minor = 4,
    Info = 5
}

export enum IssueType {
    CodeSmell = 1,
    Bug = 2,
    Vulnerability = 3
}

export enum ReportType {
    MCQ = 1,
    SFA = 2,
    Stack = 3,
    Wheebox = 4,
    Adaptive = 5,
    Collaborative = 6,
    Aeye = 7,
    Cloud = 8,
    AssessmentReview = 9,
    Campaign = 10,
    Assignment = 11
}

export enum InstanceStatus {
    Initiated = 0,
    Running = 10,
    Deleted = 20,
    ProvisionFailed = 30,
    Stopped = 40
}

export enum EnvironmentType {
    Container = 1,
    VirtualMachine = 2
}

export enum MmlStatus {
    CreationInProgress = 1,
    BaseVmNotFound = 2,
    ClusterNotFound = 3,
    DatacenterNotFound = 4,
    DVSNotFound = 5,
    TenantPortGroupNotFound = 6,
    DatastoreNotFound = 7,
    SnapShotNotFound = 8,
    ConfigureParamSuccess = 9,
    CloningInProgress = 10,
    CloningFailed = 11,
    CloningSuccess = 12,
    ReConfigureInProgress = 13,
    ReConfigureFailed = 14,
    ReconfigureSuccess = 15,
    InitialBootInProgress = 16,
    InitialBootSuccess = 17,
    InitialBootFailed = 18,
    CustomizationInProgress = 19,
    CustomizationFailed = 20,
    CustomizationSuccess = 21,
    InitialShutDownInProgress = 22,
    InitialShutDownSuccess = 23,
    InitialShutDownFailed = 24,
    ProvisioningFailed = 25,
    ProvisioningSuccess = 26,
    PowerOnInProgress = 27,
    Running = 28,
    PowerOffInProgress = 29,
    Stopped = 30,
    SuspendInProgress = 31,
    Suspended = 32,
    Restarting = 33,
    RestartingGuestOs = 34,
    ShutDownGuestOsInProgress = 35,
    DeletionInProgress = 36,
    Deleted = 37
}

export enum SubjectiveUploadErrors {
    AssessmentAlreadySubmitted = 1,
    QuestionInActive = 2,
    LinkIsInvalid = 3,
    ErrorOccurred = 4
}

export enum GuacamoleReadyState {
    Connected = 3,
    Closed = 4,
    Connecting = 5
}