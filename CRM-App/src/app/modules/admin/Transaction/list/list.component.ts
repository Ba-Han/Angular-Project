import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, filter, fromEvent, Observable, Subject, switchMap, takeUntil, of } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TransactionService } from 'app/modules/admin/transaction/transaction.service';
import { Transaction, TransactionPagination } from 'app/modules/admin/transaction/transaction.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'transaction-list',
    templateUrl: './list.component.html',
    styles: [
        /* language=SCSS */
        `
            .transaction-grid {
                grid-template-columns: 180px 130px 130px 130px 130px 130px;

                @screen sm {
                    grid-template-columns: 180px 130px 130px 130px 130px 130px;
                }

                @screen md {
                    grid-template-columns: 180px 130px 130px 130px 130px 130px;
                }

                @screen lg {
                    grid-template-columns: 180px 130px 130px 130px 130px 130px;
                }
            }
            .custom-paging {
                position: fixed !important;
                margin-bottom: 55px;
                margin-left: 281px;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .transaction-2-sort {
                position: static;
                width: 10rem !important;
            }

            .transaction_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .transaction-sort-btn-01 {
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
export class TransactionListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    transactions$: Observable<Transaction[]>;
    transaction: Transaction;
    memberPointsCount: number = 0;
    isLoading: boolean = false;
    pagination: TransactionPagination;
    memberId: number;
    transactionlistMode: boolean = false;
    TransactionDetail: boolean = false;
    isAscending: boolean = false;
    selectedCoulumn: string = 'date';
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';
    searchInputControl: FormControl = new FormControl();
    //selectedMemberPoint: Transaction | null = null;;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _transactionService: TransactionService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }

        });

        // Get the data
        this.transactions$ = this._transactionService.memberTransactions$;

        // Get the pagination
        this._transactionService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: TransactionPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.searchValue = query;
                    return this._transactionService.getData(Number(this.memberId), 0, 10, this.getSortTitleValue, this.sortDirection, query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'orderno') {
                this._sort.sort({
                    id: 'document_no',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'orderno') {
                this._sort.sort({
                    id: 'document_no',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'amount') {
                this._sort.sort({
                    id: 'total_amount',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'amount') {
                this._sort.sort({
                    id: 'total_amount',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'transaction_date',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'transaction_date',
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
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                });

            // Get transaction if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._transactionService.getData(Number(this.memberId), this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue);
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

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    toggleListMode(transactionlistMode: boolean | null = null): void {
        if (transactionlistMode === null) {
            this.transactionlistMode = !this.transactionlistMode;
        }
        else {
            this.transactionlistMode = transactionlistMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    toggleDetailMode(transactiondetailMode: boolean | null = null): void {
        if (transactiondetailMode === null) {
            this.TransactionDetail = !this.TransactionDetail;
        }
        else {
            this.TransactionDetail = transactiondetailMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._transactionService.getData(Number(this.memberId), this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'desc';
                this.getSortTitleValue = this._sort?.active || 'transaction_date';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._transactionService.getData(Number(this.memberId), this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue);
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
        if ( this.selectedCoulumn === 'orderno') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'orderno' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'orderno' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    openDetail(): void {
        //this.toggleListMode(false);
        this.toggleDetailMode(true);
    }

    backToList(): void {
        this.toggleDetailMode(false);
        //this.toggleListMode(true);
    }
}
