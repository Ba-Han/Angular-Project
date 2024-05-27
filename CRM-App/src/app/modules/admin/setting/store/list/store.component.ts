import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Channel, Store, StorePagination } from 'app/modules/admin/setting/store/store.types';
import { StoreService } from 'app/modules/admin/setting/store/store.service';
import { StoreDetailComponent } from 'app/modules/admin/setting/store/detail/detail.component';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'store-list',
    templateUrl: './store.component.html',
    styles: [
        /* language=SCSS */
        `
            .store-grid {
                grid-template-columns: 200px 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 200px 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 200px 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 200px 150px 150px 150px 150px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .store-2-sort {
                position: static;
                width: 12rem !important;
            }

            .store_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .store-sort-btn-01 {
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
export class StoreListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    stores$: Observable<Store[]>;
    store$: Observable<Store>;
    isLoading: boolean = false;
    pagination: StorePagination;
    searchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    canEdit: boolean = false;
    StoreAddForm: FormGroup;
    code: string;
    selectedChannel: Store | null = null;
    isAscending: boolean = true;
    channels$: Observable<Channel[]>;
    getChannelData: any;
    selectedCoulumn = 'storename';
    selectedChannelFilter: string = 'channel';
    searchFilter: string;
    errorMessage: string | '' = '';
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _storeService: StoreService,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.StoreAddForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['active', Validators.required],
            name: ['', Validators.required],
            address_line_1: [''],
            address_line_2: [''],
            city: [''],
            state: [''],
            postal_code: [''],
            region: [''],
            country: ['SG', Validators.required],
            channel_code: ['', Validators.required],
        });

        // Get the pagination
        this._storeService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StorePagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the stores []
        this.stores$ = this._storeService.stores$;
        //Get the Channel []
        this._storeService.channels$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((channel) => {
            this.getChannelData = channel;
        });

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.searchValue = query;
                    return this._storeService.getStores(0, 10, this.getSortTitleValue, this.sortDirection, query ,this.searchFilter);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe(() =>{
                this._changeDetectorRef.markForCheck();
            });

            this.canEdit = this._userService.getEditUserPermissionByNavId('store');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'storename') {
                this._sort.sort({
                    id: 'name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'storename') {
                this._sort.sort({
                    id: 'name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'storecode') {
                this._sort.sort({
                    id: 'code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'storecode') {
                this._sort.sort({
                    id: 'code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'country') {
                this._sort.sort({
                    id: 'country',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'country') {
                this._sort.sort({
                    id: 'country',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'status') {
                this._sort.sort({
                    id: 'status',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'status') {
                this._sort.sort({
                    id: 'status',
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

            // Get store if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._storeService.getStores(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter);
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

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    channelFilterChange(e: any): void {
        const getChannelCode = e.value;
        this.searchFilter = getChannelCode ? '{"channel_code":{"_eq":"' + getChannelCode + '"}}' : '';
        const pageIndex = this._paginator?.pageIndex || 0;
        const pageSize = this._paginator?.pageSize || 10;
        const sortActive = this._sort?.active || 'name';
        const sortDirection = this._sort?.direction || 'asc';

        if(this.searchFilter === '{"channel_code":{"_eq":"all"}}') {
            this.searchFilter = '';
        }

        this._storeService.getStores(pageIndex, pageSize, sortActive, sortDirection,this.searchValue, this.searchFilter)
       .pipe(
        takeUntil(this._unsubscribeAll)
            )
            .subscribe((response: any) => {
                this._changeDetectorRef.markForCheck();
        });
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._storeService.getStores(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'asc';
                this.getSortTitleValue = this._sort?.active || 'name';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._storeService.getStores(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter);
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
        if ( this.selectedCoulumn === 'storename') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'storecode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'country' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'storename' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'storename' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'storecode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'storecode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'country' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'country' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    createStore(): void {
        const store = this.StoreAddForm.getRawValue();
        this._storeService.createStore(store).subscribe(() => {
            this.toogleStoreAddFormMode(false);
            this.StoreAddForm.reset();
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
