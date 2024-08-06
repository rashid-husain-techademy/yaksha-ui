import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from "../../shared/roles-permission/permissions";
import { AssessmentsComponent } from './assessments.component';

const routes: Routes = [
  { path: '', component: AssessmentsComponent,  data: { permission: `${Permissions.tenantUserOnly}` } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentsRoutingModule { }
