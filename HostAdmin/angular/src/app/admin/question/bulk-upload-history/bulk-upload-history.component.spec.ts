import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadHistoryComponent } from './bulk-upload-history.component';

describe('BulkUploadHistoryComponent', () => {
  let component: BulkUploadHistoryComponent;
  let fixture: ComponentFixture<BulkUploadHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
