import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAssessmentPageViewComponent } from './post-assessment-page-view.component';

describe('PostAssessmentPageViewComponent', () => {
  let component: PostAssessmentPageViewComponent;
  let fixture: ComponentFixture<PostAssessmentPageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAssessmentPageViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAssessmentPageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
