import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { Constants } from '@app/models/constants';
import { UserDashboardService } from '../user-dashboard.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { UserInput } from '@app/admin/user-profile/my-profile/my-profile';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import * as pbi from 'powerbi-client';
import { DashboardType, DashboardUserRoles, ProjectType } from '@app/admin/analytics/analytics-details'
import { DashboardData, DashboardEmbedData } from '@app/admin/analytics/analytics';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements AfterViewInit {
  constants = Constants;
  userRole: string;
  nochartsAvailable: boolean = false;
  input = new UserInput();
  dashboardData: DashboardEmbedData;

  constructor(private userService: UserDashboardService,
    private appSessionService: AppSessionService,
    private router: Router,
    private renderer: Renderer2,
    public dataService: dataService) { }

  ngAfterViewInit(): void {
    if (this.dataService.isHsbcTenant(this.appSessionService.tenantId)) {
      this.router.navigate([`${this.appSessionService.tenantName}/app/profile`]);
    }
    const element = document.querySelector('[data-id="zsalesiq"]');
    if (element)
      this.renderer.setStyle(element, 'display', 'none');
    this.dataService.userRole.subscribe(val => {
      if (val) {
        this.userRole = val;
      }
    });
    this.input.userId = this.appSessionService.user.id;
    this.getOverviewDashboard();
  }

  getOverviewDashboard() {
    let data: DashboardData = {
      dashboardType: DashboardType.DefaultType,
      projectType: ProjectType.KantarYaksha,
      role: DashboardUserRoles.TenantUser,
      tenantId: this.appSessionService.tenantId,
      userId: this.appSessionService.user.id
    }
    this.getDashboard(data, "Overview");
  }
   
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if (this.userRole !== UserRoles[5]) {
      this.nochartsAvailable = true;
    }
    else {
      this.nochartsAvailable = false;
      let data: DashboardData = {
        projectType: ProjectType.KantarYaksha,
        role: DashboardUserRoles.TenantUser,
        tenantId: this.appSessionService.tenantId,
        userId: this.appSessionService.user.id
      }
      if (tabChangeEvent.tab.textLabel === "Overview") {
        data.dashboardType = DashboardType.DefaultType;
        this.getDashboard(data, "Overview");
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