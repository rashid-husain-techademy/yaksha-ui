import { UserAssessmentStatus } from './../../enums/test';
import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../models/constants';
import { TestService } from '../test.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TestTerminationComponent } from '../test-termination/test-termination.component';
import { PostAssessmentResult, ProgressFilter } from '../field';
import { CookieService } from 'ngx-cookie-service';
import { UtilsService } from 'abp-ng2-module';
import { dataService } from '@app/service/common/dataService';


@Component({
  selector: 'app-post-assessment-page',
  templateUrl: './post-assessment-page.component.html',
  styleUrls: ['./post-assessment-page.component.scss']
})

export class PostAssessmentPageComponent extends AppComponentBase implements OnInit, OnDestroy {
  constants = Constants;
  tenantId: number;
  userId: number;
  assessmentScheduleId: number;
  postAssessmentResult: PostAssessmentResult;
  remainingAttempts: number;
  resultMessage: string;
  isUserFailed: boolean = false;
  proctoringViolationMessage: string = '';
  userRole: string;
  authUser: boolean = false;
  sourceOfSchedule: string;
  isCustomThemeEnabled: boolean = false;
  isABInBev: boolean = false;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private testService: TestService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private _utilsService: UtilsService,
    private dataService: dataService,
    injector: Injector) {
    super(injector);
    if (window.location !== window.parent.location) {
      // in iframe
    } else {
      window.location.hash = "no-back-button";
      window.location.hash = "Again-No-back-button";
      window.onhashchange = function () { window.location.hash = "no-back-button"; };
    }
  }

  ngOnInit(): void {
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = true;
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    this.sourceOfSchedule = localStorage.getItem(Constants.sourceOfSchedule);
    if (bool === "true")
      this.authUser = true;
    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const assessment = atob(params['assessment']).split('/');
        this.assessmentScheduleId = parseInt(assessment[0]);
        this.userId = parseInt(assessment[1]);
        this.tenantId = parseInt(assessment[2]);
        this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
        this.isABInBev = this.dataService.checkCustomThemeForAbinBev(this.tenantId);  
        let isProctoringViolated = assessment[3];
        if (isProctoringViolated === Constants.trueLabel) {
          this.proctoringViolationMessage = assessment[4];
          this.showTestTerminationModal();
        }
        this.getAssessmentResult();
      }
    });
  }

  showTestTerminationModal() {
    const modalRef = this.modalService.open(TestTerminationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.proctoringViolationMessage = this.proctoringViolationMessage;
  }

  getAssessmentResult() {
    let data: ProgressFilter = {
      tenantId: this.tenantId,
      userId: this.userId,
      assessmentScheduleId: this.assessmentScheduleId,
      attemptId: parseInt(localStorage.getItem(Constants.attemptId)),
      attemptNumber: parseInt(localStorage.getItem(Constants.attemptNumber))
    };
    this.testService.getPostAssessmentResults(data).subscribe(res => {
      this.postAssessmentResult = res.result;
      this.postAssessmentResult.cutOffPercentage = Math.floor((this.postAssessmentResult.cutOffMark / this.postAssessmentResult.assessmentTotalScore) * 100.0);
      this.postAssessmentResult.earnedPercentage = Math.floor((this.postAssessmentResult.userEarnedScore / this.postAssessmentResult.assessmentTotalScore) * 100.0);
      this.postAssessmentResult.questionsSkipped = this.postAssessmentResult.assessmentTotalQuestions - this.postAssessmentResult.totalAnswered;
      this.postAssessmentResult.userAssessmentDuration = Math.ceil(this.postAssessmentResult.userAssessmentDuration);
      this.postAssessmentResult.remainingAttempts = this.postAssessmentResult.maxAttempts - this.postAssessmentResult.availedAttempts;

      if (this.postAssessmentResult.userLatestAttemptStatus === UserAssessmentStatus.Failed) {
        this.isUserFailed = true;
        this.resultMessage = (this.postAssessmentResult.remainingAttempts > 0) ? `${Constants.assessmentRetryMessage} ${this.postAssessmentResult.remainingAttempts} ${Constants.moreAttemptsRemaining}` : Constants.maxAttemptsReached;
      }
      else {
        this.resultMessage = Constants.congratulations;
      }
      if (!this.authUser) {
        this.cookieService.delete(this.constants.abpAuthToken, "/");
      }
    });
  }

  navigateToRetryAttempt() {
    let queryParam = this.postAssessmentResult.assessmentScheduleIdNumber + '/' + this.tenantId + '/' + this.postAssessmentResult.userEmailAddress;
    queryParam = btoa(queryParam);
    this.router.navigate(['../../../../account/test-taker/pre-assessment', queryParam], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy() {
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    elementStyleSheet.disabled = false;
  }
}
