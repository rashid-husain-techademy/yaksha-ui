import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import html2pdf from 'html2pdf.js';
import { AeyeProctoringReportRequest, ReportChatHistory, ReportTestTakerData, RuleViolations } from '../reports';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-aeye-proctor-report',
  templateUrl: './aeye-proctor-report.component.html',
  styleUrls: ['./aeye-proctor-report.component.scss']
})
export class AeyeProctorReportComponent implements OnInit {
  reportDetails: AeyeProctoringReportRequest;
  pageSizes: number[] = [5, 10, 20, 30];
  pageIndex = 1;
  pageSize = 5;
  maxSize: number = 5;
  userReports: any;
  contentToDownload = { sec1: [], sec2: [], sec3: [], sec4: [], sec5: [], sec6: [], sec7: [], sec8: [], sec9: [] };
  constants = Constants;
  testTakerData: ReportTestTakerData;
  userRuleViolatios: RuleViolations[] = [];
  totalRuleViolations: number;
  chatHistory: ReportChatHistory[] = [];

  constructor(
    private reportService: ReportsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.get('reportDetails')) {
        let input = atob(paramMap.get('reportDetails'));
        this.reportDetails = JSON.parse(input);
        this.getReportDetails();
        this.getUserViolations();
        this.getContentToDownload();
      }
    });
  }

  getContentToDownload() {
    const data: AeyeProctoringReportRequest = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber,
      skipCount: 0,
      maxResultCount: 50
    };
    this.reportService.getAeyeUserViolations(data).subscribe(res => {
      if (res.success && res.result) {
        const response = JSON.parse(res.result).data.results;
        this.contentToDownload.sec1 = response.slice(0, 5);
        this.contentToDownload.sec2 = response.slice(5, 12);
        this.contentToDownload.sec3 = response.slice(12, 18);
        this.contentToDownload.sec4 = response.slice(18, 24);
        this.contentToDownload.sec5 = response.slice(24, 30);
        this.contentToDownload.sec6 = response.slice(30, 36);
        this.contentToDownload.sec7 = response.slice(36, 42);
        this.contentToDownload.sec8 = response.slice(42, 48);
        this.contentToDownload.sec9 = response.slice(48, 50);
      }
    },
      error => console.error(error));
  }

  getRuleBasedScore(ruleName: string): number {
    return this.userRuleViolatios.filter(x => x.rule_tag === ruleName)[0].violation_count;
  }

  getUserViolations() {
    const data: AeyeProctoringReportRequest = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber,
      skipCount: this.pageIndex,
      maxResultCount: this.pageSize
    };
    this.reportService.getAeyeUserViolations(data).subscribe(res => {
      if (res.success && res.result) {
        this.userReports = JSON.parse(res.result).data;
      }
    },
      error => console.error(error));
  }

  getReportDetails() {
    const data: AeyeProctoringReportRequest = {
      scheduleId: this.reportDetails.scheduleId,
      userEmail: this.reportDetails.userEmail,
      attemptNumber: this.reportDetails.attemptNumber
    };
    this.reportService.getAeyeReportDetails(data).subscribe(res => {
      if (res.success && res.result) {
        const response = JSON.parse(res.result).data;
        this.testTakerData = response.test_taker_data;
        this.userRuleViolatios = response.rule_violations;
        this.totalRuleViolations = response.total_rule_violations;
        this.chatHistory = response.chat_history;
      }
    },
      error => console.error(error));
  }

  downloadPDF() {
    document.getElementById("content").removeAttribute("hidden");
    var elementStyleSheet = document.getElementById("aeyeStyleSheet") as HTMLLinkElement;
    this.handleStyleSheet(true, elementStyleSheet);

    var element = document.querySelector("#content");
    var opt = {
      margin: 15,
      filename: `${this.constants.assessmentReport}_${this.reportDetails.userEmail}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.20 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { format: 'b3', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      this.handleStyleSheet(false, elementStyleSheet);
      document.getElementById("content").setAttribute("hidden", "true");
    });
  }

  handleStyleSheet(value: boolean, element: HTMLLinkElement) {
    if (element)
      element.disabled = value;
  }

  loadPage() {
    this.getUserViolations();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getUserViolations();
  }

  reviewSession(): void {
    this.router.navigate(['../../review-session', btoa(JSON.stringify(this.reportDetails))], { relativeTo: this.activatedRoute });
  }

}
