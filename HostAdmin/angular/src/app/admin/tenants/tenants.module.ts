import { NgModule } from '@angular/core';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TenantsRoutingModule } from './tenants-routing.module';
import { TenantCustomizationComponent } from './tenant-list/tenant-customization/tenant-customization.component';

@NgModule({
  declarations: [
    TenantListComponent,
    TenantCustomizationComponent,
  ],
  imports: [
    SharedModule,
    TenantsRoutingModule,
    NgbModule
  ]
})
export class TenantsModule { }
