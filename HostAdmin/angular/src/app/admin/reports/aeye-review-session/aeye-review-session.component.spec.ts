import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeyeReviewSessionComponent } from './aeye-review-session.component';

describe('AeyeReviewSessionComponent', () => {
  let component: AeyeReviewSessionComponent;
  let fixture: ComponentFixture<AeyeReviewSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AeyeReviewSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeyeReviewSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
