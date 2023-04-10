import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionModel, User } from 'app/modules/admin/setting/user/user.types';
import { CRMUserService } from 'app/modules/admin/setting/user/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { UserService } from 'app/core/user/user.service';


@Component({
    selector: 'user-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .reset-qr-btn {
                padding-left: 38px !important;
            }

            .reset-rq-btn-scss {
                margin-top: 1.5rem !important;
            }

            .user-permission {
                margin-top: 1rem !important;
            }

            .v-e-d {
                text-align: center;
            }

            .user-page-scss {
                padding-left: 2rem !important;
            }

            .reset_QR_popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) !important;
                width: 30% !important;
                height: 34% !important;
            }

            .parent_popup {
                position: fixed;
                display: grid;
                justify-content: center;
                padding: 4rem;
            }

            .child_btn {
                padding-left: 1.5rem;
                position: relative;
                margin-top: 1rem !important;
            }

            .update_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 4rem;
                font-size: 16px;
            }

            .updaeuser_scss {
                font-size: 16px;
                color: rgb(0, 128, 0);
            }

            tr,td {
                border: 1px solid rgba(226, 232, 240, var(--tw-border-opacity));
              }

        `
    ]
})

export class UserDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    user: User;
    userId: number;
    isLoading: boolean = false;
    selectedUser: User | null = null;
    editMode: boolean = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UserEditForm: FormGroup;
    updatedPagePermission: PermissionModel[] = [];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ResetQRCodeMode: boolean = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UpdateUserDetailMode: boolean = false;
    canEdit: boolean = false;
    isSuccess: boolean = false;
    isUpadteUserSuccess: boolean = false;
    checkboxChecked: boolean = true;
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
        private _crmUserService: CRMUserService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService

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

        this._crmUserService.user$
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

            this.canEdit = this._userService.getViewUserPermissionByNavId('loginuser');
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleResetQRCodeMode(ResetQRCodeMode: boolean | null = null): void {
        this.UpdateUserDetailMode = false;
        if (ResetQRCodeMode === null) {
            this.ResetQRCodeMode = !this.ResetQRCodeMode;
        }
        else {
            this.ResetQRCodeMode = ResetQRCodeMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleUpdateUserDetailMode(UpdateUserDetailMode: boolean | null = null): void {
        this.ResetQRCodeMode = false;
        if (UpdateUserDetailMode === null) {
            this.UpdateUserDetailMode = !this.UpdateUserDetailMode;
        }
        else {
            this.UpdateUserDetailMode = UpdateUserDetailMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    resetQRCodeDrawer(): void {
        this.toogleResetQRCodeMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    cancelPopup(): void {
        this.isSuccess = false;
        this.toogleResetQRCodeMode(false);
        this.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    cancelUserPopup(): void {
        this.toogleUpdateUserDetailMode(false);
        this.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        // Update QR Code Function
        this._crmUserService.updateQRCode().subscribe();
        this.isSuccess = true;
    }

    updateUser(): void {
        // Get the contact object
        this.toogleUpdateUserDetailMode(true);
        this.matDrawer.open();
        this.isUpadteUserSuccess = true;
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
        this._crmUserService.updatePermission(user.id, this.updatedPagePermission).subscribe((res) => {
            //console.log(res);
            /* if(res){
                this._router.navigate(['/users'], { relativeTo: this._activatedRoute });
            } else {
                console.log(res);
            } */
        });
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getUserRoles() {
        this._crmUserService.getUserRoles()
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

    /* onCheckboxChange(event: any): void {
        if (event.target.checked) {
            this.checkboxChecked = true;
          } else {
            this.checkboxChecked = false;
          }
        //this.checkboxChecked = event.target.checked;
      } */
}
