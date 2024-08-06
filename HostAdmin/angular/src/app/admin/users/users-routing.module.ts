import { Permissions } from "../../../shared/roles-permission/permissions";
import { UserListComponent } from "./user-list/user-list.component";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: UserListComponent, data: { permission: `${Permissions.superAdmin},${Permissions.tenantAdmin}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class UsersRoutingModule { }