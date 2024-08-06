import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permissions } from '@shared/roles-permission/permissions';
import { AssessmentInsightsComponent } from './assessment-insights/assessment-insights.component';
import { QuestionBankReportComponent } from './question-bank-report/question-bank-report.component';

const routes: Routes = [
    { path: 'assessment-insights', component: AssessmentInsightsComponent, data: { permission: `${Permissions.superAdmin}` } },
    { path: 'question-bank-report', component: QuestionBankReportComponent, data: { permission: `${Permissions.superAdmin}` } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
