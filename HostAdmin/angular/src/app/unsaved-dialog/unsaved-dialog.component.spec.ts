import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsavedDialogComponent } from './unsaved-dialog.component';

describe('UnsavedDialogComponent', () => {
  let component: UnsavedDialogComponent;
  let fixture: ComponentFixture<UnsavedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnsavedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsavedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
