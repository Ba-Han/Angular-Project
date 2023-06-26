import { ChangeDetectorRef, Component, OnDestroy, ViewChild, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, finalize } from 'rxjs';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJs from 'crypto-js';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'profile-detail',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProfileComponent implements OnInit, OnDestroy {
    loginUser: User;
    userId: number;
    isLoading: boolean = false;
    selectedUser: User | null = null;
    editProfile: boolean = false;
    changePassword: boolean = false;
    loginUserName: string;
    UserEditForm: FormGroup;
    ChangePasswordForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('changePasswordNgForm') changePasswordNgForm: NgForm;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.UserEditForm = this._formBuilder.group({
            id: [''],
            username: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
        });

        this.ChangePasswordForm = this._formBuilder.group(
            {
            currentPassword: ['', Validators.required],
            newPassword: ['',Validators.required],
            confirmPassword: ['',Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('newPassword', 'confirmPassword')
            }
        );

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.loginUser = user;
                this.loginUserName = user.email;
                this.UserEditForm.patchValue(user);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    toggleEditProfileMode(editProfile: boolean | null = null): void {
        this.showAlert = false;
        if (editProfile === null) {
            this.editProfile = !this.editProfile;
        }
        else {
            this.editProfile = editProfile;
        }
        this._changeDetectorRef.markForCheck();
    }
    toggleChangePasswordMode(changePassword: boolean | null = null): void {
        this.showAlert = false;
        if (changePassword === null) {
            this.changePassword = !this.changePassword;
        }
        else {
            this.changePassword = changePassword;
        }
        this._changeDetectorRef.markForCheck();
    }
    updateUser(): void {
        this.showAlert = false;
        const user = this.UserEditForm.getRawValue();
        this._userService.updateProfile(user)
            .pipe(
                finalize(() => {
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {
                    this.alert = {
                        type: 'success',
                        message: 'Update Successfully.'
                    };
                },
                (response) => {
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.'
                    };
                }
            );
    }
    changeUserPassword(): void {
        this.showAlert = false;
        const currentpass = this.ChangePasswordForm.get('currentPassword').value;

        this._userService.checkCurrentPass(currentpass, this.loginUserName)
            .pipe(
                finalize(() => {
                    if (this.alert.type === 'error') {
                        this.showAlert = true;
                    }
                    else {
                        this.sendNewPassword();
                    }
                })
        ).subscribe(
            (response) => {
                this.alert = {
                    type: 'success',
                    message: 'Your current password is Correct.'
                };
            },
            (response) => {
                this.alert = {
                    type: 'error',
                    message: 'Your current password is Wrong.'
                };
            }
        );
    }

    sendNewPassword(): void {
        const pass = this.ChangePasswordForm.get('confirmPassword').value;
        this._userService.changePassword(pass)
            .pipe(
                finalize(() => {
                    this.ChangePasswordForm.enable();
                    this.changePasswordNgForm.resetForm();
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {
                    this.alert = {
                        type: 'success',
                        message: 'Password Changed Successfully.'
                    };
                },
                (response) => {
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.'
                    };
                }
            );
    }
}
