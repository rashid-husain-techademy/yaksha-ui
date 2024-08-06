import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProctoringComponent } from './proctoring.component';

describe('ProctoringComponent', () => {
  let component: ProctoringComponent;
  let fixture: ComponentFixture<ProctoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProctoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProctoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
