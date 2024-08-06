import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { AeyeProctoringReportRequest, AeyeUserFullVideo, AeyeVideoRequestDto, ProctorStatus, ReviewSessionUserDetails, SessionAlertData } from '../reports';
import { ReportsService } from '../reports.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProctoringStatus } from '@app/enums/assessment';

@Component({
  selector: 'app-aeye-review-session',
  templateUrl: './aeye-review-session.component.html',
  styleUrls: ['./aeye-review-session.component.scss']
})
export class AeyeReviewSessionComponent implements OnInit {
  reportDetails: AeyeProctoringReportRequest;
  sessionAlerts: SessionAlertData[] = [];
  userDetails: ReviewSessionUserDetails;
  constants = Constants;
  reportClipDetails: any;
  chatHistory: any;
  @ViewChild('rejectReasonModal') rejectReasonModal: ElementRef;
  rejectReason: string = null;
  proctoringStatus = ProctoringStatus;
  modalMessage: string;
  modalTitle: string;
  modalPlaceholder: string;
  selectedStatus: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportsService,
    private toastrService: ToastrService,
    public modalService: NgbModal) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.get('reportDetails')) {
        let input = atob(paramMap.get('reportDetails'));
        this.reportDetails = JSON.parse(input);
        this.getAlerts();
        this.getReviewSessionDetails();
      }
    });
  }

  getReviewSessionDetails() {
    const data: AeyeProctoringReportRequest = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber
    };
    this.reportService.getReviewSessionDetails(data).subscribe((res) => {
      if (res?.result && res?.success) {
        const response = JSON.parse(res?.result).data;
        this.userDetails = response.test_taker_details;
        this.chatHistory = response.chat_history;
      }
    });
  }

  getAlerts() {
    const data: AeyeProctoringReportRequest = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber
    };
    this.reportService.getSessionAlerts(data).subscribe((res) => {
      if (res?.result && res?.success) {
        this.sessionAlerts = JSON.parse(res?.result).data;
      }
    });
  }

  profileReport() {
    this.router.navigate(['../../user-reports', btoa(JSON.stringify(this.reportDetails))], { relativeTo: this.activatedRoute });
  }

  loadVideo(alert: SessionAlertData) {
    const data: AeyeVideoRequestDto = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      imageName: alert?.media_blob_name?.split('?')[0]?.split('/')?.filter(d => d.includes('img_'))[0],
      attemptNumber: this.reportDetails.attemptNumber
    };

    this.reportService.getVideoURL(data).subscribe((res) => {
      if (res?.result && res?.success) {
        this.reportClipDetails = JSON.parse(res?.result).data;
      }
    });
  }

  getFullVideo() {
    let data: AeyeUserFullVideo = {
      userEmail: this.reportDetails.userEmail,
      userExamId: this.reportDetails.scheduleId
    };
    this.reportService.getFullVideo(data).subscribe((res) => {
      if (res && res.result) {
        let result = JSON.parse(res?.result);
        if (result)
          this.toastrService.info(Constants.videoExtractionInProgressweWillSendVideoThroughMail);
      }
    });
  }

  updateProctorStatus() {
    const status = this.selectedStatus;
    if (this.rejectReason === null) {
      this.toastrService.error(Constants.reasonIsRequiredtoApproveOrRejectTheCandidateReport);
      return;
    }
    const data: ProctorStatus = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber,
      proctorStatus: status === ProctoringStatus.Approved ? Constants.approved : Constants.rejected,
      rejectedReason: this.rejectReason
    };
    this.reportService.updateProctorStatus(data).subscribe((res) => {
      if (res && res.success) {
        this.toastrService.success(Constants.candidateProctoringStatusUpdatedSuccessfully);
        this.userDetails.proctoring_result = JSON.parse(res.result)?.data?.proctoring_result;
        this.closeModal();
      }
    });
  }

  openRejectReasonModal(status: number) {
    this.rejectReason = null;
    this.selectedStatus = status;
    this.modalService.open(this.rejectReasonModal, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    this.modalTitle = `${status === ProctoringStatus.Approved ? Constants.approve : Constants.reject} Candidate`;
    this.modalMessage = `Proctoring will be marked '${status === ProctoringStatus.Approved ? Constants.approved : Constants.rejected}' for the candidate. This action is not reversible`;
    this.modalPlaceholder = `Reason to ${status === ProctoringStatus.Approved ? Constants.approve : Constants.reject}`;
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
