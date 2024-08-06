import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankReportComponent } from './question-bank-report.component';

describe('QuestionBankReportComponent', () => {
  let component: QuestionBankReportComponent;
  let fixture: ComponentFixture<QuestionBankReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionBankReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
