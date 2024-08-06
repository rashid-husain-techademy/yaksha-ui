import { Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '../../../models/constants';
import { CloneAssessmentDto, CreateResultDto } from '../assessment';
import { AssessmentService } from '../assessment.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clone-assessment',
  templateUrl: './clone-assessment.component.html',
  styleUrls: ['./clone-assessment.component.scss']
})
export class CloneAssessmentComponent implements OnInit {
  constants = Constants;
  id: number;
  cloneForm: FormGroup;
  allPageIndex:number;
  createOrUpdateResult: CreateResultDto;
  isFormSubmitTriggered: boolean = false;
  isSubmit: boolean= true;
  @Input() public cloneAssessmentDto: CloneAssessmentDto;

  constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder, private assessmentService: AssessmentService, private toastrService:ToastrService) {
    this.cloneForm = this.formBuilder.group({
      cloneName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.cloneAssessmentDto.id;
  }

  cloneAssessment() {
    this.isFormSubmitTriggered = true;
    this.cloneForm.markAsDirty();
  this.cloneForm.updateValueAndValidity();
    if (this.cloneForm.valid) {
      this.isSubmit=false;
      const cloneAssessmentDto: CloneAssessmentDto = {
        id: this.id,
        name: this.cloneForm.get('cloneName').value
      };
      this.assessmentService.cloneAssessment(cloneAssessmentDto).subscribe(res => {
        this.createOrUpdateResult = res.result;
        if (res.result) {
          if (this.createOrUpdateResult.isSuccess) {
          let message = this.constants.cloneSuccessMessage
          this.toastrService.success(message);
          this.activeModal.dismiss();
        }
        else if( this.createOrUpdateResult.errorMessage && !this.createOrUpdateResult.isSuccess){
          this.toastrService.error(this.createOrUpdateResult.errorMessage)
        }
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
      }
  }

  cancelClone() {
    this.activeModal.dismiss();
  }

  createAssessmentFormValidationMessages = {
      cloneName: Constants.pleaseEnterTheAssessmentTitle
  }
}
