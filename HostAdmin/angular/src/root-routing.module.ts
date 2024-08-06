import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenantloginComponent } from 'shared/tenantlogin/tenantlogin.component';
import { AuthCallbackComponent } from '@app/auth-callback/auth-callback.component';
import { SsoInternalComponent } from 'account/sso-internal/sso-internal.component';
import { QuicklinkStrategy } from 'ngx-quicklink';

const routes: Routes = [
    {
        path: ':tenantName',
        component: TenantloginComponent
    },
    {
        path: '',
        component: TenantloginComponent
    },
    {
        path: ':tenantName/account/internal-login',
        component: SsoInternalComponent
    },
    {
        path: 'auth-callback',
        component: AuthCallbackComponent
    },
    {
        path: ':tenantName/app',
        loadChildren: () => import('app/app.module').then(m => m.AppModule), // Lazy load app module
        data: { preload: true }
    },
    {
        path: ':tenantName/account',
        loadChildren: () => import('account/account.module').then(m => m.AccountModule), // Lazy load account module
        data: { preload: true }
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', preloadingStrategy: QuicklinkStrategy })],
    exports: [RouterModule],
    providers: []
})
export class RootRoutingModule { }
