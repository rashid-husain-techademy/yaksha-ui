import { Injectable } from '@angular/core';
import { AppSessionService } from '../session/app-session.service';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { AppAuthService } from './app-auth.service';
import { Constants } from '@app/models/constants';
import { PermissionCheckerService, UtilsService } from 'abp-ng2-module';

@Injectable()
export class AppRouteGuard implements CanActivate, CanActivateChild {
    permissions: any = [];
    path: string;
    
    constructor(
        private _permissionChecker: PermissionCheckerService,
        private _router: Router,
        private _authService: AppAuthService,
        private _sessionService: AppSessionService,
        private _utilsService: UtilsService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        var pathname = window.location.pathname;
        this.path = pathname.split('/')[1];

        // check why router url is always '/'
        // this.path = this._router.url;

        this._utilsService.setCookieValue('ssoInitialUrl', pathname, undefined, abp.appPath);

        if (this.path === '/') {
            this.path = this._utilsService.getCookieValue('tenantName');
        }

        if (this.path === null) {
            this.path = Constants.default.toLocaleLowerCase();
        }

        if (this.path !== this._utilsService.getCookieValue('tenantName') && (this._sessionService.user || this._authService.isLoggedIn())) {
            window.location.href = this.generateTenancyUrl(pathname);
            return false;
        }

        if (!this._sessionService.user && !this._authService.isLoggedIn()) {
            this._router.navigate([`${this.path}/account/landing`]);
            return false;
        }

        if (!route.data || !route.data['permission']) {
            return true;
        }
        if (route.data) {
            this.permissions = route.data['permission'].split(',');
            for (let permission of this.permissions) {
                // if (permission !== Roles.superAdmin && permission !== Roles.tenantAdmin) {
                //     // return this.dataService.userRole.rolePermissions.includes(permission);
                //     // console.log(this.dataService.userRole);
                //     console.log(abp.auth.grantedPermissions);
                // }
                if (this._permissionChecker.isGranted(permission)) {
                    return true;
                }
            }

        }

        this._router.navigate([this.selectBestRoute()]);
        return false;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    selectBestRoute(): string {
        if (!this._sessionService.user) {
            return '/account/landing';
        }

        if (this._permissionChecker.isGranted('Admin.Users.Manage.All')) {
            return '/app/admin/users';
        }

        return '/app/dashboard';
    }

    generateTenancyUrl(currentPath: string): string {
        let pathData = currentPath.split('/');
        pathData[1] = this._utilsService.getCookieValue('tenantName');
        return pathData.join('/');
    }
}
