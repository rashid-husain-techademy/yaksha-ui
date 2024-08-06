export interface TestTakerAssessmentStatus {
    year: number;
    month: number;
    NoOfAssessmentsTaken: number;
    NoOfAssessmentsScheduled: number;
}

export interface TestTakerAssessmentType {
    noOfTotalTestTaken: number;
    noOfInvitedAssessments: number;
    noOfSelfEnrolledAssessments: number;
    noOfPublicAssessments: number;
}

export interface DashboardAssessmentData {
    yakshaAssessmentsCount: number;
    yakshaCategories: number;
    yakshaSkills: number;
    tenantAssessmentsCount: number;
    tenantCategories: number;
    tenantSkills: number;
    totalUsers: number;
    totalTestTakers: number;
    totalPassed: number;
    totalFailed: number;
    totalReattempts: number;
}

export interface TenantAssessmentData {
    tenantAssessmentsCount: number;
    tenantCategories: number;
    tenantSkills: number;
}

export interface DashboardQuestionsCount {
    qbName: string;
    questionCounts: QuestionCounts[];
}

export interface FilteredSkillProficiency {
    categoryId: number | null;
    categoryName: string;
    skillId: number | null;
    skillName: string;
    isTenantFilter: boolean;
}

export interface QuestionCounts {
    name: string;
    count?: number;
    value?: number;
}

export interface AssessmentStatus {
    testTakerAssessmentStatus: TestTakerAssessmentStatus[],
    testTakerAssessmentType: TestTakerAssessmentType,
    topAssessmentDetails: TopAssessmentDetails[]
}

export interface TestTakerAssessmentStatus {
    year: number,
    month: number,
    noOfAssessmentsTaken: number,
    noOfAssessmentsScheduled: number
}

export interface TestTakerAssessmentType {
    noOfTotalTestTaken: number,
    noOfInvitedAssessments: number,
    noOfPublicAssessments: number
}

export interface TopAssessmentDetails {
    assessmentName: string,
    assessmentsDuration: number,
    noOfAssessmentsScheduled: number,
    noOfTestTakers: number,
    completionPercentage: number
}

export interface AssessmentStatusRequest {
    fromDate?: string;
    toDate?: string;
    tenantId?: number;
    topAssessmentFilter?: boolean;
}

export interface TopSkillAssessments {
    skillName: string
    assessmentCount: number,
    skillImage: string
}

export interface SkillDetails {
    id: number;
    name: string;
}

export interface QuestionFilters {
    tenantId:string;
    skillId?: number;
    categoryId: number;
    proficiencyId: number;
    startDate:string;
    endDate:string;
    timeZone: string;
}