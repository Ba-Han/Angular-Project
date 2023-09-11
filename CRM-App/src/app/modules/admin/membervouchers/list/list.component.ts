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
import { MemberVoucherService } from 'app/modules/admin/membervouchers/membervouchers.service';
import { MemberVoucher, MemberVoucherPagination } from 'app/modules/admin/membervouchers/membervouchers.types';

@Component({
    selector       : 'membervouchers-list',
    templateUrl    : './list.component.html',
    styles         : [
        `
            .membervoucher-grid {
                grid-template-columns: 150px 150px 150px 100px 100px 100px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 100px 100px 100px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 100px 100px 100px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 100px 100px 100px;
                }
            }
            .membercustom-paging {
                position: fixed !important;
                bottom: 57px;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .membervoucher-2-sort {
                position: static;
                width: 13rem !important;
            }

            .membervoucher-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .membervoucher_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .sendEmail {
                position: relative;
                top: 0rem;
                left: 51rem;
                margin: -2rem;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class MemberVoucherListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    memberVouchers$: Observable<MemberVoucher[]>;
    memberVouchersCount: number = 0;
    isLoading: boolean = false;
    pagination: MemberVoucherPagination;
    minDate: string;
    memberId: number;
    voucherAddFormMode: boolean = false;
    memberVoucherAddForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    isAscending: boolean = true;
    selectedCoulumn = 'vouchercode';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor( private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberVoucherService: MemberVoucherService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void
    {
        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }

        });

        this.memberVoucherAddForm = this._formBuilder.group({
            id: 0,
            member_id: this.memberId,
            voucher_code: ['', [Validators.required]],
            points_used: ['', [Validators.required]],
            conversion_rate: ['', [Validators.required]],
            amount: ['', [Validators.required]]
        });

        // Get the data
        this.memberVouchers$ = this._memberVoucherService.memberVouchers$;
        this._memberVoucherService.memberVouchers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberVouchers: MemberVoucher[]) => {
                this.memberVouchersCount = memberVouchers.length;
                 this._changeDetectorRef.markForCheck();

            });

        // Get the pagination
        this._memberVoucherService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: MemberVoucherPagination) => {
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
                 return this._memberVoucherService.getMemberVoucher(Number(this.memberId),0, 10, 'voucher_code', 'asc', query);
             }),
             map(() => {
                 this.isLoading = false;
             })
         ).subscribe(() => {
            this._changeDetectorRef.markForCheck();
         });
    }

    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'vouchercode') {
                this._sort.sort({
                    id: 'voucher_code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'vouchercode') {
                this._sort.sort({
                    id: 'voucher_code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'pointused') {
                this._sort.sort({
                    id: 'points_used',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointused') {
                this._sort.sort({
                    id: 'points_used',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'conversionrate') {
                this._sort.sort({
                    id: 'conversion_rate',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'conversionrate') {
                this._sort.sort({
                    id: 'conversion_rate',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'amount') {
                this._sort.sort({
                    id: 'amount',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'amount') {
                this._sort.sort({
                    id: 'amount',
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

            // Get membervouchers if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._memberVoucherService.getMemberVoucher(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void
     {
         this._router.navigate(['./'], {relativeTo: this._activatedRoute});
         this._changeDetectorRef.markForCheck();
     }

     // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._memberVoucherService.getMemberVoucher(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._memberVoucherService.getMemberVoucher(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
        if ( this.selectedCoulumn === 'vouchercode') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'pointused' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'conversionrate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'vouchercode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'vouchercode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointused' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointused' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'conversionrate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'conversionrate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'amount' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    createMemberVoucher(): void
    {
        const newmemberVoucher = this.memberVoucherAddForm.getRawValue();
        this._memberVoucherService.createMemberVoucher(newmemberVoucher).subscribe(() => {
            this.toogleVoucherAddFormMode(false);
            this._changeDetectorRef.markForCheck();
        });
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    toogleVoucherAddFormMode(voucherAddFormMode: boolean | null = null): void {
        if (voucherAddFormMode === null) {
            this.voucherAddFormMode = !this.voucherAddFormMode;
        }
        else {
            this.voucherAddFormMode = voucherAddFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    AddFormclose(): void {
        this.toogleVoucherAddFormMode(false);
    }
}
