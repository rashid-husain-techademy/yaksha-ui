import { Component, HostListener, Injector, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';
import { AppComponentBase } from '@shared/app-component-base';
import { dataService } from '@app/service/common/dataService';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-post-assessment-reviewer-view',
  templateUrl: './post-assessment-reviewer-view.component.html',
  styleUrls: ['./post-assessment-reviewer-view.component.scss']
})
export class PostAssessmentReviewerViewComponent extends AppComponentBase implements OnInit {
  logoUrl: string = 'assets/images/yaksha-logo.png';
  constants = Constants;
  tenantId: number;
  isCustomThemeEnabled: boolean = false;
  isTenantLogoLoaded: boolean = false;
  isABInBev: boolean = false;

  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(
    private dataService: dataService,
    private tenantService: TenantsService,
    injector: Injector) {
    super(injector);
    if (window.location !== window.parent.location) {
      // in iframe
    } else {
      window.location.hash = "no-back-button";
      window.location.hash = "Again-No-back-button";
      window.onhashchange = function () { window.location.hash = "no-back-button"; };
    }
  }

  ngOnInit(): void {
    this.tenantId = this.appSession.tenantId;
    if (this.tenantId) {
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.tenantId);
      this.isABInBev = this.dataService.checkCustomThemeForAbinBev(this.tenantId);
      this.tenantService.getTenantCustomizationSettings(this.tenantId).pipe(
        finalize(() => {
          this.isTenantLogoLoaded = true;
        })).subscribe(res => {
        if (res && res.result) {
          let customizationSettings = JSON.parse(res.result) as TenantCustomizationSettings;
          this.logoUrl = customizationSettings.TenantLogoUrl;
        }
      }, error => {
        console.error(error);
      });
    }
    else {
      this.isTenantLogoLoaded = true;
    }
  }
}
