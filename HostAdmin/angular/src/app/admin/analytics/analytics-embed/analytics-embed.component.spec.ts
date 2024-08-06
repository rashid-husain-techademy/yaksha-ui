import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsEmbedComponent } from './analytics-embed.component';

describe('AnalyticsEmbedComponent', () => {
  let component: AnalyticsEmbedComponent;
  let fixture: ComponentFixture<AnalyticsEmbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsEmbedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
