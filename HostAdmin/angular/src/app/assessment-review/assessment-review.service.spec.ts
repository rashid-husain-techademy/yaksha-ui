import { TestBed } from '@angular/core/testing';

import { AssessmentReviewService } from './assessment-review.service';

describe('AssessmentReviewService', () => {
  let service: AssessmentReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
