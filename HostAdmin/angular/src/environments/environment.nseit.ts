// "Production" enabled environment

export const environment = {
    production: true,
    apiServerBaseUrl: 'https://yaksha-production-core-api.azurewebsites.net/api/services/',
    apiPlatformBaseUrl: 'https://idp-prod-iris.azurewebsites.net/',
    apiPlatformUrl: 'https://idp-prod-iris.azurewebsites.net/api/services/',

    hmr: false,
    appConfig: 'appconfig.nseit.json',
    isB2CInstance: false,
    instance1EnabledTenant: 'quinnox',
    instance2EnabledTenant: 'cloudassert',
    instance3EnabledTenant: 'tcsion',
    instance4EnabledTenant: 'stlacademy',
    instance5EnabledTenant: 'ramco',
    instance6EnabledTenant: 'amazon',
    instance7EnabledTenant: 'socgen',
    instance8EnabledTenant: 'virtusa',
    instance9EnabledTenant: 'prolifics',

    //Cloud Assessment
    azureBaseUrl: "https://portal.azure.com",
    //slot email passcode
    passcode:'123e4567-e89b-12d3-a456-426614174000',

    // SSO -> OIDC Client configurations
    authority: 'https://idp-prod-iris.azurewebsites.net/',
    client_id: 'angular',
    redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
    post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
    response_type: "code",
    scope: "openid profile default-api",
    filterProtocolClaims: true,
    loadUserInfo: true,
    wheeboxChatURL: "wss://akschat.wheebox.com/",
    wheeboxAppURL: "https://wheebox.com/",
    wheeboxInstance: "wbinstance",
    makeMyLabsBaseURL: 'laas.makemylabs.in',
    aeyeApiKey: "KtevgszI.Czj19rD5PIiFkzlDAF9GEy7kGjpUABlc",
    aeyeTenantName: 'yaksha',
    aeyeWSSUrl: 'wss://aeye.pro/apps/yaksha/lms/live_updates/api/v1/',
    //jdoodle
    jdoodleSockJSURL: 'https://yaksha.jdoodle.com/v1/stomp',
    reCaptchaSiteKey: '6LczMfklAAAAADKOQvNQl7_8pks4x0erP0w2tx5Z',
    disableCaptchaToken: 'YmI8208Hj4KS',
    questionMetadataEditableTenantId: 543,

    instance1: {
        appConfig: 'appconfig.production_instance1.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-quinnox.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-quinnox.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-quinnox.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-quinnox.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance2: {
        appConfig: 'appconfig.production_instance2.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-cloudassert.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-cloudassert.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-cloudassert.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-cloudassert.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance3: {
        appConfig: 'appconfig.production_instance3.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-tcsion.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-tcsion.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-tcsion.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-tcsion.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance4: {
        appConfig: 'appconfig.production_instance4.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-stlacademy.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-stlacademy.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-stlacademy.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-stlacademy.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance5: {
        appConfig: 'appconfig.production_instance5.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-ramco.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-ramco.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-ramco.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-ramco.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance6: {
        appConfig: 'appconfig.production_instance6.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-amazon.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-amazon.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-amazon.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-amazon.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance7: {
        appConfig: 'appconfig.production_instance7.json',
        apiServerBaseUrl: 'https://apisocgen.yaksha.com/api/services/',
        apiPlatformBaseUrl: 'https://idpsocgen.techademy.in/',
        apiPlatformUrl: 'https://idpsocgen.techademy.in/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idpsocgen.techademy.in/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance8: {
        appConfig: 'appconfig.production_instance8.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-virtusa.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-virtusa.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-virtusa.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-virtusa.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance9: {
        appConfig: 'appconfig.production_instance9.json',
        apiServerBaseUrl: 'https://yaksha-production-core-api-prolifics.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://idp-prod-iris-prolifics.azurewebsites.net/',
        apiPlatformUrl: 'https://idp-prod-iris-prolifics.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://idp-prod-iris-prolifics.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://dextest.nseitonline.com/auth-callback',
        post_logout_redirect_uri: 'https://dextest.nseitonline.com/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    }
};
