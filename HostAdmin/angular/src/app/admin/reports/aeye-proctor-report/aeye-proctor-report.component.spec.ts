import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeyeProctorReportComponent } from './aeye-proctor-report.component';

describe('AeyeProctorReportComponent', () => {
  let component: AeyeProctorReportComponent;
  let fixture: ComponentFixture<AeyeProctorReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AeyeProctorReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeyeProctorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
