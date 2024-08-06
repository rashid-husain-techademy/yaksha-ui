import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudAssessmentComponent } from './cloud-assessment.component';

describe('CloudAssessmentComponent', () => {
  let component: CloudAssessmentComponent;
  let fixture: ComponentFixture<CloudAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
