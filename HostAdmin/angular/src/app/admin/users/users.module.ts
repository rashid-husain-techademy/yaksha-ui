import { NgModule } from '@angular/core';
import { UserListComponent } from './user-list/user-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    UserListComponent
  ],
  imports: [
    SharedModule,
    UsersRoutingModule,
    NgbModule
  ]
})
export class UsersModule { }