import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignRoutingModule } from './campaign-routing.module';
import { ListCampaignComponent } from './list-campaign/list-campaign.component';
import { ViewCampaignComponent } from './view-campaign/view-campaign.component';
import { CreateCampaignComponent } from './create-campaign/create-campaign.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { ScheduleCampaignComponent } from './schedule-campaign/schedule-campaign.component';


@NgModule({
  declarations: [
    ListCampaignComponent,
    ViewCampaignComponent,
    CreateCampaignComponent,
    ScheduleCampaignComponent
  ],
  imports: [
    CommonModule,
    CampaignRoutingModule,
    NgbModule,
    SharedModule,
    QuillModule.forRoot() 
  ]
})
export class CampaignModule { }
