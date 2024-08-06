import { Component } from '@angular/core';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-invalid-request',
  templateUrl: './invalid-request.component.html',
  styleUrls: ['./invalid-request.component.scss']
})
export class InvalidRequestComponent {
  constants = Constants;

  constructor() { }

}