import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-tfa',
    templateUrl: './tfa.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthTfaComponent implements OnInit {
    @ViewChild('tfaNgForm') tfaNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    tfaForm: FormGroup;
    showAlert: boolean = false;
    public otpauth_url: string = null;
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.otpauth_url = this._authService.otpAuthUrl;
        // Create the form
        this.tfaForm = this._formBuilder.group({
            otp: ['', [Validators.required]],
            secret: [this._authService.tfaSecret, [Validators.required]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    enableTFA(): void {
        
        // Return if the form is invalid
        if (this.tfaForm.invalid) {
            return;
        }

        // Disable the form
        this.tfaForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Send the request to the server
        this._authService
            .enableTFA(this.tfaForm.get('otp').value, this.tfaForm.get('secret').value)
            .pipe(
                finalize(() => {
                    // Re-enable the form
                    this.tfaForm.enable();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {
                    if (response != null) {
                        this.alert = {
                            type: 'error',
                            message: 'Somthing went wrong!',
                        };
                    } else {

                        this.alert = {
                            type: 'success',
                            message: 'Two-Factor Authentication is enabled. Please go to sign-in page and log in again.',
                        };
                        setTimeout(() => {
                            this._router.navigateByUrl('/sign-in');
                        }, 2000);
                    }

                    //Reset the form
                    this.tfaNgForm.resetForm();
                },
                (response) => {
                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Otp is not valid.',
                    };
                }
            );
    }
}
