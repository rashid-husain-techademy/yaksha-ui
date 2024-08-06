import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewQuestionnaireComponent } from './review-questionnaire.component';

describe('ReviewQuestionnaireComponent', () => {
  let component: ReviewQuestionnaireComponent;
  let fixture: ComponentFixture<ReviewQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
