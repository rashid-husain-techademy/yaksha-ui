import { Component, Injector, OnInit, Renderer2 } from '@angular/core';
import { AssessmentDetailDto, AssessmentRequestDto, CategoryDetails, CategoryDto } from '@app/assessments/assessments';
import { Constants } from '@app/models/constants';
import { AppComponentBase } from '@shared/app-component-base';
import { AssessmentsService } from '@app/assessments/assessments.service';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '@app/admin/catalog/catalog.service';
import { CatalogDataDto } from '@app/admin/catalog/catalog-details';
import { dataService } from '@app/service/common/dataService';
import { AppSessionService } from '@shared/session/app-session.service';
import { Helper } from '@app/shared/helper';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  isGuruKashiTenant: boolean = false;
  pageTitle = Constants.assessments;
  pageSize: number = 15;
  maxSize: number = 5;
  allPageIndex: number = 1;
  allSkipCount: number = 0;
  allMaxResultCount: number = 15;
  allTotalCount: number = 0;
  assessments: AssessmentDetailDto[] = [];
  noAssessmentsFound: boolean = false;
  categoryId: number = 0;
  tenantId: number = 0;
  searchString: string = "";
  userId: number = 0;
  viewCount: number = 0;
  categories: CategoryDto[] = [];
  selectedCategory: CategoryDetails;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  catalogs: CatalogDataDto[] = [];
  selectedCatalog: CatalogDataDto;
  catalogId: number;
  catalogDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'catalogName',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  emailAddress: string;
  scheduleId: string;
  isActive: boolean = true;
  helper = Helper;
  constructor(private assessmentService: AssessmentsService, private renderer: Renderer2,
    private toastrService: ToastrService, injector: Injector, private router: Router,
    private activateRoute: ActivatedRoute, private catalogService: CatalogService, public dataService: dataService, private appSessionService: AppSessionService,) { super(injector); }

  ngOnInit(): void {
    this.isGuruKashiTenant = this.dataService.isGurukashiTenant(this.appSessionService.tenantId);
    const element = document.querySelector('[data-id="zsalesiq"]');
    if (element)
      this.renderer.setStyle(element, 'display', 'none');

    this.tenantId = this.appSession.tenantId;
    this.userId = this.appSession.user.id;
    this.emailAddress = this.appSession.user.emailAddress;
    this.getAssignedCatalogs();
    this.getCategories();
    this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex, this.isActive);
  }

  getAssignedCatalogs() {
    this.catalogService.getAssignedCatalogs().subscribe(res => {
      if (res && res.result) {
        this.catalogs = res.result;
      }
    })
  }

  getAssessments(skipCount: number, maxResultCount: number, pageIndex: number, isActive: boolean) {
    this.assessments = [];
    this.noAssessmentsFound = false;
    console.log(isActive);
    let data: AssessmentRequestDto = {
      assessmentStatus: isActive ? 'Active' : 'InActive',
      userId: this.userId,
      tenantId: this.tenantId,
      categoryId: this.categoryId,
      catalogId: this.catalogId,
      searchString: encodeURIComponent(this.searchString),
      skipCount: skipCount,
      maxResultCount: maxResultCount
    };
    console.log(data);
    this.assessmentService.getUserBasedAssessmentsList(data).subscribe(res => {
      if (res && res.result && res.result.totalCount) {
        this.allTotalCount = res.result.totalCount;
        if (res.result.assessments.length === maxResultCount) {
          this.viewCount = maxResultCount * pageIndex;
        }
        else if (res.result.assessments.length < maxResultCount) {
          this.viewCount = ((pageIndex - 1) * maxResultCount) + (res.result.assessments.length % maxResultCount);
        }
        this.assessments = res.result.assessments;
      }
      else {
        this.assessments = [];
        this.noAssessmentsFound = true;
        this.allTotalCount = 0;
        this.viewCount = 0;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getAssessmentsBySearchString() {
    this.clear();
  }

  onKey(event: any): void {
    if (!event.target.value)
      this.clear();
  }

  clear() {
    this.allSkipCount = 0;
    this.allMaxResultCount = 15;
    this.allPageIndex = 1;
    this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex, this.isActive);
  }

  reset() {
    this.categoryId = 0;
    this.selectedCategory = { name: '', id: 0, description: '', idNumber: '', sortOrder: 0 };
    this.catalogId = 0;
    this.selectedCatalog = { id: 0, catalogName: '' };
    this.searchString = "";
    this.clear();
  }

  changePage() {
    this.allSkipCount = (this.allPageIndex - 1) * this.pageSize;
    this.allMaxResultCount = this.pageSize;
    this.getAssessments(this.allSkipCount, this.allMaxResultCount, this.allPageIndex, this.isActive);
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


  OnCategoryDeselect() {
    this.categoryId = 0;
    this.clear();
  }

  getAssessmentsByCategory(event) {
    this.categoryId = event.id;
    this.clear();
  }

  getAssessmentsByCatalog(event) {
    this.catalogId = event.id;
    this.clear();
  }

  onCatalogDeselect() {
    this.catalogId = 0;
    this.clear();
  }

  progressAssessment() {
    let queryParam = this.scheduleId + '/' + this.tenantId + '/' + this.emailAddress;
    queryParam = btoa(queryParam);
    this.router.navigate(['../../account/test-taker/pre-assessment', queryParam], { relativeTo: this.activateRoute });
  }

  startAssessment(assessment: AssessmentDetailDto) {
    this.scheduleId = assessment.assessmentScheduleIdNumber;
    this.progressAssessment();
  }
  isChecked(event) {
    this.isActive = event.target.checked;
    this.clear();
  }
  getCutOffDate(assessmentStartTime: string, cutOffTime: number): string {
    let difference = new Date(assessmentStartTime).getMinutes() + (cutOffTime);
    var cutOffDate = new Date(assessmentStartTime);
    cutOffDate.setMinutes(difference);
    return cutOffDate.toISOString();
  }
}
