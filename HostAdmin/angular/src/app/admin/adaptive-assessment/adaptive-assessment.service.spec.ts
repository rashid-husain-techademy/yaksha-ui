import { TestBed } from '@angular/core/testing';

import { AdaptiveAssessmentService } from './adaptive-assessment.service';

describe('AdaptiveAssessmentService', () => {
  let service: AdaptiveAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdaptiveAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
