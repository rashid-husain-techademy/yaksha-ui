import { Component, OnInit } from '@angular/core';
import { Constants } from '../../../models/constants';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../assessment.service';
import { ExtraTimeUsers } from '../assessment';
import { NavigationService } from '@app/service/common/navigation.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-extra-time',
  templateUrl: './extra-time.component.html',
  styleUrls: ['./extra-time.component.scss']
})
export class ExtraTimeComponent implements OnInit {
  constants = Constants;
  selectAll: boolean = false;
  isSaveAllEnabled: boolean = false
  scheduleId: number = 0;
  tenantId: number = 0;
  listUsersExtraTime: ExtraTimeUsers[] = [];
  extraTime: number = 0;
  searchString: string = '';
  isCampaign: boolean = false;

  constructor(private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private navigationService: NavigationService,
    private toastrService: ToastrService,) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.scheduleId = JSON.parse(atob(params['id']));
      this.tenantId = JSON.parse(atob(params['tenantId']));
      this.isCampaign = JSON.parse(atob(params['campaign']));
    });
    this.getLatestPendingAssessment();
  }

  getLatestPendingAssessment() {
    if (!this.isCampaign) {
      this.assessmentService.getSchedulePendingUsers(this.scheduleId, this.tenantId, encodeURIComponent(this.searchString)).subscribe(res => {
        if (res.result) {
          this.listUsersExtraTime = res.result;
        }
      });
    } else {
      this.assessmentService.getCampaignSchedulePendingUsers(this.scheduleId, this.tenantId, encodeURIComponent(this.searchString)).subscribe(res => {
        if (res.result) {
          this.listUsersExtraTime = res.result;
        }
      });
    }
  }

  selectAllRows() {
    for (let item of this.listUsersExtraTime) {
      item.selected = this.selectAll;
    }
    // Check if any row is selected
    this.isSaveAllEnabled = this.listUsersExtraTime.some(item => item.selected);

    // Disable individual row Save buttons when at least one row is checked
    if (this.isSaveAllEnabled) {
      this.listUsersExtraTime.forEach(item => item.disableSaveButton = true);
    } else {
      this.listUsersExtraTime.forEach(item => item.disableSaveButton = false);
    }
  }
  onRowCheckboxChange(): void {
    // Check if any row is selected
    this.isSaveAllEnabled = this.listUsersExtraTime.some(item => item.selected);
    this.selectAll = false;

    // Disable individual row Save buttons when at least one row is checked
    if (this.isSaveAllEnabled) {
      this.listUsersExtraTime.forEach(item => item.disableSaveButton = true);
    } else {
      this.listUsersExtraTime.forEach(item => item.disableSaveButton = false);
    }
  }

  onSave(selectedExtraTime: ExtraTimeUsers) {
    if (selectedExtraTime != null && selectedExtraTime.extendTime >= selectedExtraTime.extraTime) {
      selectedExtraTime.extraTime = selectedExtraTime.extendTime;
      var extraTimeData: ExtraTimeUsers[] = [];
      extraTimeData.push(selectedExtraTime);
      this.assessmentService.updateExtraTime(extraTimeData).subscribe(res => {
        if (res.result) {
          this.getLatestPendingAssessment();
          this.toastrService.success(selectedExtraTime.name + Constants.userExtraTimeUpdate);
        }
        else
          this.toastrService.error(selectedExtraTime.name + Constants.errorExtraTimeUpdate);
      });
    }
    else {
      this.toastrService.warning(Constants.extraTimeShouldBeGreater);
    }
  }

  onSaveAll() {
    if (this.extraTime && this.extraTime > 0) {
      const allExtendTimesGreaterThanExtraTimes = this.listUsersExtraTime.every(user => this.extraTime > user.extraTime);
      if (allExtendTimesGreaterThanExtraTimes) {
        this.listUsersExtraTime.forEach(user => {
          user.extraTime = this.extraTime;
        });
        this.assessmentService.updateExtraTime(this.listUsersExtraTime).subscribe(res => {
          if (res.result) {
            this.getLatestPendingAssessment();
            this.toastrService.success(Constants.extraTimeUpdateSuccess);
          }
          else
            this.toastrService.error(Constants.extraTimeUpdateFailed);
        });
      }
      else {
        this.toastrService.warning(Constants.extraTimeShouldBeGreater);
      }
    }
    else
      this.toastrService.success(Constants.extraTimeIsRequired);
  }

  close(): void {
    this.navigationService.goBack();
  }

  search() {
    this.getLatestPendingAssessment();
  }

  reset() {
    this.searchString = '';
    this.getLatestPendingAssessment();
  }
}
