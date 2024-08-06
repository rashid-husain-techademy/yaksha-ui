import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCatalogComponent } from './manage-catalog.component';

describe('ManageCatalogComponent', () => {
  let component: ManageCatalogComponent;
  let fixture: ComponentFixture<ManageCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
