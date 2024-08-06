import { Component, Injector, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { ToastrService } from 'ngx-toastr';
import { tenantDetailsDto, TenantsDto } from '../tenants/tenant-detail';
import { TenantsService } from '../tenants/tenants.service';
import { ReportsService } from './reports.service';
import { Constants } from '@app/models/constants';
import { AeyeUsageReportDto, ReportData, ReportFilter, StackReportData, TodayDate, UserStackAssessmentsRequestDto, assignmentReportFilter } from './reports';
import { FormBuilder, FormGroup } from '@angular/forms';
import { saveAs } from 'file-saver';
import { dataService } from '@app/service/common/dataService';
import { Helper } from '@app/shared/helper';
import { AssessmentService } from '../assessment/assessment.service';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportType } from '@app/enums/test';
import html2pdf from 'html2pdf.js';
import { environment as env } from "../../../environments/environment";
import { SpinnerVisibilityService } from 'ng-http-loader';
import { AssesmentSchdules } from 'account/pre-assessment/pre-assessment-details';
import { AssessmentDetailDto, AssessmentDto } from '../assessment/assessment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantDetailsList: TenantsDto[];
  filterForm: FormGroup;
  reportData: ReportData[];
  selectedTenantId: number = 0;
  selectedTenantName: string;
  isSuperAdmin: boolean = false;
  isTenantAdmin: boolean = false;
  currentDate: TodayDate;
  timeZone = Helper.getTimeZone();
  tenantDetails: tenantDetailsDto[];
  ltiMindtreeTenantId: number = 446;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  purposeDropDownSettings: { singleSelection: boolean; selectAllText: string; idField: string; textField: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  pageSizes: number[] = [10, 20, 30];
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  wheeboxTableView: boolean = false;
  stackTableView: boolean = false;
  mcqFilterView: boolean = true;
  stackReports: StackReportData[] = [];
  stackReportTotalCount: number = 0;
  isSearchTriggered: boolean = false;
  reportType = ReportType;
  isExportSfa: boolean = false;
  isExportCloudBasedReport: boolean = false;
  isAdaptiveAssessmentReport: boolean = false;
  isCollaborativeAssessmentReport: boolean = false;
  assignmentReportSelected: boolean = false;
  @ViewChild('reportTypeddl') reportTypeddl: ElementRef;
  selectedReportType: number;
  isAssessmentReviewReport: boolean = false;
  isClicked: boolean = false;
  data: any = {
    userId: null,
    userAssessmentAttemptId: null,
    assessmentName: null,
    assessmentScheduleId: null
  }
  userEmailAddress: string;
  selectedTestPurpose = [];
  testPurposeList: AssesmentSchdules[];
  selectedPurposeDetails: AssesmentSchdules[] = [];
  viewFilter: boolean = false;
  showRegisterDownload: boolean = false;
  assessmentDetailsList: AssessmentDto[];
  assessmentDetails: AssessmentDetailDto[];

  get userName() { return this.filterForm.get('userName'); };

  constructor(private reportService: ReportsService,
    private formBuilder: FormBuilder,
    private tenantService: TenantsService,
    private toastrService: ToastrService,
    private dataService: dataService,
    private assessmentService: AssessmentService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private spinner: SpinnerVisibilityService,
    injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.initFilterForm();
    this.purposeDropDownSettings = {
      singleSelection: false,
      selectAllText: Constants.selectAll,
      unSelectAllText: Constants.unSelectAll,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      idField: 'scheduleId',
      textField: 'scheduleTestPurpose',
    };
    this.selectedPurposeDetails = [];
    this.getCurrentDate();
    this.isSuperAdmin = this.dataService.isSuperAdmin();
    this.isTenantAdmin = this.dataService.isTenantAdmin();
    if (this.isSuperAdmin)
      this.getTenantDetails();
    else {
      this.selectedTenantId = this.appSession.tenantId;
      if (this.selectedTenantId == this.dataService.nitte || this.selectedTenantId == this.dataService.ltim)
        this.showRegisterDownload = true;
    }
    if(this.appSession.tenantId)
    this.getScheduledAssessments(this.appSession.tenantId);
  }

  initFilterForm() {
    this.selectedTenantId = 0;
    this.selectedTenantName = "";
    this.filterForm = this.formBuilder.group({
      assessmentName: [''],
      testPurpose: [''],
      assessmentStatus: [0],
      userName: [''],
      assessmentStartDate: [''],
      assessmentEndDate: [''],
      isExport: true,
      tenantName: [''],
      tenantId: 0
    });
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

  getTenantDetails(): void {
    this.tenantService.getAllTenants().subscribe(res => {
      if (res.success) {
        this.tenantDetailsList = res.result;
      }
    }, error => {
      console.error(error);
    });
  }

  getFilterData(): ReportFilter {
    let tenantId = this.dataService.isSuperAdmin() ? this.selectedTenantId : this.appSession.tenantId;
    this.selectedTenantName = this.dataService.isTenantAdmin() ? this.appSession.tenantName : this.selectedTenantName;
    let data: ReportFilter = {
      endDate: this.filterForm.get('assessmentEndDate').value,
      assessmentName: encodeURIComponent(this.filterForm.get('assessmentName').value),
      startDate: this.filterForm.get('assessmentStartDate').value,
      assessmentStatus: this.filterForm.get('assessmentStatus').value,
      userName: this.filterForm.get('userName').value,
      isExport: true,
      tenantName: this.selectedTenantName,
      tenantId: tenantId,
      timeZone: this.timeZone,
      assessmentStartDate: undefined,
      assessmentEndDate: undefined,
      isExportSfa: this.isExportSfa,
      IsCloudBasedAssessment: this.isExportCloudBasedReport,
      isAdaptiveAssessmentReport: this.isAdaptiveAssessmentReport,
      isCollaborativeAssessmentReport: this.isCollaborativeAssessmentReport,
      selectedTestPurposeScheduleIds: this.selectedPurposeDetails.map(x => x.scheduleId).join(',')
    };

    if (data.startDate || data.endDate) {
      data.assessmentStartDate = Helper.convertNgbDateToString(data.startDate, "");
      data.assessmentEndDate = Helper.convertNgbDateToString(data.endDate, "");
    }
    return data;
  }

  tenantSelection(event) {
    this.tenantDetails = [{
      id: event.id,
      name: event.name
    }];
    this.selectedTenantId = event.id;
    this.getScheduledAssessments(this.selectedTenantId);
    // eslint-disable-next-line eqeqeq
    this.selectedTenantName = this.selectedTenantId > 0 ? this.tenantDetailsList.find(t => t.id == this.selectedTenantId).name : undefined;
    if (this.selectedTenantId !== this.ltiMindtreeTenantId)
      this.assignmentReportSelected = false;
  }

  purposeSelection(event) {
    let selectedPurpose: AssesmentSchdules = {
      scheduleId: event.scheduleId,
      scheduleTestPurpose: event.scheduleTestPurpose
    };
    this.selectedPurposeDetails.push(selectedPurpose);
  }

  assessmentDeSelection(event) {
    this.assessmentDetailsList = this.assessmentDetailsList.filter(x => x.name == event.name);
    this.testPurposeList = [];
    this.filterForm.get('testPurpose').reset();
  }

  purposeDeSelection(event) {
    this.selectedPurposeDetails = this.selectedPurposeDetails.filter(x => x.scheduleId !== event.scheduleId);
  }

  onSelectAllPurpose(event) {
    this.selectedPurposeDetails = [];
    this.selectedPurposeDetails = event.map(x => x);
  }
  onDeSelectAllPurpose(event) {
    this.selectedPurposeDetails = [];
  }

  getMasterReport(): void {
    let data: ReportFilter = {
      isExport: true,
      assessmentName: '',
      assessmentStatus: undefined,
      userName: '',
      assessmentStartDate: undefined,
      assessmentEndDate: undefined,
      tenantName: '',
      tenantId: 0,
      timeZone: undefined,
      startDate: undefined,
      endDate: undefined,
      isAdaptiveAssessmentReport: this.isAdaptiveAssessmentReport,
      selectedTestPurposeScheduleIds: ''
    };
    this.reportService.exportReportData(data).subscribe(res => {
    }, error => {
      this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      return;
    });
    this.toastrService.info(Constants.reportWillBeSentThroughMail);
  }

  getScheduledAssessments(tenantId: number) {
    this.reportService.getScheduledAssessments(tenantId).subscribe(res => {
      this.assessmentDetailsList = res.result;
    }, error => {
      console.error(error);
    });
  }

  getAssessmentsBySearchString() {
    if (!this.isSuperAdmin && this.selectedTenantId == 0) {
      this.selectedTenantId = this.appSession.tenantId
    }
    if (this.filterForm.get('assessmentName').value) {
      let assessmentName = encodeURIComponent(this.filterForm.get('assessmentName').value);
      this.assessmentService.isAssessmentExists(this.selectedTenantId, assessmentName).subscribe(res => {
        if (res && res.result.isAssessmentExist) {
          this.testPurposeList = res.result.assessmentSchedules;
          this.filterForm.get('testPurpose').reset();
          this.selectedPurposeDetails = [];
          if (this.testPurposeList.length == 0 || this.testPurposeList == null) {
            this.toastrService.warning(this.constants.thereIsNoScheduledTestPurposeForThisEvaluation);
          }
        }
        else {
          this.testPurposeList = [];
          this.selectedPurposeDetails = [];
          this.filterForm.get('testPurpose').reset();
          this.toastrService.warning(this.constants.invalidAssessmentName);
        }
      });
    }
    else {
      this.testPurposeList = [];
      this.selectedPurposeDetails = [];
      this.filterForm.get('testPurpose').reset();
      this.toastrService.warning(this.constants.pleaseEntryTheAssessmentName);
    }
  }

  getReportData(isExportViaMail: boolean): void {
    let data = this.getFilterData();
    let _reportType = this.reportTypeddl.nativeElement.value;
    if (!this.wheeboxTableView && !data.tenantId) {
      this.toastrService.warning(this.constants.selectTenant);
      return;
    }
    if (((!this.isAssessmentReviewReport && !this.wheeboxTableView) && this.selectedPurposeDetails.length <= 0) && this.filterForm.get('assessmentName').value) {
      this.toastrService.warning(this.constants.pleaseSelectTheSchedulePurpose);
      return;
    }
    if ((this.wheeboxTableView) && (((data.assessmentStartDate === "" || data.assessmentStartDate === "undefined-undefined-undefined") && data.assessmentEndDate !== undefined) || (data.assessmentStartDate !== undefined && (data.assessmentEndDate === "" || data.assessmentEndDate === "undefined-undefined-undefined"))
      || (data.assessmentStartDate === undefined && data.assessmentEndDate === undefined) || (data.assessmentStartDate === "undefined-undefined-undefined" && data.assessmentEndDate === "undefined-undefined-undefined"))) {
      this.toastrService.warning(this.constants.pleaseSelectValidDateRange);
      return;
    }
    else {
      var fromDate = new Date(data.assessmentStartDate);
      var toDate = new Date(data.assessmentEndDate);
      if (fromDate > toDate) {
        this.toastrService.warning(this.constants.pleaseSelectValidDateRange);
        return;
      }
    }
    if (_reportType.toLocaleLowerCase() === ReportType.Stack.toString().toLocaleLowerCase() || _reportType.toLocaleLowerCase() === ReportType.Collaborative.toString().toLocaleLowerCase()) {
      this.downloadStackReport(data);
    }
    else if (_reportType.toLocaleLowerCase() === ReportType.Cloud.toString().toLocaleLowerCase()) {
      this.downloadReport(data, isExportViaMail);
    }
    else if (_reportType.toLocaleLowerCase() === ReportType.Wheebox.toString().toLocaleLowerCase()) {
      this.downloadWheeboxReport(data);
    }
    else if (_reportType.toLocaleLowerCase() === ReportType.Aeye.toString().toLocaleLowerCase()) {
      this.downloadAeyeReport(data);
    }
    else if (_reportType.toLocaleLowerCase() === ReportType.AssessmentReview.toString().toLocaleLowerCase()) {
      this.downloadAssessmentReviewReport(data);
    }
    else {
      this.downloadReport(data, isExportViaMail);
    }
  }

  getAssignmentReportData() {
    let data: assignmentReportFilter = {
      tenantId: this.ltiMindtreeTenantId,
      userEmail: this.filterForm.get('userName').value,
      startDateUtc: this.filterForm.get('assessmentStartDate').value,
      endDateUtc: this.filterForm.get('assessmentEndDate').value,
      timeZone: Helper.getTimeZone()
    };
    if (data.startDateUtc || data.endDateUtc) {
      data.startDateUtc = Helper.convertNgbDateToString(this.filterForm.get('assessmentStartDate').value, "");
      data.endDateUtc = Helper.convertNgbDateToString(this.filterForm.get('assessmentEndDate').value, "");
    }
    this.reportService.exportAssingmentReportData(data).subscribe(res => {
      this.saveFile(res, "AssignmentReport", false);
    });
  }

  downloadAssessmentReviewReport(data: ReportFilter) {
    if (data.assessmentStartDate !== '' && data.assessmentEndDate === '') {
      this.toastrService.warning(this.constants.pleaseSelectEndDate);
    }
    else if (data.assessmentStartDate === '' && data.assessmentEndDate !== '') {
      this.toastrService.warning(this.constants.pleaseSelectStartDate);
    }
    else {
      this.reportService.getAssessmentReviewReport(data).subscribe(res => {
        const contentType = res.result.fileContentResult.contentType;
        const fileContents = res.result.fileContentResult.fileContents;
        const fileDownloadName = res.result.fileContentResult.fileDownloadName;
        const fileData = this.convertToPKFormat(fileContents);
        const blob = new Blob([fileData], { type: contentType });
        saveAs(blob, fileDownloadName);
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
        return;
      });
    }
  }

  convertToPKFormat(fileContents: string): Uint8Array {
    const byteCharacters = atob(fileContents);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  }

  saveFile(data: File, fileName: string, isNoData: boolean = false): any {
    let file = new Blob([data], { type: 'text/csv' });
    saveAs(file, fileName + "_Report" + Date.now() + ".csv");
    !isNoData ? this.toastrService.success(this.constants.successfullyDownloaded) : '';
  }


  downloadReport(data: ReportFilter, isExportViaMail: boolean) {
    if (data.isExport) {
      this.reportService.exportReportData(data).subscribe(res => {
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
        return;
      });
      this.toastrService.info(Constants.reportWillBeSentThroughMail);
    }
    else {
      this.reportService.getReportData(data).subscribe(res => {
        if (res.success) {
          this.reportData = res.result;
        }
        else {
          this.toastrService.warning(this.constants.unableToFetchReportAtThisInstanceOfTime);
        }
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      });
    }
  }

  downloadStackReport(data: ReportFilter) {
    if (data.isExport) {
      this.reportService.exportStackReportData(data).subscribe(res => {
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
        return;
      });
      this.toastrService.info(Constants.reportWillBeSentThroughMail);
    }
    else {
      this.reportService.getStackReportData(data).subscribe(res => {
        if (res.success) {
          this.reportData = res.result;
        }
        else {
          this.toastrService.warning(this.constants.unableToFetchReportAtThisInstanceOfTime);
        }
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      });
    }
  }

  downloadWheeboxReport(data: ReportFilter) {
    if (data.isExport) {
      this.reportService.exportWheeboxReportData(data).subscribe(res => {
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
        return;
      });
      this.toastrService.info(Constants.reportWillBeSentThroughMail);
    }
    else {
      this.reportService.getStackReportData(data).subscribe(res => {
        if (res.success) {
          this.reportData = res.result;
        }
        else {
          this.toastrService.warning(this.constants.unableToFetchReportAtThisInstanceOfTime);
        }
      }, error => {
        this.toastrService.error(this.constants.failedToFetchReportAtThisInstanceOfTime);
      });
    }
  }

  reset(): void {
    this.tenantDetails = [];
    this.selectedTenantId = 0;
    this.testPurposeList = [];
    this.selectedPurposeDetails = [];
    if (this.selectedTenantId == 0) {
      this.assessmentDetailsList = [];
    }
    this.filterForm.get('testPurpose').reset();
    this.filterForm.get('assessmentName').reset();
    this.filterForm.get('assessmentName').setValue('');
    this.filterForm.get('userName').reset();
    this.filterForm.get('userName').setValue('');
    this.filterForm.get('assessmentStatus').setValue(0);
    this.filterForm.get('assessmentStartDate').reset();
    this.filterForm.get('assessmentEndDate').reset();
    this.filterForm.get('assessmentStartDate').setValue('');
    this.filterForm.get('assessmentEndDate').setValue('');
    this.isSearchTriggered = false;
    if (this.selectedTenantId == 0 && !this.dataService.isSuperAdmin()) {
      this.selectedTenantId = this.appSession.tenantId;
    }
    if (this.isSuperAdmin)
      this.assignmentReportSelected = false;
  }

  getStackSubmittedData() {
    if (this.dataService.isSuperAdmin() && !this.selectedTenantId) {
      this.toastrService.warning(this.constants.pleaseSelectTenant);
    }
    else if (!this.filterForm.get('assessmentName').value) {
      this.toastrService.warning(this.constants.pleaseEntryTheAssessmentName);
    }
    else if (this.selectedPurposeDetails.length <= 0) {
      this.toastrService.warning(this.constants.pleaseSelectTheSchedulePurpose);
      throw "";
    }
    else {
      let params: UserStackAssessmentsRequestDto = {
        SkipCount: (this.pageIndex - 1) * this.pageSize,
        MaxResultCount: this.pageSize,
        SearchString: encodeURIComponent(this.filterForm.get('assessmentName').value),
        EmailAddress: this.filterForm.get('userName').value,
        TenantId: this.dataService.isSuperAdmin() ? this.selectedTenantId : this.appSession.tenantId,
        IsCollaborativeAssessment: this.selectedReportType === ReportType.Collaborative ? true : false,
        timeZone: this.timeZone,
        startDate: this.filterForm.get('assessmentStartDate').value,
        endDate: this.filterForm.get('assessmentEndDate').value,
        assessmentStartDate: undefined,
        assessmentEndDate: undefined,
        selectedTestPurposeScheduleIds: this.selectedPurposeDetails.map(x => x.scheduleId).join(',')
      };

      if (params.startDate || params.endDate) {
        params.assessmentStartDate = Helper.convertNgbDateToString(params.startDate, "");
        params.assessmentEndDate = Helper.convertNgbDateToString(params.endDate, "");
      }

      if (params.assessmentStartDate !== "" && params.assessmentEndDate !== "") {
        if (params.assessmentStartDate === "undefined-undefined-undefined" || params.assessmentEndDate === "undefined-undefined-undefined") {
          this.toastrService.warning(this.constants.pleaseSelectValidDateFormat);
          throw "";
        }
        else {
          var fromDate = new Date(params.assessmentStartDate);
          var toDate = new Date(params.assessmentEndDate);
          if (fromDate > toDate) {
            this.toastrService.warning(this.constants.pleaseSelectValidDateRange);
            throw "";
          }
        }
      }

      this.reportService.getUserStackAssessments(params).subscribe(data => {
        this.isSearchTriggered = true;
        if (data && data.result && data.result.length > 0) {
          this.stackReports = data.result;
          this.stackReports.forEach(item => {
            item.isStackDetails = false;
            if (item.userAssessmentStack) {
              item.isStackDetails = true;
              item.userAssessmentStack.forEach(stack => {
                stack['toolTip'] = `${Constants.view} ${stack.language} ${Constants.dashboard}`;
              });
            }
          });
          this.stackReportTotalCount = this.stackReports[0].totalCount;
        } else {
          this.pageIndex = 1;
          this.stackReports = [];
        }
      });
    }
  }

  loadPage() {
    this.getStackSubmittedData();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getStackSubmittedData();
  }

  onReportTypeChange(event) {
    this.selectedReportType = +event.target.value;
    this.isExportSfa = false;
    this.isExportCloudBasedReport = false;
    this.stackTableView = false;
    this.wheeboxTableView = false;
    this.isAdaptiveAssessmentReport = false;
    this.isCollaborativeAssessmentReport = false;
    this.assignmentReportSelected = false;
    if(this.appSession.tenantId)
    this.getScheduledAssessments(this.appSession.tenantId);

    if (event.target.value === ReportType.MCQ.toString() || event.target.value === this.reportType.SFA.toString() || event.target.value === this.reportType.Cloud.toString()) {
      this.mcqFilterView = true;
      this.isAssessmentReviewReport = false;
      if (event.target.value === this.reportType.SFA.toString()) {
        this.isExportSfa = true;
        this.isCollaborativeAssessmentReport = false;
        this.isAssessmentReviewReport = false;
        this.assignmentReportSelected = false;
      }
      if (event.target.value === this.reportType.Cloud.toString()) {
        this.isExportCloudBasedReport = true;
        this.isCollaborativeAssessmentReport = false;
        this.isAssessmentReviewReport = false;
        this.assignmentReportSelected = false;
      }
    }
    else if (event.target.value === ReportType.Stack.toString()) {
      this.stackTableView = true;
      this.mcqFilterView = false;
      this.isCollaborativeAssessmentReport = false;
      this.isAssessmentReviewReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value === ReportType.Collaborative.toString()) {
      this.stackTableView = true;
      this.mcqFilterView = false;
      this.isCollaborativeAssessmentReport = true;
      this.isAssessmentReviewReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value === ReportType.Wheebox.toString()) {
      this.wheeboxTableView = true;
      this.mcqFilterView = false;
      this.isCollaborativeAssessmentReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value === ReportType.Aeye.toString()) {
      this.wheeboxTableView = true;
      this.mcqFilterView = false;
      this.isCollaborativeAssessmentReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value === ReportType.Adaptive.toString()) {
      this.mcqFilterView = true;
      this.isAdaptiveAssessmentReport = true;
      this.isCollaborativeAssessmentReport = false;
      this.isAssessmentReviewReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value === ReportType.AssessmentReview.toString()) {
      this.isAssessmentReviewReport = true;
      this.mcqFilterView = false;
      this.isCollaborativeAssessmentReport = false;
      this.assignmentReportSelected = false;
    }
    else if (event.target.value == this.reportType.Assignment.toString()) {
      this.assignmentReportSelected = true;
    }
    if (event.target.value !== this.reportType.Assignment.toString())
      this.reset();
  }

  viewReport(userId: number, userAssessmentAttemptId: number, assessmentName: string, assessmentScheduleId: number, emailAddress: string) {
    const isCollaborative: boolean = this.selectedReportType === ReportType.Collaborative ? true : false;
    this.router.navigate(['stack-report', btoa(userId.toString()), btoa(userAssessmentAttemptId.toString()), btoa(assessmentName), btoa(assessmentScheduleId.toString()), btoa(emailAddress), btoa(isCollaborative.toString())], { relativeTo: this.activateRoute });
  }

  downloadStackPdf(userId: number, emailAddress: string, userAssessmentAttemptId: number, assessmentName: string, assessmentScheduleId: number) {
    this.userEmailAddress = "";
    this.isClicked = true;
    this.spinner.show();
    const isCollaborative: boolean = this.selectedReportType === ReportType.Collaborative ? true : false;
    this.data = {
      userId: userId,
      userAssessmentAttemptId: userAssessmentAttemptId,
      assessmentName: assessmentName,
      assessmentScheduleId: assessmentScheduleId,
      emailAddress: emailAddress,
      isCollaborative: isCollaborative.toString()
    };
    this.userEmailAddress = emailAddress;
  }

  getPDF() {
    var options = {
      pageHeight: 300
    };
    html2pdf(document.querySelector("#stackContentToConvert"), {
      margin: 15,
      filename: `${this.constants.stackReport}_${this.userEmailAddress}_${new Date().getTime()}.pdf`,
      jsPDF: { format: 'b3', orientation: 'portrait' }
    }).set({
      options
    });
    setTimeout(() => {
      this.isClicked = false;
      this.spinner.hide();
    }, 1500);
  }

  viewDashboard(url: string) {
    window.open(url, "_blank");
  }

  downloadAeyeReport(data: ReportFilter) {
    const requestData: AeyeUsageReportDto = {
      email: this.dataService.userProfile.emailAddress,
      from_date: data.assessmentStartDate.toString(),
      to_date: data.assessmentEndDate.toString(),
      tenant_name: env.aeyeTenantName
    };
    this.reportService.exportAeyeUsageReportData(requestData).subscribe((res) => {
      const response = JSON.parse(res.result)?.status;
      if (response) {
        this.toastrService.info(response.code === 200 ? Constants.reportWillBeSentThroughMail : response.message);
      }
    });
  }
  showMoreFilter() {
    this.viewFilter = !this.viewFilter;
  }
  downloadUserRegistration() {
    const timestamp = new Date().getTime(); // Get current timestamp in milliseconds
    const filename = `UserSchedules_${timestamp}.xlsx`; // Create a unique filename
    var data = { tenantId: this.appSession.tenantId };
    this.reportService.getUserScheduleDetails(data).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Set the desired file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
}
