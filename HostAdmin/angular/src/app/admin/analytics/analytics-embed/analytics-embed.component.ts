import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as pbi from 'powerbi-client';
import { AnalyticsEmbedComponentData, DashboardData, DashboardEmbedData } from '@app/admin/analytics/analytics';
import { DashboardType, DashboardUserRoles, ProjectType } from '@app/admin/analytics/analytics-details';
import { AppSessionService } from '@shared/session/app-session.service';
import { UserDashboardService } from '@app/user-dashboard/user-dashboard.service';
import { Constants } from '@app/models/constants';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';


@Component({
  selector: 'app-analytics-embed',
  templateUrl: './analytics-embed.component.html',
  styleUrls: ['./analytics-embed.component.scss']
})
export class AnalyticsEmbedComponent implements OnInit {
  @Input() public embedData: AnalyticsEmbedComponentData;
  isShowModal: boolean = true;
  nochartsAvailable: boolean = false;
  dashboardData: DashboardEmbedData;
  constants = Constants;
  isUserDashboard: boolean = false;
  userRole: string;

  constructor(//private modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private dataService: dataService,
    private appSessionService: AppSessionService,
    private userService: UserDashboardService) { }

  ngOnInit(): void {
    this.isUserDashboard = this.embedData.isUserDashboard;
    this.dataService.userRole.subscribe(val => {
      if (val) {
        this.userRole = val;
      }
    });
    if (this.isUserDashboard) {
      this.getYakshaUserProfileDashboard();
    } else {
      this.questionPerformance();
    }
  }

  close() {
    this.activeModal.close();
  }

  getYakshaUserProfileDashboard() {
    let data: DashboardData = {
      dashboardType: DashboardType.YakshaUserProfile,
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.TenantUser,
      tenantId: this.appSessionService.tenantId,
      userId: this.embedData.id
    }
    this.getDashboard(data, "YakshaUserProfile");
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if (this.userRole === UserRoles[1] || this.userRole === UserRoles[2]) {
      this.nochartsAvailable = false;
      let data: DashboardData = {
        projectType: ProjectType.KantarYaksha,
        role: DashboardUserRoles.TenantUser,
        tenantId: this.appSessionService.tenantId,
        userId: this.embedData.id
      }
      if (tabChangeEvent.tab.textLabel === "User Profile") {
        data.dashboardType = DashboardType.DefaultType;
        this.getDashboard(data, "YakshaUserProfile");
      }
      else if (tabChangeEvent.tab.textLabel === "Standard Assessments") {
        data.dashboardType = DashboardType.UserStandardAssessment;
        this.getDashboard(data, "StandardAssessment");
      }
      else if (tabChangeEvent.tab.textLabel === "Coding Assessments") {
        data.dashboardType = DashboardType.UserCodingAssessment;
        this.getDashboard(data, "CodingAssessment");
      }
      else if (tabChangeEvent.tab.textLabel === "Project Assessments") {
        data.dashboardType = DashboardType.UserProjectAssessment;
        this.getDashboard(data, "ProjectAssessment");
      }
      else if (tabChangeEvent.tab.textLabel === "Report") {
        data.dashboardType = DashboardType.UserReport;
        this.getDashboard(data, "Report");
      }
    }
    else {
      this.nochartsAvailable = true;
    }
  }

  getDashboard(data, elementName: string) {
    this.userService.getDashboard(data)
      .subscribe(res => {
        if (res.success && res.result) {
          this.dashboardData = res.result;
          if (this.dashboardData.embedToken) {
            this.dashboardEmbed(this.dashboardData, elementName)
          }
          else {
            this.nochartsAvailable = true;
          }
        }
        else {
          this.nochartsAvailable = true;
        }
      },
        error => console.error(error));
  }

  questionPerformance() {
    let data: DashboardData = {
      dashboardType: DashboardType.YakshaQuestionPerformance,
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.All,
      tenantId: this.appSessionService.tenantId,
      userId: this.embedData.id
    }
    this.userService.getDashboard(data)
      .subscribe(res => {
        if (res.success && res.result) {
          this.dashboardData = res.result;
          if (this.dashboardData.embedToken) {
            this.dashboardEmbed(this.dashboardData, this.constants.powerBi)
          }
          else {
            this.nochartsAvailable = true;
          }
        }
        else {
          this.nochartsAvailable = true;
        }
      },
        error => console.error(error));
  }

  dashboardEmbed(result, elementName: string) {
    setTimeout(function () {
      let config = {
        type: 'report',
        accessToken: result.embedToken,
        embedUrl: result.embedUrl,
        id: result.reportId,
        settings: {
          background: pbi.models.BackgroundType.Transparent,
          panes: {
            bookmarks: {
              visible: false
            },
            fields: {
              expanded: false
            },
            filters: {
              expanded: false,
              visible: false
            },
            pageNavigation: {
              visible: false
            },
            selection: {
              visible: false
            },
            syncSlicers: {
              visible: false
            },
            visualizations: {
              expanded: false
            }
          }
        },
        viewMode: pbi.models.ViewMode.View,
        tokenType: pbi.models.TokenType.Embed,
        permissions: pbi.models.Permissions.All
      };
      let powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
      let target = document.getElementById(elementName);
      powerbi.embed(target, config);
    }, 1000);
  }
}
