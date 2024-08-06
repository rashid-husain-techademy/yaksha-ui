import { Permissions } from "../../../shared/roles-permission/permissions";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantadminDashboardComponent } from './tenantadmin-dashboard/tenantadmin-dashboard.component';

const routes: Routes = [
  { path: '', component: TenantadminDashboardComponent, data: { permission: `${Permissions.superAdmin},${Permissions.tenantAdmin},${Permissions.dashboardManageAll}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class DashboardRoutingModule { }