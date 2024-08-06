import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RoleAssignmentRoutingModule } from './role-assignment-routing.module';
import { RoleAssignmentComponent } from './role-assignment.component';

@NgModule({
  declarations: [
    RoleAssignmentComponent
  ],
  imports: [
    SharedModule,
    RoleAssignmentRoutingModule,
    NgbModule,
    NgApexchartsModule,
    NgxChartsModule
  ]
})
export class RoleAssignmentModule { }
