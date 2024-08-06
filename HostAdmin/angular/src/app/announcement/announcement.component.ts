import { Component } from '@angular/core';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent {
  constants = Constants;
  
  constructor() { }

}
