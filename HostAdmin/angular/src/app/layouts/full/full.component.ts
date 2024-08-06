import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles } from '@app/enums/user-roles';
import { dataService } from '@app/service/common/dataService';
import { Permissions } from '@shared/roles-permission/permissions';
import { NavigationService } from '../../../../src/app/service/common/navigation.service';
declare var $: any;

import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppSessionService } from '@shared/session/app-session.service';
import { Constants } from '@app/models/constants';
import { TenantCustomizationSettings } from '@app/admin/tenants/tenant-detail';
import { TenantsService } from '@app/admin/tenants/tenants.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-full-layout',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  active = 1;
  isFullScreen: boolean;
  constants = Constants;
  logoUrl: string = 'assets/images/yaksha-logo.png';
  isCustomThemeEnabled: boolean = false;
  isTenantLogoLoaded: boolean = false;
  isHsbcTenant: boolean = false;
  constructor(public router: Router, public dataService: dataService, public navigationService: NavigationService,
    private appSessionService: AppSessionService,
    private tenantService: TenantsService) {
    this.navigationService.startSaveHistory();
  }

  tabStatus = 'justified';

  public isCollapsed = false;

  public innerWidth: any;
  public defaultSidebar: any;
  public showSettings = false;
  public showMobileMenu = false;
  public expandLogo = false;

  options = {
    theme: 'light', // two possible values: light, dark
    dir: 'ltr', // two possible values: ltr, rtl
    layout: 'horizontal', // two possible values: vertical, horizontal
    sidebartype: 'full', // four possible values: full, iconbar, overlay, mini-sidebar
    sidebarpos: 'fixed', // two possible values: fixed, absolute
    headerpos: 'fixed', // two possible values: fixed, absolute
    boxed: 'boxed', // two possible values: full, boxed
    navbarbg: 'skin3', // six possible values: skin(1/2/3/4/5/6)
    sidebarbg: 'skin6', // six possible values: skin(1/2/3/4/5/6)
    logobg: 'skin6' // six possible values: skin(1/2/3/4/5/6)
  };

  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  ngOnInit() {
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard']);
      this.isFullScreen = false;
    }
    else if (this.router.url.includes('test-taker/')) {
      this.isFullScreen = true;
    }
    this.isHsbcTenant = this.dataService.isHsbcTenant(this.appSessionService.tenantId);
    this.defaultSidebar = this.options.sidebartype;
    this.handleSidebar();
    let permissios = abp.auth.grantedPermissions;
    this.dataService.setUserPermissions(permissios);
    if (permissios[Permissions.superAdmin])
      this.dataService.setUserRole(UserRoles[1]);
    else if (permissios[Permissions.tenantAdmin] && permissios[Permissions.roleManageAll])
      this.dataService.setUserRole(UserRoles[2]);
    else if (permissios[Permissions.testAdmin])
      this.dataService.setUserRole(UserRoles[3]);
    else if (permissios[Permissions.reviewer])
      this.dataService.setUserRole(UserRoles[4]);
    else if (permissios[Permissions.questionReviewerOnly])
      this.dataService.setUserRole(UserRoles[6]);
    else if (!(permissios[Permissions.roleManageAll]) && (permissios[Permissions.reportsManageAll] || permissios[Permissions.assesmentsManageAll] || permissios[Permissions.manageResourcesManageAll] || permissios[Permissions.questionsManageAll]))
      this.dataService.setUserRole(UserRoles[7]);
    else if (permissios[Permissions.tenantUser])
      this.dataService.setUserRole(UserRoles[5]);

    if (this.appSessionService.tenantId) {
      this.isCustomThemeEnabled = this.dataService.checkCustomTheme(this.appSessionService.tenantId);
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
    else {
      this.isTenantLogoLoaded = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: string) {
    this.handleSidebar();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    switch (this.defaultSidebar) {
      case 'full':
      case 'iconbar':
        if (this.innerWidth < 1170) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      case 'overlay':
        if (this.innerWidth < 767) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      default:
    }
  }

  toggleSidebarType() {
    switch (this.options.sidebartype) {
      case 'full':
      case 'iconbar':
        this.options.sidebartype = 'mini-sidebar';
        break;

      case 'overlay':
        this.showMobileMenu = !this.showMobileMenu;
        break;

      case 'mini-sidebar':
        if (this.defaultSidebar === 'mini-sidebar') {
          this.options.sidebartype = 'full';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      default:
    }
  }


  handleClick(event: boolean) {
    this.showMobileMenu = event;
  }

  goToPrivacy(): void {
    let tenantName: string = this.appSessionService.tenantName || Constants.default.toLowerCase();
    this.router.navigateByUrl(`/${tenantName}/app/privacy`);
  }

}
