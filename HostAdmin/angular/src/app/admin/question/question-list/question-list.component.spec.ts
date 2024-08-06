import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QbSubCatalogComponent } from './question-list.component';

describe('QbSubCatalogComponent', () => {
  let component: QbSubCatalogComponent;
  let fixture: ComponentFixture<QbSubCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QbSubCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QbSubCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
