import { AfterViewInit, Component } from '@angular/core';
import { UserDashboardService } from '@app/user-dashboard/user-dashboard.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { Constants } from '@app/models/constants';
import { UserInput } from '../../user-profile/my-profile/my-profile';
import { DashboardData, DashboardEmbedData } from '../../analytics/analytics';
import { DashboardType, DashboardUserRoles, ProjectType } from '../../analytics/analytics-details';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as pbi from 'powerbi-client';
import { UserRoles } from '@app/enums/user-roles';

@Component({
  selector: 'app-tenantadmin-dashboard',
  templateUrl: './tenantadmin-dashboard.component.html',
  styleUrls: ['./tenantadmin-dashboard.component.scss']
})
export class TenantadminDashboardComponent implements AfterViewInit {
  constants = Constants;
  userRole: string;
  nochartsAvailable: boolean = false;
  input = new UserInput();
  dashboardData: DashboardEmbedData;
  userRoles = UserRoles;
  
  constructor(private userService: UserDashboardService,
    private appSessionService: AppSessionService,
    public dataService: dataService) { }

  ngAfterViewInit(): void {
    this.dataService.userRole.subscribe(val => {
      if (val) {
        this.userRole = val;
        this.input.userId = this.appSessionService.user.id;
        this.input.tenantId = this.appSessionService.tenantId;
        this.userRole === UserRoles[1] ? this.getDefaultAdminDashboard() : this.getDefaultTenantAdminDashboard();
      }
    });
  }

  getDefaultAdminDashboard() {
    let data: DashboardData = {
      dashboardType: DashboardType.DefaultType,
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.SuperAdmin,
      tenantId: null,
      userId: this.appSessionService.user.id
    }
    this.getDashboard(data, "QuestionBank");
  }

  getDefaultTenantAdminDashboard() {
    let data: DashboardData = {
      dashboardType: DashboardType.DefaultType,
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.TenantAdmin,
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.user.id
    }
    this.getDashboard(data, "Dashboard");
  }
   
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.userRole === UserRoles[1] ? this.superAdminTabChanged(tabChangeEvent) : this.tenantAdminTabChanged(tabChangeEvent)
  }

  superAdminTabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.nochartsAvailable = false;
    let data: DashboardData = {
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.SuperAdmin,
      tenantId: null,
      userId: this.appSessionService.user.id
    }
    if (tabChangeEvent.tab.textLabel === "Question Bank") {
      data.dashboardType = DashboardType.DefaultType;
      this.getDashboard(data, "QuestionBank");
    }
    else if (tabChangeEvent.tab.textLabel === "Question Bank Report") {
      data.dashboardType = DashboardType.QuestionBankReportType;
      this.getDashboard(data, "QuestionBankReport");
    }
    else if (tabChangeEvent.tab.textLabel === "Question Performance") {
      data.dashboardType = DashboardType.QuestionPerformanceType;
      this.getDashboard(data, "QuestionPerformance");
    }
    else if (tabChangeEvent.tab.textLabel === "Assessments and Tenants") {
      data.dashboardType = DashboardType.TenantAssessmentsType;
      this.getDashboard(data, "AssessmentsAndTenants");
    }
  }

  tenantAdminTabChanged(tabChangeEvent: MatTabChangeEvent): void {
      this.nochartsAvailable = false;
      let data: DashboardData = {
        projectType: ProjectType.KantarYaksha,
        role: DashboardUserRoles.TenantAdmin,
        tenantId: this.appSessionService.tenantId,
        userId: this.appSessionService.user.id
      }
      if (tabChangeEvent.tab.textLabel === "Dashboard") {
        data.dashboardType = DashboardType.DefaultType;
        this.getDashboard(data, "Dashboard");
      }
      else if (tabChangeEvent.tab.textLabel === "Knowledge Base Assessments") {
        data.dashboardType = DashboardType.KnowledgeBaseAssessmentType;
        this.getDashboard(data, "KnowledgeBaseAssessments");
      }
      else if (tabChangeEvent.tab.textLabel === "Composite Assessments") {
        data.dashboardType = DashboardType.CompositeAssessmentType;
        this.getDashboard(data, "CompositeAssessments");
      }
      else if (tabChangeEvent.tab.textLabel === "Project Base Assessments") {
        data.dashboardType = DashboardType.ProjectBaseAssessmentType;
        this.getDashboard(data, "ProjectBaseAssessments");
      }
  }

  getDashboard(data: DashboardData, elementName: string) {
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