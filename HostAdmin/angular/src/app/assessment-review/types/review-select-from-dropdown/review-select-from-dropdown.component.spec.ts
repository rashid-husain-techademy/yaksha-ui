import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSelectFromDropdownComponent } from './review-select-from-dropdown.component';

describe('ReviewSelectFromDropdownComponent', () => {
  let component: ReviewSelectFromDropdownComponent;
  let fixture: ComponentFixture<ReviewSelectFromDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewSelectFromDropdownComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSelectFromDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
