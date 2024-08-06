import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/admin/users/users.service';
import { Constants } from '@app/models/constants';

@Component({
  selector: 'app-approver-idscan-redirect',
  templateUrl: './approver-idscan-redirect.component.html',
  styleUrls: ['./approver-idscan-redirect.component.scss']
})
export class ApproverIdscanRedirectComponent implements OnInit {
 
  constructor(private userService: UserService,) { }

  ngOnInit(): void {
    let approvalPayload =JSON.parse( localStorage.getItem(Constants.approvalPayload));
    this.userService.generatePageUrlWheebox(approvalPayload).subscribe((res => {
      if (res.result ) {
        window.open(res.result, "_self");
      }
     }));    
  }
}
