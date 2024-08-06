import { Component, Injector, OnInit } from '@angular/core';
import { tenantDetailsDto, TenantsDto } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../../models/constants';
import { QuestionBankFilter, QuestionBankResult, QuestionBanks, QuestionType, UpdateTenantQuestionBank } from '../question-bank-details';
import { QuestionBankService } from '../question-bank.services';
import { ActivatedRoute, Router } from '@angular/router';
import { Helper } from '@app/shared/helper';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { QuestionBankScope } from '@app/enums/question-bank-type';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { UtilsService } from 'abp-ng2-module';

@Component({
    selector: 'app-question-bank-operation',
    templateUrl: './question-bank-operation.component.html',
    styleUrls: ['./question-bank-operation.component.scss']
})
export class QuestionBankOperationComponent extends AppComponentBase implements OnInit {

    constants = Constants;
    pageSizes: number[] = [10, 20, 30];
    pageIndex: number = 1;
    pageSize: number = 10;
    maxSize: number = 5;
    tenantId: number;
    isDisabled: boolean = true;
    helper = Helper;
    selectedItems: string[] = [];
    singleselectedItems: string[] = [];
    dropdownSettings = {};
    tenantDetailsList: TenantsDto[];
    tenantDetails: tenantDetailsDto[];
    questionTypes: QuestionType[];
    questionBankList: QuestionBankResult;
    searchString: string;
    questionBankName: string;
    tenantName: string;
    isTenantAdmin: boolean = false;
    isSuperAdmin: boolean = false;
    userRole: string;
    singleDropdownSettings: MultiSelectDropdownSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        closeDropDownOnSelection: true
    };
    permissions: any;
    isDynamicUser: boolean = false;

    constructor(private tenantService: TenantsService,
        private questionBankService: QuestionBankService,
        private router: Router,
        private toastrService: ToastrService,
        private activateRoute: ActivatedRoute,
        private dataService: dataService,
        private utilsService: UtilsService,
        injector: Injector) { super(injector); }

    ngOnInit(): void {
        this.dataService.userRole.subscribe(val => {
            this.userRole = val;
        });
        this.dataService.userPermissions.subscribe(val => {
            this.permissions = val;
        });
        if (this.userRole === UserRoles[1]) {
            this.isSuperAdmin = true;
        }
        else if (this.userRole === UserRoles[2]) {
            this.isTenantAdmin = true;
        }
        else if (this.userRole === UserRoles[7]) {
            this.isDynamicUser = true;
        }
        this.tenantId = this.appSession.tenantId;
        this.getPageCookieDataIfExist();
        this.getQuestionTypes();
        this.getQuestionBanks();
        this.getTenantDetails();
    }

    getQuestionTypes(): void {
        this.questionBankService.getQuestionTypes().subscribe(res => {
            if (res.success) {
                let sortedQuestionType = res.result.sort(Helper.sortString<QuestionType>('name'));
                this.questionTypes = sortedQuestionType;
            }
        }, error => {
            console.error(error);
        });
    }

    getTenantDetails(): void {
        this.tenantService.getAllTenants().subscribe(res => {
            if (res.success) {
                let sortedTenants = res.result.sort(Helper.sortString<TenantsDto>('name'));
                this.tenantDetailsList = sortedTenants;
            }
        }, error => {
            console.error(error);
        });
    }

    selectTenant(event): void {
        this.tenantId = parseInt(event.id);
        this.tenantDetails = [{
            id: event.id,
            name: event.name
        }];
        this.pageIndex = 1;
        this.getQuestionBanks();
        this.tenantName = this.tenantDetailsList.find(x => x.id === this.tenantId).name;
    }

    onDeSelectTenant() {
        this.tenantId = null;
        this.tenantDetails = [];
        this.searchString = '';
        this.getQuestionBanks();
    }

    getQuestionBanks() {
        if (this.isTenantAdmin)
            this.tenantId = this.appSession.tenantId;
        let data: QuestionBankFilter = {
            TenantId: this.tenantId,
            SkipCount: (this.pageIndex - 1) * this.pageSize,
            MaxResultCount: this.pageSize,
            Name: this.searchString
        };
        this.questionBankService.getAllQuestionBanks(data).subscribe(res => {
            this.questionBankList = res.result;
            if (this.questionBankList !== null) {
                if (this.isTenantAdmin) {
                    this.questionBankList.questionBanks = this.questionBankList.questionBanks.filter(x => x.isVisible === true || x.scope === QuestionBankScope.TenantRestricted);
                }
            }
        });
    }

    loadPage() {
        this.getQuestionBanks();
    }

    changePageSize() {
        this.pageIndex = 1;
        this.getQuestionBanks();
    }

    search(event: any): void {
        this.pageIndex = 1;
        this.searchString = event.target.value;
        this.getQuestionBanks();
    }

    searchQuestionBank(): void {
        this.pageIndex = 1;
        this.getQuestionBanks();
    }

    btoa(value: any) {
        return btoa(value);
    }

    createNewQuestionBank(): void {
        this.setPageCookieData();
        this.router.navigate(['../create-question-bank'], { relativeTo: this.activateRoute });
    }

    editQuestionBank(id: number): void {
        let edit = true;
        let clone = false;
        this.setPageCookieData();
        this.questionBankName = this.questionBankList.questionBanks.find(x => x.questionBankId === id).name;
        let queryParam = id + '/' + edit + '/' + clone + '/' + this.questionBankName + '/' + this.tenantId + '/' + this.tenantName;
        queryParam = btoa(queryParam);
        this.router.navigate(['../create-question-bank', queryParam], { relativeTo: this.activateRoute });
    }

    cloneQuestionBank(id: number): void {
        let edit = false;
        let clone = true;
        this.setPageCookieData();
        this.questionBankName = this.questionBankList.questionBanks.find(x => x.questionBankId === id).name;
        let queryParam = id + '/' + edit + '/' + clone + '/' + this.tenantId + '/' + this.tenantName;
        queryParam = btoa(queryParam);
        this.router.navigate(['../create-question-bank', queryParam], { relativeTo: this.activateRoute });
    }

    viewQuestionBank(id: number): void {
        this.setPageCookieData();
        this.router.navigate(['../view-question-bank/' + btoa(id.toString())], { relativeTo: this.activateRoute });
    }

    deleteQuestionBank(questionBankId: number): void {
        this.questionBankName = this.questionBankList.questionBanks.find(x => x.questionBankId === questionBankId).name;
        abp.message.confirm(
            this.l('QuestionBankDeleteWarningMessage', `${Constants.doYouWantToDeleteThisQuestionBank}` + this.questionBankName + "?"),
            (result: boolean) => {
                if (result) {
                    this.questionBankService.deleteQuestion(questionBankId).subscribe(res => {
                        if (res && res.success) {
                            this.pageIndex = 1;
                            this.questionBankList.totalCount = 0;
                            this.questionBankList.questionBanks = [];
                            this.getQuestionBanks();
                        }
                    },
                        error => {
                            console.error(error);
                        }
                    );
                }
            });
    }

    updateVisiblity(questionBank: QuestionBanks) {
        if (this.tenantId !== null) {
            let data: UpdateTenantQuestionBank = {
                QuestionBankId: questionBank.questionBankId,
                TenantId: this.tenantId,
                IsVisible: !questionBank.isVisible
            };
            this.questionBankService.updateTenantQuestionBank(data).subscribe(res => {
                if (res && res.success) {
                    questionBank.isVisible = !questionBank.isVisible;
                    if (questionBank.isVisible)
                        this.toastrService.success(this.constants.assignedToTenantSuccessfully);
                    else
                        this.toastrService.success(this.constants.unassignedToTenantSuccessfully);
                }
            });
        }
    }

    openQuestions(id: number, scope: number) {
        this.setPageCookieData();
        let idString: string = btoa(id.toString());
        let scopeString: string = btoa(scope.toString());
        this.router.navigate(['../../question/question-list', idString, scopeString], { relativeTo: this.activateRoute });
    }

    reset(): void {
        this.tenantId = null;
        this.tenantDetails = [];
        this.tenantName = '';
        this.searchString = '';
        this.getQuestionBanks();
        this.getQuestionTypes();
        this.getTenantDetails();
    }

    setPageCookieData() {
        let data = btoa(JSON.stringify({
            tenantDetails: this.tenantDetails?.length > 0 ? this.tenantDetails : [],
            searchString: this.searchString ? this.searchString : ''
        }));
        this.utilsService.setCookieValue(this.constants.questionBankPageData, data, null, abp.appPath);
    }

    getPageCookieDataIfExist() {
        const encodedData = this.utilsService.getCookieValue(this.constants.questionBankPageData);
        if (encodedData) {
            const cookieVal = JSON.parse(atob(encodedData));
            if (cookieVal.tenantDetails.length > 0) {
                this.tenantId = cookieVal.tenantDetails[0].id;
                this.tenantDetails = cookieVal.tenantDetails;
            }
            this.searchString = cookieVal.searchString;
        }
        this.utilsService.deleteCookie(this.constants.questionBankPageData, abp.appPath);
    }
}


