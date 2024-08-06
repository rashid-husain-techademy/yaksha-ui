import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAdaptiveAssessmentComponent } from './create-adaptive-assessment/create-adaptive-assessment.component';
import { Permissions } from '@shared/roles-permission/permissions';
import { AdaptiveAssessmentCatalogComponent } from './adaptive-assessment-catalog/adaptive-assessment-catalog.component';
import { AdaptiveAssessmentScheduleComponent } from './adaptive-assessment-schedule/adaptive-assessment-schedule.component';
import { ViewAdaptiveAssessmentComponent } from './view-adaptive-assessment/view-adaptive-assessment.component';

const routes: Routes = [
  { path: 'create-adaptive-assessment', component: CreateAdaptiveAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'adaptive-assessment-catalog', component: AdaptiveAssessmentCatalogComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'adaptive-assessment-schedule/:adaptive', component: AdaptiveAssessmentScheduleComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'view-adaptive-assessment/:id', component: ViewAdaptiveAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdaptiveAssessmentRoutingModule { }
