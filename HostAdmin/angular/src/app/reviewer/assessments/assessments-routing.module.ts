import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roles } from "../../../shared/roles-permission/roles";
import { AssessmentsComponent } from "./assessments.component";

const routes: Routes = [
    { path: '', component: AssessmentsComponent, data: { permission: `${Roles.reviewerOnly}` } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentsRoutingModule { }