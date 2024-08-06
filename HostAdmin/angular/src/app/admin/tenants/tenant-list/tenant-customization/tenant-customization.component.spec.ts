import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantCustomizationComponent } from './tenant-customization.component';

describe('TenantCustomizationComponent', () => {
  let component: TenantCustomizationComponent;
  let fixture: ComponentFixture<TenantCustomizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantCustomizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantCustomizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
