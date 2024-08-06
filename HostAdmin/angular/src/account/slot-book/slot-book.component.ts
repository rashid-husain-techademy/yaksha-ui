import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Constants } from '@app/models/constants';
import { SlotBookService } from './slot-book.service';
import { ToastrService } from 'ngx-toastr';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { RegisterSlotCustomField, AssessmentDetails, NgbDate } from './slot-book-details';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment as env } from "../../environments/environment";

@Component({
  selector: 'app-slot-book',
  templateUrl: './slot-book.component.html',
  styleUrls: ['./slot-book.component.scss']
})
export class SlotBookComponent implements OnInit {
  slots: any;
  centers: any;
  genders: any;
  languages: any;
  constants = Constants;
  bookSlotForm: FormGroup;
  isFormSubmitTriggered: boolean = false;
  isSubmitted: false;
  testTakerParams: any;
  assessmentScheduleIdNumber: any;
  tenantId: any;
  customFieldItems!: FormArray;
  newId: number = 61419;
  isTenantLogoLoaded: boolean = false;
  assessmentName:string;
  registrationStartDate:any;
  registrationEndDate:any;
  logoUrl = "";
  assessmentDetails: AssessmentDetails;
  isslotBooked: boolean = false;
  hasCustomFields: boolean = false;
  minDate = { year: 1900, month: 1, day: 1 };
  todayDate:any =undefined;
  userEmail: string = '';
  fileName: { [key: string]: string } = {};
  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private slotBookService: SlotBookService, private toastrService: ToastrService, private tenantService: TenantsService, private activatedRoute: ActivatedRoute,) { 
    const current = new Date();
    this.todayDate = {
      year: current.getFullYear(),
      month: current.getMonth(),
      day: current.getDate() - 1
    };
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      this.testTakerParams = param['id'];
      let params = atob(param['id']).split('/');
      this.assessmentScheduleIdNumber = params[0];
      this.tenantId = parseInt(params[1]);
    });
    if (this.tenantId) {
      this.tenantService.getTenantCustomizationSettings(this.tenantId).pipe(
        finalize(() => {
          this.isTenantLogoLoaded = true;
        })).subscribe(res => {
          if (res && res.result) {
            let customizationSettings = JSON.parse(res.result) as TenantCustomizationSettings;
            this.logoUrl = customizationSettings.TenantLogoUrl;
          }
        }, error => {
          console.error(error);
        });
    }
    this.genders = [
      {
        id: 10,
        name: 'Male'
      },
      {
        id: 20,
        name: 'Female'
      }
    ];
    this.initScheduleForm();
    this.getAssessmentSlots(this.assessmentScheduleIdNumber, this.tenantId);
  }
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };


  initScheduleForm() {
    this.bookSlotForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, WhiteSpaceValidators.emptySpace()]],
      phoneNumber: ['', [Validators.pattern("^(\\+91 )?[0-9]{10}$")]],
      gender: ['', [Validators.required]],
      slot: ['', [Validators.required]],
      center: ['', [Validators.required]],
      language: [{ value: 'English', disabled: true }],
      candidatePhoto: [{}, [Validators.required]],
      candidateSignature: [{}, [Validators.required]],
      customFields: this.formBuilder.array([]),
      tenantId: [''],
      scheduleIdNumber: ['']

    });
  }

  isFormValid(formControlName: string): boolean {
    return !(this.bookSlotForm.get(formControlName).errors?.required && (this.bookSlotForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }
  bookSlot() {
    this.isFormSubmitTriggered = true;
    if (this.bookSlotForm.invalid) {
      if (!(this.bookSlotForm.get('firstName').value && this.bookSlotForm.get('lastName').value && this.bookSlotForm.get('email').value && this.bookSlotForm.get('dateOfBirth').value && this.bookSlotForm.get('gender').value && this.bookSlotForm.get('slot').value && this.bookSlotForm.get('center').value)) {
        this.toastrService.warning(Constants.pleaseCorrectTheValidationErrors);
        return;
      }
      if (!this.bookSlotForm.get('customFields').valid) {
        this.toastrService.warning(Constants.pleaseEnterequiredCustomFields);
        return;
      }
    }
    if (!this.fileName.candidatePhoto) {
      this.toastrService.warning(Constants.pleaseUploadCandidatephoto);
    }
    if (!this.fileName.candidateSignature) {
      this.toastrService.warning(Constants.pleaseUploadCandidateSignature);
    }
    else {
      const customFields = this.bookSlotForm.get('customFields').value.map(field => ({
        fieldLabel: field.fieldLabel,
        fieldValue: field.customField
      }));
      const formData = new FormData();
      formData.append('LastName', this.bookSlotForm.get('lastName').value);
      formData.append('Gender', this.bookSlotForm.get('gender').value[0].id);
      formData.append('TenantId', this.tenantId);
      formData.append('CandidatePhoto', this.bookSlotForm.get('candidatePhoto').value);
      formData.append('SelectedLanguage', this.bookSlotForm.get('language').value);
      formData.append('CandidateSignature', this.bookSlotForm.get('candidateSignature').value);
      formData.append('SelectedCentre', this.bookSlotForm.get('center').value[0]);
      formData.append('PhoneNumber', this.bookSlotForm.get('phoneNumber').value);
      formData.append('EmailAddress', this.bookSlotForm.get('email').value);
      formData.append('TimeZone', '');
      formData.append('DateOfBirth', this.convertNgbDateToString(this.bookSlotForm.get('dateOfBirth').value));
      formData.append('ScheduleIdNumber', this.assessmentScheduleIdNumber);
      formData.append('FirstName', this.bookSlotForm.get('firstName').value);
      formData.append('AssessmentScheduleSlotTimingId', this.bookSlotForm.get('slot').value[0].id);
      if (this.hasCustomFields) {
        formData.append('CustomFields', JSON.stringify(customFields));
      }
      if (this.bookSlotForm.valid) {
        this.slotBookService.bookSlot(formData).subscribe((res: any) => {
          if (res && res.result.isSuccess) {
            this.toastrService.success(Constants.registeredToSlotSuccessfully);
            this.isslotBooked = true;
            this.userEmail = this.bookSlotForm.get('email').value;
          }
          else if (res.result.errorMessage) {
            this.isSubmitted = false;
            this.toastrService.warning(res.result.errorMessage);
          }
        })
      }
    }
  }

  resendEmail() {
    const emailAddress =this.userEmail;
    const passcode = env.passcode;
    this.slotBookService.resendEmail(this.assessmentScheduleIdNumber, emailAddress, passcode, this.tenantId).subscribe((res: any) => {
      if (res && res.success) {
        this.toastrService.success(Constants.emailSentSuccessfully);
      }
      else if (res.result.errorMessage) {
        this.toastrService.warning(res.result.errorMessage);
      }
    })
  }
  getAssessmentSlots(assessmentScheduleId: number, tenantId: number) {
    this.slotBookService.getBookedSlotList(assessmentScheduleId, tenantId).subscribe((res: any) => {
      if (res && res.success) {
        this.assessmentDetails = res.result;
        this.registrationStartDate = this.formatDateTime(res.result.registrationStartDate);
        this.registrationEndDate = this.formatDateTime(res.result.registrationEndDate);
        this.centers = res.result.availableCentres;
        this.assessmentName = res.result.assessmentName;
        this.languages = res.result.supportedLanguages;
        this.slots = res.result.availableSlots.map(slot => ({
          id: slot.id,
          name: this.formatDateTime(slot.slotStartDateTime)
        }));
        if (res.result.assessmentScheduleCustomFields.length) {
          this.hasCustomFields = true;
          this.assessmentDetails.assessmentScheduleCustomFields.forEach(element => {
            this.addcustomField(element);
          });
        }
      }
      else if (res.result.errorMessage) {
        this.toastrService.warning(res.result.errorMessage);
      }
    });
  }
  addcustomField(customField: RegisterSlotCustomField) {

    const customFieldFormItem = this.formBuilder.group({
      fieldLabel: [customField.fieldLabel],
      customField: [''],
    });
    customFieldFormItem.get('customField').setValidators([Validators.pattern("^[a-zA-Z0-9].*"), Validators.maxLength(250)]);
    if (customField.isMandatory) {
      customFieldFormItem.get('customField').setValidators([Validators.required, Validators.min(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9].*")]);
    }
    this.customFieldItems = this.bookSlotForm.get("customFields") as FormArray;
    this.customFieldItems.push(customFieldFormItem);
  }
  isFormArrayGroupValid(index: number): boolean {
    let value = ((this.customFieldItems.at(index).touched || this.isSubmitted));
    if (value) {
      if (this.assessmentDetails.assessmentScheduleCustomFields[index].isMandatory) {
        if (this.customFieldItems.at(index).value && this.customFieldItems.at(index).value.customField.length === 0)
          return true;
      }
    }
    return false;
  }
  isFormArrayGroupValidRegularExpresson(index: number): boolean {
    if (this.customFieldItems.at(index).value.customField.toString() === "")
      return false;
    let value = ((this.customFieldItems.at(index).touched || this.isFormSubmitTriggered));
    if (value) {
      return !this.customFieldItems.at(index).valid;
    }
    return false;
  }
  convertNgbDateToString(date: NgbDate) {
    if (date)
      return `${date.year}-${date.month}-${date.day}`;
    else
      return "";
  }

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length) {
      const file = event.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      if (!validTypes.includes(file.type)) {
        this.toastrService.error(Constants.onlyPngJpgFilesAreAccepted);
        this.bookSlotForm.patchValue({
          [controlName]: null
        });
        this.fileName[controlName] = null;
        return;
      }

      this.bookSlotForm.patchValue({
        [controlName]: file
      });
      this.bookSlotForm.get(controlName).updateValueAndValidity();
      this.fileName[controlName] = file.name;
    }
  }

  openResedEmail(resendContent: TemplateRef<any>) {
    this.modalService.open(resendContent, { centered: true });
  }
  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const year = date.getFullYear();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }
}
