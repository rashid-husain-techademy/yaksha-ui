import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TestCaseDto, TestCasesDto } from '../question-details';

@Component({
  selector: 'app-create-test-case',
  templateUrl: './create-test-case.component.html',
  styleUrls: ['./create-test-case.component.scss']
})
export class CreateTestCaseComponent implements OnInit {
  @Input() public testCaseData: TestCaseDto;
  @Input() public testCaseDetails: TestCasesDto[] = [];
  @Input() public indexOfCurrentItem: number;
  constants = Constants;
  testCaseForm: FormGroup;
  isFormSubmitTriggered: boolean = false;
  isEdit: boolean = false;
  sortOrderExist: boolean = false;
  get testCaseConstraints(): FormArray {
    return this.testCaseForm.get('testCaseConstraints') as FormArray;
  }

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.initQuestionForm();
    if (this.testCaseData.testCaseTitle.length > 0) {
      this.isEdit = true;
      this.displayTestCase();
    }

    this.changeTestFormConfig();
  }

  initQuestionForm(): void {
    this.testCaseForm = this.formBuilder.group({
      name: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      input: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      output: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      sortOrder: [this.testCaseData.sortOrder],
      maxMemoryPermitted: [''],
      maxCpuTime: [''],
      elementName: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      elementId: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      testCaseConstraints: this.formBuilder.array([])
    });

    if (!this.testCaseData.isInputRequired) {
      this.testCaseForm.get('input').clearValidators();
    }
    if (this.testCaseData.isCloud) {
      this.testCaseForm.get('input').clearValidators();
    }
    if (!this.testCaseData.isSortOrderEnabled) {
      this.testCaseForm.get('sortOrder').clearValidators();
    }
  }

  changeTestFormConfig(): void {
    if (this.testCaseData.isHtmlCssSelected) {
      this.testCaseForm.removeControl('input');
      this.testCaseForm.removeControl('output');
      this.testCaseForm.removeControl('maxMemoryPermitted');
      this.testCaseForm.removeControl('maxCpuTime');
      this.testCaseForm.removeControl('sortOrder');
    }
    else {
      this.testCaseForm.removeControl('elementName');
      this.testCaseForm.removeControl('elementId');
      this.testCaseForm.removeControl('testCaseConstraints');
    }
  }

  buildTestCaseConstraints(): FormGroup {
    return this.formBuilder.group({
      attributeName: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
      attributeValue: [''],
      id: ['']
    });
  }

  addConstraints(): void {
    this.testCaseConstraints.push(this.buildTestCaseConstraints());
  }

  deleteConstraints(index: number): void {
    this.testCaseConstraints.removeAt(index);
  }

  closeBtnClick(): void {
    this.modalService.dismissAll(false);
  }

  testcaseValidation = {
    name: Constants.nameRequired,
    input: Constants.inputRequired,
    output: Constants.outputRequired,
    elementName: Constants.pleaseEnterTheElementName,
    elementId: Constants.pleaseEnterTheElementId,
    attributeName: Constants.pleaseEnterTheAttributeName,
    sortOrder: Constants.sortOrderRequired
  }

  isFormValid(formControlName: string): boolean {
    return !(this.testCaseForm.get(formControlName).errors?.required && (this.testCaseForm.get(formControlName).touched || this.isFormSubmitTriggered) || this.testCaseForm.get(formControlName).errors?.whitespace && (this.testCaseForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  displayTestCase() {
    this.testCaseForm.patchValue({
      id: this.testCaseData.id,
      name: this.testCaseData.testCaseTitle
    });
    if (this.testCaseData.isHtmlCssSelected) {
      this.testCaseForm.patchValue({
        elementName: this.testCaseData.elementName,
        elementId: this.testCaseData.elementId,
        testCaseConstraints: this.displayTestCaseConstraints()
      });
    }
    else {
      this.testCaseForm.patchValue({
        input: this.testCaseData.standardInput,
        output: this.testCaseData.expectedOutput,
        maxMemoryPermitted: this.testCaseData.maxMemoryPermitted,
        maxCpuTime: this.testCaseData.maxCpuTime,
        sortOrder: this.testCaseData.sortOrder
      });
    }
  }

  displayTestCaseConstraints(): void {
    if (this.testCaseData.testCaseConstraints.length) {
      this.testCaseData.testCaseConstraints.forEach((item, i) => {
        this.addConstraints();
        this.testCaseConstraints.at(i).patchValue({
          attributeName: item.attributeName,
          attributeValue: item.attributeValue,
          id: item.id
        });
      });
    }
  }

  removeSortOrderValidation(value) {
    if (value != "0" && value != "") {
      this.sortOrderExist = false;
    }
  }

  setSortOrderValidation() {
    if (this.sortOrderExist) {
      this.testCaseForm.get('sortOrder').setErrors({ 'invalid': true });
    }
    else {
      this.testCaseForm.get('sortOrder').setErrors(null);
    }
  }

  save() {
    this.isFormSubmitTriggered = true;
    if (this.testCaseForm.valid) {
      if (!this.isEdit) {
        let data;
        if (this.testCaseData.isHtmlCssSelected) {
          data = {
            "id": 0,
            "questionId": 0,
            "score": 0,
            "testCaseTitle": this.testCaseForm.controls.name.value,
            "elementName": this.testCaseForm.controls.elementName.value,
            "elementId": this.testCaseForm.controls.elementId.value,
            "testCaseConstraints": this.testCaseForm.controls.testCaseConstraints.value
          };
          this.modalService.dismissAll(data);
        }
        else {
          data = {
            "id": 0,
            "questionId": 0,
            "score": 0,
            "testCaseTitle": this.testCaseForm.value.name,
            "standardInput": this.testCaseForm.value.input,
            "expectedOutput": this.testCaseForm.value.output,
            "sortOrder": this.testCaseForm.value.sortOrder,
            "maxMemoryPermitted": this.testCaseForm.value.maxMemoryPermitted,
            "maxCpuTime": this.testCaseForm.value.maxCpuTime
          };

          if (this.testCaseForm.value.sortOrder != "" && this.testCaseDetails.length > 0 && this.testCaseDetails.some(i => i.sortOrder == this.testCaseForm.value.sortOrder)) {
            this.sortOrderExist = true;
            this.setSortOrderValidation();
          }
          else {
            this.sortOrderExist = false;
            this.setSortOrderValidation();
            this.modalService.dismissAll(data);
          }
        }
      }
      else if (this.isEdit) {
        let data;
        if (this.testCaseData.isHtmlCssSelected) {
          data = {
            "id": this.testCaseData.id,
            "questionId": this.testCaseData.questionId,
            "testCaseTitle": this.testCaseForm.value.name,
            "elementName": this.testCaseForm.controls.elementName.value,
            "elementId": this.testCaseForm.controls.elementId.value,
            "testCaseConstraints": this.testCaseForm.controls.testCaseConstraints.value
          };
          this.modalService.dismissAll(data);
        }
        else if (!this.testCaseData.isSortOrderEnabled) {
          data = {
            "id": this.testCaseData.id,
            "questionId": this.testCaseData.questionId,
            "score": this.testCaseData.score,
            "testCaseTitle": this.testCaseForm.value.name,
            "standardInput": this.testCaseForm.value.input,
            "expectedOutput": this.testCaseForm.value.output,
            "sortOrder": 0,
            "maxMemoryPermitted": this.testCaseForm.value.maxMemoryPermitted,
            "maxCpuTime": this.testCaseForm.value.maxCpuTime
          };
          this.modalService.dismissAll(data);
        }
        else {
          data = {
            "id": this.testCaseData.id,
            "questionId": this.testCaseData.questionId,
            "score": this.testCaseData.score,
            "testCaseTitle": this.testCaseForm.value.name,
            "standardInput": this.testCaseForm.value.input,
            "expectedOutput": this.testCaseForm.value.output,
            "sortOrder": this.testCaseForm.value.sortOrder,
            "maxMemoryPermitted": this.testCaseForm.value.maxMemoryPermitted,
            "maxCpuTime": this.testCaseForm.value.maxCpuTime
          };
          if (this.testCaseForm.value.sortOrder != "" && this.testCaseDetails.length > 0 && this.testCaseDetails.some((i, index) => i.sortOrder == this.testCaseForm.value.sortOrder && index != this.indexOfCurrentItem)) {
            this.sortOrderExist = true;
            this.setSortOrderValidation();
          }
          else {
            this.sortOrderExist = false;
            this.setSortOrderValidation();
            this.modalService.dismissAll(data);
          }
        }
      }
    }
    else {
      this.toastr.error(Constants.pleaseEnterRequiredField);
    }
  }
  preventE(event) {
    if (event.which === 101 ||event.which === 43 ||event.which === 45 || event.which === 69) {
      event.preventDefault();
    }
  }
}
