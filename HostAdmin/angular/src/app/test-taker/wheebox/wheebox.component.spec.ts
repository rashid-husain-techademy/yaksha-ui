import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheeboxComponent } from './wheebox.component';

describe('WheeboxComponent', () => {
  let component: WheeboxComponent;
  let fixture: ComponentFixture<WheeboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WheeboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WheeboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
