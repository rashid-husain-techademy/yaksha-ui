import { Permissions } from "../../../shared/roles-permission/permissions";
import { MyProfileComponent } from "./my-profile/my-profile.component";
import { SettingsComponent } from "./settings/settings.component";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsavedGuard } from "@app/shared/guards/unsaved.guard";
import { ShowResultComponent } from "./show-result/show-result.component";

const routes: Routes = [
  { path: '', component: MyProfileComponent },
  { path: 'settings', component: SettingsComponent, canDeactivate: [UnsavedGuard] },
  { path: 'view-result/:id', component: ShowResultComponent },
  { path: ':id', component: MyProfileComponent, data: { permission: `${Permissions.superAdmin},${Permissions.tenantAdmin}` } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }