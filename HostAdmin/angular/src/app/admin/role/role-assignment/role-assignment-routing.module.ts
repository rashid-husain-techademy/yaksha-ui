import { Roles } from "../../../../shared/roles-permission/roles";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleAssignmentComponent } from "./role-assignment.component";

const routes: Routes = [
  { path: '', component: RoleAssignmentComponent, data: { permission: `${Roles.roleManageAll}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class RoleAssignmentRoutingModule { }