import { Component, Injector, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/app-component-base';
import { HorizontalSidebarService } from './horizontal-sidebar.service';
import { dataService } from '@app/service/common/dataService';
import { AppSessionService } from '@shared/session/app-session.service';
export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  permissionName: string;
  class: string;
  ddclass: string;
  extralink: boolean;
  submenu: RouteInfo[];
}

@Component({
  selector: 'app-horizontal-sidebar',
  templateUrl: './horizontal-sidebar.component.html',
  styleUrls: ['./horizontal-sidebar.component.scss']
})
export class HorizontalSidebarComponent extends AppComponentBase {
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems: RouteInfo[] = [];
  path = '';
  permissions: string[] = [];
  granted: boolean = true;
  isGuruKashiTenant: boolean = false;
  isCognizantYakshaTenant: boolean = false;
  @Input() isHsbcTenant: boolean;
  constructor(private menuServise: HorizontalSidebarService, private router: Router, injector: Injector, public dataService: dataService, private appSessionService: AppSessionService,) {
    super(injector);
    this.menuServise.items.subscribe(menuItems => {
      this.sidebarnavItems = menuItems;

      // Active menu
      this.sidebarnavItems.filter(m => m.submenu.filter(
        (s) => {
          if (s.path === this.router.url) {
            this.path = m.title;
          }
        }
      ));
      this.addExpandClass(this.path);
    });
    this.isGuruKashiTenant = this.dataService.isGurukashiTenant(this.appSessionService.tenantId);
    this.isCognizantYakshaTenant = this.dataService.isCognizantYakshaTenant(this.appSessionService.tenantId);
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = element;
    } else {
      this.showMenu = element;
    }
  }

  addActiveClass(element: any) {
    if (element === this.showSubMenu) {
      this.showSubMenu = element;
    } else {
      this.showSubMenu = element;
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  showMenuItem(item: RouteInfo): boolean {
    if (item.permissionName) {
      // if a feature has multiple Permissions
      if (this.isHsbcTenant && item.path === "user-dashboard") {
        return false;
      }
      if (this.isGuruKashiTenant && item.path === "user-dashboard") {
        return false;
      }
      if (this.isCognizantYakshaTenant && item.path === "user-dashboard") {
        return false;
      }
      else {
        if (item.permissionName.includes(',')) {
          this.permissions = item.permissionName.split(',');
          for (let permission of this.permissions) {
            this.granted = false;
            if (this.permission.isGranted(permission)) {
              this.granted = true;


              break;
            }
          }
          if (this.granted) {
            return true;
          }
          else {

            return false;
          }
        }
        else {
          return this.permission.isGranted(item.permissionName);
        }
      }
      return true;
    }
  }

}
