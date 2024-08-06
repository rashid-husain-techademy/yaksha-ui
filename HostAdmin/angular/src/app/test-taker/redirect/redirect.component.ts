import { Component, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {
  constants = Constants;
  constructor() { }

  ngOnInit(): void {
    let faceTrainUrl = localStorage.getItem("faceTrainUrl");
    window.open(faceTrainUrl, "_self");
  }
}
