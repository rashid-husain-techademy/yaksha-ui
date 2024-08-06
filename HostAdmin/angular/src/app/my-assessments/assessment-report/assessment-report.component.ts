import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserAssessmentStatus } from '@app/enums/assessment';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { AppComponentBase } from '@shared/app-component-base';
import { AssessmentProgressFilter, SectionScore, SkillsScore, UserAssessmentProgressDetails } from '../my-assessments';
import { MyAssessmentsService } from '../my-assessments.service';
import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions
} from 'ng-apexcharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';
export interface AssessmentResultChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;

}
@Component({
  selector: 'app-assessment-report',
  templateUrl: './assessment-report.component.html',
  styleUrls: ['./assessment-report.component.scss']
})
export class AssessmentReportComponent extends AppComponentBase implements OnInit {
  constants = Constants;
  tenantId: number;
  userId: number;
  assessmentScheduleId: number = 0;
  userAssessmentProgressDetails: UserAssessmentProgressDetails;
  assessmentSkills: any;
  assessmentProficiencies: any;
  assessmentSections: any;
  userAssessmentDuration: string;
  averageQuestionDuration: string;
  isUserPassed: boolean;
  public assessmentResultChartOptions: Partial<AssessmentResultChartOptions>;
  assessmentPercentage: number | null;
  totalBeginnerQuestions: number | null;
  correctIntermediateQuestions: number | null;
  correctAdvancedQuestions: number | null;
  totalIntermediateQuestions: number | null;
  correctBeginnerQuestions: number | null;
  totalAdvancedQuestions: number | null;
  questionsSkipped: number | null;
  remainingAttempts: number;
  sections: SectionScore[];
  skills: SkillsScore;
  helper = Helper;
  completionDate: any;
  isCompleted: boolean = false;

  constructor(private myAssessmentsService: MyAssessmentsService, private activateRoute: ActivatedRoute, injector: Injector) { super(injector); }

  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    this.userId = this.appSession.user.id;
    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        this.assessmentScheduleId = parseInt(atob(params['id']));

      }
    });
    this.loadPage();

  }
  loadPage() {
    this.getAssessmentProgressDetail();
  }

  getTime(date: string) {
    return formatDate(Helper.convertUTCDateToLocalDate(date), 'd, MMM y - h:mm a', 'en_US');
  }

  getAssessmentProgressDetail() {
    let data: AssessmentProgressFilter;
    data = {
      assessmentScheduleId: this.assessmentScheduleId,
      userId: this.userId,
      tenantId: this.tenantId,
      isUserProfile: false
    };
    this.myAssessmentsService.getAssessmentProgressDetails(data).subscribe(res => {

      this.userAssessmentProgressDetails = res.result[0];
      this.userAssessmentDuration = Helper.secondsToHm(this.userAssessmentProgressDetails.userAssessmentDuration);
      this.averageQuestionDuration = Helper.secondsToHm(this.userAssessmentProgressDetails.averageQuestionDuration);
      if (this.userAssessmentProgressDetails.userLatestAttemptStatus !== UserAssessmentStatus.Completed)
        this.isUserPassed = this.userAssessmentProgressDetails.userLatestAttemptStatus === UserAssessmentStatus.Passed ? true : false;
      else
        this.isCompleted = true;
      this.remainingAttempts = this.userAssessmentProgressDetails.maxAttempts - this.userAssessmentProgressDetails.availedAttempts;
      this.assessmentPercentage = Math.floor((this.userAssessmentProgressDetails.userEarnedScore / this.userAssessmentProgressDetails.assessmentTotalScore) * 100);
      let proficiencies = this.userAssessmentProgressDetails.assessmentProficiencies;
      let questionCount = JSON.parse(proficiencies);
      this.totalBeginnerQuestions = this.totalBeginnerQuestions = 0;
      this.correctIntermediateQuestions = this.correctIntermediateQuestions = 0;
      this.correctAdvancedQuestions = this.correctAdvancedQuestions = 0;
      this.completionDate = this.getTime(this.userAssessmentProgressDetails?.completionDate);

      questionCount.forEach(element => {
        if (element.ProficiencyId === this.constants.beginnerId) {
          this.totalBeginnerQuestions = element.TotalQuestions;
          this.correctBeginnerQuestions = element.TotalCorrect;
        }
        if (element.ProficiencyId === this.constants.intermediateId) {
          this.totalIntermediateQuestions = element.TotalQuestions;
          this.correctIntermediateQuestions = element.TotalCorrect;
        }
        if (element.ProficiencyId === this.constants.advancedId) {
          this.totalAdvancedQuestions = element.TotalQuestions;
          this.correctAdvancedQuestions = element.TotalCorrect;
        }
      });
      this.questionsSkipped = this.userAssessmentProgressDetails.assessmentTotalQuestions - this.userAssessmentProgressDetails.totalAnswered;
      this.sections = JSON.parse(this.userAssessmentProgressDetails.assessmentSections);
      let sectionPercentage = 0;
      this.sections.forEach(element => {
        if (element.SectionName === this.sections[0].SectionName) {
          element.EarnedScorePercentage = Math.floor((element.UserEarnedScore / element.TotalScore) * 100);
          element.ScorePercentage = 0;
        }
        else {
          sectionPercentage += Math.floor((element.TotalScore / this.userAssessmentProgressDetails.assessmentTotalScore) * 100);
          element.ScorePercentage = sectionPercentage;
          element.EarnedScorePercentage = Math.floor((element.UserEarnedScore / element.TotalScore) * 100);
        }
        element.SectionPercentage = +(element.TotalScore / this.userAssessmentProgressDetails.assessmentTotalScore * 100).toFixed(1);
        element.SectionPercentage = element.SectionPercentage > 100 ? 100 : element.SectionPercentage;
      });
      this.skills = JSON.parse(this.userAssessmentProgressDetails.assessmentSkills);
      this.displayAssessmentResultChart();
    });
  }
  displayAssessmentResultChart(): void {
    if (this.isCompleted) {
      var color = '#578fcd';
      var label = Constants.completed;
    } else {
      color = this.isUserPassed ? '#57CD64' : '#F20A34';
      label = this.isUserPassed ? Constants.pass : Constants.notCleared;
    }
    this.assessmentResultChartOptions = {
      series: [this.assessmentPercentage],
      chart: {
        type: "radialBar",
        width: 250,
        sparkline: {
          enabled: true
        }
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "75%"
          },
        }
      },
      fill: {
        colors: [color]
      },
      labels: [label]
    };
  }
  htmltoPDF() {
    html2canvas(document.querySelector("#contentToConvert")).then(canvas => {
      var pdf = new jsPDF('p', 'mm', "a4");
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData, 'JPEG', 10, 10, 180, 150);
      pdf.save(`${this.constants.userAssessmentReport}_${this.appSession.user.emailAddress}_${new Date().getTime()}.pdf`);
    });
  }
}
