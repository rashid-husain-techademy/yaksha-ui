import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentInsightsComponent } from './assessment-insights.component';

describe('AssessmentInsightsComponent', () => {
  let component: AssessmentInsightsComponent;
  let fixture: ComponentFixture<AssessmentInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentInsightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
