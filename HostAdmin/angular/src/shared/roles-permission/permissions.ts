export class Permissions {
    public static readonly superAdmin = 'Tenants.Manage.All';
    public static readonly tenantAdmin = 'User.Manage.All';
    public static readonly testAdmin = 'Tenant.TestAdmin.Manage.All';
    public static readonly reviewer = 'Tenant.Reviewer.Manage.All';
    public static readonly tenantUser = 'Tenant.User.Default';
    public static readonly tenantUserOnly = 'Tenant.User.Default.Only';
    public static readonly reviewerOnly = 'Tenant.Reviewer.Default.Only';
    public static readonly questionReviewerOnly = 'Tenant.Question.Reviewer.Default.Only';

    public static readonly questionsManageAll = "Questions.Manage.All";
    public static readonly reportsManageAll = "Reports.Manage.All";
    public static readonly assesmentsManageAll = "Assessments.Manage.All";
    public static readonly manageResourcesManageAll = "ManageResources.Manage.All";
    public static readonly roleManageAll = 'Role.Manage.All';
    public static readonly dashboardManageAll = 'Dashboard.Manage.All'
}
