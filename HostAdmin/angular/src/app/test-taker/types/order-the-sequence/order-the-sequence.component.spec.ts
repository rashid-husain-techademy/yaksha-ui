import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTheSequenceComponent } from './order-the-sequence.component';

describe('OrderTheSequenceComponent', () => {
  let component: OrderTheSequenceComponent;
  let fixture: ComponentFixture<OrderTheSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderTheSequenceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTheSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
