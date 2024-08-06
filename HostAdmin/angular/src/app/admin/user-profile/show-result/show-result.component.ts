import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@app/models/constants';
import { UserProfileService } from '../user-profile.service';
import { ShowAnswerDto, UserAssessmentAtemptResultDto } from '../my-profile/my-profile';

@Component({
  selector: 'app-show-result',
  templateUrl: './show-result.component.html',
  styleUrls: ['./show-result.component.scss']
})
export class ShowResultComponent implements OnInit {
  constants = Constants;
  userId: number;
  assessmentSecheduleId: number;
  mcqs: UserAssessmentAtemptResultDto[];
  selectedSectionId: number;
  sections: ShowAnswerDto[];
  constructor(private activateRoute: ActivatedRoute,
    private userProfileService: UserProfileService,) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe(params => {
      if (params['id']) {
        let data = atob(params['id']).split('/');
        this.userId = parseInt(data[0]);
        this.assessmentSecheduleId = parseInt(data[1]);
      }
    });
    let data = {
      userId: this.userId,
      assessmentScheduleId: this.assessmentSecheduleId
    };
    this.userProfileService.getUserAssessmentAnswers(data).subscribe(res => {
      if (res.result) {
        this.sections = res.result;
        this.selectedSectionId = this.sections[0].assessmentSectionId;
        this.mcqs = this.sections[0].attemptResult;
      }
    });
  }

  onSelectedSession(assessmentSectionId: number) {
    this.selectedSectionId = assessmentSectionId;
    this.mcqs = this.sections.find(x => x.assessmentSectionId == assessmentSectionId).attemptResult;
  }

}
