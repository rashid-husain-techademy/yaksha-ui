import { Permissions } from "@shared/roles-permission/permissions";

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    permissionName: string;
    class: string;
    ddclass: string;
    extralink: boolean;
    submenu: RouteInfo[];
}

export const ROUTES: RouteInfo[] = [
    {
        path: 'dashboard',
        title: 'Dashboard',
        icon: 'mdi mdi-view-dashboard',
        permissionName: `${Permissions.dashboardManageAll}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'user-dashboard',
        title: 'Dashboard',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.tenantUserOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'assessments',
        title: 'Assessments',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.tenantUserOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'my-assessments',
        title: 'My Assessments',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.tenantUserOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: '',
        title: 'Assessments',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.assesmentsManageAll}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: "assessment/list-assessment",
                title: "Assessments Catalog",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "assessment/assessment-review",
                title: "Assessments On Review",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "assessment/create-assessment",
                title: "Create Assessment",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            // {
            //     path: "assessment/create-adaptive-assessment",
            //     title: "Create Adaptive Assessment",
            //     icon: "mdi mdi-adjust",
            //     permissionName: `${Permissions.assesmentsManageAll}`,
            //     class: "",
            //     ddclass: '',
            //     extralink: false,
            //     submenu: [],
            // },
            {
                path: "drive/list-drive",
                title: "Drives Catalog",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "assessment/bulk-schedule",
                title: "Bulk Assessment Schedule",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.superAdmin},${Permissions.tenantAdmin}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
        ]
    }, {
        path: '',
        title: 'Adaptive Assessments',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.assesmentsManageAll}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: "adaptive-assessment/adaptive-assessment-catalog",
                title: "Adaptive Assessment Catalog",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "adaptive-assessment/create-adaptive-assessment",
                title: "Create Adaptive Assessment",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.assesmentsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            }
        ]
    },
    {
        path: '',
        title: 'Question Bank',
        icon: 'mdi mdi-database',
        permissionName: `${Permissions.questionsManageAll}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: "question-bank/question-bank-operation",
                title: "Question Bank",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.questionsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "question/create-question",
                title: "Create Question",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.questionsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "question/bulk-upload-history",
                title: "Bulk Upload History",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.questionsManageAll}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            }
        ]
    },
    {
        path: '',
        title: 'Users',
        icon: 'mdi mdi-account-multiple',
        permissionName: `${Permissions.superAdmin},${Permissions.tenantAdmin}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: "users",
                title: "User List",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.superAdmin},${Permissions.tenantAdmin}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            }
        ]
    },
    {
        path: '',
        title: 'Manage Resource',
        icon: 'fas fa-tags',
        permissionName: `${Permissions.manageResourcesManageAll}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: 'manage-catalog',
                title: 'Manage Catalog',
                icon: 'mdi mdi-view-dashboard',
                permissionName: `${Permissions.manageResourcesManageAll}`,
                class: '',
                ddclass: '',
                extralink: false,
                submenu: []
            },
            {
                path: 'manage-tags',
                title: 'Manage Tags',
                icon: 'fas fa-tags',
                permissionName: `${Permissions.superAdmin}`,
                class: '',
                ddclass: '',
                extralink: false,
                submenu: []
            }
        ]
    },

    {
        path: '',
        title: 'Tenants',
        icon: 'mdi mdi-city',
        permissionName: `${Permissions.superAdmin}`,
        class: 'has-arrow',
        ddclass: '',
        extralink: false,
        submenu: [
            {
                path: "tenants",
                title: "Tenant List",
                icon: "mdi mdi-adjust",
                permissionName: `${Permissions.superAdmin}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            },
            {
                path: "schedule-option",
                title: "Customize Schedule",
                icon: "fas fa-cogs",
                permissionName: `${Permissions.superAdmin}`,
                class: "",
                ddclass: '',
                extralink: false,
                submenu: [],
            }

        ]
    },
    {
        path: 'reports',
        title: 'Reports',
        icon: 'fas fa-file-excel',
        permissionName: `${Permissions.reportsManageAll}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'role',
        title: 'Role',
        icon: 'fas fa-cogs',
        permissionName: `${Permissions.roleManageAll}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'tenants/customization',
        title: 'Customization',
        icon: 'fas ti-pencil',
        permissionName: `${Permissions.roleManageAll}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'reviewer/dashboard',
        title: 'Dashboard',
        icon: 'mdi mdi-view-dashboard',
        permissionName: `${Permissions.reviewerOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: 'reviewer/assessments',
        title: 'Assessments',
        icon: 'mdi mdi-code-tags-check',
        permissionName: `${Permissions.reviewerOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: []
    },
    {
        path: "assessment-review",
        title: "Assessments On Review",
        icon: "mdi mdi-adjust",
        permissionName: `${Permissions.questionReviewerOnly}`,
        class: '',
        ddclass: '',
        extralink: false,
        submenu: [],
    },

];
