import { Component, OnInit } from '@angular/core';
import { DurationDropDown } from '@app/admin/dashboard/dashboard.component';
import { AssessmentResultChartOptions, AssessmentReviewProgressChartOptions, AssignedAssessmentChartOptions } from '@app/interface/chart';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { Constants } from '@app/models/constants';
import { AssessmentsCount, AssessmentsReviewProgress, ReviewerScheduleData } from '../reviewer';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { ReviewerService } from '../reviewer.service';
import { Result } from '@app/shared/core-interface/base';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constants = Constants;
  assessmentsCount: AssessmentsCount;
  userRole: string;
  userRoles = UserRoles;
  reviewerScheduleData: ReviewerScheduleData[];
  assessmentsReviewProgress: AssessmentsReviewProgress[];
  assessmentReviewProgress: AssessmentsReviewProgress;
  public assignedAssessmentChartOptions: Partial<AssignedAssessmentChartOptions>;
  public assessmentReviewProgressChartOptions: Partial<AssessmentReviewProgressChartOptions>;
  public assessmentResultChartOptions: Partial<AssessmentResultChartOptions>;
  periodList: string[] = [];
  totalAssessmentSceduled: number[];
  monthList: number[] = [];
  reviewerdurationDropDown: DurationDropDown[] = [{ name: "Last 3 Months", value: 1 }, { name: "Last 6 Months", value: 2 }, { name: "Last 1 Year", value: 3 }];
  testTakerPeriod: number = this.reviewerdurationDropDown[2].value;
  months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  threeMonths: number = 3;
  sixMonths: number = 6;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  constructor(private reviewerService: ReviewerService, private dataService: dataService) { }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });
    this.reviewerService.getAssessmentsCount().subscribe(res => {
      if (res && res.success && res.result !== null) {
        this.assessmentsCount = res.result;
      }
    });
    this.reviewerService.getReviewerAssessmentsReviewProgress().subscribe(res => {
      if (res && res.success && res.result !== null) {

        this.assessmentsReviewProgress = res.result;
        this.onAssessmentReviewProgressChange(this.assessmentsReviewProgress[0].assessmentId);
        this.createAssessmentResultsChart(this.assessmentsReviewProgress[0].assessmentId)
      }
    });
    this.getAssessmentStatus();
  }

  onAssessmentReviewProgressChange(assessmentId) {
    this.assessmentReviewProgress = this.assessmentsReviewProgress.filter(obj => obj.assessmentId === Number(assessmentId))[0];
    this.assessmentReviewProgressChartOptions = {
      series: [this.assessmentReviewProgress.reviewProgressPercentage],
      chart: {
        height: 175,
        type: "radialBar",
        offsetY: -10
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: "16px",
              color: undefined,
              offsetY: 120
            },
            value: {
              offsetY: 76,
              fontSize: "22px",
              color: undefined,
              formatter: function (val) {
                return val + "%";
              }
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91]
        }
      },
      stroke: {
        dashArray: 4
      },
      labels: [""]
    };
  }

  getAssessmentStatus(): void {
    this.reviewerService.getReviewerAssessmentSchedules().subscribe((res: Result<ReviewerScheduleData[]>) => {
      if (res.result) {
        this.reviewerScheduleData = res.result;
        this.totalAssessmentSceduled = this.reviewerScheduleData.map(x => x.noOfAssessmentsScheduled);
        this.monthList = this.reviewerScheduleData.map(x => x.month);
        this.monthList.forEach(element => {
          this.periodList.push(this.months[element - 1]);
        });
      }
      this.createAssignedAssessmentChart();
    },
      error => console.error(error));
  }

  onChangeTestTaker(): void {
    let periodList: number[] = [];
    let fromMonth: number = 0;
    let duration: number = 0;
    let reviewerScheduleData: ReviewerScheduleData[] = [];
    this.totalAssessmentSceduled = [];
    this.monthList = [];
    this.periodList = [];
    if (+this.testTakerPeriod === this.reviewerdurationDropDown[0].value) {
      duration = this.threeMonths;
      fromMonth = new Date(new Date().setMonth(new Date().getMonth() - duration)).getMonth() + 2;
      monthCalculation();
      periodList.forEach(period => {
        let data: ReviewerScheduleData = this.reviewerScheduleData.find(x => x.month === period);
        if (data) {
          reviewerScheduleData.push(data);
        }
      });
      this.totalAssessmentSceduled = reviewerScheduleData.map(x => x.noOfAssessmentsScheduled);
      this.monthList = reviewerScheduleData.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }
    else if (+this.testTakerPeriod === this.reviewerdurationDropDown[1].value) {
      duration = this.sixMonths;
      fromMonth = new Date(new Date().setMonth(new Date().getMonth() - duration)).getMonth() + 2;
      monthCalculation();
      periodList.forEach(period => {
        let data: ReviewerScheduleData = this.reviewerScheduleData.find(x => x.month === period);
        if (data) {
          reviewerScheduleData.push(data);
        }
      });
      this.totalAssessmentSceduled = reviewerScheduleData.map(x => x.noOfAssessmentsScheduled);
      this.monthList = reviewerScheduleData.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }
    else if (+this.testTakerPeriod === this.reviewerdurationDropDown[2].value) {
      this.totalAssessmentSceduled = this.reviewerScheduleData.map(x => x.noOfAssessmentsScheduled);
      this.monthList = this.reviewerScheduleData.map(x => x.month);
      this.monthList.forEach(element => {
        this.periodList.push(this.months[element - 1]);
      });
    }

    function monthCalculation() {
      periodList.push(fromMonth);
      let startMonth: number = 0;
      for (let i = 1; i <= duration; i++) {
        let value: number = fromMonth + 1;
        if (value <= 12) {
          periodList.push(value);
          ++fromMonth;
        }
        else {
          startMonth += 1;
          periodList.push(startMonth);
        }
      }
    }
    this.createAssignedAssessmentChart();
  }

  createAssignedAssessmentChart(): void {
    this.assignedAssessmentChartOptions = {
      series: [
        {
          name: Constants.assessmentsScheduled,
          data: this.totalAssessmentSceduled
        }
      ],
      chart: {
        fontFamily: 'Nunito Sans,sans-serif',
        height: 500,
        type: 'line',
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 3,
        strokeColors: "transparent"
      },
      stroke: {
        curve: 'smooth',
        width: '2',

      },
      colors: ['#009efb', '#55ce63'],
      legend: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: 'rgba(0,0,0,0.1)',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: this.periodList,
        labels: {
          style: {
            colors: '#a1aab2'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#a1aab2'
          }
        }
      },
      tooltip: {
        theme: 'dark'
      }
    };
  }

  createAssessmentResultsChart(assessmentId) {
    this.assessmentReviewProgress = this.assessmentsReviewProgress.filter(obj => obj.assessmentId === Number(assessmentId))[0];
    if (this.assessmentReviewProgress.passedAssessmentPercentage != 0 || this.assessmentReviewProgress.failedAssessmentPercentage != 0) {
      this.assessmentResultChartOptions = {
        series: [this.assessmentReviewProgress.passedAssessmentPercentage, this.assessmentReviewProgress.failedAssessmentPercentage],
        chart: {
          fontFamily: 'Rubik,sans-serif',
          type: 'donut',
          height: 170
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '50px',
            }
          }
        },
        tooltip: {
          theme: "dark",
          fillSeriesColor: false,
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        legends: {
          show: true,
        },
        labels: ['Passed Assessments', 'Failed Assessments'],
        colors: ['#39C449', '#f62d51'],
      };
    }
    else {
      this.assessmentResultChartOptions = {
        series: [0, 0],
        chart: {
          fontFamily: 'Rubik,sans-serif',
          type: 'donut',
          height: 170
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '50px',
              labels: {
                show: true,
                name: {
                  show: false
                },
                value: {
                  show: true,
                  formatter: (val) => {
                    return val + ' 0%';
                  }
                },
                total: {
                  show: true,
                  showAlways: false,
                  formatter: (w) => {
                    return '0 %'
                  }
                }
              }
            }
          }
        },
        tooltip: {
          theme: "dark",
          fillSeriesColor: false,
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        legends: {
          show: true,
        },
        labels: ['Passed Assessments', 'Failed Assessments'],
        colors: ['#39C449', '#f62d51'],
      };
    }
  }
}

