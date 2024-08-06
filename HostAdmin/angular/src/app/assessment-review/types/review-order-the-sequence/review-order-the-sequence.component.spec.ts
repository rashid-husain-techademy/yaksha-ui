import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewOrderTheSequenceComponent } from './review-order-the-sequence.component';

describe('ReviewOrderTheSequenceComponent', () => {
  let component: ReviewOrderTheSequenceComponent;
  let fixture: ComponentFixture<ReviewOrderTheSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewOrderTheSequenceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewOrderTheSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
