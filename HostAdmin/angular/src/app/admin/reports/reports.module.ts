import { NgModule } from '@angular/core';
import { ReportsComponent } from './reports.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportsRoutingModule } from './reports-routing.module';
import { ProctoringComponent } from './proctoring/proctoring.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { StackReportComponent } from './stack-report/stack-report.component';
import { AeyeProctorReportComponent } from './aeye-proctor-report/aeye-proctor-report.component';
import { AeyeReviewSessionComponent } from './aeye-review-session/aeye-review-session.component';
@NgModule({
  declarations: [
    ReportsComponent,
    ProctoringComponent,
    StackReportComponent,
    AeyeProctorReportComponent,
    AeyeReviewSessionComponent
  ],
  imports: [
    SharedModule,
    ReportsRoutingModule,
    NgbModule,
    NgApexchartsModule
  ]
})
export class ReportsModule { }