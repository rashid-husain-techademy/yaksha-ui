import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdaptiveAssessmentCatalogComponent } from './adaptive-assessment-catalog.component';

describe('AdaptiveAssessmentCatalogComponent', () => {
  let component: AdaptiveAssessmentCatalogComponent;
  let fixture: ComponentFixture<AdaptiveAssessmentCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdaptiveAssessmentCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdaptiveAssessmentCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
