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
import { LogService } from 'app/modules/admin/log/log.service';
import { Log, LogPagination } from 'app/modules/admin/log/log.types';

@Component({
    selector       : 'log-list',
    templateUrl    : './log.component.html',
    styles         : [
        `
            .log-grid {
                grid-template-columns: 150px 200px 150px 250px 100px 350px 200px 200px 100px;

                @screen sm {
                    grid-template-columns: 150px 200px 150px 250px 100px 350px 200px 200px 100px;
                }

                @screen md {
                    grid-template-columns: 150px 200px 150px 250px 100px 350px 200px 200px 100px;
                }

                @screen lg {
                    grid-template-columns: 150px 200px 150px 250px 100px 350px 200px 200px 100px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .log-2-sort {
                position: static;
                width: 13rem !important;
            }

            .log-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .log_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .log_long_text {
                white-space: pre-wrap !important;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class LogListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    log$: Observable<Log[]>;
    log: Log;
    isLoading: boolean = false;
    pagination: LogPagination;
    logSearchInputControl: FormControl = new FormControl();
    searchInputControl: FormControl = new FormControl();
    isAscending: boolean = true;
    requestedMethod: string = 'post';
    todayDate: string;
    errorMessage: string;
    logData: any;
    getLogInputData: string;
    logDataFormMode: boolean = false;
    getDetailsLogData: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor( private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _logService: LogService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
    )
    {
        const currentDate = new Date();
        this.todayDate = currentDate.toISOString().split('T')[0];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void
    {
        this._logService.Log$
        .subscribe((response: any) => {
            this.logData = response;
            this._changeDetectorRef.markForCheck();
          });

        // Get the pagination
        this._logService.Pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: LogPagination) => {
            this.pagination = pagination;
            this._changeDetectorRef.markForCheck();
        });

        // search Log Data
        this.logSearchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, 0, 10, 'request_on', 'asc', query);
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe();

        this.setupValueChangesSubscription();
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            if (this.isAscending && this.requestedMethod === 'post') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.requestedMethod === 'post') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.requestedMethod === 'get') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.requestedMethod === 'get') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.requestedMethod === 'patch') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.requestedMethod === 'patch') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.requestedMethod === 'delete') {
                this._sort.sort({
                    id: 'request_method',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.requestedMethod === 'delete') {
                this._sort.sort({
                    id: 'request_method',
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
                    return this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toogleLogDataFormMode(logDataFormMode: boolean | null = null) {
        if (logDataFormMode === null) {
            this.logDataFormMode = !this.logDataFormMode;
        }
        else {
            this.logDataFormMode = logDataFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    openLogDetailsForm(log: any): void {
        this.getDetailsLogData = log;
        this.toogleLogDataFormMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setupValueChangesSubscription() {
        this.searchInputControl.valueChanges
         .pipe(
             takeUntil(this._unsubscribeAll),
             debounceTime(300),
             switchMap((query) => {
                 this.isLoading = true;
                 return this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, 0, 10, 'request_on', 'asc', query);
                }),
             map(() => {
                 this.isLoading = false;
             })
         ).subscribe(() => {
            this.ngOnInit();
            this.isLoading = false;
            this.errorMessage = null;
            this._changeDetectorRef.markForCheck();
          },
          (error) => {
            this.errorMessage = error.error.message;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
          });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    requestMethodList(selectedMethod: string) {
        this.requestedMethod = selectedMethod;
        this._logService.postWithTodayDate(this.getLogInputData, this.todayDate, this.requestedMethod, 0, 10, 'request_on', 'asc')
          .subscribe(
            () => {
              // Do something on success if needed
            },
            (error) => {
              console.error(error);
            }
          );
          this._changeDetectorRef.markForCheck();
      }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingRequestMethodList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.requestedMethod === 'post' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.requestedMethod === 'post' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.requestedMethod === 'get' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.requestedMethod === 'get' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.requestedMethod === 'patch' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.requestedMethod === 'patch' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.requestedMethod === 'delete' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.requestedMethod === 'delete' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }
}
