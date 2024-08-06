import { TestBed } from '@angular/core/testing';

import { TenantloginService } from './tenantlogin.service';

describe('TenantloginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TenantloginService = TestBed.get(TenantloginService);
    expect(service).toBeTruthy();
  });
});
