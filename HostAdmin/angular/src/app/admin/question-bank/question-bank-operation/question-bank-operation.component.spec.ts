import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankOperationComponent } from './question-bank-operation.component';

describe('QuestionBankOperationComponent', () => {
  let component: QuestionBankOperationComponent;
  let fixture: ComponentFixture<QuestionBankOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionBankOperationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
