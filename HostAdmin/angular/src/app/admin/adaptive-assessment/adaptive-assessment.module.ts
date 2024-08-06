import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { AdaptiveAssessmentRoutingModule } from './adaptive-assessment-routing.module';
import { CreateAdaptiveAssessmentComponent } from './create-adaptive-assessment/create-adaptive-assessment.component';
import { AdaptiveAssessmentScheduleComponent } from './adaptive-assessment-schedule/adaptive-assessment-schedule.component';
import { AdaptiveAssessmentCatalogComponent } from './adaptive-assessment-catalog/adaptive-assessment-catalog.component';
import { ViewAdaptiveAssessmentComponent } from './view-adaptive-assessment/view-adaptive-assessment.component';




@NgModule({
  declarations: [
    CreateAdaptiveAssessmentComponent,
    AdaptiveAssessmentScheduleComponent,
    AdaptiveAssessmentCatalogComponent,
    ViewAdaptiveAssessmentComponent
  ],
  imports: [
    SharedModule,
    AdaptiveAssessmentRoutingModule,
    NgbModule,

  ]
})
export class AdaptiveAssessmentModule { }
