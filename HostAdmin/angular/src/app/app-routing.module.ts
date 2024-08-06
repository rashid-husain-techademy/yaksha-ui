import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { AnnouncementComponent } from './announcement/announcement.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ManageTagsComponent } from './admin/manage-tags/manage-tags.component';
import { ManageCatalogComponent } from './admin/catalog/manage-catalog/manage-catalog.component';
import { RoleAssignmentComponent } from './admin/role/role-assignment/role-assignment.component';
import { ScheduleConfigurationComponent } from './admin/schedule-configuration/schedule-configuration.component';
import { Permissions } from '@shared/roles-permission/permissions';
import { ViewGroupUsersComponent } from './view-group-users/view-group-users.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: FullComponent,
                children: [
                    { path: 'privacy', component: PrivacyComponent, canActivate: [AppRouteGuard] },
                    { path: 'announcement', component: AnnouncementComponent, canActivate: [AppRouteGuard] },
                    { path: 'manage-tags', component: ManageTagsComponent, canActivate: [AppRouteGuard] },
                    { path: 'manage-catalog', component: ManageCatalogComponent, canActivate: [AppRouteGuard] },
                    { path: 'role', component: RoleAssignmentComponent, canActivate: [AppRouteGuard], data: { permission: `${Permissions.roleManageAll}` } },
                    { path: 'schedule-option', component: ScheduleConfigurationComponent, canActivate: [AppRouteGuard], data: { permission: `${Permissions.superAdmin}` } },
                    { path: 'view-group-users/:id', component: ViewGroupUsersComponent, canActivate: [AppRouteGuard] },
                    {
                        path: 'my-assessments',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./my-assessments/my-assessments.module').then(m => m.MyAssessmentsModule)
                    },
                    {
                        path: 'assessments',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./assessments/assessments.module').then(m => m.AssessmentsModule)
                    },
                    {
                        path: 'user-dashboard',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./user-dashboard/user-dashboard.module').then(m => m.UserDashboardModule)
                    },
                    {
                        path: 'question',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/question/questions.module').then(m => m.QuestionsModule)
                    },
                    {
                        path: 'question-bank',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/question-bank/question-bank.module').then(m => m.QuestionBankModule)
                    },
                    {
                        path: 'analytics',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/analytics/analytics.module').then(m => m.AnalyticsModule)
                    },
                    {
                        path: 'assessment',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/assessment/assessment.module').then(m => m.AssessmentModule)
                    },
                    {
                        path: 'reports',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/reports/reports.module').then(m => m.ReportsModule)
                    },
                    {
                        path: 'users',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/users/users.module').then(m => m.UsersModule)
                    },
                    {
                        path: 'tenants',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/tenants/tenants.module').then(m => m.TenantsModule)
                    },
                    {
                        path: 'dashboard',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/dashboard/dashboard.module').then(m => m.DashboardModule)
                    },
                    {
                        path: 'profile',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/user-profile/user-profile.module').then(m => m.UserProfileModule)
                    },
                    {
                        path: 'test-taker',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./test-taker/test-taker.module').then(m => m.TestTakerModule)
                    },
                    {
                        path: 'reviewer',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./reviewer/reviewer.module').then(m => m.ReviewerModule)
                    },
                    {
                        path: 'assessment-review',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./assessment-review/assessment-review.module').then(m => m.AssessmentReviewModule)
                    },
                    {
                        path: 'drive',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/campaign/campaign.module').then(m => m.CampaignModule)
                    },
                    {
                        path: 'adaptive-assessment',
                        canActivateChild: [AppRouteGuard],
                        loadChildren: () => import('./admin/adaptive-assessment/adaptive-assessment.module').then(m => m.AdaptiveAssessmentModule)
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
