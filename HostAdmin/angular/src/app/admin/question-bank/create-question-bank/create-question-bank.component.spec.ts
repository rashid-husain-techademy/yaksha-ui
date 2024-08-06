import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestionBankComponent } from './create-question-bank.component';

describe('CreateQuestionBankComponent', () => {
  let component: CreateQuestionBankComponent;
  let fixture: ComponentFixture<CreateQuestionBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateQuestionBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateQuestionBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
