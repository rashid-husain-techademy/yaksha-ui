import { Component } from '@angular/core';
import { Constants } from '@app/models/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss']
})
export class InstructionsComponent {
  constants = Constants;

  constructor(
    private modalService: NgbModal
  ) { }

  close(): void {
    this.modalService.dismissAll();
  }

}
