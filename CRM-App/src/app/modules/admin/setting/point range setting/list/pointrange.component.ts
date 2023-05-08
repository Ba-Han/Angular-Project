import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointRange, PointRangePagination } from 'app/modules/admin/setting/point range setting/pointrange.types';
import { PointRangeService } from 'app/modules/admin/setting/point range setting/pointrange.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'point range setting-list',
    templateUrl: './pointrange.component.html',
    styles: [
        /* language=SCSS */
        `
            .pointrange-grid {
                grid-template-columns: 150px 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 150px 150px;
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


        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointRangeListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    pointranges$: Observable<PointRange[]>;
    pointrange$: Observable<PointRange>;
    isLoading: boolean = false;
    pagination: PointRangePagination;
    AddMode: boolean = false;
    canEdit: boolean = false;
    searchInputControl: FormControl = new FormControl();
    PointRangeAddForm: FormGroup;
    isAscending: boolean = true;
    selectedCoulumn = 'starttype';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _pointRangeService: PointRangeService,
        private _router: Router,
        private _userService: UserService
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {


        this.PointRangeAddForm = this._formBuilder.group({
            id: [''],
            start_type: ['', [Validators.required]],
            start_day_type: [''],
            end_type: ['', [Validators.required]],
            end_day_type: ['', [Validators.required]],
            end_day_value: ['', [Validators.required]]
        });

        // Get the pagination
        this._pointRangeService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointRangePagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.pointranges$ = this._pointRangeService.pointranges$;

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._pointRangeService.getPointRange(0, 10, 'start_type', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
            this.canEdit = this._userService.getEditUserPermissionByNavId('pointrangesetting');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'start_type',
                start: 'asc',
                disableClear: true
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                });

            // Get channels if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                    return this._pointRangeService.getPointRange(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
    tooglepointAddFormMode(AddMode: boolean | null = null): void {
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
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'starttype' ) {
            this._pointRangeService.getPointRange(0, 10, 'start_type', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'starttype' ) {
            this._pointRangeService.getPointRange(0, 10, 'start_type', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'startdaytype' ) {
            this._pointRangeService.getPointRange(0, 10, 'start_day_type', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'startdaytype' ) {
            this._pointRangeService.getPointRange(0, 10, 'start_day_type', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'endtype' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_type', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'endtype' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_type', 'desc').subscribe();
        }
        else if ( !this.isAscending && this.selectedCoulumn === 'enddaytype' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_day_type', 'asc').subscribe();
        }
        else if ( !this.isAscending && this.selectedCoulumn === 'enddaytype' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_day_type', 'desc').subscribe();
        }
        else if ( !this.isAscending && this.selectedCoulumn === 'value' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_day_value', 'asc').subscribe();
        }
        else if ( !this.isAscending && this.selectedCoulumn === 'value' ) {
            this._pointRangeService.getPointRange(0, 10, 'end_day_value', 'desc').subscribe();
        }
    }

    createPointRange(): void {
        const pointrange = this.PointRangeAddForm.getRawValue();
        this._pointRangeService.createPointRange(pointrange).subscribe(() => {
            this.tooglepointAddFormMode(false);
        });

    }
}
