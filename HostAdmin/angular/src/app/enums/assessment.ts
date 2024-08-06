export enum AssessmentStatus {
    Draft = 10,
    Published = 20,
    Scheduled = 30
}

export enum QuestionType {
    MCQ = 10,
    Coding = 20,
    Stack = 30
}

export enum QuestionBankScope {
    Global = 0,
    Shared = 1,
    TenantSpecific = 2,
    TenantRestricted = 3
}
export enum AssessmentType {
    Assessment = 1,
    Hackathon = 2,
    Adaptive = 3
}

export enum ProficiencyLevel {
    Beginner = 10,
    Intermediate = 20,
    Advanced = 30
}

export enum ScheduleTarget {
    Public = 1,
    Private = 2
}

export enum CatalogAssessmentType {
    Shared = 10,
    Owned = 20
}

export enum ViewAssessmentTabs {
    Description = 1,
    Questions = 2,
    Schedule = 3
}

export enum ProctoringResult {
    AllowUserToProceedWithTheTest = 1,
    EndTheTestAfterNotifyingViolationToTheUser = 2
}

export enum WheeboxSettings {
    FaceTraining = 1,
    EnvironmentValidation = 2,
    FaceTrainingIDScanningAutoApproval = 3,
    FaceTrainingIDScanningManualApproval = 4,
    EnvironmentValidationIDScanningAutoApproval = 6,
    EnvironmentValidationIDScanningManualApproval = 7,
    FaceTrainingIDScanningAiApproval = 8,
    EnvironmentValidationIDScanningAiApproval = 9
}

export enum ApprovalType {
    Approver = 1,
    AiApprover = 2
}

export enum CustomFieldType {
    TextBox = 1,
    DropDown = 2
}

export enum UserMyAssessmentStatus {
    SelfEnrolled = 10,
    Invites = 20,
    Completed = 30,
    Campaign = 40
}

export enum UserAssessmentStatus {
    NotStarted = 0,
    InProgress = 10,
    Passed = 20,
    Failed = 30,
    EvaluationPending = 40,
    Abandoned = 50,
    Completed = 60,
    Expired = 70,
    UpComing = 80

}

export enum ScheduleType {
    Public = 1,
    Invite = 2,
    External = 3,
    SelfEnrolled = 4,
    Collaborative = 5,
    SelfRegistration = 6,
    Campaign = 7
}

export enum AdaptiveAssessmentType {
    SingleSkill = 10,
    MultiSkill = 20
}

export enum ReviewerAssessmentStatus {
    InProgress = 10,
    Upcoming = 20,
    Completed = 30
}

export enum AssessmentReviewStatus {
    Pending = 10,
    ReviewSubmitted = 20,
    SignedOff = 30,
    Expired = 40
}

export enum QuestionSelectionMode {
    Manual = 1,
    Automated = 2,
    Hybrid = 3
}

export enum AssessmentScheduleMode {
    Standard = 1,
    ManualAutomated = 2
}

export enum StackTemplateType {
    VSCode = 1,
    Eclipse = 2,
    Jupyter = 3
}

export enum UserAssessmentCompletedStatus {
    Passed = 20,
    Failed = 30,
    EvaluationPending = 40,
    Abandoned = 50
}

export enum ProctorType {
    Wheebox = 1,
    Aeye = 2
}

export enum RegistrationValidationErrors {
    RegistrationInactive = 1,
    RegistrationNotStared = 2,
    RegistrationLinkExpired = 3,
    RegistrationNotAvailable = 4
}

export enum CampaignValidationErrors {
    LinkInActive = 1,
    ValidityNotStartedOrExpired = 2,
    CampaignAlreadyTaken = 3,
    FirstLevelAlreadyTaken = 4,
    AssessmentAlreadyTaken = 5,
    DomainRestriction = 6,
    CampaignNotAvailableForUser = 7,
    CampaignNotAvailable = 8
}

export enum ProctoringStatus {
    Approved = 1,
    Rejected = 2,
    AutoApprove = 3,
    AutoReject = 4,
    ReviewPending = 5
}
