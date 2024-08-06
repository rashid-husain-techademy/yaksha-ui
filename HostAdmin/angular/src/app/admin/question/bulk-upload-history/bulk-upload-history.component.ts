import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantsDto } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { ToastrService } from 'ngx-toastr';
import { BulkHistoryDto, BulkUploadHistoryFilter } from '../../question/question-details';
import { QuestionsService } from '../../question/questions.service';
import { Constants } from '../../../models/constants';
import { Helper, NgbDate } from '@app/shared/helper';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { TodayDate } from '@app/admin/reports/reports';
import { Permissions } from '@shared/roles-permission/permissions';

@Component({
  selector: 'app-bulk-upload-history',
  templateUrl: './bulk-upload-history.component.html',
  styleUrls: ['./bulk-upload-history.component.scss']
})
export class BulkUploadHistoryComponent implements OnInit {
  constants = Constants;
  bulkUploadDetails: BulkHistoryDto[];
  totalCount: number;
  totalQuestions: number;
  totalMcqCount: number;
  totalStackQuestionCount: number;
  totalCodingQuestionCount: number;
  skipCount: number = 0;
  maxResultCount: number = 10;
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  tenantName: string = '';
  emailAddress: string = '';
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  tenantDetailsList: TenantsDto[];
  formattedStartTime: string = '';
  formattedEndTime: string = '';
  bulkForm: FormGroup;
  startTime: string = '00:00';
  endTime: string = '23:59';
  userEmailList: string[] = [];
  tenantId: number | null;
  userRole: string;
  userRoles = UserRoles;
  currentDate: TodayDate;
  permissions: any;

  constructor(private tenantService: TenantsService,
    private formBuilder: FormBuilder,
    private questionsService: QuestionsService,
    private toastrService: ToastrService,
    private dataService: dataService,
    private appSessionService: AppSessionService,
    injector: Injector) {
  }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.dataService.userPermissions.subscribe(val => {
      this.permissions = val;
    });
    if (this.userRole === UserRoles[1]) {
      this.getUserByTenantId();
      this.getBulkUploadHistoryTract();
    } else if (this.permissions[Permissions.questionsManageAll]) {
      this.tenantId = this.appSessionService.tenantId;
      this.getUserByTenantId(this.tenantId);
      this.getBulkUploadHistoryTract();
    }
    this.initBulkForm();
    this.getTenantDetails();
    this.getCurrentDate();
  }

  initBulkForm() {
    this.bulkForm = this.formBuilder.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      tenantName: ['', [Validators.required]],
      emailAddress: ''
    });
  }

  getTenant(data, event: any): void {
    if (data === 'tenantName') {
      this.tenantId = event.id;
      this.bulkForm.patchValue({
        emailAddress: null
      });
      this.emailAddress = null;
      this.userEmailList = [];
      this.getUserByTenantId(this.tenantId);
      this.getBulkUploadHistoryTract();
    }
  }

  getUserName(data, event: any): void {
    if (data === 'emailAddress') {
      this.emailAddress = event;
      this.getBulkUploadHistoryTract();
    }
  }

  search(event: any): void {
    if (this.bulkForm.get('startDate').value && this.bulkForm.get('endDate').value) {
      this.formattedEndTime = this.convertNgbDateToString(this.bulkForm.get('endDate').value, this.endTime);
      this.formattedStartTime = this.convertNgbDateToString(this.bulkForm.get('startDate').value, this.startTime);
      if (new Date(this.formattedStartTime) > new Date(this.formattedEndTime)) {
        this.toastrService.warning(Constants.pleaseSelectTheValidDate);
        return;
      }
    }
    if (this.bulkForm.get('startDate').value && !this.bulkForm.get('endDate').value) {
      this.toastrService.warning(Constants.pleaseSelectTheEndDate);
      return;
    }
    if (!this.bulkForm.get('startDate').value && this.bulkForm.get('endDate').value) {
      this.toastrService.warning(Constants.pleaseSelectTheStartDate);
      return;
    }
    this.getBulkUploadHistoryTract();
  }

  convertNgbDateToString(date: NgbDate, time: string) {
    if (date)
      return `${date.year}-${date.month}-${date.day} ${time}`;
    else
      return "";
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

  getBulkUploadHistoryTract() {
    let data: BulkUploadHistoryFilter = {
      tenantId: this.tenantId,
      emailAddress: this.emailAddress,
      startDateTime: this.formattedStartTime,
      endDateTime: this.formattedEndTime,
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      timeZone: Helper.getTimeZone()
    };
    this.questionsService.getBulkUploadHistory(data).subscribe(res => {
      if (res.result) {
        this.bulkUploadDetails = res.result.bulkUploadQuestionTrack;
        this.totalCount = res.result.totalCount;
        this.totalQuestions = res.result.totalQuestions;
        this.totalMcqCount = res.result.totalMcqCount;
        this.totalStackQuestionCount = res.result.totalStackQuestionCount;
        this.totalCodingQuestionCount = res.result.totalCodingQuestionCount;
      }
    });
  }

  getUserByTenantId(tenantId?: number) {
    this.questionsService.getUserByTenantId(tenantId).subscribe(res => {
      if (res.success)
        this.userEmailList = res.result;
    });
  }

  getTenantDetails(): void {
    this.tenantService.getAllTenants().subscribe(res => {
      if (res.success) {
        this.tenantDetailsList = res.result;
      }
    });
  }

  onDeSelectTenant() {
    this.bulkForm.patchValue({
      emailAddress: null
    });
    this.userEmailList = [];
    this.tenantId = null;
    this.getUserByTenantId();
    this.emailAddress = null;
    this.getBulkUploadHistoryTract();
  }

  reset() {
    this.emailAddress = '';
    this.formattedEndTime = '';
    this.formattedStartTime = '';
    this.bulkForm.reset();
    this.skipCount = 0;
    this.maxResultCount = 10;
    this.pageIndex = 1;
    if (this.userRole === UserRoles[1]) {
      this.tenantId = null;
      this.getUserByTenantId();
    }
    this.getBulkUploadHistoryTract();
  }

  onDeSelectEmail() {
    this.emailAddress = '';
    this.getBulkUploadHistoryTract();
  }

  changeBulkUploadResultPage() {
    this.bulkUploadDetails = [];
    this.skipCount = (this.pageIndex - 1) * this.pageSize;
    this.maxResultCount = this.pageSize;
    this.getBulkUploadHistoryTract();
  }
}
