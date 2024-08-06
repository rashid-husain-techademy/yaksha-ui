import { Component, OnInit } from '@angular/core';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import * as pbi from 'powerbi-client';
import { DashboardType, DashboardUserRoles, ProjectType } from '@app/admin/analytics/analytics-details'
import { DashboardData, DashboardEmbedData } from '@app/admin/analytics/analytics'
import { AppSessionService } from '@shared/session/app-session.service';
import { AnalyticsService } from '@app/admin/analytics/analytics.services'
import { Constants } from '@app/models/constants';


@Component({
  selector: 'app-assessment-insights',
  templateUrl: './assessment-insights.component.html',
  styleUrls: ['./assessment-insights.component.scss']
})
export class AssessmentInsightsComponent implements OnInit {
  userRole: string;
  nochartsAvailable: boolean = false;
  dashboardData: DashboardEmbedData;
  constants = Constants;

  constructor(private appSessionService: AppSessionService,
    public dataService: dataService,
    public analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.dataService.userRole.subscribe(val => {
      if (val) {
        this.userRole = val;
        this.getDashboard();
      }
    });
  }

  getDashboard() {
    if (this.userRole !== UserRoles[1]) {
      this.nochartsAvailable = true;
    } else {
      let data: DashboardData = {
        dashboardType: DashboardType.DefaultType,
        projectType: ProjectType.KantarYaksha,
        role: DashboardUserRoles.SuperAdmin,
        tenantId: null,
        userId: this.appSessionService.user.id
      }
      this.analyticsService.getDashboard(data)
        .subscribe(res => {
          if (res.success && res.result) {
            this.dashboardData = res.result;
            if (this.dashboardData.embedToken) {
              this.dashboardEmbed(this.dashboardData)
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
  }

  dashboardEmbed(result) {
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
      let target = document.getElementById(Constants.powerBi);
      powerbi.embed(target, config);
    }, 1000);
  }
}
