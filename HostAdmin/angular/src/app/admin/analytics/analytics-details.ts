export enum DashboardUserRoles {
    TenantUser = 10,
    TenantManager = 20,
    TenantAdmin = 30,
    SuperAdmin = 40,
    All = 50
}

export enum DashboardType {
    DefaultType = 10,
    OptionalType = 20,
    UserStandardAssessment = 100,
    UserCodingAssessment = 110,
    UserProjectAssessment = 120,
    UserReport = 130,
    KnowledgeBaseAssessmentType = 140,
    CompositeAssessmentType = 150,
    ProjectBaseAssessmentType = 160,
    QuestionBankReportType = 170,
    QuestionPerformanceType = 180,
    TenantAssessmentsType = 190,
    YakshaQuestionPerformance = 210,
    YakshaUserProfile = 220
}

export enum ProjectType {
    KantarYaksha = 70
}