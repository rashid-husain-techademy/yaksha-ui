import { Injectable } from '@angular/core';
import { Result } from './../shared/core-interface/base';
import { Helper } from './../shared/helper';
import { Observable } from 'rxjs';
import { ApiClientService } from './../service';
import { AssessmentRequestDto, AssessmentResultDto, CategoryDto } from './assessments';

const routes = {
    getUserBasedAssessmentsList: 'yaksha/Assessment/GetUserBasedAssessments',
    // categories
    getCategories: "yaksha/Category/GetCategories",
};

@Injectable({
    providedIn: 'root'
})
export class AssessmentsService {
    constructor(private apiClient: ApiClientService) { }

    getUserBasedAssessmentsList(data: AssessmentRequestDto): Observable<Result<AssessmentResultDto>> {
        return this.apiClient.get(routes.getUserBasedAssessmentsList, Helper.httpParamBuilder(data));
    }

    getCategories(): Observable<Result<CategoryDto[]>> {
        return this.apiClient.get(routes.getCategories);
    }
}
