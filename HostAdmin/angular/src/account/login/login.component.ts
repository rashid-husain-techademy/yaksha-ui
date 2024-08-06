import { Component, Injector, Input } from '@angular/core';
import { AppComponentBase } from '../../shared/app-component-base';
import { accountModuleAnimation } from '../../shared/animations/routerTransition';
import { LoginService } from './login.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '@app/models/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WhiteSpaceValidators } from '@app/shared/validators/whitespace.validator';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    animations: [accountModuleAnimation()]
})
export class LoginComponent extends AppComponentBase {
    @Input() fields: boolean;
    @Input() isDisableCaptcha: boolean;
    disableCaptcha: boolean = false;
    submitting = false;
    constants = Constants;
    userLogin: FormGroup;
    siteKey = environment.reCaptchaSiteKey;

    theme: 'light' | 'dark' = 'light';
    size: 'compact' | 'normal' = 'normal';
    lang = 'en';
    type: 'image' | 'audio';
    constructor(
        injector: Injector,
        public loginService: LoginService,
        private toastrService: ToastrService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute
    ) {
        super(injector);
    }

    ngOnInit() {
        this.userLogin = this.formBuilder.group({
            userName: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
            password: ['', [Validators.required, WhiteSpaceValidators.emptySpace()]],
            recaptcha: ['', [Validators.required]]
        });
        if (this.isDisableCaptcha) {
            this.disableCaptcha = true;
        }
        else {
            this.route.queryParams
                .subscribe(params => {
                    this.disableCaptcha = params.env == environment.disableCaptchaToken ? true : false;
                }
                );
        }
    }

    login(): void {
        if (this.userLogin.controls['userName'].value && this.userLogin.controls['password'].value) {
            if (!this.disableCaptcha) {
                if (this.userLogin.controls['recaptcha'].invalid) {
                    this.toastrService.warning(Constants.PleaseConfirmthatYourAreNotARobot);
                    return;
                }
            }

            this.loginService.isUserExist(this.userLogin.controls['userName'].value).subscribe(res => {
                if (res.success) {
                    if (res.result.length > 0) {
                        this.toastrService.warning(res.result);
                    }
                    else {
                        this.loginService.authenticateModel.userNameOrEmailAddress = this.userLogin.controls['userName'].value;
                        this.loginService.authenticateModel.password = this.userLogin.controls['password'].value;
                        this.submitting = true;
                        this.loginService.authenticate(() => (this.submitting = false));
                    }
                }
                else {
                    this.toastrService.warning(Constants.somethingWentWrong);
                }
            },
                error => console.error(error));
        }
        else {
            this.toastrService.error(Constants.emptyLoginFormMessage);
            this.submitting = false;
        }
    }

}
