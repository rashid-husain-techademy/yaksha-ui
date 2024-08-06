import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentsRoutingModule } from './assessments-routing.module';
import { AssessmentsComponent } from './assessments.component';

@NgModule({
  declarations: [
    AssessmentsComponent
  ],
  imports: [
    SharedModule,
    AssessmentsRoutingModule,
    NgbModule
  ]
})
export class AssessmentsModule { }