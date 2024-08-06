import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentInsightsComponent } from './assessment-insights/assessment-insights.component';
import { QuestionBankReportComponent } from './question-bank-report/question-bank-report.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsEmbedComponent } from './analytics-embed/analytics-embed.component'

@NgModule({
    declarations: [
        AssessmentInsightsComponent,
        QuestionBankReportComponent,
        AnalyticsEmbedComponent
    ],
    imports: [
        SharedModule,
        AnalyticsRoutingModule,
        NgbModule
    ]
})
export class AnalyticsModule { }