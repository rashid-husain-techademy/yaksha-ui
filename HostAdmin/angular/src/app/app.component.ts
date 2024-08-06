import { Component, Injector, OnInit, AfterViewInit, Inject } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RoutesRecognized } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { ToastrService } from 'ngx-toastr';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { SignalRAspNetCoreHelper } from '@shared/helpers/SignalRAspNetCoreHelper';
import { filter, pairwise } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { Subject } from 'rxjs';

@Component({
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],

})
export class AppComponent extends AppComponentBase implements OnInit, AfterViewInit {
    loading: boolean = true;
    fuseConfig: any;
    navigation: any;

    // Private
    _unsubscribeAll: Subject<any>;

    constructor(
        private idle: Idle,
        private router: Router,
        private toastr: ToastrService,
        private authService: AppAuthService,
        private _platform: Platform,
        injector: Injector,
        @Inject(DOCUMENT) private document: any,
        // @Inject(PLATFORM_ID) private platformId: Object
    ) {
        super(injector);
        //checking for session timeout on user idle
        idle.setIdle(21600);
        idle.setTimeout(10);
        idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        idle.onTimeoutWarning.subscribe((countdown) => {
            if (countdown === 10) {
                this.toastr.warning("Your session will expire in " + countdown + " seconds!");
            }
        });
        idle.onTimeout.subscribe(() => {
            this.authService.logout(true);
            this.toastr.error("Session got expired. Please login into the session again");
        });
        this.reset();

        this.router.events.subscribe((routerEvent: Event) => {
            this.checkRouterEvent(routerEvent);
        });

        this.router.events
            .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
            .subscribe((events: RoutesRecognized[]) => {

            });

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    reset() {
        this.idle.watch();
    }

    checkRouterEvent(routerEvent: Event): void {
        if (routerEvent instanceof NavigationStart) {
            this.loading = true;
        }
        if (routerEvent instanceof NavigationEnd ||
            routerEvent instanceof NavigationCancel ||
            routerEvent instanceof NavigationError) {
            this.loading = false;
        }
    }

    ngOnInit(): void {
        this.appInit();
    }

    ngAfterViewInit(): void {
        $.AdminBSB.activateAll();
        $.AdminBSB.activateDemo();
    }

    onResize(event) {
        // exported from $.AdminBSB.activateAll
        $.AdminBSB.leftSideBar.setMenuHeight();
        $.AdminBSB.leftSideBar.checkStatuForResize(false);

        // exported from $.AdminBSB.activateDemo
        $.AdminBSB.demo.setSkinListHeightAndScroll();
        $.AdminBSB.demo.setSettingListHeightAndScroll();
    }

    appInit() {
        SignalRAspNetCoreHelper.initSignalR();
        abp.event.on('abp.notifications.received', userNotification => {
            abp.notifications.showUiNotifyForUserNotification(userNotification);
            // Desktop notification
            Push.create('AbpZeroTemplate', {
                body: userNotification.notification.data.message,
                icon: abp.appPath + 'assets/app-logo-small.png',
                timeout: 6000,
                onClick: function () {
                    window.focus();
                    this.close();
                }
            });
        });

    }
}
