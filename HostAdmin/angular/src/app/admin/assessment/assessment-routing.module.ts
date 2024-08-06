import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from '@shared/roles-permission/permissions';
import { AssessmentOperationComponent } from './assessment-operation/assessment-operation.component';
import { CreateAssessmentComponent } from './create-assessment/create-assessment.component';
import { ListAssessmentComponent } from './list-assessment/list-assessment.component';
import { ViewAssessmentComponent } from './view-assessment/view-assessment.component';
import { UnsavedGuard } from '../../shared/guards/unsaved.guard';
import { AssessmentReviewListComponent } from '@app/assessment-review/assessment-review-list/assessment-review-list.component';
import { CreateAdaptiveAssessmentComponent } from './create-adaptive-assessment/create-adaptive-assessment.component';
import { ScheduleAssessmentComponent } from './schedule-assessment/schedule-assessment.component';
import { ExtraTimeComponent } from './extra-time/extra-time.component';
import { BulkAssessmentScheduleComponent } from './bulk-assessment-schedule/bulk-assessment-schedule.component';
import { UpdateUserAttemptComponent } from './update-user-attempt/update-user-attempt.component';

const routes: Routes = [
  { path: 'bulk-schedule', component: BulkAssessmentScheduleComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'list-assessment', component: ListAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'create-assessment', component: CreateAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'assessment-review', component: AssessmentReviewListComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'create-assessment/:id', component: CreateAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'create-assessment/:id/:navigatedFrom', component: CreateAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'assessment-operation/:assessmentData', component: AssessmentOperationComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'view-assessment/:id', component: ViewAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'view-assessment/:id/:activePage', component: ViewAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'create-adaptive-assessment', component: CreateAdaptiveAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'create-adaptive-assessment/:id/:navigatedFrom', component: CreateAdaptiveAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'schedule-assessment/:id/:isStack/:isCloud/:isVMBased/:isCoding/:isMCQ/:campaignDetails/:isSubjective/:isUploadType', component: ScheduleAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll},${Permissions.tenantUser}` } },
  { path: 'schedule-assessment/:id/:isStack/:isCloud/:isVMBased/:scheduleId/:tenantId/:isUpdate/:isCoding/:isMCQ/:campaignDetails/:isSubjective/:isUploadType/:isCloneSchedule', component: ScheduleAssessmentComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'extra-time/:id/:tenantId/:campaign', component: ExtraTimeComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'update-user-attempt/:id/:tenantId', component: UpdateUserAttemptComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule { }
