import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentReviewListComponent } from './assessment-review-list.component';

describe('AssessmentReviewListComponent', () => {
  let component: AssessmentReviewListComponent;
  let fixture: ComponentFixture<AssessmentReviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentReviewListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
