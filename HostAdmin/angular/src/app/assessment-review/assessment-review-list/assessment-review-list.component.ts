import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryDto } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { CategoryDetails } from '@app/admin/question/question-details';
import { AssessmentReviewStatus } from '@app/enums/assessment';
import { UserRoles } from '@app/enums/user-roles';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Constants } from '@app/models/constants';
import { dataService } from '@app/service/common/dataService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/roles-permission/permissions';
import { AppSessionService } from '@shared/session/app-session.service';
import { UtilsService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { AssessmentRequestDto, ReviewAssessmentDto } from '../assessment-review';
import { AssessmentReviewService } from '../assessment-review.service';
import { ReviewQuestionnaireComponent } from '../review-questionnaire/review-questionnaire.component';

@Component({
  selector: 'app-assessment-review-list',
  templateUrl: './assessment-review-list.component.html',
  styleUrls: ['./assessment-review-list.component.scss']
})
export class AssessmentReviewListComponent implements OnInit {
  path: string;
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 10;
  pageSizes: number[] = [10, 20, 30];
  constants = Constants;
  searchValue: string;
  categoryId: number;
  reviewerId: number;
  reviewerStatus: number;
  totalCount: number = 0;
  assessments: ReviewAssessmentDto[] = [];
  viewCount: number;
  userRole: string;
  assessmentReviewStatus = AssessmentReviewStatus;
  userRoles = UserRoles;
  selectedCategory: CategoryDetails;
  categories: CategoryDto[] = [];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  permissions: any;

  constructor(private modalService: NgbModal,
    private router: Router,
    private assessmentReviewService: AssessmentReviewService,
    private appSessionService: AppSessionService,
    private dataService: dataService,
    private activatedRoute: ActivatedRoute,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private utilsService: UtilsService) { }

  ngOnInit() {
    this.path = this.router.url;
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    this.getCategories();
    this.getAssessmentListForReview();
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

  search() {
    this.pageIndex = 1;
    this.getAssessmentListForReview();
  }

  getAssessmentListForReview() {
    let data: AssessmentRequestDto = {
      tenantId: this.appSessionService.tenantId,
      searchString: this.searchValue ? encodeURIComponent(this.searchValue) : '',
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      categoryId: this.categoryId,
      reviewerId: this.userRole === UserRoles[6] ? this.appSessionService.userId : null,
      reviewStatus: this.reviewerStatus
    };
    this.assessmentReviewService.getAssessmentsOnReview(data).subscribe(res => {
      if (res.success) {
        this.totalCount = res.result.totalCount;
        this.assessments = res.result.assessmentReviewDetailsDto;
        if (this.assessments.length === this.maxSize) {
          this.viewCount = this.maxSize * this.pageIndex;
        }
        else if (this.assessments.length < this.maxSize) {
          this.viewCount = ((this.pageIndex - 1) * this.maxSize) + (this.assessments.length % this.maxSize);
        }
      }
    });
  }

  getAssessmentByCategoryId(event) {
    this.categoryId = event.id;
    this.getAssessmentListForReview();
  }

  changePage() {
    this.getAssessmentListForReview();
  }

  onAssessmentClick(assessment: ReviewAssessmentDto) {
    if (this.utilsService.getCookieValue(this.constants.reviewCommentStatus)) {
      this.utilsService.deleteCookie(this.constants.reviewCommentStatus);
    }
    if (this.userRole === UserRoles[1] || this.permissions[Permissions.assesmentsManageAll])
      this.router.navigate([`../../assessment-review/questionnaire/`, btoa(`${assessment?.tenantAssessmentReviewId}/${assessment?.tenantId}`)], { relativeTo: this.activatedRoute });
    else
      this.router.navigate([`./questionnaire/`, btoa(`${assessment?.tenantAssessmentReviewId}`)], { relativeTo: this.activatedRoute });
  }

  reset() {
    this.categoryId = 0;
    this.searchValue = null;
    this.selectedCategory = { name: '', id: 0, description: '', idNumber: '', sortOrder: 0 };
    this.getAssessmentListForReview();
  }

  onCategoryDeselect() {
    this.categoryId = 0;
    this.getAssessmentListForReview();
  }

  getAssessmentByReviewStatus(reviewStatus?: number) {
    this.reviewerStatus = reviewStatus || null;
    this.getAssessmentListForReview();
  }

  deleteAssessment(assessment: ReviewAssessmentDto): void {
    abp.message.confirm(
      this.l('AssessmentDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${assessment.assessmentName}" ${Constants.assessmentReview}?`),
      (result: boolean) => {
        if (result) {
          this.assessmentReviewService.deleteAssessmentReview(assessment.tenantAssessmentReviewId).subscribe(res => {
            if (res.result) {
              this.getAssessmentListForReview();
              this.toastrService.success(Constants.assessmentReviewDeletedSuccessfully);
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

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  onUpdate(assessment: ReviewAssessmentDto): void {
    const modalRef = this.modalService.open(ReviewQuestionnaireComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.reviewQuestionnaireDto = {
      tenantId: assessment.tenantId,
      tenantAssessmentReviewId: assessment.tenantAssessmentReviewId,
      assessmentReviewerId: assessment.assessmentReviewerId,
      isUpdate: true,
      isReReview: false
    };
    modalRef.dismissed.subscribe(result => {
      if (!result) {
        this.getAssessmentListForReview();
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
        console.error(error);
      });
  }

  navigateToReviewQuestionnaire(reviewCommentStatus: string, tenantAssessmentReviewId: number, tenantId: number, qnCount: number) {
    if (qnCount === 0)
      return this.toastrService.warning(`${this.constants.no} ${reviewCommentStatus} ${this.constants.questions}`);
    this.utilsService.setCookieValue(Constants.reviewCommentStatus, btoa(reviewCommentStatus));
    if (this.userRole === UserRoles[1] || this.permissions[Permissions.assesmentsManageAll])
      this.router.navigate([`../../assessment-review/questionnaire/`, btoa(`${tenantAssessmentReviewId}/${tenantId}`)], { relativeTo: this.activatedRoute });
    else
      this.router.navigate([`./questionnaire/`, btoa(`${tenantAssessmentReviewId}`)], { relativeTo: this.activatedRoute });
  }

  redirectToDashboard(tenantAssessmentReviewId: number, assessmentId) {
    if (this.userRole === UserRoles[1] || this.permissions[Permissions.assesmentsManageAll])
      this.router.navigate([`../../assessment-review/review-dashboard/`, btoa(JSON.stringify(tenantAssessmentReviewId)), btoa(JSON.stringify(assessmentId))], { relativeTo: this.activatedRoute });
    else
      this.router.navigate([`review-dashboard/`, btoa(JSON.stringify(tenantAssessmentReviewId)), btoa(JSON.stringify(assessmentId))], { relativeTo: this.activatedRoute });
  }
}
