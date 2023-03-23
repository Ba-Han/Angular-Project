import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionModel, User } from 'app/modules/admin/setting/user/user.types';
import { UserService } from 'app/modules/admin/setting/user/user.service';

@Component({
    selector: 'user-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            tr,td {
                border: 1px solid rgba(226, 232, 240, var(--tw-border-opacity));
              }

        `
    ]
})

export class UserDetailComponent implements OnInit, OnDestroy {
    user: User;
    userId: number;
    isLoading: boolean = false;
    selectedUser: User | null = null;
    editMode: boolean = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UserEditForm: FormGroup;
    updatedPagePermission: PermissionModel[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private passwordStrength: 0;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    roles: any;
    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/naming-convention
    page_roles: any;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selectedRole: string;
    

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,

    ) {
        this.getUserRoles();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.UserEditForm = this._formBuilder.group({
            id: [''],
            status: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            role:['', Validators.required],
            page_roles:['', Validators.required]
        });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.selectedRole = user.role;
                this.page_roles = user.page_roles;
                for(const key of this.page_roles) {
                    const viewControl = new FormControl(key.can_view);
                    this.UserEditForm.addControl(`view-${key.id}`, viewControl);

                    const editControl = new FormControl(key.can_edit);
                    this.UserEditForm.addControl(`edit-${key.id}`, editControl);

                    const deleteControl = new FormControl(key.can_delete);
                    this.UserEditForm.addControl(`delete-${key.id}`, deleteControl);
                }
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
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    updateUser(): void {
        // Get the contact object
        debugger;
        const user = this.UserEditForm.getRawValue();
        const checkBoxes = Object.keys(this.UserEditForm.value).map(key =>
            ({
                id : (key),
                selected : this.UserEditForm.value[key]
            }));

        this.page_roles.forEach((pr: { id: any }) =>
            {
                console.log(pr.id);
                const vKey = 'view-' + pr.id;
                const vValue = this.UserEditForm.value[vKey];

                const eKey = 'edit-' + pr.id;
                const eValue = this.UserEditForm.value[eKey];

                const dKey = 'delete-' + pr.id;
                const dValue = this.UserEditForm.value[dKey];

                const res: PermissionModel = {
                    page_id : pr.id,
                    can_view : vValue,
                    can_edit : eValue,
                    can_delete : dValue
                };
                this.updatedPagePermission.push(res);
            });

        // Update the contact on the server
        if (this.passwordStrength >= 100) {
            this._userService.updateUser(user.id, user).subscribe(() => {
                this._router.navigate(['/users'], { relativeTo: this._activatedRoute });
            });
        }
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getUserRoles() {
        this._userService.getUserRoles()
            .pipe(
                finalize(() => {
                })
        ).subscribe(
            (response) => {
                const roles: any = ((response.data) ? response.data : []);
                const availableRoles: any = [];
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i: number = 0; i < roles.length; i++) {
                    if (roles[i].name === 'CRM APP User' ||
                    roles[i].name === 'CRM APP Manager' ||
                    roles[i].name === 'CRM Admin') {
                        availableRoles.push(roles[i]);
                    }
                }
                this.roles = availableRoles;
                this.ngOnInit();
            }
        );
    }
}
