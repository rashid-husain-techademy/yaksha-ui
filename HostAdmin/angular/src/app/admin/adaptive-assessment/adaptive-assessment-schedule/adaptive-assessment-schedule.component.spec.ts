import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdaptiveAssessmentScheduleComponent } from './adaptive-assessment-schedule.component';

describe('AdaptiveAssessmentScheduleComponent', () => {
  let component: AdaptiveAssessmentScheduleComponent;
  let fixture: ComponentFixture<AdaptiveAssessmentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdaptiveAssessmentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdaptiveAssessmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
