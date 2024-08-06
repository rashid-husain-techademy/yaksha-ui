import { Injectable } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { CookieService } from 'ngx-cookie-service';
import { UserManager, User, UserManagerSettings } from 'oidc-client';
import { Constants } from '@app/models/constants';
import { AppSessionService } from '@shared/session/app-session.service';
import { Router } from '@angular/router';
import { environment as en } from "environments/environment";
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { TenantHelper } from '@shared/helpers/TenantHelper';
import { TokenService } from 'abp-ng2-module';

@Injectable()
export class AppAuthService {
    isB2CInstance = en.isB2CInstance;
    tenantName: string;
    private manager: UserManager = null;
    private user: User = null;
    router: Router = null;

    constructor(private cookieService: CookieService,
        private userService: UserServiceProxy,
        private _tokenService: TokenService,
        private _appSessionService: AppSessionService,
        _router: Router) {
        this.router = _router;
        this.manager = new UserManager(this.getClientSettings(undefined));
        this.manager.getUser().then(user => {
            this.user = user;
            if (this.user && this.user.access_token) {
                _tokenService.setToken(this.user.access_token);
            }
        }).catch(function (ex) {
            console.error("User " + ex);
        });
    }

    isLoggedIn(): boolean {
        return this.user !== null && !this.user.expired;
    }

    getClaims(): any {
        return this.user.profile;
    }

    getToken(): any {
        return this.user.access_token;
    }

    setToken(access_token: string): void {
        this._tokenService.setToken(access_token);
    }

    getAuthorizationHeaderValue(): string {
        return `${this.user.token_type} ${this.user.access_token}`;
    }

    startAuthentication(tenantName: string): Promise<void> {
        this.manager = new UserManager(this.getClientSettings(tenantName));
        return this.manager.signinRedirect();
    }

    completeAuthentication(): Promise<void> {
        // eslint-disable-next-line no-console
        console.log('Auth: Auth called');
        return this.manager.signinRedirectCallback().then(user => {
            this.user = user;
            // eslint-disable-next-line no-console
            console.log('Auth: Auth verified' + this.user.profile);
            this._tokenService.setToken(this.user.access_token);
            if (Object.keys(abp.utils).length) {
                this.tenantName = abp.utils.getCookieValue("tenantName");
                // eslint-disable-next-line no-console
                console.log('Auth: Tenant name: ' + this.tenantName);
                //this._router.navigate([this.selectBestRoute()]);
                let previousUrl: any = abp.utils.getCookieValue('ssoInitialUrl');
                if (previousUrl) {
                    // eslint-disable-next-line no-console
                    console.log('Auth: Previous URL blcok: ' + this.tenantName);
                    abp.utils.setCookieValue("isAutoAuthenticated", "true", undefined, abp.appPath);
                    this._appSessionService.init().then(() => {
                        location.href = previousUrl;
                    });
                }
                else {
                    // eslint-disable-next-line no-console
                    console.log('Auth: Normal block: ' + this.tenantName);
                    this._appSessionService.init().then(() => {
                        location.href = `${this.tenantName}/app/dashboard`;
                    });
                }
            }
        }).catch(function (ex) {
            console.error(ex);
            this.tenantName = abp.utils.getCookieValue("tenantName");
            console.error('Auth: Complete auth exceptional: ' + this.tenantName);
            if (this.tenantName) {
                location.href = `${this.tenantName}/account/landing`;
            }
            else {
                location.href = `default/account/landing`;
            }
        });
    }

    logout(reload?: boolean): void {
        this.userService.logout().subscribe(res => {
            let SSOEnabled = JSON.parse(abp.utils.getCookieValue("SSOEnabled"));
            let tenantName = abp.utils.getCookieValue("tenantName");
            this.cookieService.deleteAll('/');
            this.cookieService.deleteAll('/app');
            abp.auth.clearToken();

            // retrieve the tenancyname from cookie and set it back.
            if (tenantName) {
                if (SSOEnabled) {
                    sessionStorage.clear();
                    this.manager.signoutRedirect();
                }
                this.manager.clearStaleState().then(() => {
                }).catch(ex => {
                    console.error(ex);
                });
                this.manager.removeUser().then(() => {
                    this.cookieService.deleteAll('/');
                    this.cookieService.deleteAll('/app');
                    abp.auth.clearToken();
                    abp.utils.setCookieValue("tenantName", tenantName, undefined, abp.appPath);
                    location.href = AppConsts.appBaseUrl;
                }).catch(ex => {
                    console.error(ex);
                });
            }
            abp.utils.setCookieValue(AppConsts.authorization.encrptedAuthTokenName, undefined, undefined, abp.appPath);
            abp.utils.setCookieValue(AppConsts.authorization.authorizedUser, undefined, undefined, abp.appPath);
            if (!tenantName && reload !== false) {
                location.href = AppConsts.appBaseUrl;
            }
        });
    }

    getClientSettings(tenantName: string): UserManagerSettings {
        return {
            authority: TenantHelper.getEnvironmentBasedValue("authority"),
            client_id: TenantHelper.getEnvironmentBasedValue("client_id"),
            redirect_uri: TenantHelper.getEnvironmentBasedValue("redirect_uri"),
            post_logout_redirect_uri: TenantHelper.getEnvironmentBasedValue("post_logout_redirect_uri"),
            response_type: TenantHelper.getEnvironmentBasedValue("response_type"),
            scope: TenantHelper.getEnvironmentBasedValue("scope"),
            filterProtocolClaims: TenantHelper.getEnvironmentBasedValue("filterProtocolClaims"),
            loadUserInfo: TenantHelper.getEnvironmentBasedValue("loadUserInfo"),
            extraQueryParams: {
                "tenantName": tenantName ? tenantName : abp.utils.getCookieValue(Constants.tenantName) ? abp.utils.getCookieValue(Constants.tenantName) : TenantHelper.getTenantName()
            }
        };
    }
}
