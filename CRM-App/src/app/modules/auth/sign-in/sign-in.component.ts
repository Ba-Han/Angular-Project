import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;
    _tfaEnableInApp: boolean = true;
    isOptNeed: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _userService: UserService
    )
    {
        this._tfaEnableInApp = environment.tfaEnable;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            otp  : [''],
            rememberMe: ['']
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();
        
        if (!this.isOptNeed) {
            delete this.signInForm.value.otp;
        }
        // Hide the alert
        this.showAlert = false;
        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                (response) => {
                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                    
                    if (this._tfaEnableInApp /*&& !this.isOptNeed*/) {
                        let password: string = this.signInForm.value.password;
                        let token: string = ((response.data && response.data.access_token) ? response.data.access_token : "");
                        this.generateTwoFactorSecret(token,password);
                    }
                    this.getUser(redirectURL);

                },
                (response) => {
                    let errorCode:string =  ((response.error.errors && response.error.errors[0].extensions) ? response.error.errors[0].extensions.code : "");
                    // Re-enable the form
                    this.signInForm.enable();

                    if (errorCode === 'INVALID_OTP' || errorCode === 'INVALID_PAYLOAD') {
                        // Set the alert
                        if (this.isOptNeed) {
                            this.alert = {
                                type   : 'error',
                                message: (errorCode === 'INVALID_PAYLOAD') ? 'You do not have permission to login' : 'Please enter valid otp'
                            };
                            this.showAlert = true;
                        }

                        this.isOptNeed = true;
                    } else {
                        // Reset the form
                        this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type   : 'error',
                            message: 'Wrong email or password'
                        };
                        this.showAlert = true;
                    }
                    // Show the alert
                    

                }
            );
    }

    /**
     * 
     * @param token 
     * @param password 
     */
     generateTwoFactorSecret(token: string, password: string): void {
        this._authService.generateTwoFactorSecret(token, password).subscribe((response: any) => {
            const redirectURL =  '/sign-in';
            if (response.data && response.data.secret) {
                const redirectURL =  '/tfa';
                this._router.navigateByUrl(redirectURL);
            } else {
                this._router.navigateByUrl(redirectURL);
            }
           
        },
        (response) => {
            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Somthing went wrong!'
            };
            return response;
        }); 
    }

        /**
     * 
     * @param token 
     * @param password 
     */
     getUser(redirectURL): void {
        this._userService.getUser().subscribe((response: any) => {
            // Navigate to the redirect url
            this._router.navigateByUrl(redirectURL);
            if (this._authService.otpAuthUrl != "") {
                this.updateOptAuthUrl(this._authService.otpAuthUrl);
            }
            return response;
        },
        (response) => {
            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Somthing went wrong!'
            };
            return response;
        }); 
    }

    updateOptAuthUrl(otpUrl: string): void {
        this._userService.updateOptAuthUrl(otpUrl).subscribe((response: any) => {
            return response;
        },
        (response) => {
            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Somthing went wrong!'
            };
            return response;
        }); 
    }

    sendQRCodeLink():void {
        this.showAlert = false;
        this._authService.sendQRCodeLink(this.signInForm.value.email).subscribe((response: any) => {
            this.showAlert = true;
            // Set the alert
            this.alert = {
                type   : 'success',
                message: 'We had sent the verification email to your account with the link to scan the QR Code'
            };
            return response;
        },
        (response) => {
            this.showAlert = true;
            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Somthing went wrong!'
            };
            return response;
        });
    }
}
