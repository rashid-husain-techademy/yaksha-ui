import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantloginComponent } from './tenantlogin.component';

describe('TenantloginComponent', () => {
  let component: TenantloginComponent;
  let fixture: ComponentFixture<TenantloginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantloginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
