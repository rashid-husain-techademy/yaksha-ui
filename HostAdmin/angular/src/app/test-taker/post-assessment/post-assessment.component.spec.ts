import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAssessmentComponent } from './post-assessment.component';

describe('PostAssessmentComponent', () => {
  let component: PostAssessmentComponent;
  let fixture: ComponentFixture<PostAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
