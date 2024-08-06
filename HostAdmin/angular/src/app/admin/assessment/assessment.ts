import { UserCampaignStatus } from "@app/my-assessments/my-assessments";
import { ScheduleTarget, AssessmentStatus, QuestionBankScope, CatalogAssessmentType, ProctoringResult, CustomFieldType, ScheduleType, AssessmentType, AdaptiveAssessmentType, AssessmentScheduleMode, QuestionSelectionMode, ProctorType, UserAssessmentStatus } from "../../enums/assessment";

export interface CreateSectionSkill {
    assessmentId: number;
    assessmentSectionId: number | null;
    assessmentSectionSkillId: number | null;
    sectionName: string;
    skill: Skill;
    totalQuestions: number;
    questionIds: number[];
}

export interface Skill {
    skillId: number;
    subSkillId: number | null;
    subSubSkillId: number | null;
    questionBankScope: QuestionBankScope;
    questionIds: number[];
    skillMetadata: SkillMetadata[];
}

export interface SkillMetadata {
    parentQuestionTypeId: number;
    totalQuestions: number;
    isAutomated: boolean;
    codingLanguageId: number[] | null;
    configJson: string;
    proficiencyLevelQuestions: ProficiencyLevelConfig[];
}

export interface ConfigJson {
    codingLanguageId: number[] | null;
}

export interface ProficiencyLevelConfig {
    proficiencyLevelId: number;
    totalQuestions: number;
}

export interface QuestionTypeConfig {
    parentQuestionTypeId: number;
    isAutomated: boolean;
}

export interface AutomatedConfig {
    typeName: string;
    parentQuestionTypeId: number;
    codingLanguageId: number[] | null;
    beginnerCount: number | 0;
    intermediateCount: number | 0;
    advancedCount: number | 0;
}

export interface Assessment {
    id: number;
    assessmentStatus: AssessmentStatus;
    assessmentType: AssessmentType;
    categories: CategoryDto[];
    name: string;
    description: string;
    instructions: string;
    assessmentQuestionsConfigDto: AssessmentQuestionsConfigDto;
}

export interface AssessmentStatusUpdateDto {
    assessmentId: number;
    status: AssessmentStatus;
}

export interface SortOrderUpdateDto {
    assessmentSectionId: number;
    sortOrder: number;
}

export interface AssessmentDetail {
    id: number;
    authorName: string;
    assessmentStatus: AssessmentStatus;
    assessmentType: AssessmentType;
    description: string;
    duration: number;
    instructions: string;
    name: string;
    totalQuestions: number;
    totalApprovedQuestions: number;
    totalSections: number;
    totalSkills: number;
    hasActiveSchedules: boolean;
    assessmentSections: AssessmentSections[];
    categories: CategoryDto[];
    isOwned: boolean;
    configJson: string;
    assessmentQuestionsConfigDto: AssessmentQuestionsConfigDto;
    assessmentIdNumber: string;
    questionBankScope: QuestionBankScope;
    skillType: AdaptiveAssessmentType;
    activeScheduleWithShowAnswer: boolean;
}

export interface AssessmentQuestionsConfigDto {
    assessmentQuestionsCriteria: assessmentQuestionConfig
}

export interface CategoryDto {
    id: number;
    name: string;
}

export interface ProctorDto {
    id: string;
    name: string;
}

export interface AssessmentSections {
    id: number;
    sectionName: string;
    sortOrder: number;
    totalSkills: number;
    totalQuestions: number;
    duration: number;
    sectionSkills: SectionSkills[];
    totalSkillQuestionsCountDetails: TotalSkillQuestionsCountDetails;
}

export interface DeleteSectionRequestDto {
    assessmentId: number;
    assessmentSectionId: number;
}

export interface DeleteSectionSkillRequestDto {
    assessmentId: number;
    assessmentSectionId: number;
    assessmentSectionSkillId: number;
}

export interface SectionSkills {
    assessmentSectionSkillId: number;
    skillId: number;
    skillName: string;
    duration: number;
    totalMCQQuestions: number;
    totalCodingQuestions: number;
    totalStackQuestions: number;
    configJson: string;
    proficiencyLevelQuestions: ProficiencyLevelQuestions[];
}

export interface AssignAssessmentReviewerDto {
    tenantId: number;
    adminUserIds: number[];
    assessmentId: number;
    linkExpiryDateTime: string;
    timeZone: string;
    reviewerEmail: string;
}

export interface ScheduleAssessmentDto {
    assessmentId: number;
    assessmentName: string;
    categoryName: string;
    type: AssessmentType;
    assessmentScheduleId: number | null;
    tenantId: number | null;
    isUpdateScheduleAssessment: boolean;
    isStackAssessment?: boolean;
    totalQuestions: number;
    assessmentSections: AssessmentSections[];
    randomizationDetails: AssessmentSectionDetails[];
    isTenantQuestions: boolean;
    isCloneSchedule: boolean;
}

export interface AssessmentTenants {
    id: number;
    name: string;
    tenancyName: string;
}

export interface TenantReviewer {
    id: number;
    name: string;
    surname: string;
    userName: string;
}

export interface UserInviteValidation {
    isSuccess: boolean;
    userIds: string;
    errorList: string[];
}

export interface UserGroupInviteValidation {
    isSuccess: boolean;
    errorMessages: string[];
}

export interface ScheduleAssessment {
    assessmentId: number;
    assessmentName: string;
    totalQuestions: number;
    tenantId: number;
    type: AssessmentType;
    totalAttempts: number;
    passPercentage: number;
    negativeScorePercentage: number;
    duration: number;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    scheduleTarget: ScheduleTarget;
    stackTemplateTypeIds: number[];
    restrictToDomain: string;
    reviewerIds: number[];
    sendResultsEmail: boolean;
    enableShuffling: boolean;
    enablePlagiarism: boolean;
    persistContainer: boolean;
    isMockSchedule: boolean;
    isShuffleMcqOptions: boolean;
    isCollaborativeAssessment: boolean;
    isCutOffTimeEnabled: boolean;
    executionCount: number;
    qrValidTime: number;
    cutOffTime: number;
    enableFullScreenMode: boolean;
    restrictWindowViolation: boolean;
    windowViolationLimit: number;
    invitedUserEmails: string;
    invitedUserIds: string;
    showResults: boolean;
    getFeedback: boolean;
    enableCalculator: boolean;
    isCopyPasteEnabledForCoding?: boolean;
    submitEnableDuration: number;
    enableProctoring: boolean;
    // wheeboxSettings: boolean,
    //  environmentValidation: WheeboxSettings,
    // internetStatus: boolean,
    // faceCheck: boolean,
    // suspiciousObjectCheck: boolean,
    // twoFaces: boolean,
    // noFace: boolean,
    // liveProctoring: boolean,
    // proctoringViolation: ProctoringResult,
    sectionDuration: SectionBasedTimer[];
    assessmentScheduleCustomFields: AssessmentScheduleCustomField[],
    scheduleType: ScheduleType,
    scheduleAssessmentCatalogId?: number
    // videoRecording: boolean
    // proctorMapping: boolean,
    // proctors: number,
    //  proctorMappingTestTakerCount: number,
    // isHardMapping: boolean,
    // isScreenSharing: boolean,
    //  screenSharingViolationLimit: number,
    scheduleMode: AssessmentScheduleMode,
    metadataDetails: MetaDataDetails[];
    adaptiveAssessmentSectionsConfig: AdaptiveAssessmentSectionsConfig[];
    enableSFATestcase: boolean;
    isCloud: boolean;
    proctorType: ProctorType;
    hideResultStatus: boolean;
    negativeMarkPercentage: number;
    registrationStartDateTime: string;
    registrationEndDateTime: string;
    campaignId: number;
    testPurpose: string;
    testCaseMetricsWeightage: number;
    testCaseWarningWeightage: number;
    IsSlotBookingEnabled: boolean;
    resultViewStartDateTime: string;
    resultViewDuration: number;
    AssessmentScheduleSlotMetadata: SlotRegisterationData;
    roleAnalysisDetails?: ScheduleRoleDetails[];
    enableAeyeDesktopApplicationInstallation?: boolean;
}

export interface SlotRegisterationData {
    slotRegistrationStartDateTime: string;
    slotRegistrationEndDateTime: string;
    supportingLanguages: string[];
    assessmentCentres: string[];
    assessmentScheduleSlotTimings: AssessmentScheduleSlotTiming[];
}
export interface AssessmentScheduleSlotTiming {
    slotStartDateTime: string;
    slotThreshold: number;
}


export interface AdaptiveAssessmentSectionsConfig {
    sectionId: number;
    totalProgression: number;
    totalRegression: number;
}

export interface MetaDataDetails {
    skillMetadataId: number,
    proficiencyDetails: ProficiencyDetails[];
}

export interface ProficiencyDetails {
    proficiencyId: number,
    totalQuestions: number
}

export interface ScheduleResultDto {
    scheduleLink: string;
    isSuccess: boolean;
    errorMessage: string;
    id: number | null;
}
export interface ScheduleSlotResultDto {
    isSuccess: boolean;
    errorMessage: string;
}

export interface NgbDate {
    year: number;
    month: number;
    day: number;
}

export interface AssessmentScheduleFilter {
    AssessmentId: number;
    TenantId: number | null;
    SkipCount: number;
    MaxResultCount: number;
}

export interface AssessmentSchedules {
    totalCount: number;
    assessmentSchedules: AssessmentSchedule[];
}
export interface AssessmentSlots {
    id: number,
    assessmentScheduleSlotMetadataId: number,
    slotStartDateTime: string,
    slotThreshold: number
}

export interface AssessmentSchedule {
    id: number;
    tenantId: number | null;
    tenancyName: string;
    scheduleTarget: ScheduleTarget;
    startDateTime: Date | null;
    endDateTime: Date | null;
    usage: number;
    isActive: boolean;
    scheduleLink: string;
    scheduleType: ScheduleType;
    isPlagiarismCompleted: boolean | null;
    tenantLogoUrl: string;
    testPurpose: string;
    disableActivation: boolean;
    isShowResultEnabled: boolean;
}
export interface slotList {
    id: number,
    slotStartDateTime: string,
    slotThreshold: number
}

export interface UpdateAssessmentSchedule {
    tenantId: number;
    assessmentId: number;
    AssessmentScheduleId: number;
    IsActive: boolean;
}

export interface UpdateScheduleInvite {
    AssessmentScheduleId: number;
    AssessmentName: string;
    TenantId: number | null;
    InvitedUserIds: string;
    InvitedUserEmails: string;
    TotalQuestions: number;
    ScheduleType: ScheduleType;
    IsCloud: boolean;
}

export interface ScheduleInvite {
    assessmentScheduleId: number;
    assessmentName: string;
    tenantId: number | null;
    categoryName: string;
    totalQuestions: number;
    isCloud: boolean;
    scheduleType: ScheduleType;
}

export interface GetAssessmentSchedule {
    AssessmentScheduleId: number;
    TenantId: number | null;
}

export interface UpdateAssessmentScheduled {
    tenantId: number;
    AssessmentId: number;
    AssessmentScheduleId: number;
    EndDateAndTime: string;
    RegistrationEndDateTime: string;
    timeZone: string;
    cutOffTime: number;
    EndDateISOString?: string;
    resultViewStartDateTime: string;
    resultViewDuration: number;
}
export interface UpdateAssessmentSlotScheduled {
    AssessmentScheduleId: number;
    UpdatedRegistrationEndDateTime: string;
}

export interface AssessmentScheduleDto {
    tenantId: number | null;
    assessmentId: number;
    startDateTime: Date | null;
    endDateTime: Date | null;
    totalAttempts: number;
    type: AssessmentType;
    totalProgression: number,
    totalRegression: number,
    passPercentage: number;
    duration: number;
    negativeScorePercentage: number;
    link: string;
    target: ScheduleTarget;
    restrictToDomain: string;
    sendResultsEmail: boolean;
    assessmentConfig: string;
    proctoringConfig: string;
    wheeboxProctoringConfig: string;
    enableWheeboxProctoring: boolean;
    isActive: boolean;
    isMockSchedule: boolean;
    enableProctoring: boolean;
    assessmentScheduleReviewers: AssessmentScheduleReviewer[];
    scheduleType: ScheduleType;
    scheduleMode: AssessmentScheduleMode;
    enablePlagiarism: boolean;
    hideResultStatus: boolean;
    enableSFATestcase: boolean;
    proctorType: ProctorType;
    negativeMarkPercentage: number;
    registrationStartDateTime: Date | null;
    registrationEndDateTime: Date | null;
    testPurpose: string;
    codeBaseMetricsConfig: string;
    isCopyPasteEnabledForCoding?: boolean;
    resultViewStartDateTime: Date | null;
    resultViewDuration: number | null;
    enableAeyeDesktopApplicationInstallation: boolean;
}

export interface AssessmentScheduleResponseDto {
    scheduleDetails: AssessmentScheduleDto;
    assessmentScheduleCustomFields: AssessmentScheduleCustomField[];
    questionRandomizationDetails: AssessmentSectionDetails[];
    scheduleTemplateMappingIds: number[];
    sectionDurationDetails: SectionBasedTimer[];
    adaptiveAssessmentScheduleSectionsConfig: AdaptiveAssessmentScheduleSectionsConfig[];
    persistContainer: boolean;
    roleAnalysisDetails: ScheduleRoleDetails[];
    assessmentScheduleSlotMetadata: AssessmentScheduleSlotMetadata;
}
export interface AssessmentScheduleSlotMetadata {
    assessmentCentres: [],
    assessmentScheduleId: number,
    assessmentScheduleSlotTimings: AssessmentScheduleSlotTimings[];
    id: number
    slotRegistrationEndDateTime: Date | null
    slotRegistrationStartDateTime: Date | null;
    supportingLanguages: []
}
export interface AssessmentScheduleSlotTimings {
    assessmentScheduleSlotMetadataId: number,
    id: number,
    slotStartDateTime: Date | null,
    slotThreshold: number,

}

export interface AssessmentConfig {
    EnableShuffling: boolean;
    IsCutOffTimeEnabled: boolean;
    CutOffTime: number | null;
    ShowResults: boolean;
    ExecutionCount: number;
}

export interface ProctoringConfig {
    EnableFullScreenMode: boolean;
    RestrictWindowViolation: boolean;
    WindowViolationLimit: number;
}

export interface ExecutionConfig {
    ExecutedCount: number;
}

export interface wheeboxProctoringConfig {
    FaceTraining: boolean,
    EnvironmentValidation: boolean,
    InternetStatus: boolean,
    FaceCheck: boolean,
    SuspiciousObjectCheck: boolean,
    TwoFaces: boolean,
    NoFace: boolean,
    LiveProctoring: boolean,
    VideoRecording: boolean,
    ProctoringViolation: ProctoringResult,
    IsHardMapping: boolean,
    IsScreenSharing: boolean,
    ScreenSharingViolationLimit: number
}

export interface AssessmentScheduleReviewer {
    reviewerId: number;
}

export interface AssignRequestDto {
    tenantId: number;
    assessmentIds?: Array<number>;
    categoryId?: number;
    isAssignMultiple?: boolean;
}

export interface AssessmentRequestDto {
    TenantId: number | null;
    CategoryId: number;
    AssessmentStatus: AssessmentStatus;
    AssessmentType: string;
    SearchString: string;
    SkipCount: number;
    MaxResultCount: number;
}

export interface AssessmentTypeDetail {
    id: number;
    name: string;
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
    status: AssessmentStatus;
    type: CatalogAssessmentType;
    assessmentType: AssessmentType;
    assessmentMode?: QuestionSelectionMode;
    hasActiveSchedules: boolean;
    isOwned: boolean | null;
    id: number;
    isSelected: boolean;
    isAdded: boolean;
    assessmentIdNumber: string;
    isStack?: boolean;
    assessmentSections?: AssessmentSections[];
    hasTenats: boolean;
    configJson: string;
    isCoding?: boolean;
    isMCQ?: boolean;
}

export interface CreateOrUpdateAssessmentDto {
    id: number;
    name: string;
    authorName: string;
    description: string;
    instructions: string;
    status: AssessmentStatus;
    categoryIds: number[];
    type: AssessmentType;
    assessmentQuestionsCriteria: assessmentQuestionConfig;
}

export interface CreateResultDto {
    isSuccess: boolean;
    errorMessage: string;
    id: number | null;
}
export interface ResultDto {
    isSuccess: boolean;
    errorMessage: string;
}

export interface AssignResultDto {
    isSuccess: boolean;
    errorMessage: string;
}

export interface AssessmentDto {
    id: number;
    name: string;
    description: string;
    instructions: string;
    categoryName: string;
    authorName: string;
    duration: number;
    totalSections: number;
    totalQuestions: number;
    totalSkills: number;
    categoryId: number;
    assessmentStatus: AssessmentStatus;
    hasActiveSchedules: boolean;
    isOwned: boolean;
    AssessmentSections: AssessmentSections[];
}

export interface AssessmentSkillDto {
    skillId: number;
    subSkillId: number | null;
    subSubSkillId: number | null;
}

export interface SkillDto {
    id: number;
    name: string;
}

export interface SkillDetailDto {
    id: number;
    name: string;
    imageUrl?: string;
}

export interface SubSkillRequestDto {
    skillId: number;
    questionBankScope: QuestionBankScope;
}

export interface SubSubSkillRequestDto {
    skillId: number;
    subSkillId: number;
    questionBankScope: QuestionBankScope;
}

export interface AssessmentSkillQuestionDto {
    skillId: number;
    skillName: string;
    subSkillId: number | null;
    subSkillName: string;
    subSubSkillId: number | null;
    subSubSkillName: string;
    totalQuestions: number;
    questionBankScope: QuestionBankScope;
    skillMetadata: SkillMetadata[];
    questions: QuestionsDto[];
}

export interface SkillQuestionDto {
    questionId: number;
    questionText: string;
    parentQuestionTypeId: number;
    parentQuestionTypeName: string;
    proficiency: QuestionProficiencyDto;
}

export interface CompilerLanguages {
    language: string;
    editorLanguageCode: string;
    compilerLanguageCode: string;
    compilerVersion: string;
    compilerVersionCode: string;
    editorDefaultCode: string;
    id: number;
    isDisabled: boolean;
}

export interface QuestionRequestDto {
    id?: number;
    searchText: string;
    searchQuestionSKUId?: string;
    questionTypeId?: number;
    parentQuestionTypeId?: number;
    skillIds?: string;
    subSkillIds?: string;
    subSkill2Ids?: string;
    proficiencyId?: number;
    codingLanguageId: string;
    questionBankId?: number;
    questionBankScope?: QuestionBankScope;
    categoryIds: string;
    skipCount: number;
    maxResultCount: number;
    moduleNameSearchText: string;
    courseNameSearchText: string;
}

export interface QuestionPaginationRequestDto {
    questionRequestDto: QuestionRequestDto
    skipCount: number;
    maxResultCount: number;
}

export interface UserDto {
    id: number;
    userEmail: string;
}
export interface ReviewersDto {
    id: number;
    name: string;
}
export interface QuestionResultDto {
    totalCount: number;
    proficiencyLevelCount: string;
    questions: QuestionsDto[];
    beginnerLevelCount: number;
    intermediateLevelCount: number;
    advancedLevelCount: number;
}

export interface QuestionsDto {
    questionId: number;
    questionText: string;
    questionIdNumber: string;
    questiontypeId: number;
    parentQuestionTypeId: number;
    parentQuestionTypeName: string;
    proficiency: ProficiencyDto;
    skillId: number;
    subSkillId: number;
    subSkill2Id: number;
    isChecked: boolean;
    isSelected: boolean;
    choices: string[];
}

export interface ProficiencyDto {
    id: number;
    name: string;
    description: string;
}

export interface QuestionTypeDto {
    id: number;
    name: string;
    parentQuestionTypeId: number;
    config: string;
}

export interface QuestionBankDetailDto {
    id: number;
    name: string;
    scope: QuestionBankScope;
}

export interface QuestionProficiencyDto {
    id: number;
    name: string;
}

export interface CreateAssessmentForm {
    categories: CategoryDto[],
    name: string,
    description: string,
    instructions: string,
    isHackathon: boolean,
    totalQuestionsCount: number,
    beginnerQuestionsCount: number,
    intermediateQuestionsCount: number,
    advancedQuestionsCount: number
}

export interface assessmentQuestionConfig {
    totalQuestionsCount: number,
    beginnerQuestionsCount: number,
    intermediateQuestionsCount: number,
    advancedQuestionsCount: number
}

export interface AssessmentData {
    action: string,
    assessmentId: number,
    categoryIds: number[],
    assessmentSectionId: number,
    assessmentSectionSkillId: number,
    skillId: number;
    skillName: string,
    subSkillId: number,
    subSubSkillId: number,
    assessmentName: string,
    sectionName: string,
    isSkillChange: boolean,
    categories: string,
    questionBank: string,
    questionId: number,
    callFrom?: string
}

export interface CategorySkillRequestDto {
    CategoryIds: string,
    QuestionBankScope: QuestionBankScope
}

export interface QuestionBankDetail {
    Id: number,
    Name: string,
    Scope: QuestionBankScope
}

export interface TenantScheduleCatalogResultsDto {
    catalogId: number,
    catalogName: string
}

export interface SectionBasedTimer {
    sectionName: string,
    duration: number,
    assessmentSectionId: number
}

export interface AssessmentScheduleCustomField {
    fieldLabel: string,
    scheduleId?: number,
    fieldType: CustomFieldType,
    defaultValue?: string,
    isMandatory: boolean
}


export interface AssessmentScheduleCustomFieldUserInput {
    fieldLabel: string,
    fieldValue: string
}

export class AssessmentScheduleCustomFieldCollectionDto {
    customField: AssessmentScheduleCustomFieldUserInput[]
}

export interface WheeboxProctor {
    fname: string,
    lname: string,
    loginID: string
}
export interface LeaderBoardDetail {
    firstName: string;
    lastName: string;
    emailAddress: string;
    duration: number;
    score: number;
    proctorScore: number;
    rank: number;
    userId: number;
}
export interface HackathonLeaderBoard {
    totalCount: number;
    startDateTime: Date;
    endDateTime: Date;
    scheduleLink: string;
    scheduleType: number;
    tenantName: string;
    leaderBoardDetails: LeaderBoardDetail[];
    tenantId?: number;
}
export interface HackathonLeaderBoardRequest {
    AssessmentId: number;
    AssessmentScheduleId?: number;
    SearchText?: string;
    SkipCount: number;
    MaxResultCount: number;
}

export interface CreateAdaptiveAssessmentForm {
    id: number;
    name: string,
    description: string,
    instructions: string,
    adaptiveAssessmentType: AdaptiveAssessmentType,
    skill: SkillSectionDto[],
    categories: number[]
}

export interface SkillSectionDto {
    assessmentSectionId: number,
    assessmentSectionSkillId: number,
    assessmentSectionSkillMetadataId: number,
    skillId: number,
    skillName: string,
    questionBankScope: QuestionBankScope,
    configJson: string,
    totalQuestions: number,
    levels: LevelDto[]
}

export interface LevelDto {
    questionsCount: number,
    passPercentage: number,
    proficiencyId: number
}

export interface AssessmentConfig {
    AdaptiveAssessmentType: AdaptiveAssessmentType,
}

export interface LevelConfig {
    proficiencyConfig: ProficiencyLevelConfig[],
    passPercentage: number
}

export interface TotalSkillQuestionsCountDetails {
    skillId: number,
    proficiencyLevelConfig: string;
}

export interface AdaptiveAssessmentDetail {
    id: number;
    authorName: string;
    assessmentStatus: AssessmentStatus;
    description: string;
    duration: number;
    instructions: string;
    name: string;
    totalQuestions: number;
    totalSections: number;
    totalSkills: number;
    hasActiveSchedules: boolean;
    assessmentSections: AdaptiveLevel[];
    categories: CategoryDto[];
    isOwned: boolean;
    assessmentIdNumber: string;
    configJson: string;
    questionBankScope: QuestionBankScope;
    assessmentType: AssessmentType;
    skillType: AdaptiveAssessmentType;
    assessmentQuestionsConfigDto: AssessmentQuestionsConfigDto;
}

export interface AdaptiveLevel {
    id: number;
    sectionName: string;
    sortOrder: number;
    totalSkills: number;
    totalQuestions: number;
    duration: number;
    sectionSkills: LevelSkills[];
    isDeleted: boolean;
    passPercentage: number | null;
    categoryId: number;
    categoryName: string;
    totalSkillQuestionsCountDetails: TotalSkillQuestionsCountDetails;
}

export interface LevelSkills {
    assessmentSectionSkillId: number;
    skillId: number;
    skillName: string;
    duration: number;
    totalMCQQuestions: number;
    totalCodingQuestions: number;
    totalStackQuestions: number;
    configJson: string;
    proficiencyLevelQuestions: ProficiencyLevelQuestions[];
}

export interface ProficiencyLevelQuestions {
    proficiencyLevelId: number;
    totalQuestions: number;
    passPercentage: number;
}

export interface ResultScheduleAssessmentDetails {
    assessmentMode: number;
    assessmentName: string;
    assessmentSections: AssessmentSections[];
    categories: CategoryDto[];
    assessmentType: number;
    totalQuestions: number;
    randomizationDetails: AssessmentSectionDetails[];
    isTenantQuestions: boolean;
}

export interface AssessmentSectionDetails {
    sectionId: number;
    sectionName: string;
    skillDetails: AssessmentSectionSkillDetails[];
}

export interface AssessmentSectionSkillDetails {
    allocatedConfig: string;
    proficiencyLevelQuestions: ProficiencyLevelConfig[];
    isAutomated: boolean;
    parentQuestionTypeId: number;
    skillMetadataId: number;
    skillName: string;
    totalQuestions: number;
}

export interface FormAndMetadataIdDto {
    proficiencyId: number;
    skillMetadataId: number;
    formId: string;
    sectionId: number;
}

export interface ScheduleAssessmentPageInputData {
    assessmentId: number;
    isStack?: boolean;
    isCloud?: boolean;
    isVmBased?: boolean;
    scheduleId: number;
    tenantId: number;
    isUpdateScheduleAssessment: boolean;
    isCoding?: boolean;
    isMCQ?: boolean;
    campaignDetails?: any;
    isSubjective?: boolean;
    isUploadType?: boolean;
    isCloneSchedule: boolean;
}

export interface StackTemplateTypeDetails {
    id: number;
    name: string;
    imageUrl: string;
}
export interface AssessmentTypeDto {
    isStack: boolean;
    isCloud: boolean;
    isVmBased: boolean;
    isSubjective: boolean;
    isUploadType: boolean;
    totalApprovalQuestions: number;
}
export interface AdaptiveAssessmentQuestionsDetailRequestDto {
    categoryIds: number[];
    skillId: number;
    parentQuestionTypeId: number;
    questionBankScope: QuestionBankScope;
}

export interface AdaptiveAssessmentScheduleSectionsConfig {
    assessmentSectionId: number;
    sectionName: string;
    totalProgression: number;
    totalRegression: number;
}

export interface UpdateScheduledAssessmentProctorDto {
    tenantId: number;
    assessmentId: number;
    assessmentScheduleId: number;
    proctorType: ProctorType
}

export interface StackAssessmentInfo {
    isVMBased: boolean;
    isAvailable: boolean;
}

export interface ScheduleConfigOptions {
    SelectReviewers: boolean,
    ExecutionCount: boolean,
    QRValidTime: boolean,
    CustomField: boolean,
    EnablePlagiarism: boolean,
    MockSchedule: boolean,
    PublicSchedule: boolean,
    InviteSchedule: boolean,
    SelfEnrollment: boolean,
    SelfRegistration: boolean,
}

export interface GetRegisteredUsersRequest {
    assessmentId: number;
    skipCount: number;
    maxResultCount: number;
}

export interface ExportHackathonReportDto {
    tenantId: number;
    scheduleId: number;
}

export interface RegisteredUsersResult {
    tenantId: number;
    scheduleId: number;
    totalCount: number;
    customFieldLabels: string[];
    registeredUsers: RegisteredUserData[];
}

export interface RegisteredUserData {
    registrationDate: Date;
    emailAddress: string;
    userName: string;
    customFields: AssessmentScheduleCustomFieldUserInput[];
}

export interface ScheduleStatusDto {
    status: UserAssessmentStatus,
    count: number
}

export interface CampaignStatusDto {
    status: UserCampaignStatus,
    count: number
}

export interface AssessmentCategoryRequestDto {
    TenantId: number,
    CategoryId: number
}

export interface CategoryAssessments {
    id: number,
    assessmentName: string,
}

export interface ExtraTimeUsers {
    selected: boolean;
    id: number,
    name: string;
    email: string;
    attemptNumber: number;
    extraTime: number;
    extendTime: number;
    disableSaveButton: boolean;
}
export interface CloneAssessmentDto {
    id: number;
    name: string;
}

export interface UserAttemptDetailsDto {
    userId: number;
    name: string;
    emailAddress: string;
    tenantId: number;
    assessment: string;
    testPurpose: string;
    userAssessmentMappingId: number;
    availedAttempt: number;
    maxAttempt: number;
    status: UserAssessmentStatus;
}

export interface UpdateUserAttempt {
    tenantId: number;
    userEmail: string;
    scheduleId: number;
    updateAttemptCountBy: number;
}

export interface SubSkillForAssessmentRequestDto {
    skillIds: string;
    questionBankScope: QuestionBankScope;
}

export interface SubSubSkillForAssessmentRequestDto {
    skillIds: string;
    subSkillIds: string;
    questionBankScope: QuestionBankScope;
}

export interface QuestionCountRequestDto {
    id?: number;
    searchText: string;
    questionTypeId?: number;
    parentQuestionTypeId?: number;
    skillIds: number[];
    subSkillIds: number[];
    subsubskillIds: number[];
    proficiencyId?: number;
    codingLanguageId: string;
    questionBankId?: number;
    questionBankScope?: QuestionBankScope;
    categoryIds: string;
    moduleNameSearchText: string;
    courseNameSearchText: string;
    searchQuestionSKUId?: string;
}

export interface QuestionCountProficiencyResponseDto {
    questionData: []
}

export interface ProficiencyCount {
    beginnerQuestionCount: number;
    intermediateQuestionCount: number;
    advancedQuestionCount: number;
}

export interface CreateMultiSectionSkill extends CreateSectionSkill {
    skillList: Skill[];
}

export interface ScheduleRoleDetails {
    roleName: string;
    description: string;
    sectionDetails?: ScheduleRoleSectionDetails[];
}

export interface ScheduleRoleSectionDetails {
    assessmentSectionId: number;
    sectionWeightage: string;
    assessmentScheduleRoleMetadataId?: number;
}