import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdaptiveAssessmentComponent } from './create-adaptive-assessment.component';

describe('CreateAdaptiveAssessmentComponent', () => {
  let component: CreateAdaptiveAssessmentComponent;
  let fixture: ComponentFixture<CreateAdaptiveAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAdaptiveAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAdaptiveAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
