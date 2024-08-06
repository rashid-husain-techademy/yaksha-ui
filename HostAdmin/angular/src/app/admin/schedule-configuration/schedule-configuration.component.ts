import { Component, Injector, OnInit } from '@angular/core';
import { Constants } from '@app/models/Constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TenantsDto } from '../tenants/tenant-detail';
import { ScheduleConfigurationService } from './schedule-configuration.service';
import { TenantScheduleConfig, TenantScheduleConfigDto, TenantScheduleConfigRequestDto, TenantScheduleRequestDto } from './schedule-configuration.data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppComponentBase } from '../../../shared/app-component-base';

@Component({
  selector: 'app-schedule-configuration',
  templateUrl: './schedule-configuration.component.html',
  styleUrls: ['./schedule-configuration.component.scss']
})
export class ScheduleConfigurationComponent extends AppComponentBase implements OnInit {

  tenantDropDownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };
  constants=Constants;
  tenants: TenantsDto[];
  pageIndex: number = 1;
  maxSize: number = 4;
  pageSize: number = 4;
  totalTenantCount: number;
  tenantConfigs: TenantScheduleConfig[];
  currentTenantId: number;
  tenantScheduleForm: FormGroup;
  editTenantScheduleForm: FormGroup;
  isNoTenantConfigAvailable: boolean = false;
  isEdit: boolean = false;

  constructor(private modalService: NgbModal,
    private toastrService: ToastrService,
    private scheduleConfigurationService: ScheduleConfigurationService,
    private formBuider: FormBuilder,
    injector: Injector
    ) {
      super(injector);
      }

  ngOnInit(): void {
    this.initScheduleConfigForm();
    this.getAllTenants();
    this.getAllTenantScheduleConfigurations();
  }

  initScheduleConfigForm(): void{
    this.tenantScheduleForm = this.formBuider.group({
      tenant: ['', [Validators.required]],
      selectReviewer: [false],
      executionCount: [false],
      enablePlagiarism: [false],
      mockSchedule: [false],
      public: [false],
      invite: [false],
      customFields: [false],
      selfEnrolment: [false]
    });
  }

  initEditScheduleConfigForm(): void{
    this.editTenantScheduleForm = this.formBuider.group({
      editSelectReviewer: [false],
      editExecutionCount: [false],
      editEnablePlagiarism: [false],
      editMockSchedule: [false],
      editCustomFields: [false],
      editPublic: [false],
      editInvite: [false],
      editSelfEnrolment: [false]
    });
  }

  getAllTenants(){
    this.scheduleConfigurationService.getAllTenants().subscribe(res => {
      if(res.result && res.result.length > 0){
        this.tenants = res.result;
      }
    },
    err => console.error(err));
  }

  getAllTenantScheduleConfigurations(){
    let request: TenantScheduleRequestDto = {
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.maxSize
    };
    this.scheduleConfigurationService.getAllTenantScheduleConfiguration(request).subscribe(res => {
      if(res.result && res.result.totalCount > 0){
        this.totalTenantCount = res.result.totalCount;
        this.tenantConfigs = res.result.tenantsScheduleConfig;
      }
      else{
        this.isNoTenantConfigAvailable = true;
        this.totalTenantCount = 0;
        this.tenantConfigs = [];
      }
    },
    err => console.error(err));
  }

  openEditModal(modal: NgbModal, tenantSchedule: any) {
		this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
    this.initEditScheduleConfigForm();
    this.currentTenantId = tenantSchedule.tenantId;
    this.isEdit = true;
    let scheduleConfig = JSON.parse(tenantSchedule.scheduleConfig);
    this.editTenantScheduleForm.patchValue({
      editSelectReviewer: scheduleConfig.SelectReviewers,
      editExecutionCount: scheduleConfig.ExecutionCount,
      editEnablePlagiarism: scheduleConfig.EnablePlagiarism,
      editMockSchedule: scheduleConfig.MockSchedule,
      editPublic: scheduleConfig.PublicSchedule,
      editInvite: scheduleConfig.InviteSchedule,
      editSelfEnrolment: scheduleConfig.SelfEnrollment,
      editCustomFields: scheduleConfig.CustomField
    });
	}

  onModalClose(){
    this.currentTenantId = 0;
    this.isEdit = false;
    this.modalService.dismissAll();
  }

  save(){
    if(!this.isEdit && (this.tenantScheduleForm.controls.tenant.value === null || this.tenantScheduleForm.controls.tenant.value.length === 0)){
      this.toastrService.error(this.constants.pleaseSelectTenant);
      return;
    }
    else if(!this.isEdit && !(this.tenantScheduleForm.controls.public.value) && !(this.tenantScheduleForm.controls.invite.value) && !(this.tenantScheduleForm.controls.selfEnrolment.value)){
      this.toastrService.error(this.constants.pleaseSelectAtleastOneScheduleType);
      return;
    }
    else if(this.isEdit && !(this.editTenantScheduleForm.controls.editPublic.value) && !(this.editTenantScheduleForm.controls.editInvite.value) && !(this.editTenantScheduleForm.controls.editSelfEnrolment.value)){
      this.toastrService.error(this.constants.pleaseSelectAtleastOneScheduleType);
      return;
    }

    let configData : TenantScheduleConfigDto;
    if(!this.isEdit){
      configData = {
        selectReviewers: this.tenantScheduleForm.controls.selectReviewer.value,
        enablePlagiarism : this.tenantScheduleForm.controls.enablePlagiarism.value,
        mockSchedule: this.tenantScheduleForm.controls.mockSchedule.value,
        customField: this.tenantScheduleForm.controls.customFields.value,
        executionCount: this.tenantScheduleForm.controls.executionCount.value,
        publicSchedule: this.tenantScheduleForm.controls.public.value,
        inviteSchedule: this.tenantScheduleForm.controls.invite.value,
        selfEnrollment: this.tenantScheduleForm.controls.selfEnrolment.value
      };
    }
    else{
      configData = {
        selectReviewers: this.editTenantScheduleForm.controls.editSelectReviewer.value,
        enablePlagiarism : this.editTenantScheduleForm.controls.editEnablePlagiarism.value,
        mockSchedule: this.editTenantScheduleForm.controls.editMockSchedule.value,
        customField: this.editTenantScheduleForm.controls.editCustomFields.value,
        executionCount: this.editTenantScheduleForm.controls.editExecutionCount.value,
        publicSchedule: this.editTenantScheduleForm.controls.editPublic.value,
        inviteSchedule: this.editTenantScheduleForm.controls.editInvite.value,
        selfEnrollment: this.editTenantScheduleForm.controls.editSelfEnrolment.value
      };
    }

    let request : TenantScheduleConfigRequestDto = {
      tenantId: this.isEdit? this.currentTenantId : this.tenantScheduleForm.controls.tenant.value[0].id,
      scheduleConfig: configData
    };
    this.scheduleConfigurationService.createOrUpdateScheduleConfig(request).subscribe(res => {
      if(res.result){
        this.toastrService.success(this.constants.scheduleConfigurationHasBeenUpdatedSuccessfullyForTheTenant);
        this.tenantScheduleForm.reset();
        this.isEdit = false;
        this.isNoTenantConfigAvailable = false;
        this.getAllTenantScheduleConfigurations();
        this.onModalClose();
      }
    }, err => console.error(err));
  }

  deleteScheduleConfiguration(tenantConfig: any){
    abp.message.confirm(
      this.l('ScheduleConfigDeletionWarningMessage', `${this.constants.thisWillEnableAllTheScheduleConfiguration} ${tenantConfig.tenantName}. ${this.constants.areYouSureYouWantToDelete}` ),
      (result: boolean) => {
        if (result) {
          this.scheduleConfigurationService.deleteTenantScheduleConfig(tenantConfig.tenantId).subscribe(res => {
            if(res.result){
              this.toastrService.success(this.constants.scheduleConfigurationHasBeenDeletedSuccessfully);
              this.getAllTenants();
              this.getAllTenantScheduleConfigurations();
            }
          },
          err => console.error(err));
        }
      });
  }

  changePage(){
    this.getAllTenantScheduleConfigurations();
  }
}
