import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { Router } from '@angular/router';
import { UtilsService } from 'abp-ng2-module';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { Constants } from '@app/models/constants';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})

export class LandingComponent extends AppComponentBase implements OnInit {
  tenantName: string;
  isCustomThemeEnabled: boolean = false;
  isDisableCaptcha: boolean = false;
  constructor(injector: Injector,
    private router: Router,
    private utilsService: UtilsService,
    private _appAuthService: AppAuthService,
    private toastrService: ToastrService,
    private tenantServiceProxy: TenantServiceProxy,) {
    super(injector);
    this.tenantName = this.utilsService.getCookieValue('tenantName');

    if (this.tenantName) {
      this.tenantName = this.tenantName.toLocaleLowerCase();
    }

    if (this.appSession && this.appSession.user && this.appSession.user.id) {
      this.router.navigate([`${this.tenantName}/app/dashboard`]);
    }
    if (this.tenantName) {
      this.checkLogin(this.tenantName);
    }
  }

  ngOnInit() {
    const path = this.router.url.split('/')[1];
    if (this.tenantName === null) {
      this.router.navigate([path]);
    }
    else if (this.tenantName !== path) {
      this.router.navigate([path]);
    }
    else {
      this.utilsService.deleteCookie(Constants.tenantName);
      document.cookie = `${Constants.tenantName}=${this.tenantName};path=/`;

    }
    this.tenantName = abp.utils.getCookieValue("tenantName");

    if (this.tenantName === 'nseitdex') {
      this.isCustomThemeEnabled = true;
    }

    if (this.tenantName === 'gurukashi') {
      this.isDisableCaptcha = true;
    }
  }

  checkLogin(tenantName: string, isInviteURL: boolean = false): void {
    this.tenantServiceProxy.GetIDProvider(tenantName, this.utilsService.getCookieValue("requestOrigin")).subscribe(res => {
      if (res) {
        let response = JSON.parse(res);
        this.utilsService.setCookieValue("isValidAuthRequst", response.IsRedirectionWhitelisted);
        if (!response.IsRedirectionWhitelisted) {
          this.toastrService.warning(response.Message);
          return setTimeout(function () {
            return this.router.navigate([`/${this.path}/account/landing`]);
          }, 5000);
        }
        if (response.SSOEnabled) {
          this.utilsService.setCookieValue("SSOEnabled", response.SSOEnabled + "", undefined, abp.appPath);
          this.utilsService.setCookieValue(Constants.tenantName, response.TenantName, undefined, abp.appPath);
          if (!this._appAuthService.isLoggedIn()) {
            if (this.utilsService.getCookieValue("IsInternalLogin") === "true") {
              return;
            }
            this._appAuthService.startAuthentication(response.TenantName);
          }
          else if (this._appAuthService.isLoggedIn()) {
            this._appAuthService.setToken(this._appAuthService.getToken());
            this._appAuthService.completeAuthentication();
          }
        }
        else {
          if (this.appSession.user && this.appSession.user.id) {
            this.router.navigate([`${tenantName}/app/home`]);
          }
        }
      }
    },
      error => console.error(error));
  }
}
