import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAssessmentReviewerViewComponent } from './post-assessment-reviewer-view.component';

describe('PostAssessmentReviewerViewComponent', () => {
  let component: PostAssessmentReviewerViewComponent;
  let fixture: ComponentFixture<PostAssessmentReviewerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostAssessmentReviewerViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAssessmentReviewerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
