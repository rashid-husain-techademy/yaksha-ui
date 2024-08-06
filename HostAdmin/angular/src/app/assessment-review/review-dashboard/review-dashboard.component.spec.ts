import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDashboardComponent } from './review-dashboard.component';

describe('ReviewDashboardComponent', () => {
  let component: ReviewDashboardComponent;
  let fixture: ComponentFixture<ReviewDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
