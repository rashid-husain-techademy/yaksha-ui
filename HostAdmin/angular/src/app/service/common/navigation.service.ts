import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Constants } from '@app/models/constants';
import { AppSessionService } from '@shared/session/app-session.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private history: string[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private appSessionService: AppSessionService
  ) { }

  public startSaveHistory(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public goBack(): void {
    this.history.pop();

    if (this.history.length > 0) {
      this.location.back();
    }
    else {
      let tenantName = this.appSessionService.tenantName || Constants.default.toLowerCase();
      this.router.navigateByUrl(`${tenantName}/app/dashboard`);
    }
  }
}