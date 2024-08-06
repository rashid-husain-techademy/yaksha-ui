import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRoles } from '@app/enums/user-roles';
import { Constants } from '@app/models/constants';
import { ApiClientService } from '@app/service';
import { dataService } from '@app/service/common/dataService';
import { Helper } from '@app/shared/helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { AssessmentService } from '../assessment.service';
import { ScheduleResultType } from '@app/enums/test';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { CustomFieldType, ScheduleTarget, ScheduleType, AssessmentType, AdaptiveAssessmentType, AssessmentScheduleMode, ProctorType } from '@app/enums/assessment';
import { AssessmentScheduleDto, AssessmentSections, ProctorDto, AssessmentTenants, GetAssessmentSchedule, NgbDate, ScheduleAssessment, ScheduleAssessmentDto, TenantScheduleCatalogResultsDto, SectionBasedTimer, TenantReviewer, UpdateAssessmentScheduled, AssessmentDetail, AssessmentSectionSkillDetails, AssessmentSectionDetails, ProficiencyDetails, FormAndMetadataIdDto, ScheduleAssessmentPageInputData, ResultScheduleAssessmentDetails, StackTemplateTypeDetails, TotalSkillQuestionsCountDetails, AdaptiveAssessmentSectionsConfig, AssessmentScheduleResponseDto, AdaptiveAssessmentScheduleSectionsConfig, ScheduleConfigOptions, UpdateScheduledAssessmentProctorDto, ScheduleRoleDetails, ScheduleRoleSectionDetails, AssessmentScheduleSlotMetadata } from '../assessment';
import { AssessmentScheduleCustomField } from '@app/admin/assessment/assessment';
import { NavigationService } from '@app/service/common/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { groupBy } from 'lodash';
import { Result } from '@app/shared/core-interface/base';
import { environment as env } from "../../../../environments/environment";
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { CampaignService } from '@app/admin/campaign/campaign.service';

declare function ExamConfig(config, sButtonRequired, className): any;

@Component({
  selector: 'app-schedule-assessment',
  templateUrl: './schedule-assessment.component.html',
  styleUrls: ['./schedule-assessment.component.scss']
})

export class ScheduleAssessmentComponent implements OnInit {

  @Input() public scheduleAssessmentDto: ScheduleAssessmentDto;
  scheduleAssessmentPageInputData: ScheduleAssessmentPageInputData;
  constants = Constants;
  scheduleForm: FormGroup;
  userRole: string;
  tenantList: AssessmentTenants[];
  tenantReviewers: TenantReviewer[];
  dropdownSettings: { singleSelection: boolean; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  singledropdownSettings: { singleSelection: boolean; selectAllText: string; unSelectAllText: string; allowSearchFilter: boolean; closeDropDownOnSelection: any; };
  singleselectedItems: string[];
  selectedItems: string[];
  tenantReviewerss: string[];
  reviewers: string[];
  selectedReviewers: string[];
  isReviewerSchedule: boolean = false;
  isFormSubmitTriggered: boolean = false;
  formattedStartTime: string = "";
  formattedEndTime: string = "";
  formattedSlotRegisterStartTime: string = "";
  formattedSlotRegisterEndTime: string = "";
  supportedTypesMessage: string;
  selectedFileType: string;
  file: File;
  fileTypeGranted: boolean = false;
  fileName: string;
  errorMessage: string[] = [];
  showErrors: boolean = false;
  errorLength: number = 99;
  supportedTypes: string[];
  userInviteSampleTemplate: string = "assets/sampleTemplate/Assessment_User_Invite.xlsx";
  userGroupUploadSampleTemplate: string = "assets/sampleTemplate/Assessment_User_Group_Invite.xlsx";
  userInviteSampleTemplateNITTE: string = "assets/sampleTemplate/Assessment_User_Invite_Nitte.xlsx";
  userInviteSampleTemplateLTIM: string = "assets/sampleTemplate/Assessment_User_Invite_Ltim.xlsx";
  invitedUserIds: string;
  showPublicLink: boolean = false;
  reviewerIds: number[] = [];
  userRoles = UserRoles;
  isSubmitted: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  hideScheduleCreation: boolean = false;
  reviewerEmail: string;
  currentDate = new Date();
  isReviewerAvailable: boolean = false;
  isSubjectiveQuestion: boolean = false;
  updateScheduledAssessment: UpdateAssessmentScheduled;
  isTenantDisabled: boolean = false;
  isProctorDisabled: boolean = false;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  tenantCatalogs: TenantScheduleCatalogResultsDto[];
  isTenantCatalogAvailable: boolean = false;
  selectedTenantCatalog: number = null;
  proctorsList: ProctorDto[] = [];
  multiSelectDropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  templateSelectDropdownSettings: { singleSelection: boolean; idField: string, textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; enableCheckAll: boolean };
  enableSection: boolean = false;
  enableSubmitDuration: boolean = false;
  sectionTimerArray: SectionBasedTimer[];
  assessmentSections: AssessmentSections[];
  disableSectionCheckbox: boolean = false;
  disableSubmitDurationCheckbox: boolean = false;
  cutOffValueMinutes: number;
  assessmentType = AssessmentType;
  adaptiveAssessmentType = AdaptiveAssessmentType;
  questionResultConfig: string;
  beginnerTotalQuestions: number;
  intermediateTotalQuestions: number;
  advancedTotalQuestions: number;
  assessmentDetail: AssessmentDetail;
  beginnerQuestions: number;
  intermediateQuestions: number;
  advancedQuestions: number;
  isCollaborativeAssessment: boolean = false;
  sampleTemplate: string;
  collaborativeUserFile: File;
  scheduleMode = AssessmentScheduleMode;
  questionRandomizationFormIds: FormAndMetadataIdDto[] = [];
  randomizationQuestionTouchedIds: number[] = [];
  defautQnRandomizationData = [{ ProficiencyLevelId: Constants.beginnerId, TotalQuestions: 0 }, { ProficiencyLevelId: Constants.intermediateId, TotalQuestions: 0 }, { ProficiencyLevelId: Constants.advancedId, TotalQuestions: 0 }];
  templateTypes: StackTemplateTypeDetails[] = [];
  selectedTemplateTypes: number[] = [];
  scheduleTemplateMappingIds: number[];
  isUpdate: boolean = true;
  maxRegression: number;
  persistContainer: boolean = false;
  endDateValue: any = null;
  adaptiveAssessmentSectionsConfig: AdaptiveAssessmentSectionsConfig[] = [];
  adaptiveAssessmentScheduleSectionsConfig: AdaptiveAssessmentScheduleSectionsConfig[] = [];
  minProgressionCount: number = 3;
  minRegressionCount: number = 1;
  scheduledId: number;
  showProctorSettings: boolean = false;
  isCodeBased: boolean = false;
  enumProctorType = ProctorType;
  tenantId: number;
  scheduleConfigOptions: ScheduleConfigOptions = null;
  isSuperAdmin: boolean = false;
  isTenantAdmin: boolean = false;
  hidePassPercentageSpan: boolean = false;
  enablePlagiarismFormControlName: string = 'enablePlagiarism';
  aeyeExamCreated: boolean = false;
  showPercentage: boolean = false;
  showCustomNegativePercentage: boolean = false;
  formattedRegistrationStartTime: string = "";
  formattedRegistrationEndTime: string = "";
  minDate = undefined;
  isUploadType: boolean = false;
  showAnswer: boolean = false;
  showAnswerAllowed: boolean = false;
  formattedReviewStartTime: string = "";
  isAdaptive: boolean = false;
  enableSlotBooking: boolean = false;
  enableRoleAnalysis: boolean = false;
  roleAnalysisRows = [{ roleName: '', isDeleted: false }];
  roleAnalysisDetails: ScheduleRoleDetails[] = [];
  isRoleAnalysisEnabled: boolean;
  disableRoleAnalysis: boolean = false;
  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private appSessionService: AppSessionService,
    private dataService: dataService,
    private apiClientService: ApiClientService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private appSession: AppSessionService,
    private campaignService: CampaignService,
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    this.route.params.subscribe(params => {
      if (params) {
        if (params['scheduleId']) {
          this.scheduleAssessmentPageInputData = { assessmentId: JSON.parse(atob(params['id'])), isStack: JSON.parse(atob(params['isStack'])), isCloud: JSON.parse(atob(params['isCloud'])), isVmBased: JSON.parse(atob(params['isVMBased'])), scheduleId: JSON.parse(atob(params['scheduleId'])), tenantId: JSON.parse(atob(params['tenantId'])), isUpdateScheduleAssessment: JSON.parse(atob(params['isUpdate'])), isCoding: JSON.parse(atob(params['isCoding'])), isMCQ: JSON.parse(atob(params['isMCQ'])), campaignDetails: JSON.parse(atob(params['campaignDetails'])), isSubjective: JSON.parse(atob(params['isSubjective'])), isUploadType: JSON.parse(atob(params['isUploadType'])), isCloneSchedule: JSON.parse(atob(params['isCloneSchedule'])) };
          this.isUploadType = this.scheduleAssessmentPageInputData.isUploadType;
        }
        else {
          this.scheduleAssessmentPageInputData = { assessmentId: JSON.parse(atob(params['id'])), isStack: JSON.parse(atob(params['isStack'])), isCloud: JSON.parse(atob(params['isCloud'])), isVmBased: JSON.parse(atob(params['isVMBased'])), scheduleId: null, tenantId: null, isUpdateScheduleAssessment: null, isCoding: JSON.parse(atob(params['isCoding'])), isMCQ: JSON.parse(atob(params['isMCQ'])), campaignDetails: JSON.parse(atob(params['campaignDetails'])), isSubjective: JSON.parse(atob(params['isSubjective'])), isUploadType: JSON.parse(atob(params['isUploadType'])), isCloneSchedule: false };
          this.isUploadType = this.scheduleAssessmentPageInputData.isUploadType;
        }
        if (this.scheduleAssessmentPageInputData.campaignDetails.callFromCampaign)
          this.showAnswerAllowed = false;
        else {
          this.showAnswerAllowed = this.scheduleAssessmentPageInputData.isMCQ &&
            !this.scheduleAssessmentPageInputData.isCoding &&
            !this.scheduleAssessmentPageInputData.isCloud &&
            !this.scheduleAssessmentPageInputData.isStack &&
            !this.scheduleAssessmentPageInputData.isSubjective;
        }
      }
    });

    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
      if (this.userRole === this.userRoles[1]) {
        this.isSuperAdmin = true;
      }
      else if (this.userRole === this.userRoles[2])
        this.isTenantAdmin = true;
    });
    this.getTenantScheduleConfigById(this.tenantId);
    if (this.scheduleAssessmentPageInputData.isStack && !this.scheduleAssessmentPageInputData.isCloud && !this.scheduleAssessmentPageInputData.isVmBased) {
      this.getAssessmentTemplateDetails();
      this.setScheduleAssessmentDetails();
    }
    else {
      this.setScheduleAssessmentDetails();
      if (this.tenantId == this.dataService.nitte) {
        this.sampleTemplate = this.userInviteSampleTemplateNITTE;
      }
      if (this.tenantId == this.dataService.ltim) {
        this.sampleTemplate = this.userInviteSampleTemplateLTIM;
      }
      else {
        this.sampleTemplate = this.userInviteSampleTemplate;
      }
    }
    if (this.scheduleAssessmentPageInputData.isCoding === true) {
      this.isCodeBased = true;
    }
  }

  getTenantScheduleConfigById(tenantId: number): void {
    if (!this.dataService.isSuperAdmin() && !this.dataService.isTenantAdmin()) {
      this.assessmentService.getTenantScheduleConfigById(tenantId).subscribe(res => {
        if (res.result !== null) {
          this.scheduleConfigOptions = JSON.parse(res.result);
        }
      },
        error => {
          console.error(error);
        });
    }
  }

  setScheduleAssessmentDetails(): void {
    this.assessmentService.getAssessmentScheduleDetails(this.scheduleAssessmentPageInputData.assessmentId).subscribe((res: Result<ResultScheduleAssessmentDetails>) => {
      if (res.success) {
        const response = res.result;
        let data: ScheduleAssessmentDto = {
          assessmentId: this.scheduleAssessmentPageInputData.assessmentId,
          assessmentName: response.assessmentName,
          isStackAssessment: this.scheduleAssessmentPageInputData.isStack,
          categoryName: response.categories.map(x => x.name).join(', '),
          type: response.assessmentType,
          assessmentScheduleId: this.scheduleAssessmentPageInputData.scheduleId,
          tenantId: this.scheduleAssessmentPageInputData.tenantId,
          totalQuestions: response.totalQuestions,
          assessmentSections: response.assessmentSections,
          isUpdateScheduleAssessment: this.scheduleAssessmentPageInputData.isUpdateScheduleAssessment,
          randomizationDetails: response.randomizationDetails,
          isTenantQuestions: response.isTenantQuestions,
          isCloneSchedule: this.scheduleAssessmentPageInputData.isCloneSchedule
        };
        if (!data.isTenantQuestions)
          this.showAnswerAllowed = false;
        this.scheduleAssessmentDto = data;
        this.initPage();
        if (this.scheduleAssessmentDto.type === AssessmentType.Adaptive) {
          this.sampleTemplate = this.userInviteSampleTemplate;
          this.isAdaptive = true;
          this.getAssessmentDetail();
        }
        if (this.isSuperAdmin) {
          this.getAllTenants();
        }
      }
    });
  }

  initPage(): void {
    this.assessmentSections = this.scheduleAssessmentDto.assessmentSections || null;
    this.initScheduleForm();
    this.scheduleForm.get('attempts').valueChanges.subscribe(value => {
      if (value === 1) {
        this.scheduleForm.get('enableSlotBooking').enable();
      } else {
        this.scheduleForm.get('enableSlotBooking').disable();
      }
    });
    this.getProctors();
    if (this.isTenantAdmin || this.userRole === UserRoles[7]) {
      this.scheduleForm.patchValue({
        tenantId: [{ id: this.appSessionService.tenantId, name: this.appSessionService.tenantName }]
      });
      this.getTenantSpecificDetails();
    }
    if (this.scheduleAssessmentDto.categoryName === null) {
      this.assessmentService.getAssessmentCategory(this.scheduleAssessmentDto.assessmentId).subscribe(res => {
        if (res.success && res.result)
          this.scheduleAssessmentDto.categoryName = res.result.join(', ');
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
    if (this.scheduleAssessmentDto.assessmentScheduleId) {
      this.hideScheduleCreation = true;
      setTimeout(() => this.viewAssessmentDetails(), 1000);
    }
    else {
      this.selectedReviewers = [];
      this.dropdownSettings = {
        singleSelection: false,
        selectAllText: Constants.selectAll,
        unSelectAllText: Constants.unSelectAll,
        itemsShowLimit: 1,
        allowSearchFilter: true
      };
      this.scheduleForm.get("startDate").valueChanges.subscribe(startDate => {
        if (startDate) {
          this.scheduleForm.get('startTime').setValidators([Validators.required]);
          this.scheduleForm.get('startTime').enable();
        }
        else {
          this.scheduleForm.get('startTime').clearValidators();
          this.scheduleForm.get('startTime').setValue('');
          this.scheduleForm.get('startTime').disable();
        }
      });
      this.endDateAndTimeValueChange();
      this.registrationStartAndEndDateChange();
      this.scheduleForm.get("resultViewStartDate").valueChanges.subscribe(resultViewStartDate => {
        if (resultViewStartDate) {
          this.scheduleForm.get('resultViewStartTime').setValidators([Validators.required]);
          this.scheduleForm.get('resultViewStartTime').enable();

          this.scheduleForm.get('resultViewDuration').setValidators([Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]);
          this.scheduleForm.get('resultViewDuration').enable();
        }
        else {
          this.scheduleForm.get('resultViewStartTime').clearValidators();
          this.scheduleForm.get('resultViewStartTime').setValue('');
          this.scheduleForm.get('resultViewStartTime').disable();

          this.scheduleForm.get('resultViewDuration').clearValidators();
          this.scheduleForm.get('resultViewDuration').setValue('');
          this.scheduleForm.get('resultViewDuration').disable();
        }
      });
    }
    this.setSectionTimerObject();
  }

  getAssessmentDetail() {
    this.assessmentService.getAssessmentDetail(this.scheduleAssessmentDto.assessmentId).subscribe(res => {
      if (res.result) {
        this.assessmentDetail = res.result;
        this.setAdaptiveAssessmentFormOnCreate(this.assessmentDetail.assessmentSections);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  setAdaptiveAssessmentForm(data: AdaptiveAssessmentScheduleSectionsConfig[]) {
    data.forEach((section) => {
      this.setProgressionForm(section.assessmentSectionId);
    });
    return;
  }

  setAdaptiveAssessmentFormOnCreate(sections: AssessmentSections[]) {
    sections.forEach((section) => {
      this.setProgressionForm(section.id);
    });
    return;
  }

  setProgressionForm(id: number) {
    this.scheduleForm.addControl('progression' + id, new FormControl('', [Validators.required, Validators.min(this.minProgressionCount), Validators.max(99)]));
    this.scheduleForm.addControl('regression' + id, new FormControl('', [Validators.required, Validators.min(this.minRegressionCount), Validators.max(this.maxRegression)]));
  }

  regressionCheck(id: number, section: AssessmentSections) {
    const totalQuestions = section?.totalSkillQuestionsCountDetails?.proficiencyLevelConfig ? JSON.parse(section?.totalSkillQuestionsCountDetails?.proficiencyLevelConfig) : undefined;
    const proficiencyLevelQuestions = section.sectionSkills[0].proficiencyLevelQuestions?.length ? section.sectionSkills[0].proficiencyLevelQuestions : undefined;
    if (totalQuestions && proficiencyLevelQuestions) {
      let maximumRegression = Math.min((totalQuestions.BeginnerQuestionCount / proficiencyLevelQuestions[0].totalQuestions), (totalQuestions.IntermediateQuestionCount / proficiencyLevelQuestions[1].totalQuestions), (totalQuestions.AdvancedQuestionCount / proficiencyLevelQuestions[2].totalQuestions));
      this.maxRegression = parseInt(maximumRegression.toString());
      this.scheduleForm.get('regression' + id).setValidators([Validators.required, Validators.min(1), Validators.max(this.maxRegression)]);
    }
  }

  registrationStartAndEndDateChange() {
    this.scheduleForm.get("registrationStartDate").valueChanges.subscribe(regStartDate => {
      if (regStartDate) {
        this.scheduleForm.get('registrationStartTime').setValidators([Validators.required]);
        this.scheduleForm.get('registrationStartTime').enable();
      }
      else {
        this.scheduleForm.get('registrationStartTime').clearValidators();
        this.scheduleForm.get('registrationStartTime').setValue('');
        this.scheduleForm.get('registrationStartTime').disable();
        this.formattedRegistrationStartTime = "";
      }
    });

    this.scheduleForm.get("registrationEndDate").valueChanges.subscribe(regEndDate => {
      if (regEndDate) {
        this.scheduleForm.get('registrationEndTime').setValidators([Validators.required]);
        this.scheduleForm.get('registrationEndTime').enable();
      }
      else {
        this.scheduleForm.get('registrationEndTime').clearValidators();
        this.scheduleForm.get('registrationEndTime').setValue('');
        this.scheduleForm.get('registrationEndTime').disable();
        this.formattedRegistrationEndTime = "";
      }
    });
  }

  endDateAndTimeValueChange() {
    this.scheduleForm.get("endDate").valueChanges.pipe(debounceTime(1000), distinctUntilChanged(), startWith(this.scheduleForm.get("endDate").value)).subscribe(endDate => {
      if (endDate) {
        this.scheduleForm.get('endTime').setValidators([Validators.required]);
        this.scheduleForm.get('endTime').enable();
        this.scheduleForm.get('cutOffDate').setValue(this.scheduleForm.get("endDate").value);
      }
      else {
        this.scheduleForm.get('endTime').clearValidators();
        this.scheduleForm.get('endTime').setValue('');
        this.scheduleForm.get('endTime').disable();
      }
    });
    this.scheduleForm.get("endTime").valueChanges.subscribe(endTime => {
      if (endTime) {
        this.scheduleForm.get('cutOffDate').enable();
        this.scheduleForm.get('cutOffTime').enable();
        this.scheduleForm.get('cutOffDate').setValue(this.scheduleForm.get("endDate").value);
        this.onChangeCutOffTimeCalc();
      }
    });
  }

  convertToDateTime(dateValue, timeValue) {
    var Year = dateValue.year;
    var Month = dateValue.month;
    var Day = dateValue.day;

    var DateTimeValue = new Date(Year + '-' + Month + '-' + Day);
    DateTimeValue.setHours((timeValue.split(' ')[0]).split(':')[0]);
    DateTimeValue.setMinutes((timeValue.split(' ')[0]).split(':')[1]);

    return DateTimeValue;
  }

  setCutOffDateTime(endDateTime) {
    var hrs = endDateTime.getHours().toString().length === 1 ? "0" + endDateTime.getHours() : endDateTime.getHours();
    var min = endDateTime.getMinutes().toString().length === 1 ? "0" + endDateTime.getMinutes() : endDateTime.getMinutes();

    var cutOffTimeCalc = hrs + ":" + min;
    this.scheduleForm.get('cutOffTime').setValue(cutOffTimeCalc);
    this.scheduleForm.get('cutOffDate').setValue(this.scheduleForm.get("endDate").value);
  }

  getDifferenceInMinutes(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60);
  }

  onChangeCutOffTimeCalc() {
    var endTimeVal = this.scheduleForm.get("endTime").value;
    if (endTimeVal !== undefined && endTimeVal !== "") {
      var endDateTime = this.convertToDateTime(this.scheduleForm.get("endDate").value, endTimeVal);
      let difference = endDateTime.getMinutes() - (this.scheduleForm.get("duration").value);
      endDateTime.setMinutes(difference);

      var hrs = endDateTime.getHours().toString().length === 1 ? "0" + endDateTime.getHours() : endDateTime.getHours();
      var min = endDateTime.getMinutes().toString().length === 1 ? "0" + endDateTime.getMinutes() : endDateTime.getMinutes();

      var cutOffTimeCalc = hrs + ":" + min;
      this.scheduleForm.get('cutOffTime').setValue(cutOffTimeCalc);
    }
    var duration = this.scheduleForm.get("duration").value;
    if (duration === undefined || duration === "") {
      this.enableSubmitDuration = false;
      this.scheduleForm.removeControl("submitEnableDuration");
    }
  }

  getAllTenants() {
    if (this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign) {
      this.campaignService.getTenantsByCampaignId(this.scheduleAssessmentPageInputData.campaignDetails?.campaignId).subscribe(res => {
        if (res.result) {
          this.tenantList = res.result;
          this.scheduleForm.patchValue({
            tenantId: [{ id: this.tenantList[0].id, name: this.tenantList[0].name }]
          });
          this.getTenantSpecificDetails();
        }
        else
          this.toastrService.warning(Constants.noTenantsFound);
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
    else {
      this.assessmentService.getTenantsByAssessmentId(this.scheduleAssessmentDto.assessmentId).subscribe(res => {
        if (res.success && res.result.length)
          this.tenantList = res.result;
        else
          this.toastrService.warning(Constants.noTenantsFound);
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }

  }

  getProctors() {
    this.assessmentService.getProctors().subscribe(res => {
      if (res.success && res.result.length)
        this.proctorsList = res.result.map((value) => {
          return { "id": value.loginID, "name": value.fname?.trim().length > 0 || value.lname?.trim().length > 0 ? value.fname + " " + value.lname : value.loginID };
        }).filter(x => x.id?.trim().length > 0);
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  initScheduleForm() {
    this.scheduleForm = this.formBuilder.group({
      tenantId: ['', Validators.required],
      attempts: [this.scheduleAssessmentDto.type === AssessmentType.Hackathon || this.scheduleAssessmentDto.type === AssessmentType.Adaptive || this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign ? { value: 1, disabled: true } : '', [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")]],
      passPercentage: [this.scheduleAssessmentDto.type === AssessmentType.Adaptive ? { value: 0, disabled: true } : '', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern("^[0-9]*$")]],
      negativeScore: ['', [Validators.min(1), Validators.max(100), Validators.pattern("^[0-9]*$")]],
      duration: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      shuffleQuestions: [false, Validators.required],
      enablePlagiarism: (this.scheduleConfigOptions?.EnablePlagiarism) ? [false, Validators.required] : [false],
      isMockSchedule: this.scheduleConfigOptions?.MockSchedule ? [false, Validators.required] : [false],
      persistContainer: [false, Validators.required],
      isShuffleMcqOptions: [false, Validators.required],
      isCollaborativeAssessment: [false, Validators.required],
      startDate: null,
      endDate: null,
      startTime: [{ value: '', disabled: true }],
      endTime: [{ value: '', disabled: true }],
      cutOffDate: [{ value: '', disabled: true }],
      cutOffTime: [{ value: '', disabled: true }],
      scheduleType: !this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign && this.scheduleAssessmentPageInputData.isCloud ? [Constants.inviteCandidates, Validators.required] : (this.scheduleConfigOptions !== null ? (this.scheduleConfigOptions.PublicSchedule ? [Constants.publicURL, Validators.required] : (this.scheduleConfigOptions?.InviteSchedule ? [Constants.inviteCandidates, Validators.required] : [Constants.selfEnrollment, Validators.required])) : [Constants.publicURL, Validators.required]),
      executionCount: this.scheduleConfigOptions?.ExecutionCount ? [0, [Validators.min(0), Validators.pattern("^[0-9]*$")]] : [],
      qrValidTime: this.scheduleConfigOptions?.QRValidTime ? [{ value: 0, disabled: true }, [Validators.min(1), Validators.pattern("^[0-9]*$")]] : [],
      candidateEmails: [''],
      proctorType: [''],
      enableFullscreenMode: [false, Validators.required],
      restrictBrowserWindowViolation: [false, Validators.required],
      windowViolationLimit: [0, [Validators.min(0)]],
      sendResultsEmail: [false, Validators.required],
      showResults: [false, Validators.required],
      enableCalculator: [false, Validators.required],
      isCopyPasteEnabledForCoding: [false, Validators.required],
      getFeedback: [false, Validators.required],
      domain: [''],
      scheduleLink: [''],
      enableProctoring: [false, Validators.required],
      /* wheeboxSettings: [false, Validators.required],
       environmentValidation: [Constants.faceTrainingsettings, Validators.required],
       internetStatus: [false, Validators.required],
       faceCheck: [false, Validators.required],
       suspiciousObjectCheck: [false, Validators.required],
       twoFaces: [false, Validators.required],
       noFace: [false, Validators.required],
       liveProctoring: [false, Validators.required],
       videoRecording: [false, Validators.required],
       proctorMapping: [false, Validators.required],
       proctorMappingTestTakerCount: ['', [Validators.min(0)]],
       proctors: [''],
       isHardMapping: [false],
       proctoringViolation: [Constants.proceedWithTheTests, Validators.required],
       isScreenSharing: [false],
       screenSharingViolationLimit: [0, [Validators.min(0)]],
       approveType: [Constants.autoApproval],*/
      customLabel1: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField1Mandatory: [false],
      customLabel2: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField2Mandatory: [false],
      customLabel3: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField3Mandatory: [false],
      customLabel4: ['', [Validators.maxLength(50), Validators.pattern("^[a-zA-Z].*")]],
      isCustomField4Mandatory: [false],
      tenantCatalogId: [''],
      showQuestionRandomization: [false],
      stackTemplateType: [''],
      enableSFATestcase: [false, Validators.required],
      hideResultStatus: [false, Validators.required],
      cpuWeightage: ['', [Validators.min(0), Validators.max(100), Validators.pattern("^[0-9]*$")]],
      warningWeightage: ['', [Validators.min(0), Validators.max(100), Validators.pattern("^[0-9]*$")]],
      enableAeye: [false],
      negativeMarking: [false],
      customNegativePercentage: ['', false],
      negativeMarkPercentage: [Constants.fifty.toString(), false],
      registrationStartDate: null,
      registrationEndDate: null,
      registrationStartTime: [{ value: '', disabled: true }],
      registrationEndTime: [{ value: '', disabled: true }],
      testPurpose: this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign ? [null] : ['', [Validators.required, Validators.pattern("^[a-zA-Z].*")]],
      enableShowResult: [false],
      resultViewStartDate: null,
      resultViewStartTime: [{ value: '', disabled: true }],
      resultViewDuration: [''],
      enableSlotBooking: [false],
      registrationSlotStartDate: [''],
      registrationSlotStartTime: [''],
      registrationSlotEndDate: [''],
      registrationSlotEndTime: [''],
      supportedLanguage: [{ value: 'English', disabled: true }],
      availableCenter: ['Online'],
      slots: this.formBuilder.array([this.createSlotFormGroup()]),
      enableAeyeDesktopApplicationInstallation: [false]
    });

    this.multiSelectDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: true
    };
    this.templateSelectDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: true
    };
    this.setSectionErrorValid();
    this.addQuestionRandomizationIntoForm();
    this.enableDisableQR();
  }
  createSlotFormGroup(data?: any): FormGroup {
    return this.formBuilder.group({
      slotStartDate: [data?.slotStartDate || ''],
      slotStartTime: [data?.slotStartTime || ''],
      maxCandidates: [data?.maxCandidates || '', [Validators.pattern("^[0-9]*$")]],
    });
  }
  addSlot(data?: any) {
    const slots = this.scheduleForm.get('slots') as FormArray;
    slots.push(this.createSlotFormGroup(data));
  }

  cloneSlot(index: number) {
    const slots = this.scheduleForm.get('slots') as FormArray;
    const slotData = slots.at(index).value;
    this.addSlot(slotData);
  }
  deleteSlot(index: number) {
    const slots = this.scheduleForm.get('slots') as FormArray;
    if (slots.length > 1) {
      slots.removeAt(index);
    }
  }

  addNewSlot() {
    this.addSlot();
  }

  isFormValid(formControlName: string): boolean {
    return !(this.scheduleForm.get(formControlName)?.errors?.required && (this.scheduleForm.get(formControlName).touched || this.isFormSubmitTriggered));
  }

  close(): void {
    this.navigationService.goBack();
  }

  getTenantSpecificDetails() {
    let tenantId = this.scheduleForm.get('tenantId').value[0].id;
    this.reviewerIds = [];
    this.selectedReviewers = [];
    if (this.scheduleAssessmentPageInputData.isSubjective) {
      this.assessmentService.getTenantReviewers(tenantId).subscribe(res => {
        if (res.success && res.result.length) {
          this.tenantReviewers = res.result;
          this.reviewers = this.tenantReviewers.map(x => x.userName);
          this.isReviewerAvailable = true;
          this.isSubjectiveQuestion = true;
        }
        else {
          this.tenantReviewers = [];
          this.reviewers = [];
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
    this.assessmentService.getTenantCatalogs(tenantId).subscribe(res => {
      if (res.success && res.result.length) {
        this.tenantCatalogs = res.result;
        this.isTenantCatalogAvailable = true;
      }
      else {
        this.tenantCatalogs = [];
        this.isTenantCatalogAvailable = false;
        this.selectedTenantCatalog = null;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getAssessmentTemplateDetails() {
    this.templateTypes = [];
    this.assessmentService.getAssessmentTemplateDetails(this.scheduleAssessmentPageInputData.assessmentId)
      .subscribe(res => {
        if (res.success && res.result.length) {
          this.templateTypes = res.result;
        }
      });
  }

  onTemplateSelect() {
    this.selectedTemplateTypes = [];
    let templateType = this.scheduleForm.get('stackTemplateType').value;
    this.selectedTemplateTypes = templateType.map(x => x.id);
  }

  onTemplateDeSelect(value) {
    let index = this.selectedTemplateTypes.indexOf(value.id);
    this.selectedTemplateTypes.splice(index, 1);
  }

  onTemplateSelectAll() {
    this.selectedTemplateTypes = [];
    this.selectedTemplateTypes = this.templateTypes.map(x => x.id);
  }

  onTemplateDeSelectAll() {
    this.selectedTemplateTypes = [];
  }

  onTenantDeSelect() {
    this.selectedReviewers = [];
    this.reviewers = [];
    this.isReviewerSchedule = false;
  }

  changeSchedule() {
    this.scheduleForm.get('tenantCatalogId').setValidators([Validators.required]);
    if (this.scheduleForm.get('scheduleType').value === Constants.inviteCandidates) {
      this.scheduleForm.get('candidateEmails').setValue('');
      this.fileName = '';
      this.file = undefined;
      this.scheduleForm.get('tenantCatalogId').setErrors(null);
    }
    else if (this.scheduleForm.get('scheduleType').value === Constants.publicURL) {
      this.scheduleForm.get('domain').setValue('');
      this.scheduleForm.get('tenantCatalogId').setErrors(null);
      this.scheduleForm.get('customLabel1').setValue('');
      this.scheduleForm.get('isCustomField1Mandatory').setValue(false);
      this.scheduleForm.get('customLabel2').setValue('');
      this.scheduleForm.get('isCustomField2Mandatory').setValue(false);
      this.scheduleForm.get('customLabel3').setValue('');
      this.scheduleForm.get('isCustomField3Mandatory').setValue(false);
      this.scheduleForm.get('customLabel4').setValue('');
      this.scheduleForm.get('isCustomField4Mandatory').setValue(false);
    }
    else if (this.scheduleForm.get('scheduleType').value === Constants.selfRegistration) {
      this.scheduleForm.get('tenantCatalogId').setErrors(null);
      this.scheduleForm.get('customLabel1').setValue('');
      this.scheduleForm.get('isCustomField1Mandatory').setValue(false);
      this.scheduleForm.get('customLabel2').setValue('');
      this.scheduleForm.get('isCustomField2Mandatory').setValue(false);
      this.scheduleForm.get('customLabel3').setValue('');
      this.scheduleForm.get('isCustomField3Mandatory').setValue(false);
      this.scheduleForm.get('customLabel4').setValue('');
      this.scheduleForm.get('isCustomField4Mandatory').setValue(false);
      this.scheduleForm.get("registrationStartDate").setValue(null);
      this.scheduleForm.get("registrationEndDate").setValue(null);
      this.fileName = '';
      this.file = undefined;
    }
    else {
      this.scheduleForm.get('tenantCatalogId').setErrors(null);
    }
  }

  getAdaptiveAssessmentSectionsConfig() {
    if (this.assessmentDetail?.assessmentType === this.assessmentType.Adaptive)
      this.assessmentDetail?.assessmentSections.forEach((obj) => {
        let adaptiveAssessmentDetails: AdaptiveAssessmentSectionsConfig = {
          sectionId: obj.id,
          totalProgression: Number(this.scheduleForm.get('progression' + obj.id).value),
          totalRegression: Number(this.scheduleForm.get('regression' + obj.id).value)
        };
        this.adaptiveAssessmentSectionsConfig.push(adaptiveAssessmentDetails);
      });
    return;
  }

  checkMMLConfig() {
    this.currentDate = new Date();
    this.isFormSubmitTriggered = true;
    if (this.scheduleForm.get('duration').status === 'VALID' && !this.enableSection) {
      this.setSectionErrorNull();
    }
    if (this.scheduleAssessmentPageInputData.isVmBased) {
      let tenantId = this.scheduleForm.get('tenantId').value[0].id;
      this.assessmentService.isMMLConfigAvailableForTenant(tenantId).subscribe(res => {
        if (res.success && res.result) {
          if (this.scheduleAssessmentDto.isCloneSchedule)
            this.save();
          else {
            if (this.scheduleForm.valid) {
              this.save();
            } else {
              this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
            }
          }
        }
        else {
          this.toastrService.warning(this.constants.selectedTenantDoestNotHaveLabConfigurationForProvisioningKindlyEnableTheConfiguration);
          return;
        }
      });
    }
    else {
      if (this.scheduleAssessmentDto.isCloneSchedule)
        this.save();
      else {
        if (this.scheduleForm.valid) {
          this.save();
        } else {
          this.toastrService.error(Constants.pleaseCorrectTheValidationErrors);
        }
      }
    }
  }

  save() {
    this.currentDate = new Date();
    this.isFormSubmitTriggered = true;
    if (this.scheduleForm.get('duration').status === 'VALID' && !this.enableSection) {
      this.setSectionErrorNull();
    }
    this.getAdaptiveAssessmentSectionsConfig();
    if (this.enableRoleAnalysis) {
      if (this.roleAnalysisRows.length > 0) {
        let isSectionWeightageValid: boolean = true;
        this.roleAnalysisDetails = [];
        for (const [rowIndex, row] of this.roleAnalysisRows.entries()) {
          if (!row.isDeleted) {
            let roleDetails: ScheduleRoleDetails = {
              roleName: this.scheduleForm.get(`roleName${rowIndex}`).value,
              description: this.scheduleForm.get(`roleDescription${rowIndex}`).value,
              sectionDetails: []
            };
            let sectionWeightage = 0;
            this.scheduleAssessmentDto.assessmentSections.forEach((section, sectionIndex) => {
              let sectionDetails: ScheduleRoleSectionDetails = {
                assessmentSectionId: section.id,
                sectionWeightage: this.scheduleForm.get(`roleAnalysisSection${rowIndex}${sectionIndex}`).value
              };
              sectionWeightage = sectionWeightage + this.scheduleForm.get(`roleAnalysisSection${rowIndex}${sectionIndex}`).value;
              roleDetails.sectionDetails.push(sectionDetails);
            });
            if (sectionWeightage === Constants.totalPercentage) {
              this.roleAnalysisDetails.push(roleDetails);
            } else {
              isSectionWeightageValid = false;
              this.toastrService.warning(Constants.sectionWeightageFieldsShouldBeEqualsWithHundred);
              break;
            }
          }
        };
        if (!isSectionWeightageValid)
          return;
      }
    }
    if (this.scheduleForm.get('showQuestionRandomization').value) {
      if (!this.isQuestionRandomizationSectionsValid()) {
        this.toastrService.warning(this.constants.sectionCannotBeEmpty);
        return;
      }
    }
    if (this.scheduleForm.get('qrValidTime').value) {
      if (this.enableSection) {
        this.sectionTimerArray.forEach(section => {
          if (((section.duration) * 60) < (this.scheduleForm.get('qrValidTime').value))
            this.toastrService.warning(this.constants.QRValidTimeShouldBeLessThanSectionDuration);
          return;
        })
      }
      else if (((this.scheduleForm.get('duration').value) * 60) < (this.scheduleForm.get('qrValidTime').value)) {
        this.toastrService.warning(this.constants.QRValidTimeShouldBeLessThanAssessmentDuration);
        return;
      }
    }
    if (this.scheduleForm.get('enableProctoring').value) {
      if (!(this.scheduleForm.get('enableFullscreenMode').value
        || this.scheduleForm.get('restrictBrowserWindowViolation').value)) {
        this.toastrService.warning(Constants.pleaseSelectAtleastOneProctoringSettings);
        return;
      }
    }
    /* if (this.scheduleForm.get('wheeboxSettings').value) {
        if (!(this.scheduleForm.get('internetStatus').value || this.scheduleForm.get('faceCheck').value || this.scheduleForm.get('suspiciousObjectCheck').value || this.scheduleForm.get('twoFaces').value || this.scheduleForm.get('noFace').value || this.scheduleForm.get('liveProctoring').value || this.scheduleForm.get('videoRecording').value || this.scheduleForm.get('isScreenSharing').value)) {
          this.toastrService.warning(Constants.pleaseSelectAtleastOneWheeboxSettings);
          return;
        }
      }*/
    if (this.scheduleForm.get('startDate').value || this.scheduleForm.get('endDate').value) {
      this.formattedStartTime = this.convertNgbDateToString(this.scheduleForm.get('startDate').value, this.scheduleForm.get('startTime').value);
      this.formattedEndTime = this.convertNgbDateToString(this.scheduleForm.get('endDate').value, this.scheduleForm.get('endTime').value);

      if (!(this.scheduleForm.get('startTime').value)) {
        this.currentDate.setHours(0, 0, 0, 0);
      }
      if (!this.formattedStartTime && this.formattedEndTime) {
        this.toastrService.warning(Constants.pleaseSelectStartDateAndTime);
        return;
      }
      else if (this.formattedStartTime && !this.formattedEndTime) {
        this.toastrService.warning(Constants.pleaseSelectEndDateAndTime);
        return;
      }
      else if (new Date(this.formattedStartTime) < this.currentDate || new Date(this.formattedStartTime) > new Date(this.formattedEndTime)) {
        this.toastrService.warning(Constants.pleaseSelectValidDate);
        return;
      }
      else if (new Date(this.formattedEndTime) < this.currentDate) {
        this.toastrService.warning(Constants.pleaseSelectValidDate);
        return;
      }
    }
    if (this.scheduleForm.get('enableShowResult').value == true) {
      if (!this.scheduleForm.get('resultViewStartDate').value || !this.scheduleForm.get('resultViewStartTime').value) {
        this.toastrService.warning(Constants.pleaseSelectSRStartDateAndTime);
        return;
      }

      this.formattedReviewStartTime = this.convertNgbDateToString(this.scheduleForm.get('resultViewStartDate').value, this.scheduleForm.get('resultViewStartTime').value);

      if (new Date(this.formattedReviewStartTime) < new Date(this.formattedStartTime)
      ) {
        this.toastrService.warning(Constants.pleaseSelectSRValidDate);
        return;
      }
    }
    if (this.scheduleAssessmentPageInputData.isStack && !this.scheduleAssessmentPageInputData.isVmBased && this.selectedTemplateTypes.length === 0 && !this.scheduleAssessmentPageInputData.isCloud) {
      this.toastrService.warning(Constants.pleaseSelectTemplateType);
      return;
    }
    if (this.scheduleForm.get('startDate').value === null) {
      this.toastrService.warning(Constants.pleaseSelectStartDateAndTime);
      return;
    }
    if (this.scheduleForm.get('endDate').value === null) {
      this.toastrService.warning(Constants.pleaseSelectEndDateAndTime);
      return;
    }
    if (this.scheduleForm.get('cutOffDate').value === "" || this.scheduleForm.get('cutOffTime').value === "") {
      this.toastrService.warning(Constants.pleaseSelectCutOffDate);
      return;
    }
    if (this.scheduleForm.get('cutOffDate').value !== "" && this.scheduleForm.get('cutOffTime').value !== "") {
      var endTimeVal = this.scheduleForm.get("endTime").value;
      var startTimeVal = this.scheduleForm.get("startTime").value;
      var endDateTime = this.convertToDateTime(this.scheduleForm.get("endDate").value, endTimeVal);
      var startDateTime = this.convertToDateTime(this.scheduleForm.get("startDate").value, startTimeVal);
      let difference = endDateTime.getMinutes() - (this.scheduleForm.get("duration").value);
      endDateTime.setMinutes(difference);

      var cutOffDateTime = this.convertToDateTime(this.scheduleForm.get("cutOffDate").value, this.scheduleForm.get('cutOffTime').value);
      this.cutOffValueMinutes = this.getDifferenceInMinutes(startDateTime, cutOffDateTime);

      if (cutOffDateTime > endDateTime) {
        this.toastrService.error(Constants.cutOffDateTimeGreaterThanEndDate);
        this.setCutOffDateTime(endDateTime);
        return;
      }
      if (startDateTime > cutOffDateTime) {
        this.toastrService.error(Constants.startDateTimeGreaterThanCutOffDate);
        this.setCutOffDateTime(endDateTime);
        return;
      }
    }
    if (this.scheduleForm.get('cpuWeightage').value + this.scheduleForm.get('warningWeightage').value > 100) {
      this.toastrService.warning("The Sum of CPU/Memory weightage and Warning weightage should be less or equal to 100");
      return;
    }
    if (this.enableSlotBooking) {
      if (this.scheduleForm.get('registrationSlotStartDate').value || this.scheduleForm.get('registrationSlotStartTime').value) {
        this.formattedSlotRegisterStartTime = this.convertNgbDateToString(this.scheduleForm.get('registrationSlotStartDate').value, this.scheduleForm.get('registrationSlotStartTime').value);
        this.formattedSlotRegisterEndTime = this.convertNgbDateToString(this.scheduleForm.get('registrationSlotEndDate').value, this.scheduleForm.get('registrationSlotEndTime').value);
        const slots = this.scheduleForm.get('slots').value;
        if (new Date(this.formattedSlotRegisterStartTime) > new Date(this.formattedSlotRegisterEndTime)) {
          this.toastrService.warning(Constants.slotRegisterationEndDateAndTimeMustBeGreaterThanStartDateAndTime);
          return;
        }
        if (new Date(this.formattedSlotRegisterStartTime) > new Date(this.formattedStartTime) || new Date(this.formattedSlotRegisterEndTime) > new Date(this.formattedStartTime)) {
          this.toastrService.warning(Constants.slotRegisterationStartAndEndDateTimeHasToBeBeforeAssessmentValidityStartDateAndTime);
          return;
        }
        if (new Date(this.formattedSlotRegisterStartTime) < this.currentDate) {
          this.toastrService.warning(Constants.slotRegistrationDateAndTimeMustBeGreaterThanCurrentDateAndTime);
          return;
        }
        for (let slot of slots) {
          if (slot.slotStartDate && slot.slotStartTime) {
            const slotStartDateTime = this.convertNgbDateToString(slot.slotStartDate, slot.slotStartTime);
            if (new Date(slotStartDateTime) < new Date(this.formattedStartTime)) {
              this.toastrService.warning(Constants.slotStartDateAndTimeMustBeGreaterThanAssessmentValidityStartDateAndTime);
              return;
            }
          }
        }
      }
    }
    if (this.scheduleForm.get('scheduleType').value === Constants.selfRegistration) {
      if (this.scheduleForm.get('registrationStartDate').value === null) {
        this.toastrService.warning(Constants.pleaseSelectRegistrationStartDate);
        return;
      }
      if (this.scheduleForm.get('registrationEndDate').value === null) {
        this.toastrService.warning(Constants.pleaseSelectRegistrationEndDate);
        return;
      }
      if (this.scheduleForm.get('registrationStartDate').value || this.scheduleForm.get('registrationEndDate').value) {
        this.formattedRegistrationStartTime = this.convertNgbDateToString(this.scheduleForm.get('registrationStartDate').value, this.scheduleForm.get('registrationStartTime').value);
        this.formattedRegistrationEndTime = this.convertNgbDateToString(this.scheduleForm.get('registrationEndDate').value, this.scheduleForm.get('registrationEndTime').value);

        if (!(this.scheduleForm.get('registrationStartTime').value)) {
          this.currentDate.setHours(0, 0, 0, 0);
        }
        if (!this.formattedRegistrationStartTime && this.formattedRegistrationEndTime) {
          this.toastrService.warning(Constants.pleaseSelectRegistrationStartDate);
          return;
        }
        else if (this.formattedRegistrationStartTime && !this.formattedRegistrationEndTime) {
          this.toastrService.warning(Constants.pleaseSelectRegistrationEndDate);
          return;
        }
        else if (new Date(this.formattedRegistrationStartTime) < this.currentDate || new Date(this.formattedRegistrationStartTime) >= new Date(this.formattedRegistrationEndTime)) {
          this.toastrService.warning(Constants.pleaseSelectValidRegistrationDate);
          return;
        }
        else if (new Date(this.formattedRegistrationEndTime) < this.currentDate) {
          this.toastrService.warning(Constants.pleaseSelectValidRegistrationDate);
          return;
        }
        else if (new Date(this.formattedRegistrationStartTime) >= new Date(this.formattedStartTime)
          || new Date(this.formattedRegistrationEndTime) >= new Date(this.formattedStartTime)) {
          this.toastrService.warning(Constants.registrationValidityError);
          return;
        }
      }
    }
    if (this.scheduleForm.get('scheduleType').value === Constants.selfRegistration) {
      if (this.scheduleForm.get('attempts').value > 1) {
        this.toastrService.warning(Constants.attemptCount);
        return;
      }
    }
    if (this.scheduleForm.get('scheduleType').value === Constants.inviteCandidates) {
      if (this.scheduleForm.get('candidateEmails').value.length === 1 && !this.file) {
        this.toastrService.warning(Constants.pleaseInviteUsers);
        return;
      }
      if (!this.scheduleForm.get('candidateEmails').value && this.scheduleForm.get('candidateEmails').value.length === 1) {
        this.toastrService.warning(Constants.pleaseInviteUsers);
        return;
      }
      if (this.scheduleForm.get('candidateEmails').value && this.scheduleForm.get('candidateEmails').value.length > 1) {
        if (!Helper.emailValidation(this.scheduleForm.get('candidateEmails').value)) {
          this.toastrService.warning(Constants.invalidEmailAddress);
          return;
        }
      }

    }

    if (this.scheduleForm.get('customLabel1').value === this.scheduleForm.get('customLabel2').value && this.scheduleForm.get('customLabel1').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField1AndCustomField2ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel1').value === '' && (this.scheduleForm.get('customLabel3').value !== '' || this.scheduleForm.get('customLabel4').value !== '')) {
      this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable1);
      return;
    }
    else if (this.scheduleForm.get('customLabel2').value === '' && (this.scheduleForm.get('customLabel3').value !== '' || this.scheduleForm.get('customLabel4').value !== '')) {
      this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable2);
      return;
    }
    else if (this.scheduleForm.get('customLabel3').value === '' && (this.scheduleForm.get('customLabel4').value !== '')) {
      this.toastrService.warning(Constants.pleaseEnterTheValueInCustomLable3);
      return;
    }
    else if (this.scheduleForm.get('customLabel1').value === this.scheduleForm.get('customLabel3').value && this.scheduleForm.get('customLabel1').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField1AndCustomField3ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel1').value === this.scheduleForm.get('customLabel4').value && this.scheduleForm.get('customLabel1').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField1AndCustomField4ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel2').value === this.scheduleForm.get('customLabel3').value && this.scheduleForm.get('customLabel2').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField2AndCustomField3ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel3').value === this.scheduleForm.get('customLabel4').value && this.scheduleForm.get('customLabel3').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField3AndCustomField4ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel2').value === this.scheduleForm.get('customLabel4').value && this.scheduleForm.get('customLabel2').value.toString().trim() !== '') {
      this.toastrService.warning(Constants.customField2AndCustomField4ShouldNotBeSame);
      return;
    }
    else if (this.scheduleForm.get('customLabel1').value === this.constants.firstName || this.scheduleForm.get('customLabel1').value === this.constants.lastName || this.scheduleForm.get('customLabel1').value === this.constants.email || this.scheduleForm.get('customLabel1').value === this.constants.phone) {
      this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
      return;
    }
    else if (this.scheduleForm.get('customLabel2').value === this.constants.firstName || this.scheduleForm.get('customLabel2').value === this.constants.lastName || this.scheduleForm.get('customLabel2').value === this.constants.email || this.scheduleForm.get('customLabel1').value === this.constants.phone) {
      this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
      return;
    }
    else if (this.scheduleForm.get('customLabel3').value === this.constants.firstName || this.scheduleForm.get('customLabel3').value === this.constants.lastName || this.scheduleForm.get('customLabel3').value === this.constants.email || this.scheduleForm.get('customLabel3').value === this.constants.phone) {
      this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
      return;
    }
    else if (this.scheduleForm.get('customLabel4').value === this.constants.firstName || this.scheduleForm.get('customLabel4').value === this.constants.lastName || this.scheduleForm.get('customLabel4').value === this.constants.email || this.scheduleForm.get('customLabel4').value === this.constants.phone) {
      this.toastrService.warning(Constants.customFieldCanNotBeFisrtNameLastNameEmailPhone);
      return;
    }
    if (this.selectedReviewers?.length && !this.formattedStartTime && !this.formattedEndTime) {
      this.toastrService.warning(Constants.pleaseSelectStartAndEndDate);
      return;
    }
    if (this.scheduleAssessmentPageInputData.isSubjective && !this.isReviewerSchedule) {
      this.toastrService.warning(Constants.pleaseSelectReviewerForSubjectiveAssessment);
      return;
    }
    else if (this.scheduleAssessmentPageInputData.isSubjective && this.scheduleAssessmentPageInputData.isUploadType && !(this.scheduleForm.get('qrValidTime').value > 0)) {
      this.toastrService.warning(Constants.pleaseEnterQRValidTimeForSubjectiveAssessment);
      return;
    }


    else {
      this.isSubmitted = true;
      this.reviewerIds = [];
      if (this.selectedReviewers?.length) {
        this.selectedReviewers.forEach(reviewer => {
          this.reviewerIds.push(this.tenantReviewers.find(x => x.userName === reviewer).id);
        });
      }
      if (this.file && !this.isCollaborativeAssessment && this.scheduleForm.get('scheduleType').value === Constants.inviteCandidates) {
        this.errorMessage = [];
        this.invitedUserIds = "";
        const formData = new FormData();
        formData.append('file', this.file, this.file.name);
        this.assessmentService.userInviteValidation(formData, this.scheduleForm.get('tenantId').value[0].id, this.scheduleAssessmentPageInputData.isCloud).pipe(
        ).subscribe(res => {
          if (res.success && res.result.isSuccess) {
            this.constructData();
          }
          else {
            this.showErrors = true;
            this.errorMessage = res.result.errorList;
            this.toastrService.error(this.constants.fileUploadFailedErrorButton);
            this.isSubmitted = false;
          }
        },
          error => {
            this.toastrService.error(Constants.somethingWentWrong);
          });
      }
      else if (this.file && this.isCollaborativeAssessment) {
        this.errorMessage = [];
        const formData = new FormData();
        formData.append('file', this.file, this.file.name);
        this.assessmentService.scheduleUserGroupValidation(formData, this.scheduleForm.get('tenantId').value[0].id).pipe(
        ).subscribe(res => {
          if (res.success && res.result.isSuccess) {
            this.constructData();
          }
          else {
            this.showErrors = true;
            this.errorMessage = res.result.errorMessages;
            this.toastrService.error(this.constants.fileUploadFailedCheckError);
            this.isSubmitted = false;
          }
        },
          error => {
            this.toastrService.error(Constants.somethingWentWrong);
          });
      }
      else {
        this.constructData();
      }
    }

  }

  constructData() {
    let customFields: AssessmentScheduleCustomField[] = [];
    if (this.scheduleForm.get("customLabel1").value.toString().trim().length > 0) {
      let temp: AssessmentScheduleCustomField = { fieldLabel: this.scheduleForm.get('customLabel1').value, isMandatory: this.scheduleForm.get('isCustomField1Mandatory').value, fieldType: CustomFieldType.TextBox };
      customFields.push(temp);
    }
    if (this.scheduleForm.get("customLabel2").value.toString().trim().length > 0) {
      let temp: AssessmentScheduleCustomField = { fieldLabel: this.scheduleForm.get('customLabel2').value, isMandatory: this.scheduleForm.get('isCustomField2Mandatory').value, fieldType: CustomFieldType.TextBox };
      customFields.push(temp);
    }
    if (this.scheduleForm.get("customLabel3").value.toString().trim().length > 0) {
      let temp: AssessmentScheduleCustomField = { fieldLabel: this.scheduleForm.get('customLabel3').value, isMandatory: this.scheduleForm.get('isCustomField3Mandatory').value, fieldType: CustomFieldType.TextBox };
      customFields.push(temp);
    }
    if (this.scheduleForm.get("customLabel4").value.toString().trim().length > 0) {
      let temp: AssessmentScheduleCustomField = { fieldLabel: this.scheduleForm.get('customLabel4').value, isMandatory: this.scheduleForm.get('isCustomField4Mandatory').value, fieldType: CustomFieldType.TextBox };
      customFields.push(temp);
    }

    if (!this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign && this.scheduleForm.get('testPurpose').value) {
      let tenantId = this.scheduleForm.get('tenantId').value[0].id;
      let testPurpose = this.scheduleForm.get('testPurpose').value;
      this.assessmentService.validateAssessmentScheduleCreation(tenantId, this.scheduleAssessmentDto.assessmentId, testPurpose).subscribe(res => {
        if (!res.result.isSuccess) {
          this.toastrService.warning(res.result.errorMessage);
          this.isSubmitted = false;
          return;
        }
        else
          this.scheduleAssessment(customFields);
      })
    }
    else if (this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign) {
      this.scheduleAssessment(customFields);
    }
  }

  scheduleAssessment(customFields: AssessmentScheduleCustomField[]) {
    {
      let data: ScheduleAssessment =
      {
        assessmentId: this.scheduleAssessmentDto.assessmentId,
        assessmentName: this.scheduleAssessmentDto.assessmentName,
        totalQuestions: this.scheduleAssessmentDto.totalQuestions,
        type: this.scheduleAssessmentDto.type,
        tenantId: this.scheduleForm.get('tenantId').value[0].id,
        totalAttempts: this.scheduleForm.get('attempts').value,
        passPercentage: this.scheduleForm.get('passPercentage').value === '' ? 0 : this.scheduleForm.get('passPercentage').value,
        negativeScorePercentage: this.scheduleForm.get('negativeScore').value ? this.scheduleForm.get('negativeScore').value : 0,
        duration: this.scheduleForm.get('duration').value,
        startDateTime: this.formattedStartTime,
        endDateTime: this.formattedEndTime,
        timeZone: Helper.getTimeZone(),
        scheduleTarget: this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign ? null : this.scheduleForm.get('scheduleType').value === Constants.publicURL ? ScheduleTarget.Public : ScheduleTarget.Private,
        restrictToDomain: this.scheduleForm.get('domain').value,
        reviewerIds: this.reviewerIds,
        sendResultsEmail: this.scheduleForm.get('sendResultsEmail').value,
        enableShuffling: this.scheduleForm.get('shuffleQuestions').value,
        enablePlagiarism: this.scheduleForm.get('enablePlagiarism').value == null || this.scheduleForm.get('enablePlagiarism').value.length == 0 ? false : this.scheduleForm.get('enablePlagiarism').value,
        persistContainer: this.scheduleForm.get('persistContainer').value === null || this.scheduleForm.get('persistContainer').value.length === 0 ? false : this.scheduleForm.get('persistContainer').value,
        isMockSchedule: this.scheduleForm.get('isMockSchedule').value,
        isShuffleMcqOptions: this.scheduleForm.get('isShuffleMcqOptions').value,
        isCollaborativeAssessment: this.scheduleForm.get('isCollaborativeAssessment').value,
        isCutOffTimeEnabled: true,
        executionCount: this.scheduleForm.get('executionCount').value ? this.scheduleForm.get('executionCount').value : 0,
        qrValidTime: this.scheduleForm.get('qrValidTime').value ? this.scheduleForm.get('qrValidTime').value : 0,
        cutOffTime: this.cutOffValueMinutes,
        enableFullScreenMode: this.scheduleForm.get('enableFullscreenMode').value,
        restrictWindowViolation: this.scheduleForm.get('restrictBrowserWindowViolation').value,
        windowViolationLimit: this.scheduleForm.get('windowViolationLimit').value,
        invitedUserEmails: (this.scheduleForm.get('candidateEmails').value === null || this.scheduleForm.get('candidateEmails').value.length <= 1) ? null : this.scheduleForm.get('candidateEmails').value,
        showResults: this.scheduleForm.get('showResults').value,
        enableCalculator: this.scheduleForm.get('enableCalculator').value,
        isCopyPasteEnabledForCoding: this.scheduleForm.get('isCopyPasteEnabledForCoding').value,
        getFeedback: this.scheduleForm.get('getFeedback').value,
        submitEnableDuration: this.enableSubmitDuration ? this.scheduleForm.get('submitEnableDuration').value : null,
        invitedUserIds: this.invitedUserIds,
        enableProctoring: this.scheduleForm.get('enableProctoring').value,
        // wheeboxSettings: this.scheduleForm.get('wheeboxSettings').value,
        // environmentValidation: this.getEnvironmentValidation(),
        // internetStatus: this.scheduleForm.get('internetStatus').value == null ? false : this.scheduleForm.get('internetStatus').value,
        // faceCheck: this.scheduleForm.get('faceCheck').value,
        // suspiciousObjectCheck: this.scheduleForm.get('suspiciousObjectCheck').value,
        // twoFaces: this.scheduleForm.get('twoFaces').value,
        //  noFace: this.scheduleForm.get('noFace').value,
        // liveProctoring: this.scheduleForm.get('liveProctoring').value,
        //   proctoringViolation: this.scheduleForm.get('proctoringViolation').value === Constants.proceedWithTheTests ? ProctoringResult.AllowUserToProceedWithTheTest : ProctoringResult.EndTheTestAfterNotifyingViolationToTheUser,
        scheduleType: this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign === true ? ScheduleType.Campaign
          : this.scheduleForm.get('isCollaborativeAssessment').value === true ? ScheduleType.Collaborative
            : this.scheduleForm.get('scheduleType').value === Constants.publicURL ? ScheduleType.Public
              : this.scheduleForm.get('scheduleType').value === Constants.inviteCandidates ? ScheduleType.Invite
                : this.scheduleForm.get('scheduleType').value === Constants.selfEnrollment ? ScheduleType.SelfEnrolled
                  : ScheduleType.SelfRegistration,
        //videoRecording: this.scheduleForm.get('videoRecording').value,
        assessmentScheduleCustomFields: customFields,
        scheduleAssessmentCatalogId: this.scheduleForm.get('scheduleType').value === Constants.selfEnrollment ? this.selectedTenantCatalog : null,
        sectionDuration: this.enableSection ? this.sectionTimerArray : [],
        //proctorMapping: this.scheduleForm.get('proctorMapping').value,
        //proctorMappingTestTakerCount: this.scheduleForm.get('proctorMappingTestTakerCount').value,
        // proctors: this.scheduleForm.get('proctorMapping').value ? this.scheduleForm.get('proctors').value.map(x => x.id) : "",
        //isHardMapping: this.scheduleForm.get('isHardMapping').value,
        //isScreenSharing: this.scheduleForm.get('isScreenSharing').value,
        //screenSharingViolationLimit: this.scheduleForm.get('screenSharingViolationLimit').value,
        scheduleMode: this.scheduleForm.get('showQuestionRandomization').value ? this.scheduleMode.ManualAutomated : this.scheduleMode.Standard,
        metadataDetails: this.scheduleForm.get('showQuestionRandomization').value ? this.getQuestionRandomizationValues() : null,
        stackTemplateTypeIds: this.scheduleAssessmentPageInputData.isStack ? this.selectedTemplateTypes : null,
        adaptiveAssessmentSectionsConfig: this.adaptiveAssessmentSectionsConfig,
        enableSFATestcase: this.scheduleForm.get('enableSFATestcase').value,
        isCloud: this.scheduleAssessmentPageInputData.isCloud,
        proctorType: null,
        hideResultStatus: this.scheduleForm.get('hideResultStatus').value,
        negativeMarkPercentage: this.getNegativeMarkPercentage(),
        registrationStartDateTime: this.formattedRegistrationStartTime,
        registrationEndDateTime: this.formattedRegistrationEndTime,
        campaignId: this.scheduleAssessmentPageInputData.campaignDetails?.campaignId ? this.scheduleAssessmentPageInputData.campaignDetails?.campaignId : null,
        testPurpose: this.scheduleAssessmentPageInputData.campaignDetails?.callFromCampaign ? null : this.scheduleForm.get('testPurpose').value,
        testCaseMetricsWeightage: this.scheduleForm.get('cpuWeightage').value ? this.scheduleForm.get('cpuWeightage').value : null,
        testCaseWarningWeightage: this.scheduleForm.get('warningWeightage').value ? this.scheduleForm.get('warningWeightage').value : null,
        resultViewStartDateTime: this.scheduleForm.get('enableShowResult').value ? this.formattedReviewStartTime : null,
        resultViewDuration: this.scheduleForm.get('enableShowResult').value ? this.scheduleForm.get('resultViewDuration').value : null,
        IsSlotBookingEnabled: this.enableSlotBooking,
        AssessmentScheduleSlotMetadata: {
          slotRegistrationStartDateTime: '',
          slotRegistrationEndDateTime: '',
          supportingLanguages: [],
          assessmentCentres: [],
          assessmentScheduleSlotTimings: []
        },
        roleAnalysisDetails: this.roleAnalysisDetails,
        enableAeyeDesktopApplicationInstallation: this.scheduleForm.get('enableAeyeDesktopApplicationInstallation').value
      };

      if (this.scheduleForm.get('enableSlotBooking').value) {
        data.AssessmentScheduleSlotMetadata.slotRegistrationStartDateTime = this.convertNgbDateToString(this.scheduleForm.get('registrationSlotStartDate').value, this.scheduleForm.get('registrationSlotStartTime').value);
        data.AssessmentScheduleSlotMetadata.slotRegistrationEndDateTime = this.convertNgbDateToString(this.scheduleForm.get('registrationSlotEndDate').value, this.scheduleForm.get('registrationSlotEndTime').value);
        data.AssessmentScheduleSlotMetadata.supportingLanguages = [this.scheduleForm.get('supportedLanguage').value];
        data.AssessmentScheduleSlotMetadata.assessmentCentres = this.scheduleForm.get('availableCenter').value.split(',');
        data.AssessmentScheduleSlotMetadata.assessmentScheduleSlotTimings = this.scheduleForm.get('slots').value.map((slot: any) => {
          return {
            slotStartDateTime: this.convertNgbDateToString(slot.slotStartDate, slot.slotStartTime),
            slotThreshold: slot.maxCandidates
          };
        });
      }
      const formData = new FormData();
      if (this.file) {
        formData.append('File', this.file, this.file.name);
      }
      else {
        formData.append('File', null);
      }
      formData.append('Input', JSON.stringify(data));
      this.assessmentService.scheduleAssessment(formData).subscribe((res: any) => {
        if (res && res.result.isSuccess) {
          this.scheduledId = res.result.scheduleId;
          if (this.scheduleAssessmentPageInputData?.campaignDetails?.callFromCampaign && !this.scheduleForm.get('enableAeye').value) {
            this.close();
          }
          else if (!this.scheduleAssessmentPageInputData?.campaignDetails?.callFromCampaign && (data.scheduleType === ScheduleType.Public || data.scheduleType === ScheduleType.SelfRegistration)) {
            this.showPublicLink = true;
            this.scheduleForm.patchValue({
              scheduleLink: res.result.scheduleLink
            });
            this.scheduleForm.get('scheduleLink').disable();
          } else {
            if (this.scheduleForm.get('enableAeye').value) {
              this.showProctorSettings = this.showPublicLink = true;
            }
          }
          this.toastrService.success(Constants.assessmentHasBeenScheduled);
          this.apiClientService.reloadCache("yaksha/Assessment/GetAssessments");
          this.isFormSubmitTriggered = false;
          if ((data.scheduleType === ScheduleType.Invite || data.scheduleType === ScheduleType.SelfEnrolled || data.scheduleType === ScheduleType.Collaborative) && !this.scheduleForm.get('enableAeye').value) {
            this.close();
          }
        }
        else if (res.result.errorMessage) {
          this.isSubmitted = false;
          this.toastrService.warning(res.result.errorMessage);
        }
        else {
          this.isSubmitted = false;
          this.toastrService.warning(Constants.assessmentScheduleHasBeenFailed);
        }
      },
        error => {
          this.toastrService.error(Constants.somethingWentWrong);
        });
    }
  }

  /*  getEnvironmentValidation() {
      if (this.scheduleForm.get('environmentValidation').value === Constants.environmentcheck) {
        return WheeboxSettings.EnvironmentValidation;
      }
      else if (this.scheduleForm.get('environmentValidation').value === Constants.faceTrainingScanningsettings) {
        if (this.scheduleForm.get('approveType').value === this.constants.autoApproval)
          return WheeboxSettings.FaceTrainingIDScanningAutoApproval;
        else if (this.scheduleForm.get('approveType').value === this.constants.manualApproval)
          return WheeboxSettings.FaceTrainingIDScanningManualApproval;
        else if (this.scheduleForm.get('approveType').value === this.constants.aiApproval)
          return WheeboxSettings.FaceTrainingIDScanningAiApproval;
      }
      else if (this.scheduleForm.get('environmentValidation').value === Constants.environmentScanningcheck) {
        if (this.scheduleForm.get('approveType').value === this.constants.autoApproval)
          return WheeboxSettings.EnvironmentValidationIDScanningAutoApproval;
        else if (this.scheduleForm.get('approveType').value === this.constants.manualApproval)
          return WheeboxSettings.EnvironmentValidationIDScanningManualApproval;
        else if (this.scheduleForm.get('approveType').value === this.constants.aiApproval)
          return WheeboxSettings.EnvironmentValidationIDScanningAiApproval;
      }
      else {
        return WheeboxSettings.FaceTraining;
      }
    }
  */

  onItemSelect(reviewer: string) {
    this.selectedReviewers.push(reviewer);
    this.isReviewerSchedule = true;
  }

  onSelectAll(reviewers: string[]) {
    this.selectedReviewers = reviewers;
    this.isReviewerSchedule = true;
  }

  onItemDeSelect(reviewer: string) {
    this.selectedReviewers = this.selectedReviewers.filter(x => x !== reviewer);
    if (this.selectedReviewers.length === 0) {
      this.isReviewerSchedule = false;
    }
  }

  onDeSelectAll() {
    this.selectedReviewers = [];
    this.isReviewerSchedule = false;
  }

  isChecked(formControlName: string, event) {
    this.scheduleForm.get(formControlName).setValue(event.target.checked);
    if (formControlName === Constants.enableFullscreenMode) {
      this.scheduleForm.get('windowViolationLimit').clearValidators();
      this.scheduleForm.patchValue({
        restrictBrowserWindowViolation: false,
        windowViolationLimit: 0
      });
    }
    /*  else if (formControlName === Constants.proctorMappingFormControl) {
        if (this.scheduleForm.get('proctorMapping').value) {
          this.scheduleForm.get('proctors').setValidators([Validators.required]);
          this.scheduleForm.get('proctorMappingTestTakerCount').setValidators([Validators.required, Validators.min(1)]);
        }
        else {
          this.scheduleForm.get('proctorMappingTestTakerCount').clearValidators();
          this.scheduleForm.get('proctors').clearValidators();
          this.scheduleForm.get('proctorMappingTestTakerCount').updateValueAndValidity();
          this.scheduleForm.get('proctors').updateValueAndValidity();
        }
      }
      if (formControlName === Constants.isScreenSharing) {
        if (this.scheduleForm.get(Constants.isScreenSharing).value) {
          this.scheduleForm.get('screenSharingViolationLimit').setValidators([Validators.required, Validators.min(1)]);
          this.scheduleForm.patchValue({
            screenSharingViolationLimit: 2
          });
        }
        else {
          this.scheduleForm.get('screenSharingViolationLimit').clearValidators();
          this.scheduleForm.get('screenSharingViolationLimit').updateValueAndValidity();
        }
      }
      else if (formControlName === Constants.liveProctoringFormControl) {
        if (!this.scheduleForm.get('liveProctoring').value) {
          this.scheduleForm.patchValue({
            proctorMapping: false,
          });
          this.scheduleForm.get('proctorMappingTestTakerCount').clearValidators();
          this.scheduleForm.get('proctors').clearValidators();
          this.scheduleForm.get('proctorMappingTestTakerCount').updateValueAndValidity();
          this.scheduleForm.get('proctors').updateValueAndValidity();
        }
      }*/
    if (formControlName === Constants.isCutOffTimeEnabled) {
      if (event.target.checked) {
        this.scheduleForm.patchValue({
          cutOffTime: 15
        });
        this.scheduleForm.get('cutOffTime').setValidators([Validators.required, Validators.min(1)]);
      }
      else {
        this.scheduleForm.get('cutOffTime').clearValidators();
        this.scheduleForm.patchValue({
          cutOffTime: 0
        });
      }
    }
    else if (formControlName === Constants.enableProctoring) {
      this.scheduleForm.get('windowViolationLimit').clearValidators();
      this.scheduleForm.patchValue({
        enableFullscreenMode: false,
        restrictBrowserWindowViolation: false,
        windowViolationLimit: 0,
      });
    }
    else if (formControlName === Constants.restrictBrowserWindowViolationLabel) {
      if (event.target.checked) {
        this.scheduleForm.get('windowViolationLimit').setValidators([Validators.required, Validators.min(1)]);
        this.scheduleForm.patchValue({
          windowViolationLimit: 2
        });
      }
      else {
        this.scheduleForm.get('windowViolationLimit').clearValidators();
        this.scheduleForm.patchValue({
          windowViolationLimit: 0
        });
      }
    }
    /* else if (formControlName === Constants.wheeboxSetting) {
       if (this.scheduleForm.get('environmentValidation').value === Constants.environmentcheck) {
         this.scheduleForm.get('faceCheck').disable();
       }
       else {
         this.scheduleForm.get('faceCheck').enable();
       }
       this.scheduleForm.patchValue({
         microphone: false,
         camera: false,
         internetSpeed: false,
         browser: false,
         faceTraining: false,
         internetStatus: false,
         faceCheck: false,
         suspiciousObjectCheck: false,
         twoFaces: false,
         noFace: false,
         liveProctoring: false,
         notifyViolationToUser: false,
         environmentValidation: Constants.faceTrainingsettings,
         proctoringViolation: Constants.proceedWithTheTests,
         enableAeye: false
       });
     }*/
    else if (formControlName === Constants.isCollaborativeAssessment) {
      if (this.scheduleForm.get('isCollaborativeAssessment').value) {
        this.isCollaborativeAssessment = true;
        this.scheduleForm.get('candidateEmails').disable();
        this.scheduleForm.patchValue({
          scheduleType: Constants.inviteCandidates
        });
        this.sampleTemplate = this.userGroupUploadSampleTemplate;
      }
      else {
        this.isCollaborativeAssessment = false;
        this.scheduleForm.get('candidateEmails').enable();
        if (this.tenantId == this.dataService.nitte)
          this.sampleTemplate = this.userInviteSampleTemplateNITTE;
        else if (this.tenantId == this.dataService.ltim && !this.isAdaptive)
          this.sampleTemplate = this.userInviteSampleTemplateLTIM;
        else
          this.sampleTemplate = this.userInviteSampleTemplate;
      }
    }
    else if (formControlName === this.enablePlagiarismFormControlName) {
      if (this.scheduleAssessmentPageInputData.isStack && event.target.checked) {
        this.assessmentService.isAllowedToEnablePlagiarismForStackAssessment(this.scheduleAssessmentDto.assessmentId).subscribe(res => {
          if (!res.result) {
            this.toastrService.warning(this.constants.enablePlagiarismNotApplicableForThisStackAssessmentAsScanConfigXMLIsNotAvailableInTheQuestionSelected);
            this.scheduleForm.get(formControlName).setValue(false);
          }
        },
          error => { this.toastrService.error(this.constants.somethingWentWrong); });
      }
    }
    else if (formControlName === Constants.hideResultStatus) {
      this.hidePassPercentageSpan = !this.hidePassPercentageSpan;
      if (this.scheduleForm.get('hideResultStatus').value) {
        this.scheduleForm.get('passPercentage').setValue('');
        this.scheduleForm.get('passPercentage').disable();
      }
      else {
        this.scheduleForm.get('passPercentage').enable();
      }
    } else if (formControlName === Constants.enableAeye) {
      this.scheduleForm.patchValue({
        enableFullscreenMode: false,
        restrictBrowserWindowViolation: false,
        windowViolationLimit: 0,
        wheeboxSettings: false
      });
    }
    if (formControlName === Constants.enableShowResult) {
      if (this.scheduleForm.get(Constants.enableShowResult).value) {
        this.showAnswer = true;
        this.scheduleForm.get('resultViewStartDate').setValidators([Validators.required, Validators.min(1)]);
      }
      else {
        this.showAnswer = false;
        this.scheduleForm.get('resultViewStartDate').clearValidators();
        this.scheduleForm.get('resultViewStartDate').updateValueAndValidity();
      }
    }
    else if (formControlName === Constants.enableSlotBooking) {
      this.scheduleForm.get(formControlName).setValue(event.target.checked);

      if (formControlName === 'enableSlotBooking') {
        this.enableSlotBooking = event.target.checked;
        const slotControls = this.scheduleForm.get('slots') as FormArray;
        if (this.enableSlotBooking && this.scheduleForm.get('scheduleType').value === Constants.publicURL) {
          this.scheduleForm.get('registrationSlotStartDate').setValidators([Validators.required]);
          this.scheduleForm.get('registrationSlotStartTime').setValidators([Validators.required]);
          this.scheduleForm.get('registrationSlotEndDate').setValidators([Validators.required]);
          this.scheduleForm.get('registrationSlotEndTime').setValidators([Validators.required]);
          this.scheduleForm.get('availableCenter').setValidators([Validators.required]);
          slotControls.controls.forEach((control: FormGroup) => {
            control.get('slotStartDate').setValidators([Validators.required]);
            control.get('slotStartTime').setValidators([Validators.required]);
            control.get('maxCandidates').setValidators([Validators.required]);
          });
        } else {
          this.scheduleForm.get('registrationSlotStartDate').clearValidators();
          this.scheduleForm.get('registrationSlotStartDate').markAsUntouched();
          this.scheduleForm.get('registrationSlotStartDate').setValue('');
          this.scheduleForm.get('registrationSlotStartTime').clearValidators();
          this.scheduleForm.get('registrationSlotStartTime').setValue('');
          this.scheduleForm.get('registrationSlotStartTime').markAsUntouched();
          this.scheduleForm.get('registrationSlotEndDate').clearValidators();
          this.scheduleForm.get('registrationSlotEndDate').markAsUntouched();
          this.scheduleForm.get('registrationSlotEndDate').setValue('');
          this.scheduleForm.get('registrationSlotEndTime').clearValidators();
          this.scheduleForm.get('registrationSlotEndTime').setValue('');
          this.scheduleForm.get('registrationSlotEndTime').markAsUntouched();
          this.scheduleForm.get('availableCenter').clearValidators();
          this.scheduleForm.get('availableCenter').setValue('Online');
          this.scheduleForm.get('availableCenter').markAsUntouched();
          slotControls.controls.forEach((control: FormGroup) => {
            control.get('slotStartDate').clearValidators();
            control.get('slotStartTime').clearValidators();
            control.get('maxCandidates').clearValidators();
            control.get('slotStartDate').setValue('');
            control.get('slotStartTime').setValue('');
            control.get('maxCandidates').setValue('');
            control.get('slotStartDate').markAsUntouched();
            control.get('slotStartTime').markAsUntouched();
            control.get('maxCandidates').markAsUntouched();
          });
        }
        this.scheduleForm.get('registrationSlotStartDate').updateValueAndValidity();
        this.scheduleForm.get('registrationSlotStartTime').updateValueAndValidity();
        this.scheduleForm.get('registrationSlotEndDate').updateValueAndValidity();
        this.scheduleForm.get('registrationSlotEndTime').updateValueAndValidity();
        this.scheduleForm.get('availableCenter').updateValueAndValidity();
        slotControls.controls.forEach((control: FormGroup) => {
          control.get('slotStartDate').updateValueAndValidity();
          control.get('slotStartTime').updateValueAndValidity();
          control.get('maxCandidates').updateValueAndValidity();
        })
      }
    }
  }

  resetProctorTool() {
    this.scheduleForm.get('windowViolationLimit').clearValidators();
    this.scheduleForm.patchValue({
      enableFullscreenMode: false,
      restrictBrowserWindowViolation: false,
      windowViolationLimit: 0,
      enableProctoring: false,
      /*wheeboxSettings: false,
      environmentValidation: Constants.faceTrainingsettings,
      internetStatus: false,
      faceCheck: false,
      suspiciousObjectCheck: false,
      twoFaces: false,
      noFace: false,
      liveProctoring: false,
      videoRecording: false,
      proctorMapping: false,
      proctorMappingTestTakerCount: '',
      proctors: '',
      isHardMapping: false,
      proctoringViolation: Constants.proceedWithTheTests,
      isScreenSharing: false,
      screenSharingViolationLimit: 0,
      approveType: Constants.autoApproval*/
    });
  }

  onFileChange(files: File[]) {
    let scheduleType = this.scheduleForm.get('scheduleType').value;
    if (files.length > 0) {
      this.selectedFileType = files[0].type;
      this.file = files[0];
      this.supportedTypes = scheduleType === Constants.selfRegistration
        ? ['image/jpg', 'image/jpeg', 'image/png']
        : ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      let isFileTypeSupported = this.supportedTypes.some(x => x === this.selectedFileType);
      if (isFileTypeSupported) {
        this.fileTypeGranted = true;
        this.fileName = files[0].name;
      }
      else {
        this.file = undefined;
        this.toastrService.warning(scheduleType === Constants.selfRegistration ? Constants.uploadOnlyImageFiles : Constants.uploadOnlyExcelFiles);
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseUploadFile);
    }
  }

  removeSelectedFile(): void {
    this.fileInput.nativeElement.value = '';
    this.fileName = '';
    this.file = undefined;
    this.errorMessage = [];
    this.showErrors = false;
    this.toastrService.warning(Constants.selectedFileWasRemoved);
  }

  copyInputMessage(): void {
    let copyText = this.scheduleForm.get('scheduleLink').value;
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

  convertNgbDateToString(date: NgbDate, time: string) {
    if (date && time)
      return `${date.year}-${date.month}-${date.day} ${time}`;
    else
      return "";
  }

  getDate(date: Date) {
    let localDate = Helper.convertUTCDateToLocalDate(date.toString());
    return {
      day: localDate.getDate(),
      month: localDate.getMonth() + 1,
      year: localDate.getFullYear()
    };
  }

  getCutOffDate(date: Date) {
    let localDate = Helper.convertUTCDateToLocalDate(date.toISOString());
    return {
      day: localDate.getDate(),
      month: localDate.getMonth() + 1,
      year: localDate.getFullYear()
    };
  }

  getTime(date: Date) {
    return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'HH:mm', 'en_US');
  }

  getISOTime(date: Date) {
    return formatDate(date.toString(), 'HH:mm', 'en_US');
  }

  UpdateScheduledAssessment() {
    if (this.scheduleForm.get('endDate').value) {
      this.formattedEndTime = this.convertNgbDateToString(this.scheduleForm.get('endDate').value, this.scheduleForm.get('endTime').value);
      this.formattedStartTime = this.convertNgbDateToString(this.scheduleForm.get('startDate').value, this.scheduleForm.get('startTime').value);
      if (!this.formattedEndTime) {
        this.toastrService.warning(Constants.pleaseSelectEndDateAndTime);
        return;
      }
      else if (!(this.scheduleForm.get('endTime').value)) {
        this.currentDate.setHours(0, 0, 0, 0);
      }
      else if (new Date(this.formattedStartTime) > new Date(this.formattedEndTime) || new Date(this.formattedEndTime) < this.currentDate) {
        this.toastrService.warning(Constants.pleaseSelectValidDate);
        return;
      }
    }
    else {
      this.toastrService.warning(Constants.pleaseSelectValidDate);
      return;
    }
    if (this.scheduleForm.get('cutOffDate').value !== "" && this.scheduleForm.get('cutOffTime').value !== "") {
      var endTimeVal = this.scheduleForm.get("endTime").value;
      var startTimeVal = this.scheduleForm.get("startTime").value;
      var endDateTime = this.convertToDateTime(this.scheduleForm.get("endDate").value, endTimeVal);
      var startDateTime = this.convertToDateTime(this.scheduleForm.get("startDate").value, startTimeVal);
      let difference = endDateTime.getMinutes() - (this.scheduleForm.get("duration").value);
      endDateTime.setMinutes(difference);

      var cutOffDateTime = this.convertToDateTime(this.scheduleForm.get("cutOffDate").value, this.scheduleForm.get('cutOffTime').value);
      this.cutOffValueMinutes = this.getDifferenceInMinutes(startDateTime, cutOffDateTime);

      if (cutOffDateTime > endDateTime) {
        this.toastrService.error(Constants.cutOffDateTimeGreaterThanEndDate);
        this.setCutOffDateTime(endDateTime);
        return;
      }
      if (startDateTime > cutOffDateTime) {
        this.toastrService.error(Constants.startDateTimeGreaterThanCutOffDate);
        this.setCutOffDateTime(endDateTime);
        return;
      }
    }
    if (this.scheduleForm.get('scheduleType').value === Constants.selfRegistration) {
      if (this.scheduleForm.get('registrationEndDate').value) {
        this.formattedRegistrationStartTime = this.convertNgbDateToString(this.scheduleForm.get('registrationStartDate').value, this.scheduleForm.get('registrationStartTime').value);
        this.formattedRegistrationEndTime = this.convertNgbDateToString(this.scheduleForm.get('registrationEndDate').value, this.scheduleForm.get('registrationEndTime').value);
        if (!this.formattedRegistrationEndTime) {
          this.toastrService.warning(Constants.pleaseSelectRegistrationEndDate);
          return;
        }
        else if (!(this.scheduleForm.get('registrationEndTime').value)) {
          this.currentDate.setHours(0, 0, 0, 0);
        }
        else if (new Date(this.formattedRegistrationStartTime) > new Date(this.formattedRegistrationEndTime) || new Date(this.formattedRegistrationEndTime) < this.currentDate) {
          this.toastrService.warning(Constants.pleaseSelectValidRegistrationDate);
          return;
        }
        else if (new Date(this.formattedRegistrationStartTime) >= new Date(this.formattedStartTime)
          || new Date(this.formattedRegistrationEndTime) >= new Date(this.formattedStartTime)) {
          this.toastrService.warning(Constants.registrationValidityError);
          return;
        }
      }
      else {
        this.toastrService.warning(Constants.pleaseSelectRegistrationEndDate);
        return;
      }
    }
    if (this.scheduleForm.get('enableShowResult').value == true) {
      if (!this.scheduleForm.get('resultViewStartDate').value || !this.scheduleForm.get('resultViewStartTime').value) {
        this.toastrService.warning(Constants.pleaseSelectSRStartDateAndTime);
        return;
      }

      this.formattedReviewStartTime = this.convertNgbDateToString(this.scheduleForm.get('resultViewStartDate').value, this.scheduleForm.get('resultViewStartTime').value);

      if (new Date(this.formattedReviewStartTime) < new Date(this.formattedStartTime)
      ) {
        this.toastrService.warning(Constants.pleaseSelectSRValidDate);
        return;
      }
    }

    let data: UpdateAssessmentScheduled = {
      AssessmentId: this.scheduleAssessmentDto.assessmentId,
      AssessmentScheduleId: this.scheduleAssessmentDto.assessmentScheduleId,
      EndDateAndTime: this.formattedEndTime,
      RegistrationEndDateTime: this.formattedRegistrationEndTime,
      timeZone: Helper.getTimeZone(),
      tenantId: this.scheduleForm.get('tenantId').value[0].id,
      cutOffTime: this.cutOffValueMinutes,
      EndDateISOString: this.scheduleForm.get('enableAeye').value ? new Date(this.formattedEndTime).toISOString() : '',
      resultViewStartDateTime: this.scheduleForm.get('enableShowResult').value ? this.formattedReviewStartTime : null,
      resultViewDuration: this.scheduleForm.get('enableShowResult').value ? this.scheduleForm.get('resultViewDuration').value : null
    };
    this.assessmentService.updateScheduledAssessments(data).subscribe(res => {
      if (res.success && res.result)
        this.toastrService.success(Constants.assessmentScheduleUpdatedSuccessfully);
      this.close();
    });
  }
  updateSchedule() {
    this.UpdateScheduledAssessment();
  }
  viewAssessmentDetails() {
    let data: GetAssessmentSchedule = {
      AssessmentScheduleId: this.scheduleAssessmentDto.assessmentScheduleId,
      TenantId: this.scheduleAssessmentDto.tenantId
    };
    this.assessmentService.getAssessmentScheduleById(data).subscribe(res => {
      if (res.success && res.result) {
        if (this.scheduleAssessmentDto.type === AssessmentType.Adaptive) {
          this.setAdaptiveAssessmentForm(res.result.adaptiveAssessmentScheduleSectionsConfig);
          res.result.adaptiveAssessmentScheduleSectionsConfig?.forEach((obj) => {
            this.scheduleForm.get('progression' + obj.assessmentSectionId)?.patchValue(obj.totalProgression);
            this.scheduleForm.get('progression' + obj.assessmentSectionId)?.disable();
            this.scheduleForm.get('regression' + obj.assessmentSectionId)?.patchValue(obj.totalRegression);
            this.scheduleForm.get('regression' + obj.assessmentSectionId)?.disable();
          });
        }
        let schedule: AssessmentScheduleDto = res.result.scheduleDetails;
        const roleAnalysisDetails = res.result.roleAnalysisDetails;
        const questionRandomizationData = res.result.questionRandomizationDetails;
        this.scheduleTemplateMappingIds = res.result.scheduleTemplateMappingIds;
        this.persistContainer = res.result.persistContainer;
        let proctoringConfig = JSON.parse(schedule.proctoringConfig);
        let assessmentConfig = JSON.parse(schedule.assessmentConfig);
        let codeBaseMetricsConfig = JSON.parse(schedule.codeBaseMetricsConfig);
        //  let wheeboxProctoringConfig = JSON.parse(schedule.wheeboxProctoringConfig);
        let tenant: any;
        this.endDateValue = schedule.endDateTime ? this.getDate(schedule.endDateTime) : '';
        if (this.userRole === UserRoles[2] || this.userRole === UserRoles[7])
          tenant = { id: this.appSessionService.tenantId, name: this.appSessionService.tenantName };
        else
          tenant = this.tenantList.find(x => x.id === schedule.tenantId);
        if (this.scheduleAssessmentPageInputData.isStack && this.scheduleTemplateMappingIds.length > 0) {
          this.isUpdate = true;
          this.selectedTemplateTypes = [];
          this.selectedTemplateTypes = this.scheduleTemplateMappingIds;
          let templates = [];
          this.scheduleTemplateMappingIds.forEach(value => {
            templates.push(this.templateTypes.find(x => x.id === value).name);
          });
          this.scheduleForm.patchValue({
            stackTemplateType: templates,
            persistContainer: this.persistContainer ? this.persistContainer : '',
          });
          if (this.scheduleAssessmentDto.isCloneSchedule && templates) {
            this.scheduleForm.get('stackTemplateType').enable();
            this.scheduleForm.get('persistContainer').enable();
          }
        }
        if (schedule.hideResultStatus) {
          this.hidePassPercentageSpan = !this.hidePassPercentageSpan;
        }
        this.scheduleForm.patchValue({
          tenantId: [{ id: tenant.id, name: tenant.name }],
          attempts: schedule.totalAttempts,
          passPercentage: schedule.passPercentage === 0 ? '' : schedule.passPercentage,
          negativeScore: schedule.negativeScorePercentage,
          duration: schedule.duration,
          shuffleQuestions: assessmentConfig ? assessmentConfig.EnableShuffling : '',
          enablePlagiarism: schedule.enablePlagiarism ? schedule.enablePlagiarism : '',
          hideResultStatus: schedule.hideResultStatus,
          isMockSchedule: schedule.isMockSchedule,
          isShuffleMcqOptions: assessmentConfig ? assessmentConfig.IsShuffleMcqOptions : false,
          isCollaborativeAssessment: schedule.scheduleType === ScheduleType.Collaborative ? true : false,
          startDate: schedule.startDateTime ? this.getDate(schedule.startDateTime) : '',
          endDate: schedule.endDateTime ? this.getDate(schedule.endDateTime) : '',
          startTime: schedule.startDateTime ? this.getTime(schedule.startDateTime) : '',
          endTime: schedule.endDateTime ? this.getTime(schedule.endDateTime) : '',
          executionCount: assessmentConfig ? assessmentConfig.ExecutionCount : 0,
          qrValidTime: assessmentConfig ? assessmentConfig.QRValidTime : 0,
          scheduleType: this.getScheduleType(schedule),
          candidateEmails: [''],
          enableFullscreenMode: proctoringConfig ? proctoringConfig.EnableFullScreenMode : '',
          restrictBrowserWindowViolation: proctoringConfig ? proctoringConfig.RestrictWindowViolation : '',
          windowViolationLimit: proctoringConfig ? proctoringConfig.WindowViolationLimit : '',
          sendResultsEmail: schedule.sendResultsEmail,
          showResults: assessmentConfig ? assessmentConfig.ResultType === ScheduleResultType.Detailed : '',
          enableCalculator: assessmentConfig ? assessmentConfig.enableCalculator : '',
          isCopyPasteEnabledForCoding: schedule ? schedule.isCopyPasteEnabledForCoding : '',
          getFeedback: assessmentConfig ? assessmentConfig.GetFeedback : '',
          domain: schedule.restrictToDomain,
          scheduleLink: schedule.link,
          enableProctoring: schedule.enableProctoring,
          /* wheeboxSettings: schedule.enableWheeboxProctoring,
           environmentValidation: this.getEnvironmentPatchValue(wheeboxProctoringConfig && wheeboxProctoringConfig.EnvironmentValidation ? wheeboxProctoringConfig.EnvironmentValidation : ''),
           internetStatus: wheeboxProctoringConfig && wheeboxProctoringConfig.InternetStatus ? wheeboxProctoringConfig.InternetStatus : '',
           faceCheck: wheeboxProctoringConfig && wheeboxProctoringConfig.FaceCheck ? wheeboxProctoringConfig.FaceCheck : '',
           suspiciousObjectCheck: wheeboxProctoringConfig && wheeboxProctoringConfig.SuspiciousObjectCheck ? wheeboxProctoringConfig.SuspiciousObjectCheck : '',
           twoFaces: wheeboxProctoringConfig && wheeboxProctoringConfig.TwoFaces ? wheeboxProctoringConfig.TwoFaces : '',
           noFace: wheeboxProctoringConfig && wheeboxProctoringConfig.NoFace ? wheeboxProctoringConfig.NoFace : '',
           liveProctoring: wheeboxProctoringConfig && wheeboxProctoringConfig.LiveProctoring ? wheeboxProctoringConfig.LiveProctoring : '',
           proctoringViolation: wheeboxProctoringConfig ? wheeboxProctoringConfig.ProctoringViolation === ProctoringResult.AllowUserToProceedWithTheTest ? Constants.proceedWithTheTests : Constants.endTheTest : '',
           approveType: this.getApproval(wheeboxProctoringConfig && wheeboxProctoringConfig.EnvironmentValidation ? wheeboxProctoringConfig : ''),
           videoRecording: wheeboxProctoringConfig && wheeboxProctoringConfig.VideoRecording ? wheeboxProctoringConfig.VideoRecording : '',
           proctorMapping: wheeboxProctoringConfig && wheeboxProctoringConfig.ProctorMapping ? wheeboxProctoringConfig.ProctorMapping : '',
           proctors: wheeboxProctoringConfig && wheeboxProctoringConfig.Proctors ? wheeboxProctoringConfig.Proctors : '',
           proctorMappingTestTakerCount: wheeboxProctoringConfig && wheeboxProctoringConfig.ProctorMappingTestTakerCount ? wheeboxProctoringConfig.ProctorMappingTestTakerCount : '',
           isHardMapping: wheeboxProctoringConfig && wheeboxProctoringConfig.IsHardMapping ? wheeboxProctoringConfig.IsHardMapping : '',
           isScreenSharing: wheeboxProctoringConfig && wheeboxProctoringConfig.IsScreenSharing ? wheeboxProctoringConfig.IsScreenSharing : '',
           screenSharingViolationLimit: wheeboxProctoringConfig && wheeboxProctoringConfig.ScreenSharingViolationLimit ? wheeboxProctoringConfig.ScreenSharingViolationLimit : '',*/
          showQuestionRandomization: schedule.scheduleMode === this.scheduleMode.ManualAutomated ? true : false,
          enableSFATestcase: schedule.enableSFATestcase ? schedule.enableSFATestcase : '',
          proctorType: (schedule.proctorType === ProctorType.Aeye) ? Constants.aeye : null,
          enableAeye: schedule.proctorType === ProctorType.Aeye ? true : false,
          negativeMarking: schedule.negativeMarkPercentage ? true : false,
          negativeMarkPercentage: schedule.negativeMarkPercentage && (schedule.negativeMarkPercentage === Constants.fifty || schedule.negativeMarkPercentage === Constants.totalPercentage) ? schedule.negativeMarkPercentage.toString() : Constants.custom,
          customNegativePercentage: schedule.negativeMarkPercentage && (schedule.negativeMarkPercentage !== Constants.fifty && schedule.negativeMarkPercentage !== Constants.totalPercentage) ? schedule.negativeMarkPercentage : null,
          registrationStartDate: schedule.registrationStartDateTime ? this.getDate(schedule.registrationStartDateTime) : '',
          registrationEndDate: schedule.registrationEndDateTime ? this.getDate(schedule.registrationEndDateTime) : '',
          registrationStartTime: schedule.registrationStartDateTime ? this.getTime(schedule.registrationStartDateTime) : '',
          registrationEndTime: schedule.registrationEndDateTime ? this.getTime(schedule.registrationEndDateTime) : '',
          testPurpose: schedule.testPurpose,
          cpuWeightage: codeBaseMetricsConfig?.TestCaseMetricsWeightage ? codeBaseMetricsConfig.TestCaseMetricsWeightage : '',
          warningWeightage: codeBaseMetricsConfig?.TestCaseWarningWeightage ? codeBaseMetricsConfig.TestCaseWarningWeightage : '',
          enableShowResult: schedule.resultViewStartDateTime && schedule.resultViewDuration ? true : false,
          resultViewStartDate: schedule.resultViewStartDateTime ? this.getDate(schedule.resultViewStartDateTime) : '',
          resultViewStartTime: schedule.resultViewStartDateTime ? this.getTime(schedule.resultViewStartDateTime) : '',
          resultViewDuration: schedule.resultViewDuration,
          enableAeyeDesktopApplicationInstallation: schedule.enableAeyeDesktopApplicationInstallation
        });
        if (this.scheduleAssessmentDto.isCloneSchedule) {
          if (schedule.totalAttempts)
            this.scheduleForm.get('attempts').enable();
          if (schedule.passPercentage)
            this.scheduleForm.get('passPercentage').enable();
        }
        this.showAnswer = schedule.resultViewStartDateTime && schedule.resultViewDuration ? true : false;
        this.showPercentage = schedule.negativeMarkPercentage ? true : false;
        if (schedule.scheduleType === ScheduleType.SelfEnrolled) {
          this.assessmentService.getCatalogByAssessmentSchduleId(this.scheduleAssessmentDto.assessmentScheduleId).subscribe(res => {
            if (res.success && res.result) {
              this, this.tenantCatalogs = [];
              this.tenantCatalogs.push(res.result);
              this.isTenantCatalogAvailable = true;
              this.scheduleForm.patchValue({
                tenantCatalogId: this.tenantCatalogs[0].catalogId
              });
            }
          });
        }
        if (schedule.startDateTime !== null) {
          let difference = new Date(schedule.startDateTime).getMinutes() + (assessmentConfig.CutOffTime);
          var cutOffDate = new Date(schedule.startDateTime);
          cutOffDate.setMinutes(difference);
          this.scheduleForm.get('cutOffTime').setValue(formatDate(Helper.convertUTCDateToLocalDate(cutOffDate.toISOString()), 'HH:mm', 'en_US'));
          this.scheduleForm.get('cutOffDate').setValue(this.getCutOffDate(cutOffDate));
        }
        this.patchSectionDurationValue(res.result);
        this.patchMinimumDurationValue(assessmentConfig);
        this.patchQuestionRandomizationDetails(questionRandomizationData);
        this.patchRoleAnalysisDetails(roleAnalysisDetails);
        if (res.result.assessmentScheduleCustomFields?.length > 0) {
          this.scheduleForm.patchValue({
            customLabel1: res.result.assessmentScheduleCustomFields[0].fieldLabel,
            isCustomField1Mandatory: res.result.assessmentScheduleCustomFields[0].isMandatory
          });
        }
        if (res.result.assessmentScheduleCustomFields?.length > 1) {
          this.scheduleForm.patchValue({
            customLabel2: res.result.assessmentScheduleCustomFields[1].fieldLabel,
            isCustomField2Mandatory: res.result.assessmentScheduleCustomFields[1].isMandatory
          });
        }
        if (res.result.assessmentScheduleCustomFields?.length > 2) {
          this.scheduleForm.patchValue({
            customLabel3: res.result.assessmentScheduleCustomFields[2].fieldLabel,
            isCustomField3Mandatory: res.result.assessmentScheduleCustomFields[2].isMandatory
          });
        }
        if (res.result.assessmentScheduleCustomFields?.length > 3) {
          this.scheduleForm.patchValue({
            customLabel4: res.result.assessmentScheduleCustomFields[3].fieldLabel,
            isCustomField4Mandatory: res.result.assessmentScheduleCustomFields[3].isMandatory
          });
        }
        if (res.result.assessmentScheduleSlotMetadata) {
          let slot: AssessmentScheduleSlotMetadata = res.result.assessmentScheduleSlotMetadata;
          this.enableSlotBooking = true;
          this.scheduleForm.patchValue({
            enableSlotBooking: [true],
            registrationSlotStartDate: this.getDate(slot.slotRegistrationStartDateTime),
            registrationSlotStartTime: this.getTime(slot.slotRegistrationStartDateTime),
            registrationSlotEndDate: this.getDate(slot.slotRegistrationEndDateTime),
            registrationSlotEndTime: this.getTime(slot.slotRegistrationEndDateTime),
            supportedLanguage: slot.supportingLanguages.join(','),
            availableCenter: slot.assessmentCentres.join(',')
          })
          const slotsArray = this.scheduleForm.get('slots') as FormArray;
          slotsArray.clear();
          slot.assessmentScheduleSlotTimings.forEach(slot => {
            slotsArray.push(this.formBuilder.group({
              slotStartDate: this.getDate(slot.slotStartDateTime),
              slotStartTime: this.getTime(slot.slotStartDateTime),
              maxCandidates: slot.slotThreshold
            }));
          });
        }
        this.isTenantDisabled = true;
        this.isProctorDisabled = true;
        this.disableSectionCheckbox = true;

        this.disableSubmitDurationCheckbox = this.disableRoleAnalysis = true;
        if (!this.scheduleAssessmentDto.isCloneSchedule)
          this.scheduleForm.disable();

        if (this.scheduleAssessmentDto.isUpdateScheduleAssessment === true) {
          this.scheduleForm.get('endDate').enable();
          this.scheduleForm.get('endTime').enable();
          this.scheduleForm.get('cutOffDate').enable();
          this.scheduleForm.get('cutOffTime').enable();
          this.scheduleForm.get('registrationEndDate').enable();
          this.scheduleForm.get('registrationEndTime').enable();
          this.scheduleForm.get('resultViewStartDate').enable();
          this.scheduleForm.get('resultViewStartTime').enable();
          this.scheduleForm.get('resultViewDuration').enable();
        }
        if (this.scheduleAssessmentDto.isCloneSchedule === true) {
          this.enableScheduleFormForCloning();
          this.scheduleForm.get('startTime').enable();
          this.scheduleForm.setErrors(null);
          this.scheduleForm.get('enableCalculator').setErrors(null);
          this.scheduleForm.updateValueAndValidity();
          this.scheduleForm.get('enableCalculator').updateValueAndValidity();
          //
        }
        if (schedule.assessmentScheduleReviewers.length) {
          this.isReviewerSchedule = true;
          this.reviewerEmail = "";
          this.assessmentService.getTenantReviewers(this.scheduleAssessmentDto.tenantId).subscribe(res => {
            if (res.success && res.result.length) {
              schedule.assessmentScheduleReviewers.forEach(reviewer => {
                if (this.reviewerEmail === "")
                  this.reviewerEmail = res.result.find(x => x.id === reviewer.reviewerId).userName;
                else
                  this.reviewerEmail += `, ${res.result.find(x => x.id === reviewer.reviewerId).userName}`;
              });
            }
          });
        }
      }
      else {
        this.toastrService.warning(Constants.scheduleNotFound);
        this.modalService.dismissAll();
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getScheduleType(schedule: AssessmentScheduleDto) {
    if (schedule.scheduleType === ScheduleType.Public || schedule.target === ScheduleTarget.Public) {
      return Constants.publicURL;
    }
    else if (schedule.scheduleType === ScheduleType.Invite || schedule.scheduleType === ScheduleType.Collaborative) {
      return Constants.inviteCandidates;
    }
    else if (schedule.scheduleType === ScheduleType.SelfEnrolled) {
      return Constants.selfEnrollment;
    }
    else if (schedule.scheduleType === ScheduleType.SelfRegistration) {
      return Constants.selfRegistration;
    }
  }

  /* getApproval(config: any) {
     if (config !== undefined) {
       if (config.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningAutoApproval || config.EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningAutoApproval) {
         return this.constants.autoApproval;
       }
       else if (config.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningManualApproval || config.EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningManualApproval) {
         return this.constants.manualApproval;
       }
       else if (config.EnvironmentValidation === WheeboxSettings.EnvironmentValidationIDScanningAiApproval || config.EnvironmentValidation === WheeboxSettings.FaceTrainingIDScanningAiApproval) {
         return this.constants.aiApproval;
       }
     }
     return this.constants.autoApproval;
   }*/


  isEnable() {
    if (this.scheduleForm.get('environmentValidation').value === Constants.faceTrainingsettings || this.scheduleForm.get('environmentValidation').value === Constants.faceTrainingScanningsettings) {
      this.scheduleForm.get('faceCheck').enable();
    }
    else {
      this.scheduleForm.get('faceCheck').disable();
      this.scheduleForm.patchValue({
        faceCheck: false
      });
    }
  }

  isIdScanningEnabled(): boolean {
    if (this.scheduleForm.get('environmentValidation').value === Constants.environmentScanningcheck || this.scheduleForm.get('environmentValidation').value === Constants.faceTrainingScanningsettings)
      return true;
    return false;
  }

  isCustomFieldRegularExpresson(field: string): boolean {
    let value = (this.scheduleForm.get(field).touched || this.isFormSubmitTriggered);
    if (value) {
      return !this.scheduleForm.get(field).valid;
    }
    return false;
  }

  /* getEnvironmentPatchValue(env: number) {
     if (env === WheeboxSettings.EnvironmentValidation)
       return Constants.environmentcheck;
     else if (env === WheeboxSettings.EnvironmentValidationIDScanningAutoApproval || env === WheeboxSettings.EnvironmentValidationIDScanningManualApproval || env === WheeboxSettings.EnvironmentValidationIDScanningAiApproval)
       return Constants.environmentScanningcheck;
     else if (env === WheeboxSettings.FaceTraining)
       return Constants.faceTrainingsettings;
     else if (env === WheeboxSettings.FaceTrainingIDScanningAutoApproval || env === WheeboxSettings.FaceTrainingIDScanningManualApproval || env === WheeboxSettings.FaceTrainingIDScanningAiApproval)
       return Constants.faceTrainingScanningsettings;
     return 0;
   }*/

  onSectionClick(event) {
    this.enableSection = event.target.checked;
    this.scheduleForm.get('duration').setValue('');
    if (this.scheduleForm.get('submitEnableDuration')) {
      this.enableSubmitDuration = false;
      this.scheduleForm.removeControl("submitEnableDuration");
    }

    if (this.enableSection) {
      this.scheduleForm.get('duration').setErrors(null);
      if (this.sectionTimerArray && this.sectionTimerArray.length) {
        this.sectionTimerArray.forEach((obj, index) => {
          obj.duration = 0;
          this.scheduleForm.get(obj.sectionName + index).setValue('');
        });
      }
      else {
        this.scheduleForm.get('duration').setErrors({ 'invalid': true });
      }
    }
  }

  onMinimumDurationClick(event) {
    this.enableSubmitDuration = event.target.checked;
    if (this.enableSubmitDuration) {
      this.scheduleForm.addControl("submitEnableDuration", new FormControl('', [Validators.required, Validators.min(0), Validators.max(this.scheduleForm.get('duration').value), Validators.pattern("^[0-9]*$")]));
    }
    else {
      this.scheduleForm.removeControl("submitEnableDuration");
    }
  }

  updateDuration(event, index) {
    let totalDuration = 0;
    this.sectionTimerArray[index].duration = Number(event.target.value);
    this.sectionTimerArray.forEach(obj => {
      totalDuration = obj.duration + totalDuration;
    });
    this.scheduleForm.get('duration').setValue(totalDuration);
  }

  setSectionTimerObject() {
    this.sectionTimerArray = [];
    if (this.assessmentSections && this.assessmentSections.length > 0)
      this.assessmentSections.forEach((obj: AssessmentSections) => {
        let sectionObject: SectionBasedTimer = {
          sectionName: obj.sectionName,
          duration: 0,
          assessmentSectionId: obj.id
        };
        this.sectionTimerArray.push(sectionObject);
      });
  }

  setSectionErrorNull() {
    if (this.assessmentSections && this.assessmentSections.length > 0) {
      this.assessmentSections.forEach((section, index) => {
        this.scheduleForm.controls[section.sectionName + index].setErrors(null);
      });
    }
  }

  setSectionErrorValid() {
    if (this.assessmentSections && this.assessmentSections.length > 0) {
      this.assessmentSections.forEach((section, index) => {
        this.scheduleForm.addControl(section.sectionName + index, new FormControl('', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]));
      });
    }
  }

  addQuestionRandomizationIntoForm() {
    if (this.scheduleAssessmentDto?.randomizationDetails?.length > 0) {
      this.scheduleAssessmentDto.randomizationDetails.forEach((objSectionDetails: AssessmentSectionDetails) => {
        objSectionDetails?.skillDetails?.forEach((skill: AssessmentSectionSkillDetails) => {
          skill?.proficiencyLevelQuestions?.forEach((objProficiency) => {
            if (!skill.isAutomated) {
              this.questionRandomizationFormIds.push({ formId: skill.skillMetadataId.toString() + objProficiency.proficiencyLevelId, skillMetadataId: skill.skillMetadataId, proficiencyId: objProficiency.proficiencyLevelId, sectionId: objSectionDetails.sectionId });
              this.scheduleForm.addControl(skill.skillMetadataId.toString() + objProficiency.proficiencyLevelId, new FormControl(objProficiency.totalQuestions, [Validators.required, Validators.min(0), Validators.max(objProficiency.totalQuestions), Validators.pattern("^[0-9]*$")]));
            }
            if (skill.isAutomated) {
              this.scheduleForm.addControl(skill.skillMetadataId.toString() + objProficiency.proficiencyLevelId, new FormControl({ value: Number(objProficiency.totalQuestions), disabled: true }));
            }
          });
        });
      });
    }
    if (this.questionRandomizationFormIds.length <= 0 || this.scheduleAssessmentDto.isStackAssessment)
      this.scheduleForm.get('showQuestionRandomization').disable();
  }

  patchSectionDurationValue(data: AssessmentScheduleResponseDto) {
    if (data.sectionDurationDetails) {
      const sectionDuration = data.sectionDurationDetails;
      this.enableSection = (sectionDuration !== null && sectionDuration?.length > 0) ? true : false;
      if (sectionDuration && sectionDuration.length > 0 && this.assessmentSections && this.assessmentSections.length > 0) {
        this.assessmentSections.forEach((obj, index) => {
          sectionDuration.forEach((section) => {
            if (obj.id === section.assessmentSectionId) {
              this.scheduleForm.get(section.sectionName + index)?.patchValue(section.duration);
            }
          });
        });
      }
    }
  }

  patchMinimumDurationValue(assessmentConfig) {
    this.enableSubmitDuration = assessmentConfig.SubmitEnableDuration ? true : false;
    if (assessmentConfig.SubmitEnableDuration) {
      this.scheduleForm.addControl("submitEnableDuration", new FormControl('', [Validators.required, Validators.min(1), Validators.max(this.scheduleForm.get('duration').value), Validators.pattern("^[0-9]*$")]));
      this.scheduleForm.get("submitEnableDuration")?.patchValue(assessmentConfig.SubmitEnableDuration);
    }
  }

  patchAdaptiveAssessmentDetails() {
    this.adaptiveAssessmentScheduleSectionsConfig?.forEach((obj) => {
      this.scheduleForm.get('progression' + obj.assessmentSectionId)?.patchValue(obj.totalProgression);
      this.scheduleForm.get('progression' + obj.assessmentSectionId)?.disable();
      this.scheduleForm.get('regression' + obj.assessmentSectionId)?.patchValue(obj.totalRegression);
      this.scheduleForm.get('regression' + obj.assessmentSectionId)?.disable();
    });
  }

  patchRoleAnalysisDetails(roleAnalysisDetails: ScheduleRoleDetails[]) {
    if (roleAnalysisDetails?.length > 0) {
      this.isRoleAnalysisEnabled = this.enableRoleAnalysis = true;
      roleAnalysisDetails.forEach((obj, index) => {
        if (index !== 0)
          this.roleAnalysisRows.push({ roleName: '', isDeleted: false });
        this.addFieldsInScheduleForm(index);
        this.patchFieldsInScheduleForm(index, obj);
      });
    }
  }

  isQuestionRandomizationSectionsValid(): boolean {
    let isAllSectionValid = true;
    let sectionIds = [...new Set(this.questionRandomizationFormIds.map(x => x.sectionId))];
    let groupedSection = groupBy(this.questionRandomizationFormIds, x => x.sectionId);
    sectionIds.forEach(element => {
      let sectionSelectedQnsCount = groupedSection[element].reduce((count, obj) => {
        return count + Number(this.scheduleForm.get(obj.formId).value);
      }, 0);
      if (sectionSelectedQnsCount < 1) {
        let sectionDetails = this.scheduleAssessmentDto?.randomizationDetails.find(x => x.sectionId === element).skillDetails;
        if (!sectionDetails.some(x => x.isAutomated))
          isAllSectionValid = false;
      }
    });
    return isAllSectionValid;
  }

  getQuestionRandomizationValues() {
    let randomizationDetails = [];
    this.questionRandomizationFormIds.forEach((obj) => {
      const proficiencyDetails: ProficiencyDetails = { proficiencyId: obj.proficiencyId, totalQuestions: Number(this.scheduleForm.get(obj.formId).value) };
      if (randomizationDetails.filter(x => x.skillMetadataId === obj.skillMetadataId)[0]) {
        randomizationDetails.filter(x => x.skillMetadataId === obj.skillMetadataId)[0].proficiencyDetails.push(proficiencyDetails);
      } else {
        randomizationDetails.push({ skillMetadataId: obj.skillMetadataId, proficiencyDetails: [proficiencyDetails] });
      }
    });
    return randomizationDetails;
  }

  patchQuestionRandomizationDetails(questionRandomizationDetails: AssessmentSectionDetails[]) {
    if (questionRandomizationDetails?.length > 0 && this.scheduleForm.get('showQuestionRandomization').value) {
      questionRandomizationDetails.forEach((objSectionDetails: AssessmentSectionDetails) => {
        objSectionDetails?.skillDetails?.forEach((skill: AssessmentSectionSkillDetails) => {
          JSON.parse(skill?.allocatedConfig)?.forEach((objProficiency) => {
            if (!skill.isAutomated) {
              this.scheduleForm.get(skill.skillMetadataId.toString() + objProficiency.ProficiencyLevelId).patchValue(objProficiency.TotalQuestions);
            }
          });
          if (skill?.allocatedConfig === '[]' && !skill.isAutomated) {
            this.defautQnRandomizationData.forEach((proficiency) => {
              this.scheduleForm.get(skill.skillMetadataId.toString() + proficiency.ProficiencyLevelId).patchValue(proficiency.TotalQuestions);
            });
          }
        });
      });
    }
  }

  onEndDateChange() {
    var endDateTemp = JSON.stringify(this.getDateFormat(this.scheduleForm.get('endDate').value));
    var endDateTempConstant = JSON.stringify(this.endDateValue !== null ? this.endDateValue : '');
    if (this.endDateValue !== null && endDateTemp !== endDateTempConstant) {
      this.endDateAndTimeValueChange();
    }
  }

  onEndTimeChange() {
    this.onChangeCutOffTimeCalc();
  }

  getDateFormat(date: any) {
    return {
      day: date.day,
      month: date.month,
      year: date.year
    };
  }

  getTotalQuestions(proficiencyId: number, countJson: TotalSkillQuestionsCountDetails) {
    const totalCount = JSON.parse(countJson?.proficiencyLevelConfig);
    switch (proficiencyId) {
      case Constants.beginnerId:
        return totalCount.BeginnerQuestionCount;
      case Constants.intermediateId:
        return totalCount.IntermediateQuestionCount;
      case Constants.advancedId:
        return totalCount.AdvancedQuestionCount;
    }
  }

  openProctorConfigurationTool(isViewOnly?: boolean) {
    let date = new Date;

    const saveCallbackDefinition = (event) => {
      let callbackEvent = new CustomEvent("aeye.proctorConfigCallbackEvent", {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(callbackEvent);
    };

    const startDateString = this.convertNgbDateToString(this.scheduleForm.get('startDate').value, this.scheduleForm.get('startTime').value);
    const endDateString = this.convertNgbDateToString(this.scheduleForm.get('endDate').value, this.scheduleForm.get('endTime').value);

    const params = {
      exam_id_from_lms: this.scheduledId ? this.scheduledId : this.scheduleAssessmentDto.assessmentScheduleId,
      exam_name: this.scheduleAssessmentDto.assessmentName,
      exam_description: 'Assessment schedule',
      date: isViewOnly ? '' : `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}-${date.toLocaleString('en-US', { month: 'short' })}-${date.getFullYear()}`,
      starts_at: isViewOnly ? new Date(startDateString).toISOString() : new Date(this.formattedStartTime).toISOString(),
      ends_at: isViewOnly ? new Date(endDateString).toISOString() : new Date(this.formattedEndTime).toISOString(),
      duration: this.scheduleForm.get('duration').value,
      custom_settings_present: false,
      tenant_name: env.aeyeTenantName,
      api_key: env.aeyeApiKey,
      mode: isViewOnly ? Constants.viewOnly : '',
      saveCallback: saveCallbackDefinition.toString()
    };
    ExamConfig(params, false, '');
  }

  @HostListener('window:aeye.proctorConfigCallbackEvent', ['$event'])
  updateScheduledAssessmentProctorStatus(e: any) {
    if (e?.detail?.detail === 0) {
      let data: UpdateScheduledAssessmentProctorDto = {
        assessmentId: this.scheduleAssessmentDto?.assessmentId,
        assessmentScheduleId: this.scheduledId,
        proctorType: ProctorType.Aeye,
        tenantId: this.scheduleForm.get('tenantId').value[0].id
      };

      this.assessmentService.updateScheduledAssessmentProctorStatus(data).subscribe(res => {
        if (res?.result) {
          this.toastrService.success(Constants.proctorSettingsEnabledSuccessfully);
        }
      });
    }

    if (e?.detail?.isExamCreated) {
      this.aeyeExamCreated = true;
    }
  }

  onEnableNegativeMarking(event: Event): void {
    this.showPercentage = event.target['checked'];
    if (event.target['checked']) {
      this.scheduleForm.get('negativeMarkPercentage').setValidators([Validators.required]);
      this.scheduleForm.get('negativeMarkPercentage').setValue(Constants.fifty.toString());
      this.scheduleForm.get('customNegativePercentage').disable();
    }
    else {
      this.scheduleForm.get('negativeMarkPercentage').clearValidators();
      this.scheduleForm.get('customNegativePercentage').disable();
      this.scheduleForm.get('customNegativePercentage').clearValidators();
      this.scheduleForm.get('customNegativePercentage').setValue('');
    }
  }

  enableCustomPercentageValidators(event: Event) {
    if (event.target['checked']) {
      this.scheduleForm.get('customNegativePercentage').setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
      this.scheduleForm.get('customNegativePercentage').enable();
    }
    else {
      this.scheduleForm.get('customNegativePercentage').clearValidators();
      this.scheduleForm.get('customNegativePercentage').disable();
    }
  }

  onNegativeMarkChange(value) {
    if ((value === Constants.totalPercentage || value === Constants.fifty)) {
      this.scheduleForm.get('customNegativePercentage').disable();
      this.scheduleForm.get('customNegativePercentage').clearValidators();
      this.scheduleForm.get('customNegativePercentage').setValue('');
      this.scheduleForm.get('customNegativePercentage').updateValueAndValidity();
    }
  }

  getNegativeMarkPercentage() {
    if (this.scheduleForm.get('negativeMarking').value) {
      return +(this.scheduleForm.get('negativeMarkPercentage').value !== Constants.custom ? this.scheduleForm.get('negativeMarkPercentage').value : this.scheduleForm.get('customNegativePercentage').value);
    }
    return null;
  }

  enableDisableQR() {
    if (this.isUploadType)
      this.scheduleForm.get('qrValidTime').enable();
    else
      this.scheduleForm.get('qrValidTime').disable();
  }

  enableScheduleFormForCloning() {
    this.isSubmitted = false;
    this.isTenantDisabled = false;
    this.hideScheduleCreation = false;
    this.scheduleForm.get('tenantId').enable();
    this.scheduleForm.get('endDate').enable();
    this.scheduleForm.get('endTime').enable();
    this.scheduleForm.get('cutOffDate').enable();
    this.scheduleForm.get('cutOffTime').enable();
    this.scheduleForm.get('registrationEndDate').enable();
    this.scheduleForm.get('registrationEndTime').enable();
    this.scheduleForm.get('resultViewStartDate').enable();
    this.scheduleForm.get('resultViewStartTime').enable();
    this.scheduleForm.get('resultViewDuration').enable();
    this.disableSubmitDurationCheckbox = false;
    this.disableRoleAnalysis = false;
    this.disableSectionCheckbox = false;
  }
  onEnableRoleAnalysis() {
    this.enableRoleAnalysis = !this.enableRoleAnalysis;
    this.addFieldsInScheduleForm(0);
  }

  addNewRole() {
    const index = this.roleAnalysisRows.length;
    this.roleAnalysisRows.push({ roleName: '', isDeleted: false });
    this.addFieldsInScheduleForm(index);
  }

  removeSelectedRole(index) {
    if (index === 0) {
      this.toastrService.warning(Constants.roleAnalysisRequiredMinimumOneRoleAndItsWeightage);
      return;
    }
    this.roleAnalysisRows[index].isDeleted = true;
    this.scheduleForm.get(`roleName${index}`).clearValidators();
    this.scheduleForm.get(`roleName${index}`).setValue('');
    this.scheduleForm.get(`roleName${index}`).updateValueAndValidity();
    this.scheduleForm.removeControl(`roleName${index}`);

    this.scheduleForm.get(`roleDescription${index}`).clearValidators();
    this.scheduleForm.get(`roleDescription${index}`).setValue('');
    this.scheduleForm.get(`roleDescription${index}`).updateValueAndValidity();
    this.scheduleForm.removeControl(`roleDescription${index}`);
    this.scheduleAssessmentDto.assessmentSections.forEach((section, sectionIndex) => {
      this.scheduleForm.get(`roleAnalysisSection${index}${sectionIndex}`).clearValidators();
      this.scheduleForm.get(`roleAnalysisSection${index}${sectionIndex}`).setValue('');
      this.scheduleForm.get(`roleAnalysisSection${index}${sectionIndex}`).updateValueAndValidity();
      this.scheduleForm.removeControl(`roleAnalysisSection${index}${sectionIndex}`);
    });
  }

  addFieldsInScheduleForm(rowIndex: number) {
    this.scheduleForm.addControl(`roleName${rowIndex}`, new FormControl('', [Validators.required]));
    this.scheduleForm.addControl(`roleDescription${rowIndex}`, new FormControl(''));
    this.scheduleAssessmentDto.assessmentSections.forEach((section, sectionIndex) => {
      this.scheduleForm.addControl(`roleAnalysisSection${rowIndex}${sectionIndex}`, new FormControl('', [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern("^[0-9]*$")]));
    });
  }

  patchFieldsInScheduleForm(rowIndex: number, rowData: ScheduleRoleDetails) {
    this.scheduleForm.get(`roleName${rowIndex}`).patchValue(rowData.roleName);
    this.scheduleForm.get(`roleDescription${rowIndex}`).patchValue(rowData.description);
    rowData.sectionDetails.forEach((section, sectionIndex) => {
      this.scheduleForm.get(`roleAnalysisSection${rowIndex}${sectionIndex}`)?.patchValue(section.sectionWeightage);
    });
  }

  calculateSum(rowIndex: number) {
    let sumValue = 0;
    this.scheduleAssessmentDto.assessmentSections.forEach((section, sectionIndex) => {
      if (this.scheduleForm.get(`roleAnalysisSection${rowIndex}${sectionIndex}`) !== null)
        sumValue = sumValue + (+(this.scheduleForm.get(`roleAnalysisSection${rowIndex}${sectionIndex}`)?.value));
    });
    return sumValue;
  }
}
