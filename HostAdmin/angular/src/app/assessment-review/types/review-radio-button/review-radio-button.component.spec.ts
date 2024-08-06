import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewRadioButtonComponent } from './review-radio-button.component';

describe('ReviewRadioButtonComponent', () => {
  let component: ReviewRadioButtonComponent;
  let fixture: ComponentFixture<ReviewRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewRadioButtonComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
