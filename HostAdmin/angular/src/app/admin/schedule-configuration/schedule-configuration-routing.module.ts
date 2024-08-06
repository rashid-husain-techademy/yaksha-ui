import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roles } from '../../../shared/roles-permission/roles';
import { ScheduleConfigurationComponent } from "./schedule-configuration.component";

const routes: Routes = [
  { path: 'schedule-option', component: ScheduleConfigurationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ScheduleConfigurationRoutingModule { }