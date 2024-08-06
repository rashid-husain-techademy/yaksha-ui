import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
// import { OAuthService } from 'angular-oauth2-oidc';


export interface AppResponse {
    status: number;
    message: string;
    data: object;
}
@Injectable()
export class TokenizedInterceptor implements HttpInterceptor {
    // private _authService: OAuthService;

    constructor() { }
        // private _injector: Injector) { }

    // Add authozization token to the request
    private setHeaders(request: HttpRequest<any>) {
        const token = abp.auth.getToken();
        if (token !== undefined) {
            request = request.clone({
                setHeaders: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return request;
    }

    // getAuthService(): OAuthService {
    //     if (typeof this._authService === 'undefined') {
    //         this._authService = this._injector.get(OAuthService);
    //     }
    //     return this._authService;
    // }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = this.setHeaders(request);
        return next.handle(request)
            .pipe(
                catchError((error: any) => {
                    if (error instanceof HttpErrorResponse) {
                        switch (error.status) {
                            case 0:
                                return throwError(error);

                            case 400:
                            case 401:
                            case 403:
                            case 404:
                            case 500:
                            default:
                                return throwError({ status: error.status, message: error.message } as AppResponse);
                        }
                    } else if (error.error instanceof ErrorEvent) { // Client Side Error
                        return throwError(error);
                    } else {  // Server Side Error
                        return throwError(error);
                    }

                }),
                finalize(() => {
                    // do something at the end
                })
            );
    }
}

