import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/admin/users/users.service';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-facetrain-redirect',
  templateUrl: './facetrain-redirect.component.html',
  styleUrls: ['./facetrain-redirect.component.scss']
})
export class FacetrainRedirectComponent implements OnInit {
  
  constructor(private userService: UserService,) { }

  ngOnInit(): void {
    let aiPayload =JSON.parse( localStorage.getItem(Constants.trainPageUrlPayload));
    this.userService.generatePageUrlWheebox(aiPayload).subscribe((res => {
      if (res.result ) {
        window.open(res.result, "_self");         
      }
     }));    
  }
}
