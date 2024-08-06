import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCheckboxComponent } from './review-checkbox.component';

describe('ReviewCheckboxComponent', () => {
  let component: ReviewCheckboxComponent;
  let fixture: ComponentFixture<ReviewCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewCheckboxComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
