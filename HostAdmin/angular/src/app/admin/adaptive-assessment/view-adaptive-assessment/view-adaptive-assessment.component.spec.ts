import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdaptiveAssessmentComponent } from './view-adaptive-assessment.component';

describe('ViewAdaptiveAssessmentComponent', () => {
  let component: ViewAdaptiveAssessmentComponent;
  let fixture: ComponentFixture<ViewAdaptiveAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAdaptiveAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdaptiveAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
