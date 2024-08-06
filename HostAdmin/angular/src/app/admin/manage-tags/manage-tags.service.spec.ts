import { TestBed } from '@angular/core/testing';

import { ManageTagService } from './manage-tags.service';

describe('ManageTagService', () => {
  let service: ManageTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
