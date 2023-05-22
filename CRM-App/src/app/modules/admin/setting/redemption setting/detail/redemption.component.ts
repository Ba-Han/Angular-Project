import { ChangeDetectorRef, Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Redemption, RedemptionPagination,  MemberTier} from 'app/modules/admin/setting/redemption setting/redemption.types';
import { RedemptionService } from 'app/modules/admin/setting/redemption setting/redemption.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'redemption setting',
    templateUrl: './redemption.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .redemptionsetting-grid {
                grid-template-columns: 100px 100px 100px 100px 100px 100px 100px;

                @screen sm {
                    grid-template-columns: 100px 100px 100px 100px 100px 100px 100px;
                }

                @screen md {
                    grid-template-columns: 100px 100px 100px 100px 100px 100px 100px;
                }

                @screen lg {
                    grid-template-columns: 100px 100px 100px 100px 100px 100px 100px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
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
export class RedemptionDetailComponent implements OnInit, AfterViewInit,  OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    isLoading: boolean = false;
    RedemptionEditForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    editMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    editFormData: any;
    successMessage: string | '' = '';
    errorMessage: string | '' = '';
    deleteErrorMessage: string | '' = '';
    createSuccess: string | '' = '';
    updateSuccess: string | '' = '';
    redemptions$: Observable<Redemption[]>;
    memberTiers$: Observable<MemberTier[]>;
    pagination: RedemptionPagination;
    minDate: string;
    redemption: Redemption;
    redem: any;
    typeValue: number;
    showButtonIsEdit: boolean = false;
    isAscending: boolean = true;
    selectedCoulumn = 'type';
    pageIndex: number = 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _redemptionService: RedemptionService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService
    ) {
        const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.RedemptionEditForm = this._formBuilder.group({
            id: [''],
            type: ['', [Validators.required]],
            date_from: [''],
            date_to: [''],
            member_tier: ['', [Validators.required]],
            member_tierFullName: [''],
            point_conversion: ['', [Validators.required]]
        });

        this.redemptions$ = this._redemptionService.redemptions$;
        this.memberTiers$ = this._redemptionService.memberTiers$;

        // Get the redemption pagination
        this._redemptionService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: RedemptionPagination) => {
            this.pagination = pagination;
            this._changeDetectorRef.markForCheck();
        });

        this.canEdit = this._userService.getEditUserPermissionByNavId('redemptionsetting');
    }

    ngAfterViewInit(): void
     {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'type') {
                this._sort.sort({
                    id: 'type',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'type') {
                this._sort.sort({
                    id: 'type',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'pointconversion') {
                this._sort.sort({
                    id: 'point_conversion',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointconversion') {
                this._sort.sort({
                    id: 'point_conversion',
                    start: 'desc',
                    disableClear: true
                });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._paginator.pageIndex = 0;
            });

            // Get memberDocuments if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    //const sort = this._sort.direction === 'desc' ? '-' + this._sort.active : this._sort.active;
                    // eslint-disable-next-line max-len
                    return this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
     }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
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
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    firstSaveDataToTable() {
        this._redemptionService.getRedemptions().pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._redemptionService.getRedemptions();
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    proceedPopup(): void {
        this._redemptionService.getDeleteRedemptionSetting(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this.onPageChange();
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.deleteErrorMessage = response.error.message;
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'type') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'pointconversion') {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'type' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'type' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointconversion' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointconversion' ) {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    eidtRedemption(redem) {
        this.showButtonIsEdit = true;
        this.editFormData = redem;
        this.RedemptionEditForm.patchValue(this.editFormData);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cancelRedemption() {
        this.RedemptionEditForm.reset();
        this.RedemptionEditForm.markAsPristine();
        this.RedemptionEditForm.markAsUntouched();
    }

    createRedemption(): void {
        const redemption = this.RedemptionEditForm.getRawValue();
        this._redemptionService.createRedemption(redemption.id, redemption).subscribe(() => {
            this.createSuccess = 'Create Successfully!';
            this.updateSuccess = '';
            this.errorMessage = '';
            this.cancelRedemption();
            this.firstSaveDataToTable();
            this._changeDetectorRef.markForCheck();
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this.createSuccess = '';
                    this.updateSuccess = '';
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }

    updateRedemption(): void {
        const redemption = this.RedemptionEditForm.getRawValue();
        this._redemptionService.updateRedemption(redemption.id, redemption).subscribe(() => {
            this.updateSuccess = 'Update Successfully!';
            this.createSuccess = '';
            this.errorMessage = '';
            this.cancelRedemption();
            this.onPageChange();
            this._changeDetectorRef.markForCheck();
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this.createSuccess = '';
                    this.updateSuccess = '';
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }
}
