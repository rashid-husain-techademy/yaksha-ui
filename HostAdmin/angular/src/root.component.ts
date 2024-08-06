import { Component } from '@angular/core';
import { Spinkit } from 'ng-http-loader';

@Component({
    selector: 'app-root',
    template: `
    <router-outlet>
    <ng-http-loader
    [backgroundColor]="'#169EFB'"
    [backdropBackgroundColor]="'#EEF5F9'"
    [spinner]="spinkit.skThreeBounce"
    [filteredUrlPatterns]="['InsertOrUpdateUserAttemptQuestions', 'GetContainerInstanceStatus', 'UpdateAssessmentQuestionDuration', 'AutoSaveCodingQuestion', 'GetVMDetails' ,'GenerateConnectionURL' , 'UpdateVMDetails' ,'UpdateVirtualMachine' , 'GetSubmittedSubjectiveFileAsync']">
    </ng-http-loader>
    </router-outlet>`
})
export class RootComponent {
    public spinkit = Spinkit;
}
