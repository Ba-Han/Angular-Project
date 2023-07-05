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
                width: 13%;
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
                border-radius: 8px;
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

            .errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .updaeuser_scss {
                font-size: 16px;
                color: rgb(0, 128, 0);
            }

            tr,td {
                border: 1px solid rgba(203,213,225,var(--tw-border-opacity))!important;
                height: 2rem;
            }

            .text_1xl {
                font-size: 1rem !important;
                font-weight: 700;
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
    viewAllChecked: boolean = false;
    editAllChecked: boolean = false;
    deleteAllChecked: boolean = false;
    errorMessage: string | '' = '';
    successMessage: string | '' = '';
    userErrorMessage: string | '' = '';
    userSuccessMessage: string | null = null;
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.UserEditForm = this._formBuilder.group({
            id: [''],
            status: [''],
            first_name: [''],
            last_name: [''],
            email: [''],
            password: [''],
            role:[''],
            page_roles:['']
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

            this.canEdit = this._userService.getEditUserPermissionByNavId('loginuser');
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
        this._crmUserService.updateQRCode().subscribe(() => {
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Update Successfully!';
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
    }

    updateUser(): void {
        // Get the contact object
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
        this._crmUserService.updatePermission(user.id, this.updatedPagePermission).subscribe(() => {
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.userSuccessMessage = 'Update Successfully!';
                    this.toogleUpdateUserDetailMode(true);
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.userErrorMessage = response.error.message;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }

    isViewFewSelected(): boolean {
        return this.page_roles.filter((t: { can_view: boolean }) => t.can_view).length > 0 && !this.viewAllChecked;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setViewAll(canView: boolean) {
        this.viewAllChecked = canView;
        this.page_roles.forEach((t: { can_view: boolean }) => t.can_view = canView);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateViewAllComplete() {
        this.viewAllChecked = this.page_roles != null && this.page_roles.every((t: { can_view: boolean }) => t.can_view);
    }

    isEditFewSelected(): boolean {
        return this.page_roles.filter((t: { can_edit: boolean }) => t.can_edit).length > 0 && !this.editAllChecked;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setEditAll(canEdit: boolean) {
        this.editAllChecked = canEdit;
        this.page_roles.forEach((t: { can_edit: boolean }) => t.can_edit = canEdit);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateEditAllComplete() {
        this.editAllChecked = this.page_roles != null && this.page_roles.every((t: { can_edit: boolean }) => t.can_edit);
    }

    isDeleteFewSelected(): boolean {
        return this.page_roles.filter((t: { can_delete: boolean }) => t.can_delete).length > 0 && !this.deleteAllChecked;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setDeleteAll(canDelete: boolean) {
        this.deleteAllChecked = canDelete;
        this.page_roles.forEach((t: { can_delete: boolean }) => t.can_delete = canDelete);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateDeleteAllComplete() {
        this.deleteAllChecked = this.page_roles != null && this.page_roles.every((t: { can_delete: boolean }) => t.can_delete);
    }
}
