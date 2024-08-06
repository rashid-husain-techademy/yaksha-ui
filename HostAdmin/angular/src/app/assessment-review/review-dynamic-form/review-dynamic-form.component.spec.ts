import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDynamicFormComponent } from './review-dynamic-form.component';

describe('ReviewDynamicFormComponent', () => {
  let component: ReviewDynamicFormComponent;
  let fixture: ComponentFixture<ReviewDynamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewDynamicFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
