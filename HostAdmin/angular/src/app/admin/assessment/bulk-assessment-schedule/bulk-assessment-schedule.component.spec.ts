import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAssessmentScheduleComponent } from './bulk-assessment-schedule.component';

describe('BulkAssessmentScheduleComponent', () => {
  let component: BulkAssessmentScheduleComponent;
  let fixture: ComponentFixture<BulkAssessmentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkAssessmentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkAssessmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
