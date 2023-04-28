import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from 'app/modules/admin/setting/store/store.types';
import { StoreService } from 'app/modules/admin/setting/store/store.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'store-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 28% !important;
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
                position: fixed;
                margin-top: 2rem !important;
            }

            .update_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 4rem;
                font-size: 16px;
            }

            .successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .delete-scss {
                position: fixed;
                padding-left: 2rem;
            }

        `
    ]
})
export class StoreDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    store: Store;
    storeId: number;
    isLoading: boolean = false;
    selectedCountry: Store | null = null;
    editMode: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedCode: string | null = null;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    StoreEditForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _storeService: StoreService,
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
        this.StoreEditForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['', Validators.required],
            name: ['', Validators.required],
            address_line_1: [''],
            address_line_2: [''],
            city: [''],
            state: [''],
            postal_code: [''],
            region: [''],
            country: ['', Validators.required],
        });

        this._storeService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((store: Store) => {
                this.store = store;
                this.StoreEditForm.patchValue(store);
                this._changeDetectorRef.markForCheck();
            });
        this.canDelete = this._userService.getDeleteUserPermissionByNavId('store');
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
    toogleDeleteMode(DeleteMode: boolean | null = null): void {
        if (DeleteMode === null) {
            this.DeleteMode = !this.DeleteMode;
        }
        else {
            this.DeleteMode = DeleteMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    cancelPopup(): void {
        this.isSuccess = false;
        this.toogleDeleteMode(false);
        this.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._storeService.getDeleteStore(this.selectedCode)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/store'], { relativeTo: this._activatedRoute });
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
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(code: string): void {
        this.selectedCode = code;
        this.toogleDeleteMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    updateStore(): void {
        // Get the contact object
        const store = this.StoreEditForm.getRawValue();
        // Update the contact on the server
        this._storeService.updateStore(store.code, store).subscribe(() => {

        });
    }
}
