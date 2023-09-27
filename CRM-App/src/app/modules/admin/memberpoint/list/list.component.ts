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
import { MemberPointService } from 'app/modules/admin/memberpoint/memberpoint.service';
import { MemberService } from 'app/modules/admin/member/member.service';
import { MemberPoint, MemberPointPagination } from 'app/modules/admin/memberpoint/memberpoint.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector       : 'memberpoint-list',
    templateUrl    : './list.component.html',
    styles         : [
        `
            .memberpoint-grid {
                grid-template-columns: 180px 100px 100px 100px 100px 150px 110px 110px 110px;

                @screen sm {
                    grid-template-columns: 180px 100px 100px 100px 100px 150px 110px 110px 110px;
                }

                @screen md {
                    grid-template-columns: 180px 100px 100px 100px 100px 150px 110px 110px 110px;
                }

                @screen lg {
                    grid-template-columns: 180px 100px 100px 100px 100px 150px 110px 110px 110px;
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

            .memberpoint-2-sort {
                position: static;
                width: 12rem !important;
            }

            .memberpoint-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .active-expire-point {
                width: 7rem !important;
            }

            .memberpoint_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .memberpoint_search {
                width: 14rem !important;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class MemberPointListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    memberPoints$: Observable<MemberPoint[]>;
    memberPointsCount: number = 0;
    isLoading: boolean = false;
    pagination: MemberPointPagination;
    minDate: string;
    memberId: number;
    pointAddFormMode: boolean = false;
    memberPointAddForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    isAscending: boolean = true;
    selectedCoulumn = 'documentno';
    filterActiveAndExpirePoint: string = 'all';
    getFilterValue: any;
    pageIndex: number = 0;
    canEdit: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor( private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberPointService: MemberPointService,
        private _memberservice: MemberService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _userService: UserService
    )
    {
        const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);
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

        this.memberPointAddForm = this._formBuilder.group({
            id: 0,
            member: this.memberId,
            point_type: ['adjustment', [Validators.required]],
            point_type_int: ['', [Validators.required]],
            reward_code: ['', [Validators.required]],
            point: ['', [Validators.required]],
            expiry_date: ['', [Validators.required]],
            comment: ['', [Validators.required]],
        });

        // Get the data
        this.memberPoints$ = this._memberPointService.memberPoints$;
        this._memberPointService.memberPoints$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberPoints: MemberPoint[]) => {
                this.memberPointsCount = memberPoints.length;
                 this._changeDetectorRef.markForCheck();

            });

        // Get the pagination
        this._memberPointService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: MemberPointPagination) => {
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
                 return this._memberPointService.getData(Number(this.memberId),0, 10, 'transaction_document_no', 'asc', 'all', query);
             }),
             map(() => {
                 this.isLoading = false;
             })
         ).subscribe(() => {
            this._changeDetectorRef.markForCheck();
         });

         this.canEdit = this._userService.getEditUserPermissionByNavId('member');
    }

    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'documentno') {
                this._sort.sort({
                    id: 'transaction_document_no',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'documentno') {
                this._sort.sort({
                    id: 'transaction_document_no',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'pointtype') {
                this._sort.sort({
                    id: 'point_type',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointtype') {
                this._sort.sort({
                    id: 'point_type',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'points') {
                this._sort.sort({
                    id: 'point',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'points') {
                this._sort.sort({
                    id: 'point',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'balance') {
                this._sort.sort({
                    id: 'balance',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'balance') {
                this._sort.sort({
                    id: 'balance',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'rewardcode') {
                this._sort.sort({
                    id: 'reward_code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'rewardcode') {
                this._sort.sort({
                    id: 'reward_code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'validfrom') {
                this._sort.sort({
                    id: 'spending_valid_from',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'validfrom') {
                this._sort.sort({
                    id: 'spending_valid_from',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'validto') {
                this._sort.sort({
                    id: 'spending_valid_to',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'validto') {
                this._sort.sort({
                    id: 'spending_valid_to',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'date_created',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'date_created',
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

            // Get memberpoint if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._memberPointService.getData(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.getFilterValue);
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
        this._memberPointService.getData(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.getFilterValue).pipe(
            switchMap(() => {
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._memberPointService.getData(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.getFilterValue);
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
        if ( this.selectedCoulumn === 'documentno') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'balance' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'validfrom' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'validto' ) {
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
        if ( this.isAscending && this.selectedCoulumn === 'documentno' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'documentno' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'balance' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'balance' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'validfrom' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'validfrom' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'validto' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'validto' ) {
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

    createMemberPoint(): void
    {
        const newmemberPoint = this.memberPointAddForm.getRawValue();
        this._memberPointService.createMemberPoint(newmemberPoint).subscribe(() => {
            this.tooglepointAddFormMode(false);
            this.memberPointAddForm.reset();
            this._changeDetectorRef.markForCheck();
        });
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    tooglepointAddFormMode(pointAddFormMode: boolean | null = null): void {
        if (pointAddFormMode === null) {
            this.pointAddFormMode = !this.pointAddFormMode;
        }
        else {
            this.pointAddFormMode = pointAddFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    AddFormclose(): void {
        this.tooglepointAddFormMode(false);
    }

    activeAndExpirePointfieldChange(e: any): void {
        this.getFilterValue = e.value;
        this._memberPointService.getData(Number(this.memberId), 0, 10, '', 'asc', this.getFilterValue)
       .pipe(
        takeUntil(this._unsubscribeAll)
            )
            .subscribe((response: any) => {
                this._changeDetectorRef.markForCheck();
        });
    }
}
