import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewTextAreaComponent } from './review-text-area.component';

describe('ReviewTextAreaComponent', () => {
  let component: ReviewTextAreaComponent;
  let fixture: ComponentFixture<ReviewTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewTextAreaComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
