import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    UserDashboardComponent
  ],
  imports: [
    SharedModule,
    UserDashboardRoutingModule,
    NgbModule,
    NgApexchartsModule,
    NgxChartsModule
  ]
})
export class UserDashboardModule { }