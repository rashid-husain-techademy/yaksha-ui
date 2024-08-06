import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppSessionService } from './session/app-session.service';
import { AppUrlService } from './nav/app-url.service';
import { AppAuthService } from './auth/app-auth.service';
import { AppRouteGuard } from './auth/auth-route-guard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { BlockDirective } from './directives/block.directive';
import { BusyDirective } from './directives/busy.directive';
import { EqualValidator } from './directives/equal-validator.directive';
import { TenantloginComponent } from './tenantlogin/tenantlogin.component';
import { AbpModule } from 'abp-ng2-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropDirective } from '@app/drag-drop.directive';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QuicklinkModule } from 'ngx-quicklink';
import { DisableCopyDirective } from './directives/disable-copy.directive';
import { DisablePasteDirective } from './directives/disable-paste.directive';
import { DisableRightClickDirective } from './directives/disable-right-click.directive';
import { DisableSelectDirective } from './directives/disable-select.directive';
import { DisableDragDirective } from './directives/disable-drag.directive';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { SafeHtmlPipe } from '@app/service/common/safe.pipe';
@NgModule({
    imports: [
        CommonModule,
        AbpModule,
        RouterModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        NgMultiSelectDropDownModule.forRoot(),
        QuicklinkModule,
        AngularMultiSelectModule
    ],
    declarations: [
        BlockDirective,
        BusyDirective,
        EqualValidator,
        TenantloginComponent,
        DragDropDirective,
        DisableCopyDirective,
        DisablePasteDirective,
        DisableSelectDirective,
        DisableRightClickDirective,
        DisableDragDirective,
        SafeHtmlPipe
    ],
    exports: [
        CommonModule,
        AbpModule,
        FormsModule,
        ReactiveFormsModule,
        BlockDirective,
        BusyDirective,
        DisableCopyDirective,
        DisablePasteDirective,
        DisableRightClickDirective,
        DisableSelectDirective,
        DisableDragDirective,
        EqualValidator,
        CdkTableModule,
        CdkTreeModule,
        DragDropModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        ScrollingModule,
        DragDropDirective,
        NgMultiSelectDropDownModule,
        QuicklinkModule,
        AngularMultiSelectModule,
        SafeHtmlPipe
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: [
                AppSessionService,
                AppUrlService,
                AppAuthService,
                AppRouteGuard
            ]
        };
    }
}
