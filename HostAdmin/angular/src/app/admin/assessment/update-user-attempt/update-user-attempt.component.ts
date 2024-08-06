import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../assessment.service';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { UpdateUserAttempt, UserAttemptDetailsDto } from '../assessment';
import { NavigationService } from '@app/service/common/navigation.service';
import { UserAssessmentStatus } from '@app/enums/assessment';


@Component({
  selector: 'app-update-user-attempt',
  templateUrl: './update-user-attempt.component.html',
  styleUrls: ['./update-user-attempt.component.scss']
})
export class UpdateUserAttemptComponent implements OnInit {
  constants = Constants;
  scheduleId: number = 0;
  tenantId: number = 0;
  userAttemptDetailsDto: UserAttemptDetailsDto[];
  increaseAttemptBy: number;
  attemptCount: number = 0;
  rowIndex: number;
  status = UserAssessmentStatus;


  constructor(private activateRoute: ActivatedRoute,
    private assessmentService: AssessmentService,
    private toastrService: ToastrService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe(params => {
      this.scheduleId = JSON.parse(atob(params['id']));
      this.tenantId = JSON.parse(atob(params['tenantId']));

    });
    this.getUserAssessmentAttemptDetails(this.scheduleId, this.tenantId);
  }

  getUserAssessmentAttemptDetails(scheduleId: number, tenantId: number) {
    this.assessmentService.getUserAssessmentAttemptDetails(scheduleId, tenantId).subscribe(res => {
      if (res.result) {
        if (res.result.errorMessage != null) {
          this.toastrService.error(res.result.errorMessage);
        } else {
          this.userAttemptDetailsDto = res.result.userAssessmentAttemptResponseDtos;
        }
      }
    });
  }

  increaseUserAttemptBy(event: any, index: number): void {
    this.attemptCount = Number.parseInt(event.target.value);
    this.rowIndex = index;

  }

  updateUserAttemptCount(userAttemptDetailsDto: UserAttemptDetailsDto, index: number) {
    if (this.rowIndex !== index || this.attemptCount === null || this.attemptCount <= 0 || this.attemptCount > 9) {
      this.toastrService.error(this.constants.attemptCountErrorMessage + index + " for user " + userAttemptDetailsDto.emailAddress);
      this.increaseAttemptBy = null;
    } else if ((userAttemptDetailsDto.maxAttempt + this.attemptCount) > this.constants.attemptThreshold) {
      this.toastrService.error(this.constants.attemptThresholdMessage);
    }
    else {
      let data: UpdateUserAttempt = {
        tenantId: this.tenantId,
        userEmail: userAttemptDetailsDto.emailAddress,
        scheduleId: this.scheduleId,
        updateAttemptCountBy: this.attemptCount
      };
      this.assessmentService.updateUserAssessmentAttempt(data).subscribe(res => {
        if (res.result.errorMessage != null && !res.result.isSuccess)
          this.toastrService.error(res.result.errorMessage);
        else {
          this.increaseAttemptBy = null;
          this.toastrService.success(this.constants.userAttemptUpdateSuccessful);
          this.getUserAssessmentAttemptDetails(this.scheduleId, this.tenantId);
        }
      });
    }
  }

  close() {
    this.navigationService.goBack();
  }

  checkAttemptIncrease(userAttemptDetailsDto: UserAttemptDetailsDto, index: number): boolean {
    return userAttemptDetailsDto.maxAttempt >= this.constants.attemptThreshold;
  }

}
