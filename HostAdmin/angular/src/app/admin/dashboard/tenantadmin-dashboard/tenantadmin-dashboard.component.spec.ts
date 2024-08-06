import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantadminDashboardComponent } from './tenantadmin-dashboard.component';

describe('TenantadminDashboardComponent', () => {
  let component: TenantadminDashboardComponent;
  let fixture: ComponentFixture<TenantadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantadminDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
