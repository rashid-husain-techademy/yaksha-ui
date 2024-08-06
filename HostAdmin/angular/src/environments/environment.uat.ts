// "Hot Module Replacement" enabled environment

export const environment = {
    production: true,
    apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
    apiPlatformBaseUrl: 'https://iamserver.azurewebsites.net/',
    apiPlatformUrl: 'https://iamserver.azurewebsites.net/api/services/',
    hmr: false,
    appConfig: 'appconfig.uat.json',
    isB2CInstance: false,
    instance1EnabledTenant: 'quinnnox',
    instance2EnabledTenant: 'cloudassert',
    instance3EnabledTenant: 'tcsion',
    instance4EnabledTenant: 'stlacademy',
    instance5EnabledTenant: 'ramco',
    instance6EnabledTenant: 'amazon',
    instance7EnabledTenant: 'socgen',
    instance8EnabledTenant: 'virtusa',
    instance9EnabledTenant: 'virtusa',
    //Cloud Assessment
    azureBaseUrl: "https://portal.azure.com",
    //slot email passcode
    passcode:'123e4567-e89b-12d3-a456-426614174000',

    // SSO -> OIDC Client configurations
    authority: 'https://iamserver.azurewebsites.net/',
    client_id: 'angular',
    redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
    post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
    response_type: "code",
    scope: "openid profile default-api",
    filterProtocolClaims: true,
    loadUserInfo: true,
    wheeboxChatURL: "wss://akschat.wheebox.com/",
    wheeboxAppURL: "https://wheebox.com/",
    wheeboxInstance: "wbinstance",
    aeyeApiKey: "qHthwTx9.VN8d2WIXGjULzHYsb9cw2ClUteX3nct3",
    aeyeTenantName: 'yaksha',
    aeyeWSSUrl: 'wss://uat.aeye.pro/apps/yaksha/lms/live_updates/api/v1/',
    //mml
    makeMyLabsBaseURL: 'uat.makemylabs.in',
    //jdoodle
    jdoodleSockJSURL: 'https://yaksha.jdoodle.com/v1/stomp',
    reCaptchaSiteKey: '6LfKy50lAAAAAAI5mhlajTQDeZHIlLuf2D3EFbC7',
    disableCaptchaToken: 'YmI8208Hj4KS',
    questionMetadataEditableTenantId: 135,

    instance1: {
        appConfig: 'appconfig.uat_instance1.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance2: {
        appConfig: 'appconfig.uat_instance2.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance3: {
        appConfig: 'appconfig.uat_instance3.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance4: {
        appConfig: 'appconfig.uat_instance4.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance5: {
        appConfig: 'appconfig.uat_instance5.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance6: {
        appConfig: 'appconfig.uat_instance1.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance7: {
        appConfig: 'appconfig.uat_instance1.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance8: {
        appConfig: 'appconfig.uat_instance1.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance9: {
        appConfig: 'appconfig.uat_instance1.json',
        apiServerBaseUrl: 'https://yaksha-uatt-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://iamserver-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://iamserver-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://iamserver-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-uatt-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    }
};
