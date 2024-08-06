import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGroupUsersComponent } from './view-group-users.component';

describe('ViewGroupUsersComponent', () => {
  let component: ViewGroupUsersComponent;
  let fixture: ComponentFixture<ViewGroupUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewGroupUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGroupUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
