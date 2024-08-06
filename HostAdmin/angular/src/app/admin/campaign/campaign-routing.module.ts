import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from '@shared/roles-permission/permissions';
import { ListCampaignComponent } from './list-campaign/list-campaign.component';

import { ViewCampaignComponent } from './view-campaign/view-campaign.component';
import { CreateCampaignComponent } from './create-campaign/create-campaign.component';
import { ScheduleCampaignComponent } from './schedule-campaign/schedule-campaign.component';
import { UnsavedGuard } from '@app/shared/guards/unsaved.guard';
import { ExtraTimeComponent } from '../assessment/extra-time/extra-time.component';

const routes: Routes = [
  { path: 'list-drive', component: ListCampaignComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'view-drive/:id', component: ViewCampaignComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'create-drive', component: CreateCampaignComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'create-drive/:id', component: CreateCampaignComponent, data: { permission: `${Permissions.assesmentsManageAll}` }, canDeactivate: [UnsavedGuard] },
  { path: 'schedule-drive/:campaignId/:campaignName/:isUpdate/:duration/:scheduleId/:tenantId/:campaignDate', component: ScheduleCampaignComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
  { path: 'extra-time/:id/:tenantId/:campaign', component: ExtraTimeComponent, data: { permission: `${Permissions.assesmentsManageAll}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }
