import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROUTES } from './horizontal-menu-items';

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

@Injectable({
    providedIn: 'root'
})

export class HorizontalSidebarService {

    public screenWidth: any;
    public collapseSidebar: boolean = false;
    public fullScreen: boolean = false;

    MENUITEMS: RouteInfo[] = ROUTES;

    items = new BehaviorSubject<RouteInfo[]>(this.MENUITEMS);

    constructor() {
    }
}
