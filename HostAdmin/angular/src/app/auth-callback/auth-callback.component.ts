import { Component, OnInit } from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(private authService: AppAuthService) { }

  ngOnInit() {
    this.authService.completeAuthentication();
  }

}
