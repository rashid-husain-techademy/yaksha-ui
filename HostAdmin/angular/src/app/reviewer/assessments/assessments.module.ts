import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AssessmentsComponent } from './assessments.component';
import { AssessmentsRoutingModule } from './assessments-routing.module';

@NgModule({
  declarations: [
    AssessmentsComponent
  ],
  imports: [
    SharedModule,
    AssessmentsRoutingModule,
    NgbModule,
    NgApexchartsModule
  ]
})
export class AssessmentsModule { }