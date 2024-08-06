import { Component, HostListener, Injector, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Helper } from '@app/shared/helper';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../models/constants';
import { TestTerminationComponent } from '../test-termination/test-termination.component';
import { UserDto } from '@app/admin/users/users';
import { CookieService } from 'ngx-cookie-service';
import { UtilsService } from 'abp-ng2-module';
import { dataService } from '@app/service/common/dataService';
import { AssessmentType } from '@app/enums/assessment';
import { HackathonLeaderBoard, HackathonLeaderBoardRequest } from '@app/admin/assessment/assessment';
import { AssessmentService } from '@app/admin/assessment/assessment.service';
import { ToastrService } from 'ngx-toastr';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { finalize } from 'rxjs/operators';
import { TestService } from '../test.service';
declare function stopcamera(): any;


@Component({
  selector: 'app-post-assessment',
  templateUrl: './post-assessment.component.html',
  styleUrls: ['./post-assessment.component.scss']
})

export class PostAssessmentComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantId: number;
  userId: number;
  assessmentScheduleId: number;
  assessmentTitle: string;
  timeUtilized: string;
  attempted: number;
  skipped: number;
  markedForReview: number;
  proctoringViolationMessage: string = '';
  userName: string;
  surName: string;
  emailAddress: string;
  user: UserDto;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  remainingAttempts: number;
  userRole: string;
  authUser: boolean = false;
  showLeaderBoard: string;
  assessmentId: number;
  showLeaderBoardOnly: boolean = false;
  hackathonLeaderBoard: HackathonLeaderBoard;
  isCustomThemeEnabled: boolean = false;
  isTenantLogoLoaded: boolean = false;
  campaignName: string;
  feedbackEnabled: boolean = false;
  isABInBev: boolean = false;
  isInfosys: boolean = false;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private _utilsService: UtilsService,
    private dataService: dataService,
    private assessmentService: AssessmentService,
    private testService: TestService,
    private toastrService: ToastrService,
    private tenantService: TenantsService,
    private renderer: Renderer2,
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
    this.tenantId = this.appSession.tenantId;
    this.isInfosys = this.dataService.checkTenantId(this.tenantId) === 'Infosys' ? true : false;
    if (localStorage.getItem(Constants.chatbot)) {
      if (!document.getElementById('chatbot') && !this.isInfosys) {
        let chatbotConfig = JSON.parse(localStorage.getItem(Constants.chatbot));

        if (!chatbotConfig.iscustomArgs && !chatbotConfig.isIrisIntegrated && !chatbotConfig.disableCaptcha) {
          this.loadJsScript("assets/chatbot/chatbot-script.js");
          const element = document.querySelector('[data-id="zsalesiq"]');
          if (element)
            this.renderer.setStyle(element, 'display', 'block');
        }
      }
    };
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    if (bool === "true")
      this.authUser = true;
    this.activatedRoute.params.subscribe(params => {
      if (params['assessment']) {
        const assessment = atob(params['assessment']).split('/');
        this.assessmentScheduleId = parseInt(assessment[0]);
        if (assessment.length === 8) {
          this.userId = parseInt(assessment[1]);
          this.tenantId = parseInt(assessment[2]);
          this.showLeaderBoard = assessment[3].toLowerCase();
          this.assessmentId = parseInt(assessment[4]);
          if (this.showLeaderBoard === Constants.trueLabel) {
            this.showLeaderBoardOnly = true;
          }
          this.userName = assessment[5];
          this.surName = assessment[6];
          this.emailAddress = assessment[7];
        }
        else {
          this.timeUtilized = Helper.secondsToHm(parseFloat(parseFloat(assessment[1]).toFixed(2)));
          this.attempted = parseInt(assessment[2]);
          this.skipped = parseInt(assessment[3]);
          this.markedForReview = parseInt(assessment[4]);
          this.assessmentTitle = atob(assessment[5]);
          this.userName = assessment[8];
          this.surName = assessment[9];
          this.emailAddress = assessment[10];
          let isProctoringViolated = assessment[6];
          this.remainingAttempts = isNaN(parseInt(assessment[12])) ? 0 : parseInt(assessment[12]);
          if (isProctoringViolated === Constants.trueLabel) {
            this.proctoringViolationMessage = assessment[7];
            this.showTestTerminationModal();
          }
          let assessmentType = parseInt(assessment[13]);
          if (assessmentType === AssessmentType.Hackathon) {
            this.showLeaderBoard = 'true';
          }
          this.assessmentId = parseInt(assessment[14]);
          this.campaignName = assessment[15];
        }
        this.getFeedbackEnabled(this.assessmentScheduleId);
        this.getLeaderBoardDetails();
      }
    });

    if (!this.authUser) {
      this.cookieService.delete(this.constants.abpAuthToken, "/");
    }
    if (this.tenantId) {
      this.isABInBev = this.dataService.checkCustomThemeForAbinBev(this.tenantId);
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
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
    else {
      this.isTenantLogoLoaded = true;
    }
  }

  public loadJsScript(src: string): HTMLScriptElement {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.id = 'chatbot';
    this.renderer.appendChild(window.document.body, script);
    return script;
  }

  showTestTerminationModal() {
    const modalRef = this.modalService.open(TestTerminationComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.proctoringViolationMessage = this.proctoringViolationMessage;
  }

  getFeedbackEnabled(assessmentScheduleId: number) {
    this.testService.getFeedbackSetting(assessmentScheduleId).subscribe(res => {
      this.feedbackEnabled = res.result;
    })
  }
  
  feedback() {   
    window.open("https://forms.office.com/pages/responsepage.aspx?id=S3NAdWflw0aa0-yfueUBQGZ6FxP9XSxMgK7FFEwq13JUME8xQ0dNU0lCM1QxVkE0V1E4NDNDMExJUS4u&web=1&wdLOR=cEAED3980-5D24-46E0-BD54-956AB9974410");
  }

  getLeaderBoardDetails() {
    let leaderBoardRequest: HackathonLeaderBoardRequest = {
      AssessmentId: this.assessmentId,
      AssessmentScheduleId: this.assessmentScheduleId,
      SkipCount: 0,
      MaxResultCount: 20
    };

    this.assessmentService.getLeaderBoardDetails(leaderBoardRequest).subscribe(res => {
      if (res && res.result) {
        this.hackathonLeaderBoard = res.result;
        if (res.result.leaderBoardDetails !== null) {
          this.hackathonLeaderBoard.leaderBoardDetails.forEach(item => {
            item['convertedDuration'] = Helper.secondsToHm(item.duration);
          });
        }
      }
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
      });
  }
}
