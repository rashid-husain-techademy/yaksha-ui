import { NgModule } from '@angular/core';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { ChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ShowResultComponent } from './show-result/show-result.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    MyProfileComponent,
    SettingsComponent,
    ShowResultComponent
  ],
  imports: [
    SharedModule,
    UserProfileRoutingModule,
    NgbModule,
    ChartsModule,
    NgApexchartsModule,
    MonacoEditorModule.forRoot(),
    NgxChartsModule
  ]
})
export class UserProfileModule { }
