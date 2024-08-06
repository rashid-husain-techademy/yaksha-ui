import { AssessmentScheduleCustomField, AssessmentScheduleCustomFieldUserInput } from "@app/admin/assessment/assessment";
import { AssessmentType, ProctorType, RegistrationValidationErrors, ScheduleType, WheeboxSettings } from "@app/enums/assessment";
import { ScheduleResultType } from "@app/enums/test";

export interface ValidateAssessment {
    assessmentScheduleIdNumber: string;
    emailAddress: string;
    tenantId: number | null;
}

export interface ValidateRegistration {
    assessmentScheduleIdNumber: string;
    tenantId: number;
}

export interface SectionDetails {
    sectionId: number;
    sectionName: string;
    sectionScore: number;
    sectionPercent: number;
}

export interface AssessmentDetails {
    categoryName: string;
    assessmentName: string;
    assessmentId: number;
    duration: number;
    totalSkills: number;
    assessmentPassThreshold: number;
    totalMarks: number;
    totalQuestions: number;
    startTime: Date | null;
    endTime: Date | null;
    cutOffTime: number | null;
    domainRestriction: string;
    enableProctoring: boolean;
    proctoringConfig: string;
    instructions: string;
    sections: Array<SectionDetails>;
    enableWheeboxProctoring: boolean;
    wheeboxProctoringConfig: string;
    totalAttempts: number;
    sourceOfSchedule: string;
    assessmentScheduleCustomField: Array<AssessmentScheduleCustomField>;
    type: AssessmentType;
    assessmentScheduleId: number;
    proctorType: ProctorType
    hideResultStatus: boolean;
    scheduleType: ScheduleType;
    negativeMarking: number;
    campaignDetails: CampaignDetails;
    isSlotBookingEnabled: boolean;
    slotStartTime: string;
    slotEndTime: string;
}

export interface CampaignDetails {
    campaignId: number;
    scheduleIdNumber: string;
    name: string;
    description: string;
    instructions: string;
}

export interface ValidateAssessmentResult {
    isEvaluationPending: boolean;
    isAvailable: boolean;
    errorMessage: string;
    time: string;
    startTime: string;
    endTime: string;
    errorCode: number;
    tenantAdminEmailAddress: Array<string>;
    redirectParam: string;
    resultType: ScheduleResultType;
}

export interface ValidateRegistrationResult {
    isAvailable: boolean;
    errorCode: RegistrationValidationErrors;
    tenantAdminEmails: Array<string>;
    registrationStartDateTime: string;
    registrationEndDateTime: string;
}

export interface HackathonScheuleRequestDto {
    tenantId: number;
    scheduleIdNumber: string;
}

export interface HacakthonScheduleDetailDto {
    tenantLogoUrl: string;
    scheduleCustomFields: CustomFieldDto[];
}

export interface CustomFieldDto {
    fieldLabel: string;
    isMandatory: boolean;
}

export interface HackathonRegistrationDto {
    tenantId: number;
    scheduleIdNumber: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
    customFields: AssessmentScheduleCustomFieldUserInput[];
}

export interface WheeboxUrlResultDto {
    isSuccess: boolean;
    errorMessage: string;
    environmentUrl: string;
    trainUrl: string;
    userRegisterData: string;
    token: string;
    attemptNumber: number;
    approveUrl: string;
    approvePayloadData: string;
    trainPayloadData: string
}

export interface AssessmentSchedulePurposeResponseDto {
    isAssessmentExist: boolean;
    assessmentSchedules: AssesmentSchdules[];
}

export interface AssesmentSchdules {
    scheduleId: number;
    scheduleTestPurpose: string;
}

export interface WheeboxUrlRequestDto {
    userUniqueId: string;
    scheduleIdNumber: string;
    redirectUrl: string;
    pageType: WheeboxSettings;
    userFullName: string;
    dob: string;
    fatherName: string;
    nameOnIdCard: string;
    emailid: string
}

export interface OverAllProctorStatus {
    internetstatus: boolean,
    facecheck: boolean,
    objectcheck: boolean,
    mtoff: boolean,
    noface: boolean,
    pausestatus: boolean,
    forcesubmit: boolean,
    noicedetect: boolean,
    message: string
}
