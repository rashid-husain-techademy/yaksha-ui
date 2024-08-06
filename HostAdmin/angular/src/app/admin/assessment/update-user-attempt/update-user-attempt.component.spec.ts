import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserAttemptComponent } from './update-user-attempt.component';

describe('UpdateUserAttemptComponent', () => {
  let component: UpdateUserAttemptComponent;
  let fixture: ComponentFixture<UpdateUserAttemptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateUserAttemptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
