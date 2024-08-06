import { AppConsts } from '@shared/AppConsts';
import { UtilsService } from 'abp-ng2-module';

export class SignalRAspNetCoreHelper {
    static initSignalR(): void {

        const encryptedAuthToken = new UtilsService().getCookieValue(AppConsts.authorization.encrptedAuthTokenName);

        abp.signalr = {
            autoConnect: false,
            connect: undefined,
            hubs: undefined,
            qs: AppConsts.authorization.encrptedAuthTokenName + '=' + encodeURIComponent(encryptedAuthToken),
            remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
            startConnection: undefined,
            url: '/signalr'
        };

        jQuery.getScript(AppConsts.appBaseUrl + '/assets/abp/abp.signalr-client.js');
    }
}
