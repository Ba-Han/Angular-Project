import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MemberLogsService } from 'app/modules/admin/memberlogs/memberlogs.service';
import { MemberLogs, MemberLogsPagination } from 'app/modules/admin/memberlogs/memberlogs.types';

@Component({
    selector       : 'memberlogs-list',
    templateUrl    : './memberlogs.component.html',
    styles         : [
        `
            .memberlogs-grid {
                grid-template-columns: 100px auto;

                @screen sm {
                    grid-template-columns: 100px auto;
                }

                @screen md {
                    grid-template-columns: 100px auto;
                }

                @screen lg {
                    grid-template-columns: 100px auto;
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

            .memberlogs-2-sort {
                position: static;
                width: 13rem !important;
            }

            .memberlogs-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .memberlogs_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .show_long_text {
                white-space: pre-wrap !important;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class MemberLogsListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    memberLogs$: Observable<MemberLogs[]>;
    memberLogsCount: number = 0;
    isLoading: boolean = false;
    pagination: MemberLogsPagination;
    memberId: number;
    searchInputControl: FormControl = new FormControl();
    isAscending: boolean = true;
    selectedCoulumn: string = 'dateupdated';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor( private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberLogsService: MemberLogsService,
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

        // Get the data
        this.memberLogs$ = this._memberLogsService.memberLogs$;
        this._memberLogsService.memberLogs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberLogs: MemberLogs[]) => {
                this.memberLogsCount = memberLogs.length;
                 this._changeDetectorRef.markForCheck();

            });

        // Get the pagination
        this._memberLogsService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: MemberLogsPagination) => {
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
                 return this._memberLogsService.getMemberLogs(Number(this.memberId),0, 10, 'date_updated', 'asc', query);
             }),
             map(() => {
                 this.isLoading = false;
             })
         ).subscribe();
    }

    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'dateupdated') {
                this._sort.sort({
                    id: 'date_updated',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'dateupdated') {
                this._sort.sort({
                    id: 'date_updated',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'logdata') {
                this._sort.sort({
                    id: 'log_data',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'logdata') {
                this._sort.sort({
                    id: 'log_data',
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

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._memberLogsService.getMemberLogs(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
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
    sortingColumnList() {
        if ( this.selectedCoulumn === 'dateupdated') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'logdata') {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'dateupdated' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'dateupdated' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'logdata' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'logdata' ) {
            this.ngAfterViewInit();
        }
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
