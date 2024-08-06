import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetrainRedirectComponent } from './facetrain-redirect.component';

describe('FacetrainRedirectComponent', () => {
  let component: FacetrainRedirectComponent;
  let fixture: ComponentFixture<FacetrainRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacetrainRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetrainRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
