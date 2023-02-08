import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Params } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-app',
    templateUrl: './authapp.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthAppComponent implements OnInit {
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
        private activatedRoute: ActivatedRoute
    ) {
        // subscribe to router event
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.otpauth_url = ((params['url']) ? params['url'] : "");
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.otpauth_url = this._authService.otpAuthUrl;
        this.tfaForm = this._formBuilder.group({
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
