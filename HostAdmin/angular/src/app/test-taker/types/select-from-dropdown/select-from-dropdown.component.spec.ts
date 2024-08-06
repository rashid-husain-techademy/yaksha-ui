import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFromDropdownComponent } from './select-from-dropdown.component';

describe('SelectFromDropdownComponent', () => {
  let component: SelectFromDropdownComponent;
  let fixture: ComponentFixture<SelectFromDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectFromDropdownComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFromDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
