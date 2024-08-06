import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackReportComponent } from './stack-report.component';

describe('StackReportComponent', () => {
  let component: StackReportComponent;
  let fixture: ComponentFixture<StackReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StackReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
