import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { Constants } from '@app/models/constants';
import { CloudCredentialResponseDto, QuestionDetailDto, TestcasesResult, ValidateCloudTestCases } from '@app/test-taker/field';
import { dataService } from '@app/service/common/dataService';
import { QuestionStatus, TestCaseResultStatus } from '@app/enums/test';
import { TestService } from '@app/test-taker/test.service';
import { Helper } from '@app/shared/helper';
import { AbpSessionService } from 'abp-ng2-module';
import { TestComponent } from '@app/test-taker/test/test.component';
import { TenantHelper } from '@shared/helpers/TenantHelper';

@Component({
  selector: 'app-cloud-assessment',
  templateUrl: './cloud-assessment.component.html',
  styleUrls: ['./cloud-assessment.component.scss']
})
export class CloudAssessmentComponent implements OnInit, OnDestroy {
  field: QuestionDetailDto;
  plainQuestion: string;
  questionText: string;
  constants = Constants;
  isHtmlCss: boolean = false;
  replaceQuestion: string;
  calculateDuration: NodeJS.Timeout;
  testCaseDetails: TestcasesResult[];
  formControlName: string;
  questionDetails: QuestionDetailDto;
  testcasestatus = TestCaseResultStatus;
  cloudCredentials: CloudCredentialResponseDto = {
    cloudUserName: 'Cloud UserName',
    cloudPassword: 'Cloud Password'
  };

  timeZone: string = Helper.getTimeZone();
  azureBaseUrl = TenantHelper.getEnvironmentBasedValue("azureBaseUrl");

  questionsStatus: any[] = [
    { "status": QuestionStatus.Unread, "count": 0, "class": "outline-secondary", "label": Constants.unread },
    { "status": QuestionStatus.Attempted, "count": 0, "class": "success", "label": Constants.attempted },
    { "status": QuestionStatus.MarkedForReview, "count": 0, "class": "warning", "label": Constants.forReview },
    { "status": QuestionStatus.Skipped, "count": 0, "class": "danger", "label": Constants.skipped }];
  constructor(
    public dataService: dataService,
    public testService: TestService,
    public abpSession: AbpSessionService,
    @Optional() public testComponent: TestComponent
  ) { }

  ngOnInit(): void {
    this.plainQuestion = this.field.questionText;


    if (this.plainQuestion.substring(0, 3) === '<p>')
      this.replaceQuestion = this.plainQuestion.replace(this.plainQuestion.substring(0, 3), '<p>Q' + this.field.serialNumber + '. ');
    else
      this.replaceQuestion = 'Q' + this.field.serialNumber + '. ' + this.field.questionText;

    this.questionText = this.replaceQuestion;
    clearInterval(this.dataService.calculateDuration);
    this.dataService.calculateDuration = setInterval(() => {
      this.field.duration += 1;
    }, 1000);

    this.dataService.startTimer(this.field.questionId);

    this.formControlName = `question${this.field.questionId}`;
    this.questionDetails = this.field;
    this.testCaseDetails = this.field.testCases;
    if (!this.field.isPreview) {
      this.getCloudCredentials();
    }
  }

  getCloudCredentials() {
    this.testService.getCloudCredentials(this.questionDetails.assessmentScheduleId).subscribe(res => {
      if (res.result) {
        this.cloudCredentials = res.result;
        this.field.questionStatus = QuestionStatus.Attempted;
        this.questionsStatus.find(x => x.status === QuestionStatus.Attempted).count += 1;
        this.testComponent.questionsStatus = this.questionsStatus;
      }
    },
      err => console.error(err));
  }

  validateTestCases() {
    let request: ValidateCloudTestCases = {
      userAssessmentAttemptId: this.questionDetails.userAssessmentAttemptId,
      questionId: this.questionDetails.questionId,
      timeZone: this.timeZone,
      cloudUserName: this.cloudCredentials.cloudUserName
    };
    this.testService.validateTestCases(request).subscribe(res => {
      if (res.result) {
        this.testCaseDetails.forEach(x => {
          x.actualOutput = res.result[x.id];
        });
        this.field.questionStatus = QuestionStatus.Attempted;
      }
    },
      err => console.error(err));
  }

  openIde(): void {
    window.open(this.azureBaseUrl, '_blank');
  }

  copyPassword() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.cloudCredentials.cloudPassword;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
  copyUsername() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.cloudCredentials.cloudUserName;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
  ngOnDestroy() {
    clearInterval(this.calculateDuration);
  }
}
