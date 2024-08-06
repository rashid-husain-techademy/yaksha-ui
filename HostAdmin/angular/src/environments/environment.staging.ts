// "Hot Module Replacement" enabled environment

export const environment = {
    production: false,
    apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
    apiPlatformBaseUrl: 'https://lx-platform-perf.azurewebsites.net/',
    apiPlatformUrl: 'https://lx-platform-perf.azurewebsites.net/api/services/',
    hmr: false,
    appConfig: 'appconfig.staging.json',
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


    // SSO -> OIDC Client configurations
    authority: 'https://lx-platform-perf.azurewebsites.net/',
    client_id: 'angular',
    redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
    post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
    response_type: "code",
    scope: "openid profile default-api",
    filterProtocolClaims: true,
    loadUserInfo: true,
    wheeboxChatURL: "wss://chatuat.wheebox.com/",
    wheeboxAppURL: "https://uat.wheebox.com/",
    wheeboxInstance: "uatinstance",
    aeyeApiKey: "5TI1lok4.2giAcvJO4VwypqJ8iq9j2SOCxrDgTZ9J",
    aeyeTenantName: 'itc',
    aeyeWSSUrl: 'wss://dev.aeye.pro/apps/itc/lms/live_updates/api/v1/',
    // AdaptiveAssessment
    adaptiveAssessmentAPIURL: "https://dev-one.techademy.com/v1/",
    //slot email passcode
    passcode: '123e4567-e89b-12d3-a456-426614174000',
    //mml
    makeMyLabsBaseURL: 'dev.makemylabs.in',
    //jdoodle
    jdoodleSockJSURL: 'https://yaksha.jdoodle.com/v1/stomp',
    reCaptchaSiteKey: '6LfKy50lAAAAAAI5mhlajTQDeZHIlLuf2D3EFbC7',
    disableCaptchaToken: 'YmI8208Hj4KS',
    questionMetadataEditableTenantId: 135,

    instance1: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance2: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance3: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance4: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance5: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance6: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance7: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance8: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    },
    instance9: {
        appConfig: 'appconfig.staging_instance1.json',
        apiServerBaseUrl: 'https://yaksha-staging-core-api.azurewebsites.net/api/services/',
        apiPlatformBaseUrl: 'https://lx-platform-s1.azurewebsites.net/',
        apiPlatformUrl: 'https://lx-platform-s1.azurewebsites.net/api/services/',

        // SSO -> OIDC Client configurations for second instance
        authority: 'https://lx-platform-s1.azurewebsites.net/',
        client_id: 'angular',
        redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/auth-callback',
        post_logout_redirect_uri: 'https://yaksha-staging-ui.azurewebsites.net/',
        response_type: "code",
        scope: "openid profile default-api",
        filterProtocolClaims: true,
        loadUserInfo: true,
    }
};

