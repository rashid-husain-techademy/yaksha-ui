import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../service/common/api-client.service';
import { AssessmentsReviewProgress, ReviewedQuestionsResponse, ReviewerAssessmentRequest, ReviewerAssessmentResponse, ReviewerScheduleData, ReviewQuestionsRequest, ReviewQuestionsResponse } from './reviewer';
import { Helper } from '@app/shared/helper';
import { Result } from '@app/shared/core-interface/base';
import { AssessmentsCount, ReviewerAssessmentsDetails, ReviewerAssessmentsFilter } from './reviewer';
import { QuestionAttempDetails } from '@app/assessment-review/assessment-review';

const routes = {
    getReviewerAssessmentDetails: "yaksha/UserAssessment/GetAssessmentCandidatesDetails",
    getCandidateQuestionsForReview: "yaksha/UserAssessment/GetEvaluationAssessmentQuestions",
    insertOrUpdateQuestionReview: "yaksha/UserAssessment/InsertOrUpdateReviewedQuestionsAsync",
    getUserQuestionScore: "yaksha/UserAssessment/GetUserQuestionScore",
    getAssessmentsList: 'yaksha/UserAssessment/GetReviewerAssessments',
    getAssessmentsCount: 'yaksha/UserAssessment/GetReviewerAssessmentCountDetails',
    getAssessmentsReviewProgress: 'yaksha/UserAssessment/GetReviewerAssessmentsReviewProgress',
    getReviewerAssessmentSchedules: 'yaksha/UserAssessment/GetReviewerAssessmentSchedules',
    getQuestionAttemptDetails:'yaksha/AssessmentReview/GetAttemptDetails'
};

@Injectable({
    providedIn: 'root'
})

export class ReviewerService {

    constructor(private apiClient: ApiClientService) { }

    getAssessmentsList(data: ReviewerAssessmentsFilter): Observable<Result<ReviewerAssessmentsDetails>> {
        return this.apiClient.get(routes.getAssessmentsList, Helper.httpParamBuilder(data));
    }

    getAssessmentsCount(): Observable<Result<AssessmentsCount>> {
        return this.apiClient.get(routes.getAssessmentsCount);
    }

    getReviewerAssessmentDetails(requestData: ReviewerAssessmentRequest): Observable<Result<ReviewerAssessmentResponse>> {
        return this.apiClient.get(routes.getReviewerAssessmentDetails, Helper.httpParamBuilder(requestData));
    }

    getCandidateQuestionsForReview(request: ReviewQuestionsRequest): Observable<Result<ReviewQuestionsResponse>> {
        return this.apiClient.get(routes.getCandidateQuestionsForReview, Helper.httpParamBuilder(request));
    }

    updateQuestionReviews(formData: FormData): Observable<Result<ReviewedQuestionsResponse>> {
        return this.apiClient.postFile(routes.insertOrUpdateQuestionReview, formData);
    }

    getUserQuestionScore(userAssessmentAttemptQuestionId: number): Observable<Result<number>> {
        return this.apiClient.get(routes.getUserQuestionScore + "?userAssessmentAttemptQuestionId=" + userAssessmentAttemptQuestionId);
    }

    getReviewerAssessmentsReviewProgress(): Observable<Result<AssessmentsReviewProgress[]>> {
        return this.apiClient.get(routes.getAssessmentsReviewProgress);
    }

    getReviewerAssessmentSchedules(): Observable<Result<ReviewerScheduleData[]>> {
        return this.apiClient.get(routes.getReviewerAssessmentSchedules);
    }

getQuestionAttemptDetails(questionId: number, assessmentSectionSkillId:number): Observable<Result<QuestionAttempDetails>> {
        return this.apiClient.get(routes.getQuestionAttemptDetails + "?questionId=" + questionId+ "&assessmentSectionSkillId=" +assessmentSectionSkillId);
    }
}