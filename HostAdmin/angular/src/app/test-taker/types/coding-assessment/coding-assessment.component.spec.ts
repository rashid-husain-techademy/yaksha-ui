import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingAssessmentComponent } from './coding-assessment.component';

describe('CodingAssessmentComponent', () => {
  let component: CodingAssessmentComponent;
  let fixture: ComponentFixture<CodingAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodingAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodingAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
