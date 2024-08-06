import { Component } from '@angular/core';
import { Constants } from '@app/models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-unsaved-dialog',
  templateUrl: './unsaved-dialog.component.html',
  styleUrls: ['./unsaved-dialog.component.scss']
})
export class UnsavedDialogComponent {
constants = Constants;

  constructor(
    private modalSerive: NgbModal
  ) { }

  leave(): void {
    this.modalSerive.dismissAll(true);
  }

  stay(): void {
    this.modalSerive.dismissAll(false);
  }

}
