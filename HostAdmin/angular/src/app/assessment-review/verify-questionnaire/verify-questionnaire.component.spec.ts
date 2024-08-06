import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyQuestionnaireComponent } from './verify-questionnaire.component';

describe('VerifyQuestionnaireComponent', () => {
  let component: VerifyQuestionnaireComponent;
  let fixture: ComponentFixture<VerifyQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
