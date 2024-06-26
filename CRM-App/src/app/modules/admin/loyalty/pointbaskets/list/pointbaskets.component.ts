import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointBasket, PointBasketPagination } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.types';
import { PointBasketService } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointbaskets-list',
    templateUrl: './pointbaskets.component.html',
    styles: [
        /* language=SCSS */
        `
            .pointbasket-grid {
                grid-template-columns: 250px 250px 200px 150px;

                @screen sm {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen md {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen lg {
                    grid-template-columns: 250px 250px 200px 150px;
                }
            }

            .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
            }
            .customPoint{
                cursor: pointer;
                height: 50px;
                background: #fff;
                width: 100%;
                border: 1px solid #ccc;
                border-radius: 7px;
                padding: 15px;
             }

            .pointcross{
                float: right;
                width: 20px;
                text-align: center;
                border-radius: 10px;
                color: white;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .pointbasket-2-sort {
                position: static;
                width: 14rem !important;
            }

            .pointbasket_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .pointbasket-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .text_1xl {
                font-size: 1rem !important;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointBasketListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    pointBaskets$: Observable<any[]>;
    pointBasketPagination: PointBasketPagination;
    //PointBasketListMode: boolean = false;
    PointBasketAddForm: FormGroup;
    drawerMode: 'side'|'over';

    isLoading: boolean = false;
    pagination: PointBasketPagination;
    pointBasketSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    canEdit: boolean = false;
    name: string;
    description: string;
    spendingType: string;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    spendingtypeValue: number = 0;
    totypeValue: number = 0;
    toendTypeValue: number = 0;
    fromtypeValue: number = 0;
    fromstarttypeValue: number = 0;
    isAscending: boolean = true;
    selectedCoulumn = 'name';
    errorMessage: string | '' = '';
    selectedStartDateTime: string;
    selectedEndDateTime: string;
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _pointBasketService: PointBasketService,
        private _fuseConfirmationService: FuseConfirmationService,
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

        this.PointBasketAddForm = this._formBuilder.group({
            id: [''],
            name: ['',[Validators.required]],
            description: ['',[Validators.required]],
            spending_type: ['',[Validators.required]],
            from_type: [''],
            from_number: [''],
            from_start_type: [''],
            from_start_date: [''],
            to_type: [''],
            to_number: [''],
            to_end_type: [''],
            to_end_date: [''],
        });

        this._pointBasketService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointBasketPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.pointBaskets$ = this._pointBasketService.pointBaskets$;

        // search Point Rules
        this.pointBasketSearchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.searchValue = query;
                    return this._pointBasketService.getPointBaskets(0, 10, this.getSortTitleValue, this.sortDirection, query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });

        this.canEdit = this._userService.getEditUserPermissionByNavId('point-baskets');

        //Drawer Mode
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contact when drawer closed
                //this.selectedMember = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'redemptiontype') {
                this._sort.sort({
                    id: 'spending_type',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'redemptiontype') {
                this._sort.sort({
                    id: 'spending_type',
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

            // Get pointbaskets if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._pointBasketService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue);
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
    toogleStoreAddFormMode(AddMode: boolean | null = null): void {
        if (AddMode === null) {
            this.AddMode = !this.AddMode;
        }
        else {
            this.AddMode = AddMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._pointBasketService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'asc';
                this.getSortTitleValue = this._sort?.active || 'name';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._pointBasketService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue);
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

    // Helper function to format a Date object as 'yyyy-MM-ddTHH:mm'
    formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toTypeChangeValueOne(): void {
        if( this.totypeValue ===  1 || this.totypeValue === 2 || this.totypeValue === 3 ) {
            this.PointBasketAddForm.get('to_end_date').setValue(null);
        } else if ( this.totypeValue === 4 ) {
            this.PointBasketAddForm.get('to_number').setValue(0);
            this.PointBasketAddForm.get('to_end_type').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toTypeChangeValueTwo(): void {
        if( this.totypeValue ===  1 || this.totypeValue === 2 || this.totypeValue === 3 ) {
            this.PointBasketAddForm.get('to_end_date').setValue(null);
        } else if ( this.totypeValue === 4 ) {
            this.PointBasketAddForm.get('to_number').setValue(0);
            this.PointBasketAddForm.get('to_end_type').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    fromTypeChangeValue(): void {
        if( this.fromtypeValue ===  1 || this.fromtypeValue === 2 || this.fromtypeValue === 3 ) {
            this.PointBasketAddForm.get('from_start_date').setValue(null);
        } else if ( this.fromtypeValue === 4 ) {
            this.PointBasketAddForm.get('from_number').setValue(0);
            this.PointBasketAddForm.get('from_start_type').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'name') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'redemptiontype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'redemptiontype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'redemptiontype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    createPointBasket(): void {
        const pointbasket = this.PointBasketAddForm.getRawValue();
        this._pointBasketService.createPointBasket(pointbasket).subscribe(() => {
            this.toogleStoreAddFormMode(false);
            this.PointBasketAddForm.reset();
            this._changeDetectorRef.markForCheck();
        },
        (response) => {
                if (response.status === 200) {
                    // Successful response
                    //this.toogleStoreAddFormMode(false);
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
