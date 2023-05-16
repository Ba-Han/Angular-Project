import { ChangeDetectorRef, Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Redemption, RedemptionPagination } from 'app/modules/admin/setting/redemption setting/redemption.types';
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
                grid-template-columns: 200px 150px auto 100px 100px;

                @screen sm {
                    grid-template-columns: 200px 150px auto 100px 100px;
                }

                @screen md {
                    grid-template-columns: 200px 150px auto 100px 100px;
                }

                @screen lg {
                    grid-template-columns: 200px 150px auto 100px 100px;
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
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    isLoading: boolean = false;
    RedemptionEditForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    editMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    redemptions$: Observable<Redemption>;
    pagination: RedemptionPagination;
    minDate: string;
    redemption: any;
    startTypeValue: number = 0;
    isUpdateSuccess: boolean = false;
    isAscending: boolean = true;
    selectedCoulumn = 'channelname';
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
            start_type: ['', [Validators.required]],
            start_day_type: [''],
            end_type: ['', [Validators.required]],
            end_day_type: ['', [Validators.required]],
            end_day_value: ['', [Validators.required]]
        });

        this._redemptionService.redemptions$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((redemption: Redemption) => {
            this.redemption = redemption;
            this.RedemptionEditForm.patchValue(redemption);
            this._changeDetectorRef.markForCheck();
        });

        // Get the redemptionpagination
        this._redemptionService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: RedemptionPagination) => {
            this.pagination = pagination;
            this._changeDetectorRef.markForCheck();
        });

        // search
        /* this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._redemptionService.getRedemptions(0, 10,'name','asc', query);
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe(); */

        this.canEdit = this._userService.getEditUserPermissionByNavId('pointrangesetting');
        this.canDelete = this._userService.getDeleteUserPermissionByNavId('pointrangesetting');
    }

    ngAfterViewInit(): void
     {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'documentname') {
                this._sort.sort({
                    id: 'document_name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'documentname') {
                this._sort.sort({
                    id: 'document_name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'uploadeddate') {
                this._sort.sort({
                    id: 'uploaded_on',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'uploadeddate') {
                this._sort.sort({
                    id: 'uploaded_on',
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
        this.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._redemptionService.getDeleteRedemptionSetting(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
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
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    updateRedemption(): void {
        this.isUpdateSuccess = true;
        const redemption = this.RedemptionEditForm.getRawValue();
        this._redemptionService.updateRedemption(redemption.id, redemption).pipe(
            map(() => {
                this.isLoading = false;
                //this.isSuccess = true;
            })
        ).subscribe();
        this.isSuccess = true;
    }
}
