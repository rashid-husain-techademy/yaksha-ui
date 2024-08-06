import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewMatchTheFollowingComponent } from './review-match-the-following.component';

describe('ReviewMatchTheFollowingComponent', () => {
  let component: ReviewMatchTheFollowingComponent;
  let fixture: ComponentFixture<ReviewMatchTheFollowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewMatchTheFollowingComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewMatchTheFollowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
