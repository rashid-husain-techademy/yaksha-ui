import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoInternalComponent } from './sso-internal.component';

describe('SsoInternalComponent', () => {
  let component: SsoInternalComponent;
  let fixture: ComponentFixture<SsoInternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsoInternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsoInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
