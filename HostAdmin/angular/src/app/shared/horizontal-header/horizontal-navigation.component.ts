import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { UserService } from '@app/admin/users/users.service';
import { UserDto } from '@app/admin/users/users';
import { AppSessionService } from '@shared/session/app-session.service';
import { UtilsService } from 'abp-ng2-module';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { finalize } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-horizontal-navigation',
  templateUrl: './horizontal-navigation.component.html',
  styleUrls: ['./horizontal-navigation.component.scss']
})
export class HorizontalNavigationComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  public config: PerfectScrollbarConfigInterface = {};
  constants = Constants;
  public showSearch = false;
  isCustomThemeEnabled: boolean = false;
  isGuruKashiTenant: boolean = false;
  isCognizantYakshaTenant: boolean = false;

  public isCollapsed = false;
  public showMobileMenu = false;
  userRole: string;
  userRoles = UserRoles;
  user: UserDto;
  tenantName: string;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  authUser: boolean = false;
  isTenantLogoLoaded: boolean = false;
  searchString: string = '';
  enableSearch: boolean = false;

  constructor(
    private _authService: AppAuthService,
    public router: Router,
    public dataService: dataService,
    private userService: UserService,
    private appSessionService: AppSessionService,
    private _utilsService: UtilsService,
    private tenantService: TenantsService
  ) {
  }

  ngOnInit() {
    let bool = this._utilsService.getCookieValue("enc_auth_user");
    if (bool === "true")
      this.authUser = true;
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
      if (this.userRole == 'SUPERADMIN' || this.userRole == 'TENANTADMIN') {
        this.enableSearch = true;
      }
      this.getUserDetail();
      if (this.dataService.isGurukashiTenant(this.appSessionService.tenantId) && this.userRole == 'TENANTUSER') {
        this.isGuruKashiTenant = true;
      }
      if (this.dataService.isCognizantYakshaTenant(this.appSessionService.tenantId) && this.userRole == 'TENANTUSER') {
        this.isCognizantYakshaTenant = true;
      }
    });
    this.tenantName = abp.utils.getCookieValue("tenantName");

    if (this.appSessionService.tenantId) {
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.appSessionService.tenantId);
      this.getTenantCustomizationSettings();
    }
    else {
      this.isTenantLogoLoaded = true;
    }

    this.dataService.isTenantLogoUpdated.subscribe(value => {
      if (value)
        this.getTenantCustomizationSettings();
    })
  }

  searchQuestionBank(searchString: string) {
    if (searchString != '') {
      let queryParam = btoa(searchString);
      this.router.navigate([this.tenantName + `/app/question-bank/search-results/${queryParam}`]);
      this.searchString = "";
    }
    else
      return;
  }

  getTenantCustomizationSettings() {
    this.tenantService.getTenantCustomizationSettings(this.appSessionService.tenantId).pipe(
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

  profileList() {
    this.isCollapsed = !this.isCollapsed;
    this.getUserDetail();
  }

  getUserDetail() {
    const cacheEnabled: boolean = true;
    this.userService.getUser(cacheEnabled).subscribe(user => {
      this.dataService.userProfile = user.result;
    });
  }

  myProfile(): void {
    this.router.navigate([this.tenantName + '/app/profile']);
  }

  logout(): void {
    this._authService.logout(true);
  }

  goToMain(): void {
    this.router.navigate([this.tenantName + '/app/dashboard']);
  }

}