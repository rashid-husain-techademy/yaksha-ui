import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssessmentScheduleCustomFieldCollectionDto } from '@app/admin/assessment/assessment';
import { IssueSeverity, IssueType } from '@app/enums/test';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import html2pdf from 'html2pdf.js';
import { ToastrService } from 'ngx-toastr';
import { AnalyticsAndTestCaseReportDto, AnalyticsAndTestCaseRequestDto, GitCommitHistory, StackCodeQualityRequestDto, StackMetricsDto, UserTestCaseResults } from '../reports';
import { ReportsService } from '../reports.service';

@Component({
    selector: 'app-stack-report',
    templateUrl: './stack-report.component.html',
    styleUrls: ['./stack-report.component.scss']
})

export class StackReportComponent implements OnInit {
    @Input() data: any;
    @Output() pdfData = new EventEmitter<any>();
    analyticsAndTestCaseReports: AnalyticsAndTestCaseReportDto[] = [];
    issueSeverity = IssueSeverity;
    issueType = IssueType;
    stackCodeQualityMetrics: StackMetricsDto[] = [];
    constants = Constants;
    userId: number;
    userAssessmentAttemptId: number;
    assessmentName: string;
    isReportDownloading: boolean = false;
    assessmentScheduleCustomFieldCollectionDto: AssessmentScheduleCustomFieldCollectionDto;
    isCollaborative: boolean;
    assessmentScheduleId: number;
    gitCommitHistory: GitCommitHistory[] = [];
    isRenderPdf: boolean = false;
    emailAddress: string;

    constructor(private reportService: ReportsService,
        private toastrService: ToastrService,
        private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.assessmentScheduleCustomFieldCollectionDto = new AssessmentScheduleCustomFieldCollectionDto();
        this.assessmentScheduleCustomFieldCollectionDto.customField = [];
        if (this.data) {
            this.userId = this.data.userId;
            this.userAssessmentAttemptId = this.data.userAssessmentAttemptId;
            this.assessmentName = this.data.assessmentName;
            this.assessmentScheduleId = this.data.assessmentScheduleId;
            this.emailAddress = this.data.emailAddress;
            let isCollaborative: string = this.data.isCollaborative;
            this.isCollaborative = isCollaborative === 'true' ? true : false;
            this.isRenderPdf = true;
        }
        else {
            this.activatedRoute.params.subscribe(params => {
                this.userId = parseInt(atob(params['userId']));
                this.userAssessmentAttemptId = parseInt(atob(params['userAttemptId']));
                this.assessmentName = atob(params['assessmentName']);
                this.assessmentScheduleId = parseInt(atob(params['scheduleId']));
                this.emailAddress = atob(params['emailAddress']);
                let isCollaborative: string = atob(params['type']);
                this.isCollaborative = isCollaborative === 'true' ? true : false;
            });
        }

        let data: StackCodeQualityRequestDto = {
            userId: this.userId,
            userAssessmentAttemptId: this.userAssessmentAttemptId
        };
        this.reportService.getStackCodeQualityMetrics(data).subscribe(res => {
            if (res.success && res.result) {
                this.stackCodeQualityMetrics = res.result;
                this.getAnalyticsAndTestCaseReport();
                if (this.stackCodeQualityMetrics[0].customField && this.stackCodeQualityMetrics[0].customField !== null) {
                    this.assessmentScheduleCustomFieldCollectionDto = JSON.parse(this.stackCodeQualityMetrics[0].customField);
                }

            }
        }),
            error => console.error(error);
    }

    getAnalyticsAndTestCaseReport(): void {
        let analyticsAndTestCaseRequestDto: AnalyticsAndTestCaseRequestDto = {
            userAssessmentAttemptId: this.userAssessmentAttemptId,
            assesmentScheduleId: this.assessmentScheduleId,
            userId: this.userId,
            isCollaborativeAssessment: this.isCollaborative,
        };
        this.reportService.getAnalyticsAndTestCaseReport(analyticsAndTestCaseRequestDto).subscribe(res => {
            if (res.success && res.result.length) {
                this.analyticsAndTestCaseReports = res.result;

                this.stackCodeQualityMetrics.forEach(quality => {
                    let analytics = this.analyticsAndTestCaseReports.find(anaytics => anaytics.stackId === quality.stackId);
                    quality['testCaseResultsSummary'] = analytics.testCaseResultsSummary;
                    quality['analyticsReport'] = analytics.analyticsReport;
                    quality['testCaseResultsReport'] = analytics.testCaseResultsReport;
                    quality['userTestCaseResults'] = analytics.userTestCaseResults;
                });

                this.stackCodeQualityMetrics.forEach(item => {
                    this.loadCodeQualityChart(item);
                    this.loadTestCaseStatusChart(item);
                    if (this.isCollaborative) {
                        item.userTestCaseResults.forEach(element => {
                            this.loadUserTestCaseStatusChart(element);
                        });
                    }
                });
                if (this.isCollaborative) {
                    this.getGitCommitHistory();
                }
                else {
                    if (this.isRenderPdf) {
                        setTimeout(() => {
                            this.pdfData.emit();
                        }, 2000);
                    }
                }
            }
        },
            error => {
                this.toastrService.error(Constants.somethingWentWrong);
            });
    }

    loadTestCaseStatusChart(item: StackMetricsDto) {
        item['testCaseStatusChart'] = {
            series: [
                {
                    name: "Fail",
                    data: [item.testCaseResultsSummary.functionalTestCasesFailed, item.testCaseResultsSummary.boundaryTestCasesFailed, item.testCaseResultsSummary.exceptionTestCasesFailed, item.testCaseResultsSummary.businessTestCasesFailed]
                },
                {
                    name: "Pass",
                    data: [item.testCaseResultsSummary.functionalTestCasesPassed, item.testCaseResultsSummary.boundaryTestCasesPassed, item.testCaseResultsSummary.exceptionTestCasesPassed, item.testCaseResultsSummary.businessTestCasesPassed]
                }
            ],
            chart: {
                type: "bar",
                height: 350,
                toolbar: {
                    show: true,
                    tools: {
                        download: false
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    endingShape: "rounded"
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['#b40000', '#00e396']
            },
            legend: {
                markers: {
                    fillColors: ['#b40000', '#00e396']
                }
            },
            xaxis: {
                categories: [
                    "Functional",
                    "Boundary",
                    "Exception",
                    "Business"
                ]
            },
            yaxis: {
                title: {
                    text: "Test Cases"
                }
            },
            fill: {
                opacity: 1,
                colors: ['#b40000', '#00e396']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " test cases";
                    }
                },
                marker: {
                    show: true,
                    fillColors: ['#b40000', '#00e396']
                }
            }
        };
    }

    loadUserTestCaseStatusChart(item: UserTestCaseResults) {
        item['userTestCaseStatusChart'] = {
            series: [
                {
                    name: "Fail",
                    data: [item.functionalTestCasesFailed, item.boundaryTestCasesFailed, item.exceptionTestCasesFailed, item.businessTestCasesFailed]
                },
                {
                    name: "Pass",
                    data: [item.functionalTestCasesPassed, item.boundaryTestCasesPassed, item.exceptionTestCasesPassed, item.businessTestCasesPassed]
                }
            ],
            chart: {
                type: "bar",
                height: 350,
                toolbar: {
                    show: true,
                    tools: {
                        download: false
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    endingShape: "rounded"
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['#b40000', '#00e396']
            },
            legend: {
                markers: {
                    fillColors: ['#b40000', '#00e396']
                }
            },
            xaxis: {
                categories: [
                    "Functional",
                    "Boundary",
                    "Exception",
                    "Business"
                ]
            },
            yaxis: {
                title: {
                    text: "Test Cases"
                }
            },
            fill: {
                opacity: 1,
                colors: ['#b40000', '#00e396']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " test cases";
                    }
                },
                marker: {
                    show: true,
                    fillColors: ['#b40000', '#00e396']
                }
            }
        };
    }

    loadCodeQualityChart(item: StackMetricsDto): void {
        item['codeQualityChartOptions'] = {
            series: [
                {
                    name: "Info",
                    data: [item.infoBugs, item.infoCodeSmells, item.infoVulnerabilites]
                },
                {
                    name: "Minor",
                    data: [item.minorBugs, item.minorCodeSmells, item.minorVulnerabilities]
                },
                {
                    name: "Major",
                    data: [item.majorBugs, item.majorCodeSmells, item.majorVulnerabilities]
                },
                {
                    name: "Critical",
                    data: [item.criticalBugs, item.criticalCodeSmells, item.criticalVulnerabilities]
                },
                {
                    name: "Blocker",
                    data: [item.blockerBugs, item.blockerCodeSmells, item.blockerVulnerabilities]
                }
            ],
            chart: {
                type: "bar",
                height: 350,
                stacked: true,
                toolbar: {
                    show: true,
                    tools: {
                        download: false
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            stroke: {
                width: 1,
                colors: ["#fff"]
            },
            xaxis: {
                categories: ["Bugs", "Code Smells", "Vulnerabilities"],
                labels: {
                    formatter: function (val) {
                        return val;
                    }
                }
            },
            yaxis: {
                title: {
                    text: undefined
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + '';
                    }
                }
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: "top",
                horizontalAlign: "left",
                offsetX: 40
            }
        };
    }

    downloadDocument() {
        window.open(this.stackCodeQualityMetrics[0]?.instructionDocumentLink, "_blank");
    }

    downloadStackReport() {
        this.isReportDownloading = true;
        var options = {
            pageHeight: 300
        };
        html2pdf(document.querySelector("#contentToConvert"), {
            margin: 15,
            filename: `${this.constants.stackReport}_${this.emailAddress}_${new Date().getTime()}.pdf`,
            jsPDF: { format: 'b3', orientation: 'portrait' }
        }).set({
            options
        });
        this.toastrService.success(Constants.reportHasBeenDownloaded);
        this.isReportDownloading = false;
    }

    truncateText(input: string, maxLength: number) {
        if (input.length > maxLength) {
            return input.substring(0, maxLength) + '...';
        }
        return input;
    }

    getGitCommitHistory(): void {
        this.reportService.getGitCommitHistory(this.userAssessmentAttemptId).subscribe(res => {
            if (res.success && res.result.length) {
                this.gitCommitHistory = res.result;
            }
            if (this.isRenderPdf) {
                setTimeout(() => {
                    this.pdfData.emit();
                }, 2000);
            }
        },
            error => console.error(error));
    }

    formattedDateTime(date: Date) {
        if (date) {
            return formatDate(Helper.convertUTCDateToLocalDate(date.toString()), 'MMM d, y, h:mm a', 'en_US');
        }
        else
            return "-";
    }
}
