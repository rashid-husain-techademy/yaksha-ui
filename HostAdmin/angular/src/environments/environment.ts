// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
    production: false,
    apiServerBaseUrl: 'https://localhost:44359/api/services/',
    apiPlatformBaseUrl: 'https://localhost:44380/',
    apiPlatformUrl: 'https://localhost:44380/api/services/',
    hmr: false,
    appConfig: 'appconfig.json',
    isB2CInstance: false,
    instance1EnabledTenant: 'quinnnox',
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
    authority: 'https://localhost:44380/',
    client_id: 'angular',
    redirect_uri: 'http://localhost:4200/auth-callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type: "code",
    scope: "openid profile default-api",
    filterProtocolClaims: true,
    loadUserInfo: true,
    wheeboxChatURL: "wss://akschat.wheebox.com/",
    wheeboxAppURL: "https://wheebox.com/",
    wheeboxInstance: "wbinstance",
    mml: "https://uat.makemylabs.co.in",
    aeyeApiKey: "5TI1lok4.2giAcvJO4VwypqJ8iq9j2SOCxrDgTZ9J",
    aeyeTenantName: 'itc',
    aeyeWSSUrl: 'wss://dev.aeye.pro/apps/itc/lms/live_updates/api/v1/',
    reCaptchaSiteKey: '6LfKy50lAAAAAAI5mhlajTQDeZHIlLuf2D3EFbC7',
    captchaDisabledTenants: "default,iihtinternal",
    disableCaptchaToken: 'YmI8208Hj4KS',
    questionMetadataEditableTenantId: 135,
    //slot email passcode
    passcode: '123e4567-e89b-12d3-a456-426614174000',
    // AdaptiveAssessment
    adaptiveAssessmentAPIURL: "https://assessmenttest.techademycampus.com/v1/",

    //mml
    makeMyLabsBaseURL: 'dev.makemylabs.in',
    //jdoodle
    jdoodleSockJSURL: 'https://yaksha.jdoodle.com/v1/stomp',

    instance1: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },

    instance2: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance3: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance4: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance5: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance6: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance7: {
        appConfig: 'appconfig_instance1.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance8: {
        appConfig: 'appconfig_instance8.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    },
    instance9: {
        appConfig: 'appconfig_instance8.json',
        apiServerBaseUrl: 'https://localhost:44360/api/services/',
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
        loadUserInfo: true,
    }
};
