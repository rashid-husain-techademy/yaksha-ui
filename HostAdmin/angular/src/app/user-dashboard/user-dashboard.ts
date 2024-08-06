export interface userProgressData {
    yakshaAssessmentsCount: number,
    yakshaCategories: number,
    yakshaSkills: number,
    tenantAssessmentsCount: number,
    tenantCategories: number,
    tenantSkills: number,
    totalUsers: number,
    totalTestTakers: number,
    totalPassed: number,
    totalFailed: number,
    totalReattempts: number,
    userAssessmentsCount: number,
    userPendingAssessmentsCount: number
}

export interface userAssessmentData {
    assessmentName: string,
    startDateTime: string | null,
    endDateTime: string | null,
    assessmentCategory: string,
    attempts: string,
    lastAccessedDate: string | null,
    assessmentScheduleId: string,
    status: number
    isAttemptAvailable: boolean | null;
    isAssessmentStarted: boolean;
}

export interface userTopAssessments {
    skillName: string,
    assessmentCount: number,
    skillImage: string,
    userEarnedPercentage: number
}

export interface assessmentStatusRequestDto {
    fromDate?: string,
    toDate?: string,
    tenantId?: number,
    topAssessmentFilter?: boolean
}

export interface totalCounts {
    name: string;
    count?: number;
    value?: number;
}

export interface assessmentStatus {
    testTakerAssessmentStatus: testTakerAssessmentStatus[],
    testTakerAssessmentType: testTakerAssessmentType,
    topAssessmentDetails: topAssessmentDetails[]
}

export interface testTakerAssessmentStatus {
    year: number,
    month: number,
    noOfAssessmentsTaken: number,
    noOfAssessmentsScheduled: number
}

export interface testTakerAssessmentType {
    noOfTotalTestTaken: number,
    noOfInvitedAssessments: number,
    noOfPublicAssessments: number
}

export interface topAssessmentDetails {
    assessmentName: string,
    assessmentsDuration: number,
    noOfAssessmentsScheduled: number,
    noOfTestTakers: number,
    completionPercentage: number,
    assessmentDate: string,
    assessmentStatus: string,
    assessmentScorePercentage: number,
    takenAttempts: number
}

export interface skillProficienyDto {
    skillName: string,
    scorePercentage: number,
    attemptedQuestions: number,
    correctAnswers: number,
    beginnerQuestionCount: number,
    intermediateQuestionCount: number,
    advancedQuestionCount: number
}
