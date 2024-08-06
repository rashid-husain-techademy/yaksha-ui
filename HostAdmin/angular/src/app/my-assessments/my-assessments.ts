export interface UserAssessmentsFilter {
  tenantId: number | null;
  userId: number;
  assessmentStatus: number;
  assessmentStatusFilter: number | null;
  skipCount: number;
  maxResultCount: number;
  searchString: string;
  assessmentCompletedStatusFilter: number | null;
}

export interface UserAssessmentsDetails {
  assessments: Assessment[];
  totalCount: number;
}

export interface Assessment {
  name: string
  totalAttempts: number,
  noOfAvailedAttempts: number,
  startTime: Date,
  endTime: Date,
  cutOffTime: number,
  lastAccessed: Date,
  categoryName: string
  status: number,
  scorePercentage: number,
  completionDate: Date,
  assessmentScheduleIdNumber: string,
  isValid: boolean,
  isAvailable: boolean | null,
  assessmentCompletedStatus: number,
  assessmentType: number,
  isVMBasedAssessment: boolean,
  vmBasedAssessmentStatus: number
}

export interface AssessmentProgressFilter {
  tenantId: number | null;
  userId: number;
  assessmentScheduleId: number;
  isUserProfile: boolean;
}

export interface UserAssessmentProgressDetails {
  assessmentId: number,
  userId: number,
  assessmentScheduleIdNumber: string,
  assessmentScheduleId: number,
  assessmentTitle: string,
  assessmentTotalQuestions: number,
  assessmentTotalScore: number,
  assessmentDuration: number,
  passPercentage: number,
  cutOffMark: number,
  maxAttempts: number,
  availedAttempts: number,
  userAssessmentMappingStatus: number,
  userLatestAttemptStatus: number,
  userEarnedScore: number,
  userEarnedPercentage: number,
  completionDate: string,
  userAssessmentDuration: number,
  averageQuestionDuration: number,
  totalAnswered: number,
  totalMarkedForReview: number,
  totalCorrect: number,
  assessmentProficiencies: string,
  assessmentSections: string,
  assessmentSkills: string,
  actualStart: string,
  actualEnd: string,
  retryUrl: string,
  userEmailAddress: string,
  isProctoringPassed: string,
  isExternalAssessment: boolean,
  sourceOfSchedule: string,
  isMockSchedule: boolean,
  totalTestCases: number,
  testCasesPassed: number,
  isEvaluationError: boolean
}

export interface UserCampaigns {
  userCampaignMappingId: number,
  userCampaignStatus: UserCampaignStatus,
  campaignName: string,
  campaignId: number
  campaignScheduleId: number,
  totalAssessments: number,
  totalVirtutors: number,
  startDate: Date,
  endDate: Date
}

export enum UserCampaignStatus {
  NotStarted = 0,
  InProgress = 10,
  Completed = 20,
  Failed = 30
}

export interface UserCampaignAssessment {
  campaignName: string;
  description: string;
  instructions: string;
  campaignScheduleIdNumber: string;
  isScheduleActive: boolean;
  userCampaignStatus: UserCampaignStatus;
  campaignAssessments: CampaignAssessment[];
}

export interface CampaignAssessment {
  assessmentScheduleIdNumber: string,
  isScheduleActive: boolean,
  assessmentId: number,
  assessmentName: string,
  passPercentage: number,
  startDateTime: Date,
  endDateTime: Date,
  userAssessmentStatus: number
}

export interface UserCampaignRequest {
  skipCount: number;
  maxResultCount: number;
  status: UserCampaignStatus;
  searchString: string;
}

export interface PagedUserCampaigns {
  totalCount: number,
  campaigns: UserCampaigns[]
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

export interface SkillsScore {
  SkillName: string,
  TotalQuestions: number,
  TotalCorrect: number,
  TotalScore: number,
  UserEarnedScore: number,
  EarnedScorePercentage: number
}

export enum VmInstanceStatus {
  Initiated = 0,
  Running = 10,
  Deleted = 20,
  ProvisionFailed = 30,
  Stopped = 40,
  StopTriggered = 50,
  DeletionTriggered = 60
}