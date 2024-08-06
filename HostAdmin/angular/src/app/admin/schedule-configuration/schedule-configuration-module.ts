import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    ScheduleConfigurationModule
  ],
  imports: [
    SharedModule,
    ScheduleConfigurationModule,
    NgbModule,
    NgApexchartsModule,
    NgxChartsModule
  ]
})
export class ScheduleConfigurationModule { }
