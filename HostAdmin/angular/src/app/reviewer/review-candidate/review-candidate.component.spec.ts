import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCandidateComponent } from './review-candidate.component';

describe('ReviewCandidateComponent', () => {
  let component: ReviewCandidateComponent;
  let fixture: ComponentFixture<ReviewCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewCandidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
