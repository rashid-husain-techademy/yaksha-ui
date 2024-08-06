import { Injectable } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AuthenticateModel, AuthenticateResultModel, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { TokenService, UtilsService } from 'abp-ng2-module';
import { ApiClientService } from '@app/service';
import { Observable } from 'rxjs';
import { Result } from '@app/shared/core-interface/base';

const routes = {
    isUserExist: 'yaksha/User/IsUserExist',
}

@Injectable()
export class LoginService {

    static readonly twoFactorRememberClientTokenName = 'TwoFactorRememberClientToken';

    authenticateModel: AuthenticateModel;
    authenticateResult: AuthenticateResultModel;
    isLoading: boolean;
    rememberMe: boolean;

    constructor(
        private _tokenAuthService: TokenAuthServiceProxy,
        private _utilsService: UtilsService,
        private _tokenService: TokenService,
        private toastrService: ToastrService,
        private apiClient: ApiClientService
    ) {
        this.clear();
    }

    isUserExist(userEmailAddress: string): Observable<Result<string>> {
        return this.apiClient.get(routes.isUserExist + "?userEmailAddress=" + userEmailAddress + "&tenantName=" + this._utilsService.getCookieValue(Constants.tenantName));
    }

    authenticate(finallyCallback?: () => void): void {
        finallyCallback = finallyCallback || (() => { });

        this.authenticateModel.tenancyName = this._utilsService.getCookieValue(Constants.tenantName);
        // this.userService.getLoginUserStatus(data).subscribe(res => {
        //     if (res.result) {
        this._tokenAuthService
            .authenticate(this.authenticateModel)
            .pipe(
                finalize(() => {
                    this.doneLoading();
                }))
            .subscribe((result: AuthenticateResultModel) => {
                this.processAuthenticateResult(result);
            });
        // }
        // else
        //     this.toastrService.error(Constants.invalidUserNameOrPassword);
        // });
    }

    private doneLoading(): void {
        this.isLoading = false;
    }

    getToken(finallyCallback?: () => void): void {
        this._tokenService.getToken();
    }

    private processAuthenticateResult(authenticateResult: AuthenticateResultModel) {
        this.authenticateResult = authenticateResult;
        if (authenticateResult.accessToken) {
            // Successfully logged in
            this.login(
                authenticateResult.accessToken,
                authenticateResult.encryptedAccessToken,
                authenticateResult.expireInSeconds,
                this.rememberMe);

        } else {
            if (this.authenticateResult.errorMessage === "InvalidUserNameOrEmailAddress")
                this.toastrService.error(Constants.invalidUserNameOrPassword);
            else
                this.toastrService.error(this.authenticateResult.errorMessage);
        }
    }

    private login(accessToken: string, encryptedAccessToken: string, expireInSeconds: number, rememberMe?: boolean): void {
        const tokenExpireDate = rememberMe ? (new Date(new Date().getTime() + 1000 * expireInSeconds)) : undefined;

        this._tokenService.setToken(
            accessToken,
            tokenExpireDate
        );

        this._utilsService.setCookieValue(
            AppConsts.authorization.encrptedAuthTokenName,
            encryptedAccessToken,
            tokenExpireDate,
            abp.appPath
        );
        this._utilsService.setCookieValue(
            AppConsts.authorization.authorizedUser,
            "true",
            undefined,
            abp.appPath
        );
        let initialUrl = UrlHelper.initialUrl;
        if (initialUrl.indexOf('/account') > 0) {
            initialUrl = AppConsts.appBaseUrl;
        }
        location.href = initialUrl;
    }

    private clear(): void {
        this.authenticateModel = new AuthenticateModel();
        this.authenticateModel.rememberClient = false;
        this.authenticateResult = null;
        this.rememberMe = false;
    }
}
