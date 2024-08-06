// import { UserManagerSettings } from "oidc-client";
// import { Constants } from "@app/models/constants";
// import { environment as en } from "environments/environment";
// import { AppAuthService } from "@shared/auth/app-auth.service";

// export const authConfig: UserManagerSettings = {
//     authority: en.authority,
//     client_id: en.client_id,
//     redirect_uri: en.redirect_uri,
//     post_logout_redirect_uri: en.post_logout_redirect_uri,
//     response_type: en.response_type,
//     scope: en.scope,
//     filterProtocolClaims: en.filterProtocolClaims,
//     loadUserInfo: en.loadUserInfo,
//     extraQueryParams: {
//         "tenantName": abp.utils.getCookieValue(Constants.tenantName) ? abp.utils.getCookieValue(Constants.tenantName) :  this.getTenantName()
//     }
// }
