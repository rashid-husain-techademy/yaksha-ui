import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from "../../shared/roles-permission/permissions";
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  { path: '', component: UserDashboardComponent, data: { permission: `${Permissions.tenantUserOnly}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDashboardRoutingModule { }
