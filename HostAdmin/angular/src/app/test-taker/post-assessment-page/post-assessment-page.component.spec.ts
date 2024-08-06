import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAssessmentPageComponent } from './post-assessment-page.component';

describe('PostAssessmentPageComponent', () => {
  let component: PostAssessmentPageComponent;
  let fixture: ComponentFixture<PostAssessmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAssessmentPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAssessmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
