import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    debounceTime,
    map,
    merge,
    Observable,
    Subject,
    switchMap,
    takeUntil,
    finalize,
    of,
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    User,
    UserPagination,
} from 'app/modules/admin/setting/user/user.types';
import { CRMUserService } from 'app/modules/admin/setting/user/user.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'user-list',
    templateUrl: './user.component.html',
    styles: [
        /* language=SCSS */
        `
            .user-grid {
                grid-template-columns: 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 300px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 300px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 245px 150px 150px 245px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .user-2-sort {
                position: static;
                width: 11rem !important;
            }

            .user_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .user-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class UserListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    users$: Observable<User[]>;
    user: Observable<User>;
    isLoading: boolean = false;
    pagination: UserPagination;
    searchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    UserAddForm: FormGroup;
    code: string;
    canEdit: boolean = false;
    selectedChannel: User | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'username';
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private passwordStrength: 0;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _crmUserService: CRMUserService,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.UserAddForm = this._formBuilder.group({
            id: [''],
            status: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            role: ['', Validators.required],
        });

        // Get the pagination
        this._crmUserService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: UserPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // Get the users []
        this.users$ = this._crmUserService.users$;

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.searchValue = query;
                    return this._crmUserService.getAppUsers(
                        0,
                        10,
                        this.getSortTitleValue,
                        this.sortDirection,
                        query
                    );
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });

        this.canEdit = this._userService.getEditUserPermissionByNavId('loginuser');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            if (this.isAscending && this.selectedCoulumn === 'username') {
                this._sort.sort({
                    id: 'username',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'username') {
                this._sort.sort({
                    id: 'username',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'firstname') {
                this._sort.sort({
                    id: 'first_name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'firstname') {
                this._sort.sort({
                    id: 'first_name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'lastname') {
                this._sort.sort({
                    id: 'last_name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'lastname') {
                this._sort.sort({
                    id: 'last_name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'email') {
                this._sort.sort({
                    id: 'email',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'email') {
                this._sort.sort({
                    id: 'email',
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

            // Get users if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        if(this.isLoading === true) {
                            return this._crmUserService.getAppUsers(
                                this._paginator.pageIndex,
                                this._paginator.pageSize,
                                this._sort.active,
                                this._sort.direction,
                                this.searchValue
                            );
                        } else {
                            return of(null);
                        }
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe(() => {
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
        } else {
            this.AddMode = AddMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._crmUserService.getAppUsers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'asc';
                this.getSortTitleValue = this._sort?.active || 'username';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._crmUserService.getAppUsers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue);
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
        if ( this.selectedCoulumn === 'username') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'firstname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'lastname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'email' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'username' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'username' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'firstname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'firstname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'lastname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'lastname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'email' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'email' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    createUser(): void {
        const user = this.UserAddForm.getRawValue();
        if (this.passwordStrength >= 100) {
            this._crmUserService.createUser(user).subscribe(() => {
                this.toogleStoreAddFormMode(false);
            });
        }
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }
}
