import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/app-component-base';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { Constants } from '@app/models/constants';
import { UtilsService } from 'abp-ng2-module';
import { ToastrService } from 'ngx-toastr';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { Permissions } from '@shared/roles-permission/permissions';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
  selector: 'app-tenantlogin',
  templateUrl: './tenantlogin.component.html',
  styleUrls: ['./tenantlogin.component.css']
})
export class TenantloginComponent extends AppComponentBase implements OnInit {
  path: string;
  userRole: string;
  userRoles = UserRoles;

  constructor(injector: Injector,
    private router: Router,
    private tenantServiceProxy: TenantServiceProxy,
    private _appAuthService: AppAuthService,
    private _utilsService: UtilsService,
    private toastrService: ToastrService,
    private dataService: dataService,
    private appSessionService: AppSessionService) {
    super(injector);
  }

  ngOnInit() {
    this.path = this.router.url;
    setTimeout(() => {
      let permissios = abp.auth.grantedPermissions;
      this.dataService.setUserPermissions(permissios);
      if (permissios[Permissions.superAdmin])
        this.dataService.setUserRole(UserRoles[1]);
      else if (permissios[Permissions.tenantAdmin] && permissios[Permissions.roleManageAll])
        this.dataService.setUserRole(UserRoles[2]);
      else if (permissios[Permissions.testAdmin])
        this.dataService.setUserRole(UserRoles[3]);
      else if (permissios[Permissions.reviewer])
        this.dataService.setUserRole(UserRoles[4]);
      else if (permissios[Permissions.questionReviewerOnly])
        this.dataService.setUserRole(UserRoles[6]);
      else if (!(permissios[Permissions.roleManageAll]) && (permissios[Permissions.reportsManageAll] || permissios[Permissions.assesmentsManageAll] || permissios[Permissions.manageResourcesManageAll] || permissios[Permissions.questionsManageAll]))
        this.dataService.setUserRole(UserRoles[7]);
      else if (permissios[Permissions.tenantUser])
        this.dataService.setUserRole(UserRoles[5]);

      if (this.path === '/') {
        this.path = this._utilsService.getCookieValue(Constants.tenantName);
      }

      if (this.path === null) {
        this.path = Constants.default.toLocaleLowerCase();
      }
      this.dataService.userRole.subscribe(val => {
        this.userRole = val;
      });

      if (this.appSession.user && this.appSession.user.id && this.userRole === this.userRoles[6]) {
        this.router.navigate([`${this.path}/app/assessment-review`]);
      }
      else if (this.appSession.user && this.appSession.user.id && this.userRole !== this.userRoles[5] && this.userRole !== this.userRoles[4]) {
        this.router.navigate([`${this.path}/app/dashboard`]);
      }
      else if (this.appSession.user && this.appSession.user.id && this.userRole === this.userRoles[4]) {
        this.router.navigate([`${this.path}/app/reviewer/dashboard`]);
      }
      else if (this.appSession.user && this.appSession.user.id && this.userRole === this.userRoles[7]) {
        this.router.navigate([`${this.path}/app/dashboard`]);
      }
      else if (this.appSession.user && this.appSession.user.id && this.userRole === this.userRoles[5]) {
        let bool = this._utilsService.getCookieValue("enc_auth_user");
        if (bool === "true" && (this.dataService.isGurukashiTenant(this.appSessionService.tenantId) || this.dataService.isCognizantYakshaTenant(this.appSessionService.tenantId))) {
          this.router.navigate([`${this.path}/app/my-assessments`]);
        }
        else if (bool === "true") {
          this.router.navigate([`${this.path}/app/profile`]);
        }
        else {
          this.router.navigate([`${this.path}/app/announcement`]);
        }
      }
      else if (this.path.length < 64) {
        const tenantName = this.path.replace(/^\/+/g, '').toLocaleLowerCase();
        this.path = tenantName;
        this.checkTenantName(tenantName);
      }
      else {
        try {
          this._appAuthService.completeAuthentication();
        }
        catch (ex) {
          console.error(ex);
        }
      }
    }, 3000);
  }

  checkTenantName(tenantName: string): void {
    const format = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;
    this._utilsService.setCookieValue("requestOrigin", document.referrer);
    if (format.test(tenantName)) {
      this.router.navigate(['/default/account/landing']);
    } else {
      this.tenantServiceProxy.GetIDProvider(tenantName, this._utilsService.getCookieValue("requestOrigin")).
        subscribe(res => {
          // If tenant not exists then redirect to landing page
          // If SSO is not enabled then set tenant details in cookie & redirect to landing page
          // If SSO is enabled then set tenant details in cookie & challenge the user for authentication
          let response: any;

          if (res && res !== undefined && res !== null && res !== '') {
            response = JSON.parse(res);
            this._utilsService.setCookieValue("isValidAuthRequst", response.IsRedirectionWhitelisted);
            if (!response.IsRedirectionWhitelisted) {
              this.toastrService.warning(response.Message);
              return setTimeout(function () {
                return this.router.navigate([`/${this.path}/account/landing`]);
              }, 5000);
            }

            this._utilsService.setCookieValue("SSOEnabled", response.SSOEnabled + "", undefined, abp.appPath);
            this._utilsService.setCookieValue(Constants.tenantName, response.TenantName, undefined, abp.appPath);

            if (response && response.TenantName !== tenantName && !response.SSOEnabled) {
              this._utilsService.setCookieValue(Constants.tenantName, Constants.default.toLowerCase());
              return this.router.navigate(['/default/account/landing']);
            }

            if (response && response.TenantName === tenantName && !response.SSOEnabled) {
              return this.router.navigate([`/${this.path}/account/landing`]);
            }

          }
          else {
            return this.router.navigate(['/default/account/landing']);
          }

          if (response && tenantName && response.TenantName === tenantName && response.SSOEnabled) {
            if (!this._appAuthService.isLoggedIn() && tenantName.toLowerCase() !== Constants.default.toLowerCase()) {
              this._appAuthService.startAuthentication(tenantName);
            }
            else if (this._appAuthService.isLoggedIn() && tenantName.toLowerCase() !== Constants.default.toLowerCase()) {
              this._appAuthService.setToken(this._appAuthService.getToken());
              this._appAuthService.completeAuthentication();
            }
            else if (tenantName.toLowerCase() === Constants.default.toLowerCase()) {
              this._utilsService.setCookieValue(Constants.tenantName, null);
              return this.router.navigate(['/default/account/landing']);
            }
            else {
              this._appAuthService.completeAuthentication();
            }
          }
          else {
            return this.router.navigate(['/default/account/landing']);
          }
        });
    }
  }
}
