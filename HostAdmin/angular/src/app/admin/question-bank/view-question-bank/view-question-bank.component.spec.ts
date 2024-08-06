import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestionBankComponent } from './view-question-bank.component';

describe('ViewQuestionBankComponent', () => {
  let component: ViewQuestionBankComponent;
  let fixture: ComponentFixture<ViewQuestionBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewQuestionBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQuestionBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
