export enum QuestionTypes {
    MultipleChoice = 100,
    TrueOrFalse = 200,
    FillInTheBlanks = 300,
    MatchTheFollowing = 400,
    Subjective = 500,
    CodeBased = 600,
    StackBased = 700
}
export enum QuestionTypeId {
    CloudBased = 15
}
export enum QuestionBankTypes {
    Skill = 0,
    Question = 1,
    Shared = 2
}

export enum QuestionBankScope {
    Global = 0,
    Shared = 1,
    TenantSpecific = 2,
    TenantRestricted = 3
}

export enum QuestionReviewStatus {
    Pending = 10,
    ReviewSubmitted = 20,
    SignedOff = 30,
    Expired = 40
}

export enum ReviewerComment {
    Accept = 10,
    Reject = 20,
    Suggest = 30,
    AdminReply = 40
}
