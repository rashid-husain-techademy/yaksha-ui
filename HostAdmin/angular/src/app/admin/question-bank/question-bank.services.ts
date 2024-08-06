import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiClientService } from "../../service/common/api-client.service";
import { Helper } from '../../../app/shared/helper';
import { Result } from '../../../app/shared/core-interface/base';
import { Category, CategorySkillFilter, CreateQuestionBank, CreateQuestionBankSkill, QbQuestionDetails, QuestionBankFilter, QuestionBankResult, QuestionBankSkillFilter, QuestionBankSubSkillFilter, QuestionFilter, QuestionResult, QuestionType, Skill, SkillDetails, SkillFilter, SkillResult, UpdateTenantQuestionBank } from "./question-bank-details";

const routes = {
    createQuestionBank: "yaksha/QuestionBank/CreateOrUpdateQuestionBankAsync",
    createQuestionBankSkils: 'yaksha/QuestionBank/CreateOrUpdateQuestionBankSkillAsync',
    getQuestionBanks: "yaksha/QuestionBank/GetQuestionBanks",
    getParentQuestionTypes: "yaksha/Question/GetParentQuestionTypes",
    deleteQuestion: "yaksha/QuestionBank/DeleteQuestionBankAsync",
    getCategories: "yaksha/QuestionBank/GetQuestionBankCategories",
    getCategorySkills: "yaksha/QuestionBank/GetCategorySkills",
    getSkillDetails: "yaksha/QuestionBank/GetSkillDetails",
    getSearchSkills: "yaksha/QuestionBank/GetSearchSkill",
    getAllCategories: "yaksha/Question/GetAllCategories",
    getQuestionBankDetails: "yaksha/QuestionBank/GetQuestionBankById",
    updateTenantQuestionBank: "yaksha/QuestionBank/UpdateTenantQuestionBank",

    //question list
    getQuestionBankSkills: "yaksha/Question/GetQuestionBankSkills",
    getAllCategorySkills: "yaksha/Question/GetAllCategorySkills",
    getQuestionBankSubSkills: "yaksha/Question/GetQuestionBankSubSkills",
    getSubSkillsByQuestionBankId: "yaksha/Question/GetSubSkillsByQuestionBankId",
    getAllProficiencies: "yaksha/Question/GetAllProficiencies",
    getSearchQuestions: "yaksha/Question/GetSearchQuestions",

    getSearchQbQuestionDetails: "yaksha/UserAssessment/SearchQbQuestionDetails"
};

@Injectable({
    providedIn: 'root'
})

export class QuestionBankService {

    constructor(private apiClient: ApiClientService) { }

    createQuestionBank(param: CreateQuestionBank): Observable<any> {
        return this.apiClient.post(routes.createQuestionBank, param);
    }

    createQuestionBankSkills(params: CreateQuestionBankSkill): Observable<any> {
        return this.apiClient.post(routes.createQuestionBankSkils, params);
    }

    getAllQuestionBanks(parms: QuestionBankFilter): Observable<Result<QuestionBankResult>> {
        return this.apiClient.get(routes.getQuestionBanks, Helper.httpParamBuilder(parms));
    }

    getQuestionTypes(): Observable<Result<QuestionType[]>> {
        return this.apiClient.get(routes.getParentQuestionTypes);
    }

    deleteQuestion(questionBankId: number): Observable<any> {
        return this.apiClient.delete(routes.deleteQuestion, Helper.httpParamBuilder({ questionBankId }));
    }

    getQuestionBankDetails(questionBankId: number): Observable<any> {
        return this.apiClient.get(routes.getQuestionBankDetails, Helper.httpParamBuilder({ questionBankId }));
    }

    updateTenantQuestionBank(params: UpdateTenantQuestionBank): Observable<any> {
        return this.apiClient.put(routes.updateTenantQuestionBank, params);
    }

    getCategories(questionBankId: number): Observable<Result<Category>> {
        return this.apiClient.get(routes.getCategories, Helper.httpParamBuilder({ questionBankId }));
    }

    getSkills(categoryId: number): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getCategorySkills, Helper.httpParamBuilder({ categoryId }));
    }

    getQuestionBankSkills(params: QuestionBankSkillFilter): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getCategorySkills, Helper.httpParamBuilder(params));
    }

    getSearchSkillDetails(params: SkillFilter): Observable<Result<SkillResult>> {
        return this.apiClient.get(routes.getSearchSkills, Helper.httpParamBuilder(params));
    }

    getSkillDetails(params: CategorySkillFilter): Observable<Result<SkillDetails[]>> {
        return this.apiClient.get(routes.getSkillDetails, Helper.httpParamBuilder(params));
    }

    getAllCategories(): Observable<Result<Category[]>> {
        return this.apiClient.get(routes.getAllCategories);
    }

    //question list
    getQuestionBankSkill(questionBankId: number): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getQuestionBankSkills, Helper.httpParamBuilder({ questionBankId }));
    }

    getQuestionBankSubSkill(params: QuestionBankSubSkillFilter): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getQuestionBankSubSkills, Helper.httpParamBuilder(params));
    }

    getAllProficiencies(): Observable<any> {
        return this.apiClient.get(routes.getAllProficiencies);
    }

    getSearchQuestions(params: QuestionFilter): Observable<Result<QuestionResult>> {
        return this.apiClient.get(routes.getSearchQuestions, Helper.httpParamBuilder(params));
    }

    getSubSkillsByQuestionBankId(questionBankId: number): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getSubSkillsByQuestionBankId, Helper.httpParamBuilder({ questionBankId }));
    }

    getAllCategorySkills(): Observable<Result<Skill[]>> {
        return this.apiClient.get(routes.getAllCategorySkills);
    }

    getQbQuestionDetials(str: string, pageSize: number, pageNumber: number): Observable<Result<QbQuestionDetails[]>> {
        return this.apiClient.post(routes.getSearchQbQuestionDetails + "?str=" + str + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber);
    }
}
