import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInviteComponent } from './schedule-invite.component';

describe('ScheduleInviteComponent', () => {
  let component: ScheduleInviteComponent;
  let fixture: ComponentFixture<ScheduleInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleInviteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
