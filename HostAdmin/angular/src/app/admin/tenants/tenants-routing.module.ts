import { Permissions } from "../../../shared/roles-permission/permissions";
import { TenantCustomizationComponent } from "./tenant-list/tenant-customization/tenant-customization.component";
import { TenantListComponent } from "./tenant-list/tenant-list.component";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: TenantListComponent, data: { permission: `${Permissions.superAdmin}` } },
  { path: 'customization/:id', component:TenantCustomizationComponent, data:{Permissions: `${Permissions.superAdmin}`}},
  { path: 'customization', component:TenantCustomizationComponent, data:{Permissions: `${Permissions.tenantAdmin}`}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TenantsRoutingModule { }