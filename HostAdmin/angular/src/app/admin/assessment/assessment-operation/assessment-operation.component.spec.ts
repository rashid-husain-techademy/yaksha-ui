import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentOperationComponent } from './assessment-operation.component';

describe('AssessmentOperationComponent', () => {
  let component: AssessmentOperationComponent;
  let fixture: ComponentFixture<AssessmentOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentOperationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
