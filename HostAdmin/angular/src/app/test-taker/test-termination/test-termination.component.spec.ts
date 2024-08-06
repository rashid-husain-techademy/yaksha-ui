import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTerminationComponent } from './test-termination.component';

describe('TestTerminationComponent', () => {
  let component: TestTerminationComponent;
  let fixture: ComponentFixture<TestTerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestTerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
