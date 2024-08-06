import { environment as en } from "environments/environment";
import { Constants } from "@app/models/constants";

export class TenantHelper {
    /**
     * Tenant based environment config file management
     */
    static readonly instance1EnabledTenant = en.instance1EnabledTenant;
    static readonly instance2EnabledTenant = en.instance2EnabledTenant;
    static readonly instance3EnabledTenant = en.instance3EnabledTenant;
    static readonly instance4EnabledTenant = en.instance4EnabledTenant;
    static readonly instance5EnabledTenant = en.instance5EnabledTenant;
    static readonly instance6EnabledTenant = en.instance6EnabledTenant;
    static readonly instance7EnabledTenant = en.instance7EnabledTenant;
    static readonly instance8EnabledTenant = en.instance8EnabledTenant;
    static readonly instance9EnabledTenant = en.instance9EnabledTenant;

    static readonly currentTenant = abp.utils.getCookieValue(Constants.tenantName) ? abp.utils.getCookieValue(Constants.tenantName) : TenantHelper.getTenantName();

    static getEnvironmentBasedValue(property: string): any {
        if (this.instance1EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance1[property];
        }
        if (this.instance2EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance2[property];
        }
        if (this.instance3EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance3[property];
        }
        if (this.instance4EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance4[property];
        }
        if (this.instance5EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance5[property];
        }
        if (this.instance6EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance6[property];
        }
        if (this.instance7EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance7[property];
        }
        if (this.instance8EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance8[property];
        }
        if (this.instance9EnabledTenant.toLowerCase() === this.currentTenant.toLowerCase()) {
            return en.instance9[property];
        }
        else {
            return en[property];
        }
    }

    static getTenantName(): string {
        var pathname = window.location.pathname;
        const path = pathname.split('/')[1];

        if (path.length < 64) {
            const tenantName = path.replace(/^\/+/g, '');
            const format = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;
            if (!format.test(tenantName)) {
                return tenantName;
            }
        }
        return Constants.default;
    }
}
