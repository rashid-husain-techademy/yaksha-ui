import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverIdscanRedirectComponent } from './approver-idscan-redirect.component';

describe('ApproverIdscanRedirectComponent', () => {
  let component: ApproverIdscanRedirectComponent;
  let fixture: ComponentFixture<ApproverIdscanRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproverIdscanRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverIdscanRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
