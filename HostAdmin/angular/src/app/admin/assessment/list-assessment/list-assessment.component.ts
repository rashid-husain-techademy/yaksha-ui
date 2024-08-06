import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssessmentService } from '../assessment.service';
import { AssessmentRequestDto, AssignResultDto, AssignRequestDto, CategoryDto, AssessmentStatusUpdateDto, AssessmentDetailDto, AssessmentTypeDetail } from '../assessment';
import { AssessmentStatus, AssessmentType, CatalogAssessmentType, QuestionSelectionMode } from '@app/enums/assessment';
import { Constants } from '@app/models/constants';
import { UserService } from '../../users/users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiClientService } from '@app/service';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { AllTenants } from '@app/admin/users/users';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { CategoryDetails } from '@app/admin/question/question-details';
import { tenantDetailsDto } from '@app/admin/tenants/tenant-detail';
import { ReviewQuestionnaireComponent } from '@app/assessment-review/review-questionnaire/review-questionnaire.component';
import { Permissions } from '@shared/roles-permission/permissions';
import { CloneAssessmentComponent } from '../clone-assessment/clone-assessment.component';

@Component({
  selector: 'app-list-assessment',
  templateUrl: './list-assessment.component.html',
  styleUrls: ['./list-assessment.component.scss']
})

export class ListAssessmentComponent implements OnInit, OnDestroy {
  pageTitle = Constants.assessmentsCatalog;
  pageSize: number = 16;
  maxSize: number = 5;
  allPageIndex: number = 1;
  allSkipCount: number = 0;
  allMaxResultCount: number = 16;
  allTotalCount: number = 0;
  scheduledPageIndex: number = 1;
  scheduledSkipCount: number = 0;
  scheduledMaxResultCount: number = 16;
  scheduledTotalCount: number = 0;
  publishedPageIndex: number = 1;
  publishedSkipCount: number = 0;
  publishedMaxResultCount: number = 16;
  publishedTotalCount: number = 0;
  draftPageIndex: number = 1;
  draftSkipCount: number = 0;
  draftMaxResultCount: number = 16;
  draftTotalCount: number = 0;
  totalCount: number = 0;
  assessments: AssessmentDetailDto[] = [];
  assessmentStatus = AssessmentStatus;
  assessmentType = AssessmentType;
  assignResult: AssignResultDto;
  isGridView: boolean = true;
  constants = Constants;
  noAssessmentsFound: boolean = false;
  userRole: string;
  userRoles = UserRoles;
  catalogAssessmentType = CatalogAssessmentType;
  status: AssessmentStatus = null;
  type: number[];
  tenants: AllTenants[] = [];
  categories: CategoryDto[] = [];
  categoryId: number = 0;
  categoryName: string = "";
  assessmentCount: number = 0;
  tenantId: number = 0;
  tenantDetails: tenantDetailsDto[];
  searchString: string = "";
  isScheduled: boolean = false;
  isSideDivShow: boolean = false;
  isAssignMultipleAssessments: boolean = false;
  isCategorySelected: boolean = false;
  isCategoryViewSelected: boolean = false;
  isAssessmentViewSelected: boolean = false;
  isMasterSelected: boolean = false;
  count: number = 0;
  addedCount: number = 0;
  totalItemCount: number = 0;
  selectedAssessmentId: number;
  selectedAssessmentIds: number[];
  selectedTenantId: tenantDetailsDto[];
  selectedAssessmentData: AssessmentDetailDto[] = [];
  addedAssessmentData: AssessmentDetailDto[] = [];
  viewCount: number = 0;
  isCloudAssessment: boolean;
  isVMBasedAssessment: boolean;
  isFormSubmitTriggered: boolean = false;
  selectedCategory: CategoryDetails;
  questionSelectionMode = QuestionSelectionMode;
  selectedAssessmentType: AssessmentType;
  assessmentTypes = AssessmentType;
  assessmentTypesDetails: AssessmentTypeDetail[] = [];
  permissions: any;
  dropdownSettings: {
    singleSelection: boolean;
    idField: string,
    textField: string;
    selectAllText: string;
    unSelectAllText: string;
    itemsShowLimit: number
  };
  isSubjectiveAssessment: boolean;
  isUploadType: boolean;

  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  defaultAssessmentTypeValue: AssessmentType = AssessmentType.Assessment;

  constructor(private modalService: NgbModal,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private userService: UserService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dataService: dataService,
    private apiClientService: ApiClientService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1
    };

    let assessmengtTypeIds = Object.keys(this.assessmentTypes).filter(f => !isNaN(Number(f)));

    assessmengtTypeIds.forEach(element => {
      if (Number(element) !== AssessmentType.Adaptive) { // to remove adaptive type assessment filter
        let assessmentType = {} as AssessmentTypeDetail;
        assessmentType.id = Number(element);
        assessmentType.name = this.assessmentTypes[element];
        this.assessmentTypesDetails.push(assessmentType);
      }

    });

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    this.getCategories();
    if (this.userRole === UserRoles[1]) {
      this.getAllTenants();
    }
    this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    this.selectedAssessmentData = [];
    this.addedAssessmentData = [];
    this.count = 0;
  }

  getAllTenants() {
    this.userService.getAllTenants().subscribe(res => {
      if (res.success && res.result) {
        this.tenants = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  SidebarWidgetClick() {
    this.isSideDivShow = !this.isSideDivShow;
  }

  getCategories() {
    this.assessmentService.getCategories().subscribe(res => {
      if (res && res.result) {
        this.categories = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  updateStatus(assessment: AssessmentDetailDto, statusToUpdate: AssessmentStatus) {
    let warningMessage = "";
    if (statusToUpdate === AssessmentStatus.Draft) {
      warningMessage = assessment.hasActiveSchedules ? Constants.assessmentHasActiveSchedules : Constants.areYouSureYouWantToMoveToDraft + assessment.name + " " + Constants.toDraft;
    }
    else {
      warningMessage = !assessment.totalQuestions ? Constants.noQuestionsAdded : Constants.areYouSureYouWantToPublish + assessment.name;
    }

    abp.message.confirm(
      this.l('AssessmentStatusUpdateWarningMessage', `${warningMessage}?`),
      (result: boolean) => {
        if (result) {
          let updateAssessmentStatus: AssessmentStatusUpdateDto = {
            assessmentId: assessment.id,
            status: statusToUpdate
          };
          this.assessmentService.updateAssessmentStatus(updateAssessmentStatus).subscribe(res => {
            if (res.result) {
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              assessment.status = statusToUpdate;
              let message = statusToUpdate === this.assessmentStatus.Published ? Constants.assessmentPublished : Constants.assessmentMovedToDraft;
              this.toastrService.success(message);
              this.updateView();
            }
          },
            error => {
              this.toastrService.error(Constants.somethingWentWrong);
            });
        }
      });
  }

  updateView(isDelete: boolean = false) {
    if (!this.status && isDelete) {
      this.allSkipCount = 0;
      this.allMaxResultCount = 16;
      this.allPageIndex = 1;
      this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
    else if (this.isScheduled) {
      this.scheduledSkipCount = 0;
      this.scheduledMaxResultCount = 16;
      this.scheduledPageIndex = 1;
      this.getAssessments(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = 0;
      this.publishedMaxResultCount = 16;
      this.publishedPageIndex = 1;
      this.getAssessments(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = 0;
      this.draftMaxResultCount = 16;
      this.draftPageIndex = 1;
      this.getAssessments(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else if (!this.status && this.selectedAssessmentId !== 0) {
      this.allSkipCount = 0;
      this.allMaxResultCount = 16;
      this.allPageIndex = 1;
      this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  deleteAssessment(assessment: AssessmentDetailDto): void {
    abp.message.confirm(
      this.l('AssessmentDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${assessment.name}" ${Constants.assessment}?`),
      (result: boolean) => {
        if (result) {
          this.assessmentService.deleteAssessment(assessment.id).subscribe(res => {
            if (res.result) {
              this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
              this.toastrService.success(Constants.assessmentDeletedSuccessfully);
              let isDelete = true;
              this.updateView(isDelete);
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          );
        }
      });
  }

  getAssessmentsByStatus(status: AssessmentStatus, isScheduled: boolean = false) {
    this.status = !status ? null : status;
    this.isScheduled = false;
    if (isScheduled) {
      this.isScheduled = true;
      this.getAssessments(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !isScheduled)
      this.getAssessments(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    else if (this.status === AssessmentStatus.Draft)
      this.getAssessments(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    else
      this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
  }

  getAssessmentsBySearchString() {
    this.clear();
  }

  getAssessmentsByAssessmentType(event) {
    if (this.type === undefined)
      this.type = [event.id];
    else
      this.type.push(event.id);

    this.clear();
  }

  public onSelectAll(items: any) {
    this.type = items.map(x => x.id);
    this.clear();
  }
  public onDeSelectAll() {
    this.type = [];
    this.clear();
  }

  getAssessmentsByCategory(event) {
    this.categoryId = event.id;
    if (this.categoryId !== 0) {
      this.isCategorySelected = true;
    }
    else {
      this.isCategorySelected = false;
    }
    this.clear();
  }

  OnCategoryDeselect() {
    this.categoryId = 0;
    this.isCategorySelected = false;
    this.searchString = "";
    this.clear();
  }

  OnAssessmentTypeDeselect(event) {
    const index = this.type.indexOf(event.id);
    if (index > -1) {
      this.type.splice(index, 1);
    }
    this.clear();
  }

  tenantSelection(event) {
    if (this.isAssignMultipleAssessments) {
      this.selectedTenantId = [{
        id: event.id,
        name: event.name
      }];
    }
    else {
      this.tenantId = event.id;
      this.tenantDetails = [{
        id: event.id,
        name: event.name
      }];
      this.getAssessmentsByTenant();
    }
  }

  getAssessmentsByTenant() {
    this.clear();
  }

  onKey(event: any): void {
    if (!event.target.value)
      this.clear();
  }

  clear() {
    if (this.isScheduled) {
      this.scheduledSkipCount = 0;
      this.scheduledMaxResultCount = 16;
      this.scheduledPageIndex = 1;
      this.getAssessments(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = 0;
      this.publishedMaxResultCount = 16;
      this.publishedPageIndex = 1;
      this.getAssessments(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = 0;
      this.draftMaxResultCount = 16;
      this.draftPageIndex = 1;
      this.getAssessments(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else {
      this.allSkipCount = 0;
      this.allMaxResultCount = 16;
      this.allPageIndex = 1;
      this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  reset() {
    this.tenantId = 0;
    this.tenantDetails = [];
    this.categoryId = 0;
    this.isCategorySelected = false;
    this.searchString = "";
    this.selectedCategory = { name: '', id: 0, description: '', idNumber: '', sortOrder: 0 };
    this.clear();
  }

  getAssessments(skipCount: number, maxResultCount: number, pageIndex: number) {
    this.assessments = [];
    this.noAssessmentsFound = false;
    let assessmentRequest: AssessmentRequestDto = {
      TenantId: this.tenantId,
      CategoryId: this.categoryId,
      AssessmentStatus: this.isScheduled ? this.assessmentStatus.Scheduled : this.status,
      AssessmentType: this.type !== undefined ? this.type.toString() : '',
      SearchString: encodeURIComponent(this.searchString),
      SkipCount: skipCount,
      MaxResultCount: maxResultCount
    };
    this.assessmentService.getAssessments(assessmentRequest).subscribe(res => {
      if (res && res.result && res.result.totalCount) {
        if (this.userRole === UserRoles[1]) {
          res.result.assessments.forEach(assessment => {
            assessment.isOwned = !this.tenantId ? true : assessment.type === this.catalogAssessmentType.Shared ? true : false;
            assessment.isStack = assessment.totalStackQuestions > 0 ? true : false;
          });
        }
        else if (this.permissions[Permissions.assesmentsManageAll]) {
          res.result.assessments.forEach(assessment => {
            assessment.isOwned = assessment.type === this.catalogAssessmentType.Owned ? true : false;
            assessment.isStack = assessment.totalStackQuestions > 0 ? true : false;
          });
        }
        if (this.isScheduled)
          this.scheduledTotalCount = res.result.totalCount;
        else if (this.status === AssessmentStatus.Published && !this.isScheduled)
          this.publishedTotalCount = res.result.totalCount;
        else if (this.status === AssessmentStatus.Draft)
          this.draftTotalCount = res.result.totalCount;
        else {
          this.allTotalCount = res.result.totalCount;
        }
        if (res.result.assessments.length === maxResultCount) {
          this.viewCount = maxResultCount * pageIndex;
        }
        else if (res.result.assessments.length < maxResultCount) {
          this.viewCount = ((pageIndex - 1) * maxResultCount) + (res.result.assessments.length % maxResultCount);
        }
        this.assessments = res.result.assessments;
        this.checkboxToggle(null);
      }
      else {
        this.assessments = [];
        this.noAssessmentsFound = true;
        if (this.isScheduled)
          this.scheduledTotalCount = 0;
        else if (this.status === AssessmentStatus.Published && !this.isScheduled)
          this.publishedTotalCount = 0;
        else if (this.status === AssessmentStatus.Draft)
          this.draftTotalCount = 0;
        else {
          this.allTotalCount = 0;
        }
        this.viewCount = 0;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  changePage() {
    if (this.isScheduled) {
      this.scheduledSkipCount = (this.scheduledPageIndex - 1) * this.pageSize;
      this.scheduledMaxResultCount = this.pageSize;
      this.getAssessments(this.scheduledSkipCount, this.scheduledMaxResultCount, this.scheduledPageIndex);
    }
    else if (this.status === AssessmentStatus.Published && !this.isScheduled) {
      this.publishedSkipCount = (this.publishedPageIndex - 1) * this.pageSize;
      this.publishedMaxResultCount = this.pageSize;
      this.getAssessments(this.publishedSkipCount, this.publishedMaxResultCount, this.publishedPageIndex);
    }
    else if (this.status === AssessmentStatus.Draft) {
      this.draftSkipCount = (this.draftPageIndex - 1) * this.pageSize;
      this.draftMaxResultCount = this.pageSize;
      this.getAssessments(this.draftSkipCount, this.draftMaxResultCount, this.draftPageIndex);
    }
    else {
      this.allSkipCount = (this.allPageIndex - 1) * this.pageSize;
      this.allMaxResultCount = this.pageSize;
      this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex);
    }
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  schedule(assessment: AssessmentDetailDto): void {
    if (assessment.hasActiveSchedules === true && assessment.assessmentType === AssessmentType.Hackathon) {
      abp.message.confirm(
        this.l('scheduleHackathonConfirmationMessage', `${Constants.scheduleHackathonConfirmationMessage}`),
        (result: boolean) => {
          if (result) {
            this.openSchedule(assessment);
          }
        }
      );
    }
    else {
      this.openSchedule(assessment);
    }
  }

  openSchedule(assessment: AssessmentDetailDto) {
    assessment.isStack = assessment.totalStackQuestions > 0 ? true : false;
    assessment.isCoding = assessment.totalCodingQuestions > 0 ? true : false;
    assessment.isMCQ = assessment.totalMCQQuestions > 0 ? true : false;
    this.assessmentService.getAssessmentQuestionType(assessment.id).subscribe(res => {
      if (res.success) {
        assessment.isStack = res.result.isStack;
        this.isCloudAssessment = res.result.isCloud;
        this.isVMBasedAssessment = res.result.isVmBased;
        this.isSubjectiveAssessment = res.result.isSubjective;
        this.isUploadType = res.result.isUploadType;
        if (res.result.totalApprovalQuestions > 0) {
          this.router.navigate([`../schedule-assessment`, btoa(JSON.stringify(assessment.id)), btoa(JSON.stringify(assessment.isStack)), btoa(JSON.stringify(this.isCloudAssessment)), btoa(JSON.stringify(this.isVMBasedAssessment)), btoa(JSON.stringify(assessment.isCoding)), btoa(JSON.stringify(assessment.isMCQ)), btoa(JSON.stringify({ callFromCampaign: false })), btoa(JSON.stringify(this.isSubjectiveAssessment)), btoa(JSON.stringify(this.isUploadType))], { relativeTo: this.activatedRoute });
        }
        else {
          this.toastrService.warning(Constants.noAcceptedQuestions);
        }
      }
    });
  }

  selectAssessmentsOrCategory() {
    this.isAssignMultipleAssessments = true;
    this.pageTitle = Constants.assignAssessments;
    this.tenantId = 0;
    this.categoryId = 0;
    this.isCategorySelected = false;
    this.status = AssessmentStatus.Published;
    this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
    this.clear();
  }

  checkUncheckSelectAll() {
    for (var i = 0; i < this.assessments.length; i++) {
      this.assessments[i].isSelected = this.isMasterSelected;
      this.updatedCheckBoxCount(this.assessments[i].id);
    }
  }

  checkboxToggle(id: number | null) {
    this.isMasterSelected = this.assessments.every(function (item: any) {
      return item.isSelected === true;
    });
    if (id !== null)
      this.updatedCheckBoxCount(id);
  }

  updatedCheckBoxCount(id: number | null) {
    let data = this.assessments.find(e => e.id === id);
    let existingdata = this.selectedAssessmentData.find(ob => ob.id === id);
    if (data && data.isSelected) {
      if (!existingdata)
        this.selectedAssessmentData.push(data);
      else
        existingdata.isSelected = true;
    }
    else
      existingdata.isSelected = false;
    this.count = this.selectedAssessmentData.filter(item => item.isSelected).length;
  }

  addSelection() {
    if (!this.selectedAssessmentData.filter(item => item.isSelected).length) {
      this.toastrService.warning(Constants.noAssessmentsSelected);
      return;
    }
    this.isAssessmentViewSelected = true;
    this.selectedAssessmentData.forEach(element => {
      if (element.isSelected)
        element.isAdded = true;
    });
    this.addedAssessmentData = [];
    this.addedAssessmentData = this.selectedAssessmentData.filter(item => item.isAdded);
    this.addedCount = this.addedAssessmentData.length;
    if (this.categoryName === "")
      this.totalItemCount = this.addedCount;
    else
      this.totalItemCount = this.addedCount + 1;
  }

  removeSelection(assessmentId: number) {
    let existingdata = this.selectedAssessmentData.find(ob => ob.id === assessmentId);
    if (existingdata) {
      if (!existingdata.isSelected) {
        this.selectedAssessmentData.forEach((value, index) => {
          if (value.id === assessmentId) this.selectedAssessmentData.splice(index, 1);
        });
      }
      else {
        existingdata.isSelected = false;
        existingdata.isAdded = false;
        this.checkboxToggle(assessmentId);
      }
    }
    this.addedAssessmentData = [];
    this.addedAssessmentData = this.selectedAssessmentData.filter(item => item.isAdded);
    this.addedCount = this.addedAssessmentData.length;
    if (this.addedCount === 0) {
      this.isAssessmentViewSelected = false;
    }
    if (this.categoryName === "")
      this.totalItemCount = this.addedCount;
    else
      this.totalItemCount = this.addedCount + 1;
  }

  addCategorySelection() {
    if (this.categoryId !== 0) {
      if (this.publishedTotalCount === 0)
        this.toastrService.error(Constants.noAssessmentsInThisCategory);
      else {
        this.assessmentCount = this.publishedTotalCount;
        this.categoryName = this.categories.find(x => x.id === this.categoryId).name;
        this.isCategoryViewSelected = true;
        if (this.addedCount === 0)
          this.totalItemCount = 1;
        else
          this.totalItemCount = this.addedCount + 1;
      }
    }
  }

  removeCategorySelection() {
    this.categoryName = "";
    this.assessmentCount = 0;
    this.categoryId = 0;
    this.isCategorySelected = false;
    this.isCategoryViewSelected = false;
    this.totalItemCount = this.addedCount;
    this.clear();
  }

  backFromAssign() {
    (this.isSideDivShow === true) ? this.isSideDivShow = false : '';
    this.resetToListAssessment();
  }

  openTenantModal(Tenant: string, assessmentId: number) {
    this.selectedAssessmentId = assessmentId;
    this.modalService.open(Tenant, { centered: true });
  }

  unAssignToTenant(tenantId: number, assessmentId: number) {
    let assessmentIds = [];
    assessmentIds.push(assessmentId);
    let data: AssignRequestDto = {
      tenantId: tenantId,
      assessmentIds: assessmentIds
    };
    this.assessmentService.unAssignAssessmentToTenant(data).subscribe(res => {
      if (res.result) {
        this.assignResult = res.result;
        if (this.assignResult.isSuccess) {
          this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
          this.updateView();
          this.toastrService.success(Constants.assessmentUnAssignedSuccessfully);
        }
        else {
          this.toastrService.error(this.assignResult.errorMessage);
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  assignMultipleAssessments() {
    if (!this.isAssignMultipleAssessments) {
      if (this.selectedAssessmentId !== 0) {
        this.selectedAssessmentIds = [];
        this.selectedAssessmentIds.push(this.selectedAssessmentId);
        this.assignToTenant(this.selectedTenantId, null, this.selectedAssessmentIds);
      }
      else {
        this.toastrService.error(Constants.pleaseSelectAssessments);
      }
    }
    else if (this.addedAssessmentData) {
      this.selectedAssessmentIds = this.addedAssessmentData.map(x => x.id);
      this.assignToTenant(this.selectedTenantId, this.categoryId, this.selectedAssessmentIds);
    }
    else {
      this.assignToTenant(this.selectedTenantId, this.categoryId, null);
    }
  }

  assignToTenant(tenantId: tenantDetailsDto[], categoryId?: any, assessmentIds?: any) {
    if (+tenantId !== 0) {
      let data: AssignRequestDto = {
        tenantId: this.selectedTenantId[0].id,
        assessmentIds: assessmentIds,
        categoryId: this.isCategoryViewSelected ? categoryId : null,
        isAssignMultiple: this.isAssignMultipleAssessments
      };
      this.assessmentService.assignAssessmentToTenant(data).subscribe(res => {
        if (res.result) {
          this.assignResult = res.result;
          if (this.assignResult.isSuccess) {
            this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
            this.modalService.dismissAll();
            this.toastrService.success(Constants.assessmentAssignedSuccessfully);
            this.resetToListAssessment();
          }
          else {
            this.modalService.dismissAll();
            this.selectedTenantId = [];
            this.toastrService.warning(res.result.errorMessage);
          }
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
    else
      this.toastrService.error(Constants.pleaseSelectTenant);
  }

  resetToListAssessment() {
    this.isAssignMultipleAssessments = false;
    this.pageTitle = Constants.assessments;
    this.categoryId = 0;
    this.isCategorySelected = false;
    this.count = 0;
    this.addedCount = 0;
    this.categoryName = "";
    this.assessmentCount = 0;
    this.selectedTenantId = [];
    this.selectedAssessmentIds = [];
    this.selectedAssessmentData = [];
    this.isMasterSelected = false;
    this.isAssessmentViewSelected = false;
    this.isCategoryViewSelected = false;
    this.searchString = "";
    this.status = null;
    this.clear();
  }

  createAssessment() {
    let navigatedFrom = 'listAssessment';
    this.router.navigate(['../create-assessment', btoa(''), btoa(navigatedFrom)], { relativeTo: this.activateRoute });
  }

  editAssessment(id: number, assessmentType: AssessmentType): void {
    let navigatedFrom = 'listAssessment';
    if (assessmentType === AssessmentType.Adaptive) {
      this.router.navigate(['../create-adaptive-assessment', btoa(id.toString()), btoa(navigatedFrom)], { relativeTo: this.activateRoute });
    }
    else {
      this.router.navigate(['../create-assessment', btoa(id.toString()), btoa(navigatedFrom)], { relativeTo: this.activateRoute });
    }
  }

  viewAssessment(id: number) {
    this.router.navigate(['../view-assessment', btoa(id.toString())], { relativeTo: this.activateRoute });
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll(false);
  }

  hideEllipses(assessment) {
    return assessment.status === this.assessmentStatus.Published ||
      (assessment.isOwned && assessment.status === this.assessmentStatus.Draft) ||
      (assessment.isOwned && assessment.status === this.assessmentStatus.Published) ||
      (this.userRole === this.userRoles[1] && !this.tenantId && assessment.status === this.assessmentStatus.Published) ||
      (this.userRole === this.userRoles[1] && this.tenantId && assessment.isOwned);
  }

  copyText(idNumber: string): void {
    let copyText = idNumber;
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.style.left = '0';
    selectBox.style.top = '0';
    selectBox.style.opacity = '0';
    selectBox.value = copyText;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
    this.toastrService.success(Constants.copiedToClipboard);
  }

  reviewQuestions(assessmentId: number) {
    const modalRef = this.modalService.open(ReviewQuestionnaireComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.reviewQuestionnaireDto = {
      assessmentId: assessmentId
    };
    modalRef.dismissed.subscribe(result => {
    },
      error => {
        console.error(error);
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  openCloneModal(assessmentId: number) {
    const modalRef = this.modalService.open(CloneAssessmentComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.cloneAssessmentDto = {
      id: assessmentId
    };
    modalRef.dismissed.subscribe(result => {
      this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
      this.resetToListAssessment();
    },

      error => {
        console.error(error);
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }
}
