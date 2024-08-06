import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateCampaignComponent } from './validate-campaign.component';

describe('ValidateCampaignComponent', () => {
  let component: ValidateCampaignComponent;
  let fixture: ComponentFixture<ValidateCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
