import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from '../../../models/constants';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentStatus, AssessmentType } from '@app/enums/assessment';
import { AssessmentService } from '../assessment.service';
import { Assessment, AssessmentDetail, CategoryDto, CreateAssessmentForm, CreateOrUpdateAssessmentDto, CreateResultDto } from '../assessment';
import { ApiClientService } from '@app/service';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { Unsaved } from '../../../interface/unsaved-data';

@Component({
  selector: 'app-create-assessment',
  templateUrl: './create-assessment.component.html',
  styleUrls: ['./create-assessment.component.scss']
})

export class CreateAssessmentComponent implements OnInit, Unsaved {
  createAssessmentForm: FormGroup;
  constants = Constants;
  categoryId: number;
  name: string;
  assessmentId: number;
  assessmentStatus = AssessmentStatus;
  isFormSubmitTriggered: boolean = false;
  isHackathon: boolean = false;
  assessmentDetail: AssessmentDetail;
  assessment: Assessment;
  createOrUpdateResult: CreateResultDto;
  categories: CategoryDto[] = [];
  navigatedFrom: string = '';
  isEdit: boolean = false;
  dropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  isCategoryDisabled: boolean = false;
  onLoadValue: Assessment;

  constructor(private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private assessmentService: AssessmentService,
    private activateRoute: ActivatedRoute,
    private apiClientService: ApiClientService,
    private router: Router) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.assessmentId = parseInt(atob(params['id']));
        this.getAssessmentDetail();
      }
      if (params['navigatedFrom']) {
        let navigatedFrom = atob(params['navigatedFrom']);
        this.navigatedFrom = navigatedFrom;
      }
    });
    this.getCategories();
    this.initCreateAssessmentForm();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      allowSearchFilter: this.assessmentId ? false : true,
      enableCheckAll: this.assessmentId ? false : true
    };
  }

  createAssessmentFormValidationMessages = {
    categoryId: {
      required: Constants.pleaseSelectTheCategory
    },
    name: {
      required: Constants.pleaseEnterTheAssessmentTitle
    }
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

  getAssessmentDetail() {
    this.assessmentService.getAssessmentDetail(this.assessmentId).subscribe(res => {
      if (res.result) {
        this.assessment = res.result;
        this.isEdit = true;
        this.displayAssessment();
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  displayAssessment(): void {
    if (this.createAssessmentForm) {
      this.createAssessmentForm.reset();
    }
    this.createAssessmentForm.patchValue({
      categories: this.assessment.categories,
      description: this.assessment.description,
      instructions: this.assessment.instructions,
      name: this.assessment.name,
      totalQuestionsCount: this.assessment.assessmentQuestionsConfigDto.assessmentQuestionsCriteria?.totalQuestionsCount ?? 0,
      beginnerQuestionsCount: this.assessment.assessmentQuestionsConfigDto.assessmentQuestionsCriteria?.beginnerQuestionsCount ?? 0,
      intermediateQuestionsCount: this.assessment.assessmentQuestionsConfigDto.assessmentQuestionsCriteria?.intermediateQuestionsCount ?? 0,
      advancedQuestionsCount: this.assessment.assessmentQuestionsConfigDto.assessmentQuestionsCriteria?.advancedQuestionsCount ?? 0
    });
    this.disableAssessmentQuestionsDetail();
    this.isCategoryDisabled = true;
    this.onLoadValue = this.createAssessmentForm.value;
    this.isHackathon = this.assessment.assessmentType === AssessmentType.Hackathon;
  }

  disableAssessmentQuestionsDetail() {
    this.createAssessmentForm.controls['totalQuestionsCount'].disable();
    this.createAssessmentForm.controls['beginnerQuestionsCount'].disable();
    this.createAssessmentForm.controls['intermediateQuestionsCount'].disable();
    this.createAssessmentForm.controls['advancedQuestionsCount'].disable();
  }

  isFormValid(formControlName: string): boolean {
    return !(this.createAssessmentForm.get(formControlName).errors?.required && (this.createAssessmentForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  initCreateAssessmentForm(): void {
    this.createAssessmentForm = this.formBuilder.group({
      categories: ['', [Validators.required]],
      name: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      description: [''],
      instructions: [''],
      totalQuestionsCount: [''],
      beginnerQuestionsCount: [''],
      intermediateQuestionsCount: [''],
      advancedQuestionsCount: ['']
    });
    this.onLoadValue = this.createAssessmentForm.value;
  }

  saveAssessment(formData: CreateAssessmentForm) {
    this.isFormSubmitTriggered = true;
    if (this.createAssessmentForm.valid) {
      if (this.assessmentId) {
        let data: CreateOrUpdateAssessmentDto = {
          id: this.assessment.id,
          categoryIds: formData.categories.map(x => x.id),
          description: formData.description,
          instructions: formData.instructions,
          name: formData.name,
          status: this.assessment.assessmentStatus,
          authorName: '',
          type: this.isHackathon ? AssessmentType.Hackathon : AssessmentType.Assessment,
          assessmentQuestionsCriteria: { totalQuestionsCount: formData.totalQuestionsCount || 0, beginnerQuestionsCount: formData.beginnerQuestionsCount || 0, intermediateQuestionsCount: formData.intermediateQuestionsCount || 0, advancedQuestionsCount: formData.advancedQuestionsCount || 0 }
        };
        this.createOrUpdateAssessment(data);
      }
      else {
        let data: CreateOrUpdateAssessmentDto = {
          id: 0,
          categoryIds: formData.categories.map(x => x.id),
          description: formData.description,
          instructions: formData.instructions,
          name: formData.name,
          status: this.assessmentStatus.Draft,
          authorName: '',
          type: this.isHackathon ? AssessmentType.Hackathon : AssessmentType.Assessment,
          assessmentQuestionsCriteria: { totalQuestionsCount: formData.totalQuestionsCount || 0, beginnerQuestionsCount: formData.beginnerQuestionsCount || 0, intermediateQuestionsCount: formData.intermediateQuestionsCount || 0, advancedQuestionsCount: formData.advancedQuestionsCount || 0 }
        };
        this.createOrUpdateAssessment(data);

      }
    }
    else {
      this.toastrService.error(Constants.correctValidationErrors);
    }
  }

  createOrUpdateAssessment(data: CreateOrUpdateAssessmentDto) {
    this.assessmentService.createOrUpdateAssessment(data).subscribe(res => {
      if (res.result) {
        this.createOrUpdateResult = res.result;
        if (this.createOrUpdateResult.isSuccess) {
          if (!this.isEdit)
            this.toastrService.success(Constants.assessmentCreatedSuccessfully);
          else
            this.toastrService.success(Constants.assessmentUpdatedSuccessfully);
          this.viewAssessment(this.createOrUpdateResult.id);
          this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
        }
        else {
          this.toastrService.error(this.createOrUpdateResult.errorMessage);
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  viewAssessment(id: number): void {
    if (this.isEdit) {
      if (this.navigatedFrom === Constants.viewAssessment)
        this.router.navigate(['../../../view-assessment', btoa(id.toString())], { relativeTo: this.activateRoute });
      else if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
    }
    else {
      if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
      else
        this.router.navigate(['../view-assessment', btoa(id.toString())], { relativeTo: this.activateRoute });
    }
  }

  cancel() {
    if (!this.isEdit) {
      if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
      else
        this.router.navigate(['../../dashboard'], { relativeTo: this.activateRoute });
    }
    else {
      let id = btoa(this.assessmentId.toString());
      if (this.navigatedFrom === Constants.viewAssessment)
        this.router.navigate(['../../../view-assessment', id], { relativeTo: this.activateRoute });
      else if (this.navigatedFrom === Constants.listAssessment)
        this.router.navigate(['../../../list-assessment'], { relativeTo: this.activateRoute });
    }
  }

  isUnsaved(): boolean {
    if (!this.isFormSubmitTriggered && JSON.stringify(this.createAssessmentForm.value) !== JSON.stringify(this.onLoadValue)) {
      return true;
    }
    return false;
  }

  keyDownEvent(event) {
    if (event.keyCode === Constants.keyCodeE || event.keyCode === Constants.keyCodeMinus) {
      event.preventDefault();
    }
  }
}
