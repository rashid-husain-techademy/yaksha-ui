import { Component, Input } from '@angular/core';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss']
})
export class HintComponent {
  constants = Constants;
  helper=Helper;
  @Input() public hintsData;
  constructor(
    private modalService: NgbModal
  ) { }

  close(): void {
    this.modalService.dismissAll();
  }

}
