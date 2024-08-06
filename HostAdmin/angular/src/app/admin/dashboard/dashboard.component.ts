import { Component, Injector, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';
import { TestTakerChartOptions, UserChartOptions } from '@app/interface/chart';
import { DashboardService } from './dashboard.service';
import { Helper, NgbDate } from '@app/shared/helper';
import { dataService } from '@app/service/common/dataService';
import { AssessmentStatus, AssessmentStatusRequest, DashboardQuestionsCount, QuestionCounts, TestTakerAssessmentStatus, TenantAssessmentData, TestTakerAssessmentType, TopAssessmentDetails, TopSkillAssessments, QuestionFilters, FilteredSkillProficiency } from './dashboard-details';
import { UserRoles } from '@app/enums/user-roles';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../users/users.service';
import { DashboardAssessmentData } from './dashboard-details';
import { AllTenants } from '../users/users';
import { Result } from '@app/shared/core-interface/base';
import { AppComponentBase } from '@shared/app-component-base';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { QuestionBankService } from '../question-bank/question-bank.services';
import { Category, Proficiency, Skill } from '../question-bank/question-bank-details';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TodayDate } from '../reports/reports';
import { Permissions } from '@shared/roles-permission/permissions';

export interface DurationDropDown {
  name: string,
  value: number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  dashboardQuestionsCount: DashboardQuestionsCount[] = [];
  tenantQuestionList: QuestionCounts[] = [];
  yakshaQuestionList: QuestionCounts[] = [];
  tenantQuestions: string = 'TenantQuestions';
  yakshaQuestions: string = 'YakshaQuestions';
  colorScheme = {
    domain: ['#4fc3f7', '#f62d51', '#20c997']
  };
  testTakerChartOptions: Partial<TestTakerChartOptions>;
  userChartOptions: Partial<UserChartOptions>;
  assessmentStatus: AssessmentStatus;
  dashboardAssessmentData: DashboardAssessmentData;
  userRole: string;
  userRoles = UserRoles;
  tenantId: number = this.appSession.tenantId | 0;
  tenantList: number[] = [];
  assessmentFilterTenantId: number = 0;
  tenantFilterTenantId: number = 0;
  tenantquestionselect: number[] = [];
  tenantIdlist: number[] = [];
  questionFilterSkillId: number = 0;
  questionFilterCategoryId: number = 0;
  questionFilteredProficiencyId: number = 0;
  tenantFilterSkillId: number = 0;
  tenantFilterCategoryId: number = 0;
  tenantFilteredProficiencyId: number = 0;
  formattedStartTime: string = '';
  formattedEndTime: string = '';
  startTime: string = '00:00';
  endTime: string = '23:59';
  yakshaQuestionForm: FormGroup;
  tenantQuestionForm: FormGroup;
  skillId: number;
  categoryId: number;
  proficiencyId: number;
  tenantFormDisable: boolean = true;
  testTakerAssessmentType: TestTakerAssessmentType;
  topAssessmentDetails: TopAssessmentDetails[];
  tenantAssessmentText: string = Constants.myAssessments;
  tenantQuestionText: string = Constants.myQuestions;
  topAssessmentDurationDropDown: DurationDropDown[] = [{ name: "Current month", value: 1 }, { name: "Last 3 Months", value: 2 }, { name: "Last 6 Months", value: 3 }, { name: "Last 1 Year", value: 4 }];
  testTakerdurationDropDown: DurationDropDown[] = [{ name: "Last 3 Months", value: 1 }, { name: "Last 6 Months", value: 2 }, { name: "Last 1 Year", value: 3 }];
  fromDate: string;
  toDate: string;
  assessmentFilterStatus: boolean = false;
  tenantAssessmentData: TenantAssessmentData;
  tenantAssessmentsCount: number = 0;
  tenantCategories: number = 0;
  tenantSkills: number = 0;
  tenants: AllTenants[] = [];
  testTakerAssessmentStatus: TestTakerAssessmentStatus[];
  totalAssessmentSceduled: number[];
  totalAssessmentTaken: number[];
  months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  periodList: string[] = [];
  monthList: number[] = [];
  testTakerPeriod: number = this.testTakerdurationDropDown[2].value;
  topAssessmentPeriod: number = this.topAssessmentDurationDropDown[3].value;
  topSkillAssessments: TopSkillAssessments[] = [];
  categories: Category[] = [];
  tenantSkill: Skill[] = [];
  tenantCategory: Category[] = [];
  skills: Skill[] = [];
  proficiencies: Proficiency;
  threeMonths: number = 3;
  sixMonths: number = 6;
  isTenantQuestionSelected: boolean = true;
  isYakshaQuestionSelected: boolean = true;
  splitTenant: string;
  questionSelectTenant: string;
  currentDate: TodayDate;
  dropdownSettings: { singleSelection: boolean; selectAllText: string; idField: string; textField: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  permissions: any;

  constructor(
    private dashboardService: DashboardService,
    private toastrService: ToastrService,
    private userService: UserService,
    private dataService: dataService,
    private questionBankService: QuestionBankService,
    private formBuilder: FormBuilder,
    private appSessionService: AppSessionService,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      idField: 'id',
      textField: 'name',
    };
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(data => {
      this.permissions = data;
    });
    if (this.userRole === UserRoles[1]) {
      this.tenantAssessmentText = Constants.tenantAssessments;
      this.tenantQuestionText = Constants.tenantQuestionsPie;
      this.tenantList.push(this.tenantId);
      this.getAllTenants();
      //this.getDashboardQuestionsCount(this.tenantList);
    } else if (this.permissions[Permissions.dashboardManageAll]) {
      this.tenantAssessmentText = Constants.myAssessments;
      this.tenantQuestionText = Constants.myQuestions;
      this.tenantId = this.appSessionService.tenantId;
      this.tenantFormDisable = false;
      this.tenantList.push(this.tenantId);
      this.tenantIdlist.push(this.tenantId);
      this.getFilterdSkillProficiency(this.tenantList);
      //this.getDashboardQuestionsCount(this.tenantList);
    }
    this.getDashboardData();
    this.getAssessmentStatus();
    this.getTopSkillAssessments();
    this.getAllProficiencies();
    this.getFilterdSkillProficiency();
    this.getCurrentDate();
  }

  initFilterForm() {
    this.yakshaQuestionForm = this.formBuilder.group({
      selectedSkillId: [''],
      selectedCategoryId: [''],
      selectedProficiencyId: ['']
    });
    this.tenantQuestionForm = this.formBuilder.group({
      selectedTenantId: [''],
      tenantSelectedSkillId: [''],
      tenantSelectedCategoryId: [''],
      tenantSelectedProficiencyId: [''],
      tenantStartDate: [''],
      tenantEndDate: ['']
    });
  }

  convertNgbDateToString(date: NgbDate, time: string) {
    if (date && time)
      return `${date.year}-${date.month}-${date.day} ${time}`;
    else
      return "";
  }

  getTopSkillAssessments() {
    this.dashboardService.getTopSkillAssessments(this.tenantId).subscribe(res => {
      if (res && res.result.length) {
        this.topSkillAssessments = res.result;
      }
      else {
        this.toastrService.warning(Constants.noDataTopSkillAssessments);
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  onChangeTopAssessments(event) {
    let value = event.target.value;
    this.assessmentFilterStatus = true;
    if (value === "2") {
      let fromDate = new Date(new Date().setMonth(new Date().getMonth() - 3));
      this.fromDate = Helper.getFormattedDate(fromDate);
      this.toDate = Helper.getFormattedDate(new Date());
    }
    else if (value === "3") {
      let fromDate = new Date(new Date().setMonth(new Date().getMonth() - 6));
      this.fromDate = Helper.getFormattedDate(fromDate);
      this.toDate = Helper.getFormattedDate(new Date());
    }
    else if (value === "4") {
      let fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      this.fromDate = Helper.getFormattedDate(fromDate);
      this.toDate = Helper.getFormattedDate(new Date());
    }
    else {
      let fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      this.fromDate = Helper.getFormattedDate(fromDate);
      this.toDate = Helper.getFormattedDate(new Date());
    }
    this.getAssessmentStatus();
  }

  getAllTenants() {
    this.userService.getAllTenants().subscribe(res => {
      if (res.success) {
        this.tenants = res.result;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  deSelectYakshaQuestions() {
    this.skillId = this.yakshaQuestionForm.get('selectedSkillId').value ? this.yakshaQuestionForm.get('selectedSkillId').value[0]?.id : null;
    this.proficiencyId = this.yakshaQuestionForm.get('selectedProficiencyId').value ? this.yakshaQuestionForm.get('selectedProficiencyId').value[0]?.id : null;
    this.categoryId = this.yakshaQuestionForm.get('selectedCategoryId').value ? this.yakshaQuestionForm.get('selectedCategoryId').value[0]?.id : null;
    this.isYakshaQuestionSelected = true;
    this.isTenantQuestionSelected = false;
    this.getDashboardQuestionsCount(null, this.skillId, this.categoryId, this.proficiencyId);

  }

  tenantQuestionChange(item, event): void {
    if (item === 'tenantId') {
      this.tenantFilterTenantId = event.id;
      this.tenantIdlist.push(this.tenantFilterTenantId);
    }
    if (this.tenantIdlist.length) {
      this.tenantFormDisable = false;
      this.tenantQuestionForm.patchValue({
        tenantSelectedSkillId: null,
        tenantSelectedCategoryId: null,
        tenantSelectedProficiencyId: null,
        tenantStartDate: null,
        tenantEndDate: null
      });
      this.isYakshaQuestionSelected = false;
      this.isTenantQuestionSelected = true;
      this.getFilterdSkillProficiency(this.tenantIdlist);
      this.getDashboardQuestionsCount(this.tenantIdlist);
      this.tenantQuestionText = Constants.tenantQuestionsPie;
    }
    else {
      this.tenantQuestionList.length = 0;
      this.tenantQuestionText = Constants.tenantQuestionsPie;
    }
  }

  deSelectTenants(event) {
    this.tenantIdlist = this.tenantIdlist.filter(x => x !== event.id);
    if (this.tenantIdlist.length <= 0) {
      this.tenantFormDisable = true;
      this.tenantQuestionList.length = 0;
    }
    this.tenantQuestionForm.patchValue({
      tenantSelectedSkillId: null,
      tenantSelectedCategoryId: null,
      tenantSelectedProficiencyId: null,
      tenantStartDate: null,
      tenantEndDate: null
    });
    this.isYakshaQuestionSelected = false;
    this.isTenantQuestionSelected = true;
    this.tenantQuestionText = Constants.tenantQuestionsPie;
    this.getFilterdSkillProficiency(this.tenantIdlist);
    this.getDashboardQuestionsCount(this.tenantIdlist);

  }

  onSelectAll(event) {
    this.tenantIdlist = event.map(x => x.id);
    this.getFilterdSkillProficiency(this.tenantIdlist);
    this.getDashboardQuestionsCount(this.tenantIdlist);
    this.tenantFormDisable = false;
  }

  onItemDeSelectAll(event) {
    this.tenantIdlist = [];
    this.tenantQuestionList.length = 0;
    this.tenantFormDisable = true;
    this.tenantQuestionForm.patchValue({
      selectedTenantId: null,
      tenantSelectedSkillId: null,
      tenantSelectedCategoryId: null,
      tenantSelectedProficiencyId: null,
      tenantStartDate: null,
      tenantEndDate: null
    });
  }

  searchTenantQuestions() {
    this.tenantFilterTenantId = this.tenantQuestionForm.get('selectedTenantId').value ? this.tenantQuestionForm.get('selectedTenantId').value?.id : null;
    this.tenantFilterTenantId = this.tenantQuestionForm.controls.selectedTenantId.value ? this.tenantQuestionForm.controls.selectedTenantId.value.map(x => x.id) : this.tenantId;
    this.tenantFilterSkillId = this.tenantQuestionForm.get('tenantSelectedSkillId').value ? this.tenantQuestionForm.get('tenantSelectedSkillId').value[0]?.id : null;
    this.tenantFilterCategoryId = this.tenantQuestionForm.get('tenantSelectedCategoryId').value ? this.tenantQuestionForm.get('tenantSelectedCategoryId').value[0]?.id : null;
    this.tenantFilteredProficiencyId = this.tenantQuestionForm.get('tenantSelectedProficiencyId').value ? this.tenantQuestionForm.get('tenantSelectedProficiencyId').value[0]?.id : null;
    this.formattedStartTime = this.convertNgbDateToString(this.tenantQuestionForm.get('tenantStartDate').value, this.startTime);
    this.formattedEndTime = this.convertNgbDateToString(this.tenantQuestionForm.get('tenantEndDate').value, this.endTime);
    this.isYakshaQuestionSelected = false;
    this.isTenantQuestionSelected = true;
    if (this.tenantFilterTenantId) {
      this.getFilterdSkillProficiency(this.tenantIdlist);
      this.getDashboardQuestionsCount(this.tenantIdlist, this.tenantFilterSkillId, this.tenantFilterCategoryId, this.tenantFilteredProficiencyId, this.formattedStartTime, this.formattedEndTime);
    }
    else {
      this.getFilterdSkillProficiency(this.tenantIdlist);
      this.getDashboardQuestionsCount(this.tenantIdlist, this.tenantFilterSkillId, this.tenantFilterCategoryId, this.tenantFilteredProficiencyId, this.formattedStartTime, this.formattedEndTime);
    }
  }

  deSelectTenantQuestions() {
    this.tenantFilterTenantId = this.tenantQuestionForm.get('selectedTenantId').value ? this.tenantQuestionForm.get('selectedTenantId').value[0]?.id : null;
    if (this.tenantFilterTenantId === undefined) {
      this.tenantFormDisable = true;
      this.tenantQuestionForm.patchValue({
        tenantSelectedSkillId: null,
        tenantSelectedCategoryId: null,
        tenantSelectedProficiencyId: null,
        tenantStartDate: null,
        tenantEndDate: null
      });
    }
    this.isYakshaQuestionSelected = false;
    this.isTenantQuestionSelected = true;
    this.tenantFilterSkillId = this.tenantQuestionForm.get('tenantSelectedSkillId').value ? this.tenantQuestionForm.get('tenantSelectedSkillId').value[0]?.id : null;
    this.tenantFilterCategoryId = this.tenantQuestionForm.get('tenantSelectedCategoryId').value ? this.tenantQuestionForm.get('tenantSelectedCategoryId').value[0]?.id : null;
    this.tenantFilteredProficiencyId = this.tenantQuestionForm.get('tenantSelectedProficiencyId').value ? this.tenantQuestionForm.get('tenantSelectedProficiencyId').value[0]?.id : null;
    this.formattedStartTime = this.formattedStartTime ? this.convertNgbDateToString(this.tenantQuestionForm.get('tenantStartDate').value, this.startTime) : null;
    this.formattedEndTime = this.formattedEndTime ? this.convertNgbDateToString(this.tenantQuestionForm.get('tenantEndDate').value, this.endTime) : null;
    this.getDashboardQuestionsCount(this.tenantIdlist, this.tenantFilterSkillId, this.tenantFilterCategoryId, this.tenantFilteredProficiencyId, this.formattedStartTime, this.formattedEndTime);
  }

  onChange() {
    this.formattedStartTime = this.convertNgbDateToString(this.tenantQuestionForm.get('tenantStartDate').value, this.startTime);
    this.formattedEndTime = this.convertNgbDateToString(this.tenantQuestionForm.get('tenantEndDate').value, this.endTime);
    if (this.formattedStartTime && this.formattedEndTime) {
      if ((new Date(this.formattedStartTime) < new Date(this.formattedEndTime)) || (this.formattedStartTime === this.formattedEndTime)) {
        this.searchTenantQuestions();
      }
      else {
        this.toastrService.error(Constants.startdDateShouldBeLessThenEnddate);
        this.formattedStartTime = "";
        this.formattedEndTime = "";
      }
    }
    else if (this.tenantQuestionForm.get('tenantStartDate').value && !this.tenantQuestionForm.get('tenantEndDate').value) {
      this.tenantQuestionForm.patchValue({
        tenantEndDate: ''
      });
    }
    else {
      this.tenantQuestionForm.patchValue({
        tenantStartDate: ''
      });
    }
  }

  getCurrentDate() {
    let formattedDate = Helper.getFormattedDate(new Date());
    let dateList = formattedDate.split("/");
    this.currentDate = {
      month: +dateList[0],
      day: +dateList[1],
      year: +(dateList[2].substring(0, 4)),
    };
  }

  searchYakshaQuestions() {
    this.skillId = this.yakshaQuestionForm.get('selectedSkillId').value ? this.yakshaQuestionForm.get('selectedSkillId').value[0]?.id : null;
    this.proficiencyId = this.yakshaQuestionForm.get('selectedProficiencyId').value ? this.yakshaQuestionForm.get('selectedProficiencyId').value[0]?.id : null;
    this.categoryId = this.yakshaQuestionForm.get('selectedCategoryId').value ? this.yakshaQuestionForm.get('selectedCategoryId').value[0]?.id : null;
    this.isYakshaQuestionSelected = true;
    this.isTenantQuestionSelected = false;
    this.getDashboardQuestionsCount(null, this.skillId, this.categoryId, this.proficiencyId);
  }



  getDashboardQuestionsCount(tenantId?: number[], skillId?: number, categoryId?: number, proficiencyId?: number, startDate?: string, endDate?: string): void {
    if (tenantId)
      this.questionSelectTenant = tenantId.join(',');
    else
      this.questionSelectTenant = '0';
    let data: QuestionFilters = {
      tenantId: this.questionSelectTenant,
      skillId: skillId,
      proficiencyId: proficiencyId,
      categoryId: categoryId,
      startDate: startDate,
      endDate: endDate,
      timeZone: Helper.getTimeZone()
    };
    this.dashboardService.getDashboardQuestionsCount(data).subscribe((res: Result<DashboardQuestionsCount[]>) => {
      if (res.success === true && res.result && res.result.length) {
        this.dashboardQuestionsCount = res.result;
        this.dashboardQuestionsCount.forEach((qb: DashboardQuestionsCount) => {
          if (qb.qbName === this.tenantQuestions && this.isTenantQuestionSelected) {
            this.tenantQuestionList = qb.questionCounts.map(question => {
              return {
                name: question.name,
                value: question.count
              };
            });
          }
          else if (qb.qbName === this.yakshaQuestions && this.isYakshaQuestionSelected) {
            this.yakshaQuestionList = qb.questionCounts.map(question => {
              return {
                name: question.name,
                value: question.count
              };
            });
          }
        });
      }
      else {
        console.error(res.error);
      }
    },
      error => console.error(error));
  }

  getAssessmentStatus(): void {
    let assessmentStatusRequest: AssessmentStatusRequest = {};
    assessmentStatusRequest.tenantId = this.tenantId;
    assessmentStatusRequest.fromDate = this.fromDate;
    assessmentStatusRequest.toDate = this.toDate;
    assessmentStatusRequest.topAssessmentFilter = this.assessmentFilterStatus;
    this.dashboardService.getAssessmentStatus(assessmentStatusRequest).subscribe((res: Result<AssessmentStatus>) => {
      if (res.success && res.result) {
        if (res.result.testTakerAssessmentStatus && res.result.testTakerAssessmentStatus.length) {
          this.assessmentStatus = res.result;
          this.testTakerAssessmentStatus = res.result.testTakerAssessmentStatus;
          this.totalAssessmentSceduled = this.testTakerAssessmentStatus.map(x => x.noOfAssessmentsScheduled);
          this.totalAssessmentTaken = this.testTakerAssessmentStatus.map(x => x.noOfAssessmentsTaken);
          this.monthList = this.testTakerAssessmentStatus.map(x => x.month);
          this.monthList.forEach(element => {
            this.periodList.push(this.months[element - 1]);
          });
        }
        if (res.result.topAssessmentDetails && res.result.topAssessmentDetails.length)
          this.topAssessmentDetails = res.result.topAssessmentDetails;
        this.createTestTakerChart();
        if (res.result.testTakerAssessmentType) {
          this.createUserChart();
        }
      }
    },
      error => console.error(error));
  }

  createTestTakerChart(): void {
    this.testTakerChartOptions = {
      series: [
        {
          name: Constants.assessmentsTaken,
          data: this.totalAssessmentTaken
        },
        {
          name: Constants.assessmentsScheduled,
          data: this.totalAssessmentSceduled
        }
      ],
      chart: {
        fontFamily: 'Muli,sans-serif',
        height: 370,
        type: 'area',
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 3,
        strokeColors: "transparent"
      },
      stroke: {
        curve: 'smooth',
        width: '1',
      },
      colors: ['#55ce63', '#009efb'],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [0, 50, 100]
        },
      },
      xaxis: {
        type: 'category',
        categories: this.periodList,
        labels: {
          style: {
            colors: '#a1aab2'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#a1aab2'
          },
          formatter: val => val.toFixed(0)
        }
      },
      tooltip: {
        theme: 'dark'
      }
    };
  }

  createUserChart(): void {
    this.userChartOptions = {
      series: [this.assessmentStatus.testTakerAssessmentType.noOfInvitedAssessments, this.assessmentStatus.testTakerAssessmentType.noOfSelfEnrolledAssessments, this.assessmentStatus.testTakerAssessmentType.noOfPublicAssessments],
      chart: {
        fontFamily: 'Rubik,sans-serif',
        type: 'pie',
        height: 200
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '85px',
          }
        }
      },
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 1,
        colors: ["#009efb"],
      },
      legends: {
        show: false,
      },
      labels: ['Total Invited', 'Total SelfEnrolled', 'Total Public Link'],
      colors: ['#fff', '#23af54', '#ffb22b'],
    };
  }

  onChangeTestTaker(): void {
    let periodList: number[] = [];
    let fromMonth: number = 0;
    let duration: number = 0;
    let testTakerAssessmentStatus: TestTakerAssessmentStatus[] = [];
    this.totalAssessmentSceduled = [];
    this.totalAssessmentTaken = [];
    this.monthList = [];
    this.periodList = [];
    if (+this.testTakerPeriod === this.testTakerdurationDropDown[0].value) {
      duration = this.threeMonths;
      fromMonth = new Date(new Date().setMonth(new Date().getMonth() - duration)).getMonth() + 2;
      monthCalculation();
      periodList.forEach(period => {
        let data: TestTakerAssessmentStatus = this.testTakerAssessmentStatus.find(x => x.month === period);
        if (data) {
          testTakerAssessmentStatus.push(data);
        }
      });
      this.totalAssessmentSceduled = testTakerAssessmentStatus.map(x => x.noOfAssessmentsScheduled);
      this.totalAssessmentTaken = testTakerAssessmentStatus.map(x => x.noOfAssessmentsTaken);
      this.monthList = testTakerAssessmentStatus.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }
    else if (+this.testTakerPeriod === this.testTakerdurationDropDown[1].value) {
      duration = this.sixMonths;
      fromMonth = new Date(new Date().setMonth(new Date().getMonth() - duration)).getMonth() + 2;
      monthCalculation();
      periodList.forEach(period => {
        let data: TestTakerAssessmentStatus = this.testTakerAssessmentStatus.find(x => x.month === period);
        if (data) {
          testTakerAssessmentStatus.push(data);
        }
      });
      this.totalAssessmentSceduled = testTakerAssessmentStatus.map(x => x.noOfAssessmentsScheduled);
      this.totalAssessmentTaken = testTakerAssessmentStatus.map(x => x.noOfAssessmentsTaken);
      this.monthList = testTakerAssessmentStatus.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }
    else if (+this.testTakerPeriod === this.testTakerdurationDropDown[2].value) {
      this.totalAssessmentSceduled = this.testTakerAssessmentStatus.map(x => x.noOfAssessmentsScheduled);
      this.totalAssessmentTaken = this.testTakerAssessmentStatus.map(x => x.noOfAssessmentsTaken);
      this.monthList = this.testTakerAssessmentStatus.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }

    function monthCalculation() {
      periodList.push(fromMonth);
      let startMonth: number = 0;
      for (let i = 1; i <= duration; i++) {
        let value: number = fromMonth + 1;
        if (value <= 12) {
          periodList.push(value);
          ++fromMonth;
        }
        else {
          startMonth += 1;
          periodList.push(startMonth);
        }
      }
    }
    this.createTestTakerChart();
  }

  tenantSelection(event) {
    this.tenantAssessmentsCount = 0;
    this.tenantCategories = 0;
    this.tenantSkills = 0;
    this.assessmentFilterTenantId = event.id;
    if (this.assessmentFilterTenantId) {
      this.getTenantAssessmentData(this.assessmentFilterTenantId);
      let tenantName = this.tenants.find(x => x.id === this.assessmentFilterTenantId).name;
      this.tenantAssessmentText = tenantName + Constants.tenantSelection;
    }
    else {
      this.tenantAssessmentText = Constants.tenantAssessments;
    }
  }

  tenantDeSelection() {
    this.tenantAssessmentsCount = 0;
    this.tenantCategories = 0;
    this.tenantSkills = 0;
    this.tenantAssessmentText = Constants.tenantAssessments;
  }

  getDashboardData() {
    this.dashboardService.getDashboardData().subscribe(res => {
      if (res && res.result) {
        this.dashboardAssessmentData = res.result;
        if (this.dashboardAssessmentData.tenantAssessmentsCount)
          this.tenantAssessmentsCount = this.dashboardAssessmentData.tenantAssessmentsCount;
        if (this.dashboardAssessmentData.tenantCategories)
          this.tenantCategories = this.dashboardAssessmentData.tenantCategories;
        if (this.dashboardAssessmentData.tenantSkills)
          this.tenantSkills = this.dashboardAssessmentData.tenantSkills;
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getTenantAssessmentData(tenantId: number) {
    this.dashboardService.getTenantAssessmentData(tenantId).subscribe(res => {
      if (res && res.result) {
        this.tenantAssessmentData = res.result;
        if (this.tenantAssessmentData.tenantAssessmentsCount)
          this.tenantAssessmentsCount = this.tenantAssessmentData.tenantAssessmentsCount;
        if (this.tenantAssessmentData.tenantCategories)
          this.tenantCategories = this.tenantAssessmentData.tenantCategories;
        if (this.tenantAssessmentData.tenantSkills)
          this.tenantSkills = this.tenantAssessmentData.tenantSkills;
      }
      else
        this.toastrService.warning(Constants.noDataFound);
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }

  getFilterdSkillProficiency(tenantId?: number[]) {
    let filteredDetails: FilteredSkillProficiency[] = [];
    this.tenantSkill = [];
    this.tenantCategory = [];
    if (tenantId)
      this.splitTenant = tenantId.join(',');
    else
      this.splitTenant = '0';
    this.dashboardService.getFilteredSkillProficiency(this.splitTenant).subscribe(res => {
      if (res && res.result)
        filteredDetails = res.result;
      filteredDetails.forEach(value => {
        if (value.isTenantFilter) {
          let skillData: Skill = {
            id: value.skillId,
            name: value.skillName
          };
          let categoryData: Category = {
            id: value.categoryId,
            name: value.categoryName
          };
          if (!this.tenantSkill.length || !(this.tenantSkill.find(x => x.id === skillData.id)))
            this.tenantSkill = [...this.tenantSkill, skillData];
          if (!this.tenantCategory.length || !(this.tenantCategory.find(x => x.id === categoryData.id)))
            this.tenantCategory = [...this.tenantCategory, categoryData];
        }
        else {
          let yakshaSkillData: Skill = {
            id: value.skillId,
            name: value.skillName
          };
          let yakshaCategoryData: Category = {
            id: value.categoryId,
            name: value.categoryName
          };
          if (!this.skills.length || !(this.skills.find(x => x.id === yakshaSkillData.id)))
            this.skills = [...this.skills, yakshaSkillData];
          if (!this.categories.length || !(this.categories.find(x => x.id === yakshaCategoryData.id)))
            this.categories = [...this.categories, yakshaCategoryData];
        }
      });
    });
  }

  getAllProficiencies() {
    this.questionBankService.getAllProficiencies().subscribe(res => {
      if (res && res.result) {
        this.proficiencies = res.result;
      }
    }, error => {
      console.error(error);
    });
  }
}