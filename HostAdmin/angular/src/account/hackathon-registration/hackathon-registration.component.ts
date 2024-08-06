import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentScheduleCustomFieldUserInput } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { Constants } from '@app/models/constants';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { CustomFieldDto, HacakthonScheduleDetailDto, HackathonRegistrationDto, HackathonScheuleRequestDto, ValidateRegistration, ValidateRegistrationResult } from 'account/pre-assessment/pre-assessment-details';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-hackathon-registration',
  templateUrl: './hackathon-registration.component.html',
  styleUrls: ['./hackathon-registration.component.scss']
})
export class HackathonRegistrationComponent implements OnInit {
  constants = Constants;
  assessmentScheduleIdNumber: string;
  tenantId: number;
  emailAddress: string;
  isRegistrationLinkValid: boolean = false;
  scheduleDetail: HacakthonScheduleDetailDto;
  assessmentRegisterForm: FormGroup;
  customFieldItems: FormArray;
  isDisableRegister: boolean = false;
  isSubmitTriggered: boolean = false;
  isRegistered: boolean = false;
  userData: HackathonRegistrationDto;
  disableCaptcha: boolean = false;
  siteKey = environment.reCaptchaSiteKey;
  theme: 'light' | 'dark' = 'light';
  size: 'compact';
  lang = 'en';
  type: 'image' | 'audio';

  constructor(private activatedRoute: ActivatedRoute,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private router: Router,
    private dataService: dataService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      let params = atob(param['encodedUrl']).split('/');
      this.assessmentScheduleIdNumber = params[0];
      this.tenantId = parseInt(params[1]);
      this.validateAssessment();
    });
    this.disableCaptcha = this.dataService.isGurukashiTenant(this.tenantId);
  }

  isFormValid(controlName: string): boolean {
    let value = !((this.assessmentRegisterForm.get(controlName).errors?.required || this.assessmentRegisterForm.get(controlName).errors?.whitespace)
      && (this.assessmentRegisterForm.get(controlName).touched || this.isSubmitTriggered));
    return value;
  }

  isFormArrayGroupValid(index: number): boolean {
    let value = ((this.customFieldItems.at(index).touched || this.isSubmitTriggered));
    if (value) {
      if (this.scheduleDetail.scheduleCustomFields[index].isMandatory) {
        if (this.customFieldItems.at(index).value && this.customFieldItems.at(index).value.customField.length === 0)
          return true;
      }
    }
    return false;
  }

  isFormArrayGroupValidRegularExpresson(index: number): boolean {
    if (this.customFieldItems.at(index).value.customField.toString() === "")
      return false;
    let value = ((this.customFieldItems.at(index).touched || this.isSubmitTriggered));
    if (value) {
      return !this.customFieldItems.at(index).valid;
    }
    return false;
  }

  validateFormData(): void {
    this.isSubmitTriggered = true;
    if (!this.userEmailValidation(this.assessmentRegisterForm.value.email)) {
      this.toastrService.warning(this.constants.invalidEmailAddress);
      return;
    }
    if (this.assessmentRegisterForm.invalid) {
      if (!(this.assessmentRegisterForm.get('firstName').value && this.assessmentRegisterForm.get('lastName').value &&
        this.assessmentRegisterForm.get('email').value)) {
        this.toastrService.warning(Constants.pleaseCorrectTheValidationErrors);
        return;
      }
      if (!this.disableCaptcha) {
        if (this.assessmentRegisterForm.get('recaptcha').invalid) {
          this.toastrService.warning(Constants.PleaseConfirmthatYourAreNotARobot);
          return;
        }
      }
      this.toastrService.warning(Constants.pleaseCorrectTheValidationErrors);
    }
    else {
      this.register();
    }
  }

  private validateAssessment(): void {
    let data: ValidateRegistration = {
      assessmentScheduleIdNumber: this.assessmentScheduleIdNumber,
      tenantId: this.tenantId
    };
    this.assessmentService.validateRegistration(data).subscribe(res => {
      let result: ValidateRegistrationResult = res.result;
      if (!result.isAvailable) {
        this.router.navigate(['../../invalid-request',
          {
            tenantAdminEmailAddress: result.tenantAdminEmails ? btoa(JSON.stringify(result.tenantAdminEmails)) : '',
            tenantId: this.tenantId,
            errorCode: result.errorCode,
            startTime: res.result.registrationStartDateTime,
            endTime: res.result.registrationEndDateTime,
            isHackathonRegistration: true
          }], { relativeTo: this.activatedRoute });
      }
      else {
        this.isRegistrationLinkValid = true;
        this.getScheduleDetails();
      }
    });
  }

  private getScheduleDetails(): void {
    let data: HackathonScheuleRequestDto = {
      tenantId: this.tenantId,
      scheduleIdNumber: this.assessmentScheduleIdNumber
    };
    this.assessmentService.getHackathonScheduleDetails(data).subscribe(res => {
      if (res && res.result) {
        this.scheduleDetail = res.result;
        this.initRegisterForm();
      }
    }, error => {
      console.error(error);
    });
  }

  private initRegisterForm(): void {
    this.assessmentRegisterForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), WhiteSpaceValidators.emptySpace()]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), WhiteSpaceValidators.emptySpace()]],
      email: ['', [Validators.required, Validators.email, WhiteSpaceValidators.emptySpace()]],
      phoneNumber: ['', [Validators.pattern("^(\\+91 )?[0-9]{10}$")]],
      customFields: this.formBuilder.array([]),
      recaptcha: ['', this.disableCaptcha ? '' : Validators.required]
    });

    if (this.scheduleDetail.scheduleCustomFields && this.scheduleDetail.scheduleCustomFields.length > 0) {
      this.scheduleDetail.scheduleCustomFields.forEach(element => {
        this.addcustomField(element);
      });
    }
  }

  private addcustomField(customField: CustomFieldDto) {
    const customFieldFormItem = this.formBuilder.group({
      customField: [''],
    });
    if (customField.isMandatory) {
      customFieldFormItem.get('customField').setValidators([Validators.required, Validators.min(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9].*")]);
    }
    else {
      customFieldFormItem.get('customField').setValidators([Validators.pattern("^[a-zA-Z0-9].*"), Validators.maxLength(250)]);
    }
    this.customFieldItems = this.assessmentRegisterForm.get("customFields") as FormArray;
    this.customFieldItems.push(customFieldFormItem);
  }

  private register(): void {
    this.isDisableRegister = true;
    let userCustomFieldArray: AssessmentScheduleCustomFieldUserInput[] = [];
    if (this.scheduleDetail.scheduleCustomFields && this.scheduleDetail.scheduleCustomFields.length > 0) {
      this.scheduleDetail.scheduleCustomFields.forEach((element, index) => {
        let userCustomField: AssessmentScheduleCustomFieldUserInput = {
          fieldLabel: element.fieldLabel,
          fieldValue: this.customFieldItems.value[index].customField
        };
        userCustomFieldArray.push(userCustomField);
      });
    }
    this.userData = {
      tenantId: this.tenantId,
      scheduleIdNumber: this.assessmentScheduleIdNumber,
      firstName: this.assessmentRegisterForm.value.firstName.trim(),
      lastName: this.assessmentRegisterForm.value.lastName.trim(),
      emailAddress: this.assessmentRegisterForm.value.email.trim(),
      phoneNumber: this.assessmentRegisterForm.value.phoneNumber,
      customFields: userCustomFieldArray
    };
    this.assessmentService.registerHackathon(this.userData).subscribe(res => {
      if (res && res.result.isSuccess) {
        this.assessmentRegisterForm.reset();
        this.isRegistered = true;
        this.toastrService.success(Constants.registrationSuccessful);
      }
      else if (res.result.errorMessage) {
        this.isDisableRegister = false;
        this.toastrService.warning(res.result.errorMessage);
      }
    }, error => {
      console.error(error);
      this.toastrService.warning(Constants.registrationFailed);
    })
  }

  private userEmailValidation(email: string) {
    let regex = /^[\w']+([\.'-]?[\w']+)*@\w+([\.-]?\w+)*(\.\w{1,}\w+)+$/;
    if (email === "" || !regex.test(email)) {
      return false;
    }
    return true;
  }
}
