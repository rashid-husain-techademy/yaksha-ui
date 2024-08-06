import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TenantadminDashboardComponent } from './tenantadmin-dashboard/tenantadmin-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    TenantadminDashboardComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    NgbModule,
    NgApexchartsModule,
    NgxChartsModule
  ]
})
export class DashboardModule { }
