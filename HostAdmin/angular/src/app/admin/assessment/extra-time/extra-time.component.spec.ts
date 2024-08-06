import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraTimeComponent } from './extra-time.component';

describe('ExtraTimeComponent', () => {
  let component: ExtraTimeComponent;
  let fixture: ComponentFixture<ExtraTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
