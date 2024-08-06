import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { UtilsService } from 'abp-ng2-module';

@Component({
  selector: 'app-sso-internal',
  templateUrl: './sso-internal.component.html',
  styleUrls: ['./sso-internal.component.css']
})
export class SsoInternalComponent implements OnInit {
  path: string;
  tenantName: string;

  constructor(
    private router: Router,
    private tenantServiceProxy: TenantServiceProxy,
    private _utilsService: UtilsService,
    private toastrService: ToastrService
  ) { }

  ngOnInit() {
    this.path = this.router.url;
    this.tenantName = this.path.split('/')[1];
    if (this.tenantName) {
      this.checkTenant(this.tenantName);
    }
  }

  checkTenant(tenantName: string): void {
    this.tenantServiceProxy.GetIDProvider(tenantName, this._utilsService.getCookieValue("requestOrigin")).subscribe(res => {
      if (res) {
        const response = JSON.parse(res);
        if (response.SSOEnabled && response.TenantName === tenantName) {
          this._utilsService.setCookieValue("IsInternalLogin", this.path.includes("internal-login") + "", undefined, abp.appPath);
          this._utilsService.setCookieValue("SSOEnabled", false + "", undefined, abp.appPath);
          this._utilsService.setCookieValue(Constants.tenantName, response.TenantName, undefined, abp.appPath);
          this.router.navigate([`${tenantName}/account/landing`]);
        }
        else if (!response.SSOEnabled && response.TenantName === tenantName) {
          this.toastrService.error(`SSO not enabled for ${tenantName}!`);
          this.router.navigate([`${tenantName}/account/landing`]);
        }
      }
      else {
        this.toastrService.error('Please check the tenant name you entered!');
        this.router.navigate([`default/account/landing`]);
      }
    },
      error => console.error(error));
  }
}