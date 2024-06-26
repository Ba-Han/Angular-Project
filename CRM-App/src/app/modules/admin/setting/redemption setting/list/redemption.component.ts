import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Redemption, RedemptionPagination,  MemberTier} from 'app/modules/admin/setting/redemption setting/redemption.types';
import { RedemptionService } from 'app/modules/admin/setting/redemption setting/redemption.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'redemption setting-list',
    templateUrl: './redemption.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .redemptionsetting-grid {
                grid-template-columns: 150px 150px 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 150px 150px 150px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .redem-2-sort {
                position: static;
                width: 14rem !important;
            }

            .redem_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .redem-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class RedemptionSettingListComponent implements OnInit, AfterViewInit,  OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    isLoading: boolean = false;
    RedemptionSettingAddForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    canEdit: boolean = false;
    errorMessage: string | '' = '';
    redemptions$: Observable<Redemption[]>;
    memberTiers: any;
    pagination: RedemptionPagination;
    minDate: string;
    typeValue: number;
    isAscending: boolean = true;
    selectedCoulumn = 'type';
    selectedStartDateTime: string;
    selectedEndDateTime: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _redemptionService: RedemptionService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService
    ) {
        const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);

        // Initialize with 12:01 AM for the start date
        const startDate = new Date();
        startDate.setHours(0, 1, 0, 0);

        // Initialize with 11:59 PM for the end date
        const endDate = new Date();
        endDate.setHours(23, 59, 0, 0);

        // Format for the dates 'yyyy-MM-ddTHH:mm' format expected by datetime-local
        this.selectedStartDateTime = this.formatDateTime(startDate);
        this.selectedEndDateTime = this.formatDateTime(endDate);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.RedemptionSettingAddForm = this._formBuilder.group({
            id: [''],
            type: ['', [Validators.required]],
            date_from: [''],
            date_to: [''],
            member_tier: ['', [Validators.required]],
            point_conversion: ['', [Validators.required]],
            voucher_valid_days: ['']
        });

        this.redemptions$ = this._redemptionService.redemptions$;

        //Member Tiers Groups
        this._redemptionService.memberTiers$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((tier) => {
            this.memberTiers = tier;
        });

        // Get the redemption pagination
        this._redemptionService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: RedemptionPagination) => {
            this.pagination = pagination;
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._redemptionService.getRedemptions(0, 10, 'type', 'asc', query);
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe(() =>{
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

            // Get redemption setting if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        return this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                    } else {
                        return of(null);
                    }
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
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
    toogleRedemptionSettingAddFormMode(AddMode: boolean | null = null): void {
        if (AddMode === null) {
            this.AddMode = !this.AddMode;
        }
        else {
            this.AddMode = AddMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._redemptionService.getRedemptions(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                } else {
                    return of(null);
                }
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'type') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'pointconversion') {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'type' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'type' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointconversion' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointconversion' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onDropdownChangeValue(): void {
        if( this.typeValue ===  0) {
            this.RedemptionSettingAddForm.get('date_from').setValue(null);
            this.RedemptionSettingAddForm.get('date_to').setValue(null);
            this._changeDetectorRef.markForCheck();
        }
    }

    // Helper function to format a Date object as 'yyyy-MM-ddTHH:mm'
    formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    createRedemption(): void {
        const redemption = this.RedemptionSettingAddForm.getRawValue();
        this._redemptionService.createRedemption(redemption.id, redemption).subscribe(() => {
            this.toogleRedemptionSettingAddFormMode(false);
            this.RedemptionSettingAddForm.reset();
            this._changeDetectorRef.markForCheck();
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }
}
