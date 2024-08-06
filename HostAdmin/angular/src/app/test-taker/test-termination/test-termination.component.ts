import { Component, Input } from '@angular/core';
import { Constants } from '../../../app/models/constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-test-termination',
  templateUrl: './test-termination.component.html',
  styleUrls: ['./test-termination.component.scss']
})

export class TestTerminationComponent {
  @Input() public proctoringViolationMessage: string;
  constants = Constants;
  
  constructor(private activeModal: NgbActiveModal) { }

  close() {
    this.activeModal.close();
  }
}