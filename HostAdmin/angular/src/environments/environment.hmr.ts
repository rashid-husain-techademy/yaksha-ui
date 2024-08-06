// "Hot Module Replacement" enabled environment

export const environment = {
    production: false,
    apiServerBaseUrl: 'http://localhost:44360/api/services/',
    apiPlatformBaseUrl: 'https://localhost:44380/',
    apiPlatformUrl: 'https://localhost:44380/api/services/',
    hmr: true,
    appConfig: 'appconfig.json',
    isB2CInstance: false,
    instance1EnabledTenant: 'quinnox',
    instance2EnabledTenant: 'cloudassert',
    instance3EnabledTenant: 'tcsion',
    instance4EnabledTenant: 'stlacademy',
    instance5EnabledTenant: 'ramco',

    //Cloud Assessment
    azureBaseUrl: "https://portal.azure.com",
    //slot email passcode
    passcode:'123e4567-e89b-12d3-a456-426614174000',

    // SSO -> OIDC Client configurations
    authority: 'https://lx-platform.azurewebsites.net/',
    client_id: 'angular',
    redirect_uri: 'http://localhost:4200/auth-callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type: "code",
    scope: "openid profile default-api",
    filterProtocolClaims: true,
    loadUserInfo: true,
    wheeboxChatURL: "wss://chatuat.wheebox.com/",
    wheeboxAppURL: "https://uat.wheebox.com/",
    wheeboxInstance: "uatinstance",
    //jdoodle
    jdoodleSockJSURL: 'https://yaksha.jdoodle.com/v1/stomp',
    reCaptchaSiteKey: '6LfKy50lAAAAAAI5mhlajTQDeZHIlLuf2D3EFbC7',

    instance1: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'http://localhost:44360/api/services/',
        apiPlatformBaseUrl: 'https://localhost:44380/',
        apiPlatformUrl: 'https://localhost:44380/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'http://localhost:4200/auth-callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true
    },

    instance2: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'http://localhost:44360/api/services/',
        apiPlatformBaseUrl: 'https://localhost:44380/',
        apiPlatformUrl: 'https://localhost:44380/api/services/',

        // SSO -> OIDC Client configurations for third instance
        authority: 'https://lx-platform.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'http://localhost:4200/auth-callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true
    },

    instance3: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'http://localhost:44360/api/services/',
        apiPlatformBaseUrl: 'https://localhost:44380/',
        apiPlatformUrl: 'https://localhost:44380/api/services/',

        // SSO -> OIDC Client configurations for fourth instance
        authority: 'https://lx-platform.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'http://localhost:4200/auth-callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true
    },

    instance4: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'http://localhost:44360/api/services/',
        apiPlatformBaseUrl: 'https://localhost:44380/',
        apiPlatformUrl: 'https://localhost:44380/api/services/',

        // SSO -> OIDC Client configurations for fourth instance
        authority: 'https://lx-platform.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'http://localhost:4200/auth-callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true
    },
    instance5: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'http://localhost:44360/api/services/',
        apiPlatformBaseUrl: 'https://localhost:44380/',
        apiPlatformUrl: 'https://localhost:44380/api/services/',

        // SSO -> OIDC Client configurations for fourth instance
        authority: 'https://lx-platform.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'http://localhost:4200/auth-callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true
    }
};
