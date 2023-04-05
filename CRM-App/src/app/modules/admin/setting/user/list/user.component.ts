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
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    User,
    UserPagination,
} from 'app/modules/admin/setting/user/user.types';
import { UserService } from 'app/modules/admin/setting/user/user.service';

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
                width: 9rem !important;
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
    selectedChannel: User | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'username';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private passwordStrength: 0;
    roles: any;
    selectedRole: string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
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
        this._userService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: UserPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // Get the users []
        this.users$ = this._userService.users$;

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._userService.getAppUsers(
                        0,
                        10,
                        'username',
                        'asc',
                        query
                    );
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.getUserRoles();
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'username',
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

            // Get users if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        /* const sort =
                            this._sort.direction === 'desc'
                                ? '-' + this._sort.active
                                : this._sort.active; */
                        return this._userService.getAppUsers(
                            this._paginator.pageIndex,
                            this._paginator.pageSize,
                            this._sort.active,
                            this._sort.direction

                        );
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
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
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'username' ) {
            this._userService.getAppUsers(0, 10, 'username', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'username' ) {
            this._userService.getAppUsers(0, 10, 'username', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'firstname' ) {
            this._userService.getAppUsers(0, 10, 'first_name', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'firstname' ) {
            this._userService.getAppUsers(0, 10, 'first_name', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'lastname' ) {
            this._userService.getAppUsers(0, 10, 'last_name', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'lastname' ) {
            this._userService.getAppUsers(0, 10, 'last_name', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'email' ) {
            this._userService.getAppUsers(0, 10, 'email', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'email' ) {
            this._userService.getAppUsers(0, 10, 'email', 'desc').subscribe();
        }
    }

    createUser(): void {
        const user = this.UserAddForm.getRawValue();
        if (this.passwordStrength >= 100) {
            this._userService.createUser(user).subscribe(() => {
                this.toogleStoreAddFormMode(false);
            });
        }
    }

    onStrengthChanged(value): void {
        this.passwordStrength = value;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getUserRoles() {
        this._userService
            .getUserRoles()
            .pipe(finalize(() => {}))
            .subscribe((response) => {
                const roles: any = response.data ? response.data : [];
                const availableRoles: any = [];
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i: number = 0; i < roles.length; i++) {
                    if (
                        roles[i].name === 'CRM APP User' ||
                        roles[i].name === 'CRM APP Manager'
                    ) {
                        availableRoles.push(roles[i]);
                    }
                }
                this.roles = availableRoles;
            });
    }
}
