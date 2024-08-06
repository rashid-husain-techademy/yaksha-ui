import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneAssessmentComponent } from './clone-assessment.component';

describe('CloneAssessmentComponent', () => {
  let component: CloneAssessmentComponent;
  let fixture: ComponentFixture<CloneAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
