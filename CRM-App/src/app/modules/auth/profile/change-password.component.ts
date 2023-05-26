import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector     : 'auth-change-password',
    templateUrl  : './change-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthChangePasswordComponent implements OnInit
{
    @ViewChild('changePasswordNgForm') changePasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    changePasswordForm: FormGroup;
    showAlert: boolean = false;
    loginUserName: string;
    private passwordStrength: 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _formBuilder: FormBuilder
    )
    {
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
        this.changePasswordForm = this._formBuilder.group({
                currentPassword: ['', Validators.required],
                password       : ['', Validators.required],
                passwordConfirm: ['', Validators.required]
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm')
            }
        );

        this._userService.user$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((user: User) => {
            this.loginUserName = user.username;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    changePassword(): void {
                // Return if the form is invalid
        if ( this.changePasswordForm.invalid )
        {
            return;
        }

        // Send the request to the server
        if (this.passwordStrength >= 100) {

            // Disable the form
            this.changePasswordForm.disable();

            // Hide the alert

            this.showAlert = false;
            const currentpass = this.changePasswordForm.get('currentPassword').value;
            const newpass = this.changePasswordForm.get('passwordConfirm').value;
            this._userService.changeNewPassword(this.loginUserName, currentpass, newpass)
                .pipe(
                    finalize(() => {
                        if (this.alert.type !== 'error') {
                            this.changePasswordForm.enable();
                            this.changePasswordNgForm.resetForm();
                        }
                    })
            ).subscribe(
                (response) => {
                    this.alert = {
                        type: 'success',
                        message: 'Password Changed Successfully.'
                    };
                    this.showAlert = true;
                },
                (response) => {
                    const errorCode: string =  ((response.error.errors && response.error.errors[0].extensions) ? response.error.errors[0].extensions.code : '');
                    if (errorCode === 'INVALID_CREDENTIALS') {
                        this.changePasswordForm.enable();
                        this.alert = {
                            type: 'error',
                            message: 'Your current password is Wrong.'
                        };
                        this.showAlert = true;
                    } else {
                        this.changePasswordForm.enable();
                        this.alert = {
                            type: 'error',
                            message: 'Something went wrong, please try again.'
                        };
                        this.showAlert = true;
                    }
                }
            );
        }
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }
}
