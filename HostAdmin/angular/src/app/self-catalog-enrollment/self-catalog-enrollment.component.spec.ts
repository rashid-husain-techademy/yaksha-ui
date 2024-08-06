import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfCatalogEnrollmentComponent } from './self-catalog-enrollment.component';

describe('SelfCatalogEnrollmentComponent', () => {
  let component: SelfCatalogEnrollmentComponent;
  let fixture: ComponentFixture<SelfCatalogEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfCatalogEnrollmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfCatalogEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
