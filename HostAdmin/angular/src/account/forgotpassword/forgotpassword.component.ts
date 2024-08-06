import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from 'account/login/login.service';
import { ToastrService } from 'ngx-toastr';
import { ForgotPasswordDto } from './model/forgotpassworddto';
import { AppConsts } from '@shared/AppConsts';
import { Router } from '@angular/router';
import { UtilsService } from 'abp-ng2-module';
import { Constants } from '@app/models/constants';
import { UserService } from '@app/admin/users/users.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss'],
})
export class ForgotpasswordComponent extends AppComponentBase implements OnInit {
  submitting = false;
  forgotPasswordDto = new ForgotPasswordDto();
  tenantName: string;
  commonTenant: boolean;
  isTataCommunication: boolean;
  ismosaiclti: boolean;
  isQuinnox: boolean;
  isIbm: boolean;
  isIbmAssociates: boolean;
  isHpe: boolean;
  isXoriant: boolean;
  path: string;
  constants = Constants;
  loginform = true;
  recoverform = false;

  constructor(
    injector: Injector,
    public loginService: LoginService,
    private toastr: ToastrService,
    private router: Router,
    private utilsService: UtilsService,
    private _usersService: UserService
  ) {
    super(injector);
    this.tenantName = this.utilsService.getCookieValue('tenantName');

    if (this.tenantName) {
      this.tenantName = this.tenantName.toLocaleLowerCase();
    }
  }

  ngOnInit() {
    this.path = this.router.url;
    this.tenantName = this.path.split('/')[1];
  }

  forgotPassword() {
    if (this.forgotPasswordDto.userName !== '') {
      this.forgotPasswordDto.tenantName = abp.utils.getCookieValue("tenantName");
      this.forgotPasswordDto.resetUrl = AppConsts.appBaseUrl + '/' + this.forgotPasswordDto.tenantName + '/account/resetpassword';
      this._usersService.forgotPassword(this.forgotPasswordDto).subscribe(res => {
        if (res.result.result)
          this.toastr.info(Constants.pleaseCheckYourMailForPasswordResetLink);
        else if (res.result.errorMessage === Constants.givenUserIsNotAvailableOrLoginIsNotEnabled)
          this.toastr.error(Constants.givenUserIsNotAvailableOrLoginIsNotEnabled);
        else
          this.toastr.error(Constants.givenUserIsNotAvailableOrLoginIsNotEnabled);
      });
    }
    else
      this.toastr.warning(Constants.pleaseEnterEmailaddress);
  }

  goBackToLogin() {
    this.router.navigate([`${this.tenantName}/account/landing`]);
  }

}