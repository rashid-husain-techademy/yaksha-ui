import { QuestionStatus } from '@app/enums/test';
import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '@app/models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  constants = Constants;
  @Input() public questionsStatus: any[] = [];
  attempted: number = 0;
  assessmentScheduleId: number = 0;
  markedForReview: number = 0;
  skipped: number = 0;
  unread: number = 0;
  currentTenantId: number = this.appSessionService.tenantId;
  currentUserId: number = this.appSessionService.userId;
  @Input() submit: Function;
  @Input() isExecuteAndSubmit: boolean = false;
  @Input() isMoveOtherQuestion: boolean = false;
  @Input() isResetQuestion: boolean = false;
  @Input() isSubmitAdaptiveAssessment: boolean = false;
  @Input() leave: Function;
  @Input() isDynamicMessageConfirmation: Function;
  @Input() inputMessage: Function;
  sourceOfSchedule: string;

  constructor(
    private modalService: NgbModal,
    private appSessionService: AppSessionService
  ) { }

  ngOnInit(): void {
    if (this.questionsStatus !== null) {
      this.attempted = this.questionsStatus.find(x => x.status === QuestionStatus.Attempted)?.count;
      this.markedForReview = this.questionsStatus.find(x => x.status === QuestionStatus.MarkedForReview)?.count;
      this.skipped = this.questionsStatus.find(x => x.status === QuestionStatus.Skipped)?.count;
      this.unread = this.questionsStatus.find(x => x.status === QuestionStatus.Unread)?.count;
    }
    this.sourceOfSchedule = localStorage.getItem(Constants.sourceOfSchedule);
  }

  close(): void {
    this.modalService.dismissAll();
    if (this.isSubmitAdaptiveAssessment)
      this.leave();
  }

  submitAssessment() {
    this.modalService.dismissAll();
    this.submit();
  }

  leaveQuestion() {
    this.modalService.dismissAll();
    this.leave();
  }

  saveAnswer() {
    this.modalService.dismissAll();
    this.submit();
  }
}
