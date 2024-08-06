import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { ToastrService } from 'ngx-toastr';
import { ResetPasswordDto } from './model/resetpassworddto';
import { UtilsService } from 'abp-ng2-module';
import { UserService } from '@app/admin/users/users.service';
import { Constants } from '@app/models/constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  animations: [accountModuleAnimation()],
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  resetPasswordDto = new ResetPasswordDto();
  resetPasswordForm: FormGroup;
  userInfo: any = {};
  tenantName: string;
  isIbm: boolean;
  isIbmAssociates: boolean;
  commonTenant: boolean;
  path: string;
  constants = Constants;
  showPassword: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private _utilsService: UtilsService,
    private _usersService: UserService,
    private _router: Router) {

    this.tenantName = this._utilsService.getCookieValue('tenantName');
    if (this.tenantName) {
      this.tenantName = this.tenantName.toLocaleLowerCase();
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.resetPasswordDto.encodedUrl = params['encodedUrl'];
      this.userInfo = atob(this.resetPasswordDto.encodedUrl).split('/');
    });
    this.path = this.router.url;
    this.tenantName = this.path.split('/')[1];
    if (this.tenantName === 'ibm') {
      this.isIbm = true;
    }
    else if (this.tenantName === 'ibmassociates') {
      this.isIbmAssociates = true;
    }
    else {
      this.commonTenant = true;
    }
    this.initResetForm();
  }

  initResetForm() {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.pattern("(?=^.{8,16}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$")])
    });
  }

  reset(): void {
    if (this.resetPasswordDto.newPassword.trim() !== '') {
      this._usersService.resetNewPassword(this.resetPasswordDto).subscribe(res => {
        if (res) {
          let tenantName = this.userInfo[0];
          this.toastr.success('Password reset successful');
          this._router.navigate([`${tenantName}/landing`]);
          abp.utils.setCookieValue("tenantName", tenantName, undefined, abp.appPath);
        }
        else {
          this.toastr.error(Constants.cannotResetPasswordPleaseContactAdministrator);
        }
      });
    }
    else
      this.toastr.warning(Constants.pleaseEnterYourResetPassword);
  }

  goBackToLogin() {
    this._router.navigate([`${this.tenantName}/account/landing`]);
  }

  changePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
