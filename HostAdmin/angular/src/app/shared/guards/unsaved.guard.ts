import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Unsaved } from '@app/interface/unsaved-data';
import { UnsavedDialogComponent } from '@app/unsaved-dialog/unsaved-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnsavedGuard implements CanDeactivate<Unsaved> {
  constructor(
    private modalService: NgbModal
  ) { }
  canDeactivate(
    component: Unsaved,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.isUnsaved()) {
      const modalRef = this.modalService.open(UnsavedDialogComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false
      });
      modalRef.dismissed.subscribe(res => {
        if (res) {
          modalRef.close(true);
        }
        else {
          modalRef.close(false);
        }
      });
      return modalRef.closed;
    }
    else {
      return true;
    }
  }
}