import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileUploadComponent } from './mobile-upload.component';

describe('MobileUploadComponent', () => {
  let component: MobileUploadComponent;
  let fixture: ComponentFixture<MobileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
