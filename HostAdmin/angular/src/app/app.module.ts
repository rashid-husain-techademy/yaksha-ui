import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { SharedModule } from '@shared/shared.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { LoginService } from '../account/login/login.service';
import { TokenizedInterceptor } from '@shared/Interceptor/TokenizedInterceptor';
import { CookieService } from 'ngx-cookie-service';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { UserInfo } from './UserInfo';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerComponent } from './shared/spinner.component';
import { HorizontalNavigationComponent } from './shared/horizontal-header/horizontal-navigation.component';
import { HorizontalSidebarComponent } from './shared/horizontal-sidebar/horizontal-sidebar.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { FullComponent } from './layouts/full/full.component';
import { FileUploadComponent } from './admin/shared/file-upload/file-upload.component';
import { InputComponent } from './test-taker/types/input/input.component';
import { RadioButtonComponent } from './test-taker/types/radio-button/radio-button.component';
import { CheckBoxComponent } from './test-taker/types/check-box/check-box.component';
import { TextAreaComponent } from './test-taker/types/text-area/text-area.component';
import { MatchTheFollowingComponent } from './test-taker/types/match-the-following/match-the-following.component';
import { OrderTheSequenceComponent } from './test-taker/types/order-the-sequence/order-the-sequence.component';
import { SelectFromDropdownComponent } from './test-taker/types/select-from-dropdown/select-from-dropdown.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UnsavedDialogComponent } from './unsaved-dialog/unsaved-dialog.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ManageTagsComponent } from './admin/manage-tags/manage-tags.component';
import { ManageCatalogComponent } from './admin/catalog/manage-catalog/manage-catalog.component';
import { CreateCatalogComponent } from './admin/catalog/create-catalog/create-catalog.component';
import { ReviewCheckboxComponent } from './assessment-review/types/review-checkbox/review-checkbox.component';
import { ReviewInputComponent } from './assessment-review/types/review-input/review-input.component';
import { ReviewMatchTheFollowingComponent } from './assessment-review/types/review-match-the-following/review-match-the-following.component';
import { ReviewRadioButtonComponent } from './assessment-review/types/review-radio-button/review-radio-button.component';
import { ReviewTextAreaComponent } from './assessment-review/types/review-text-area/review-text-area.component';
import { RoleAssignmentComponent } from './admin/role/role-assignment/role-assignment.component';
import { ScheduleConfigurationComponent } from './admin/schedule-configuration/schedule-configuration.component';
import { ReviewDragAndDropComponent } from './assessment-review/types/review-drag-and-drop/review-drag-and-drop.component';
import { ReviewOrderTheSequenceComponent } from './assessment-review/types/review-order-the-sequence/review-order-the-sequence.component';
import { ReviewSelectFromDropdownComponent } from './assessment-review/types/review-select-from-dropdown/review-select-from-dropdown.component';
import { DragAndDropComponent } from './test-taker/types/drag-and-drop/drag-and-drop.component';
import { CrosswordPuzzleComponent } from './test-taker/types/crossWOrd-puzzle/crossword-puzzle/crossword-puzzle.component';
import { ReviewCrosswordPuzzleComponent } from './assessment-review/types/review-crossword-puzzle/review-crossword-puzzle/review-crossword-puzzle.component';
import { SelfCatalogEnrollmentComponent } from './self-catalog-enrollment/self-catalog-enrollment.component';
import { ViewGroupUsersComponent } from './view-group-users/view-group-users.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 1,
  wheelPropagation: true,
  minScrollbarLength: 20
};

@NgModule({
  declarations: [
    AppComponent,
    AuthCallbackComponent,
    SpinnerComponent,
    BreadcrumbComponent,
    HorizontalSidebarComponent,
    HorizontalNavigationComponent,
    FullComponent,
    FileUploadComponent,
    UnsavedDialogComponent,
    AnnouncementComponent,
    PrivacyComponent,
    ManageTagsComponent,
    ManageCatalogComponent,
    CreateCatalogComponent,
    RoleAssignmentComponent,
    ScheduleConfigurationComponent,
    SelfCatalogEnrollmentComponent,
    ViewGroupUsersComponent
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    ServiceProxyModule,
    NgIdleKeepaliveModule.forRoot(),
    NgbModule,
    PerfectScrollbarModule,
    ImageCropperModule,
  ],
  providers: [
    CookieService,
    LoginService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenizedInterceptor,
      multi: true
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    UserInfo
  ],
  entryComponents: [
    FileUploadComponent,
    InputComponent,
    RadioButtonComponent,
    TextAreaComponent,
    CheckBoxComponent,
    MatchTheFollowingComponent,
    OrderTheSequenceComponent,
    SelectFromDropdownComponent,
    DragAndDropComponent,
    ReviewCheckboxComponent,
    ReviewInputComponent,
    ReviewMatchTheFollowingComponent,
    ReviewRadioButtonComponent,
    ReviewTextAreaComponent,
    ReviewOrderTheSequenceComponent,
    ReviewSelectFromDropdownComponent,
    ReviewDragAndDropComponent,
    CrosswordPuzzleComponent,
    ReviewCrosswordPuzzleComponent
  ]
})
export class AppModule {

}
