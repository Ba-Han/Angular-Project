import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map,tap, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Channel, ChannelPagination } from 'app/modules/admin/setting/channel/channel.types';
import { ChannelService } from 'app/modules/admin/setting/channel/channel.service';
import { ChannelDetailComponent } from 'app/modules/admin/setting/channel/detail/detail.component';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'channel-list',
    templateUrl: './channel.component.html',
    styles: [
        /* language=SCSS */
        `
            .channel-grid {
                grid-template-columns: 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 200px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 200px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 200px 150px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .channel-2-sort {
                position: static;
                width: 13rem !important;
            }

            .channel_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .channel-sort-btn-01 {
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
export class ChannelListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    channels$: Observable<any[]>;
    channel$: Observable<Channel>;
    isLoading: boolean = false;
    pagination: ChannelPagination;
    code: string;
    AddMode: boolean = false;
    canEdit: boolean = false;
    searchInputControl: FormControl = new FormControl();
    ChannelAddForm: FormGroup;

    selectedChannel: Channel | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'channelname';
    errorMessage: string | '' = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _channelService: ChannelService,
        private _router: Router,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.ChannelAddForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['active', Validators.required],
            name: ['', Validators.required],
        });

        //this._activatedRoute.url.subscribe((param) => {
        //    if (param != null) {
        //        this.code = param[0].path;
        //    }

        //});

        // Get the pagination
        this._channelService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ChannelPagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the channels []
        this.channels$ = this._channelService.channels$;

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._channelService.getChannels(0, 10,'name','asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
            this.canEdit = this._userService.getEditUserPermissionByNavId('channel');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'channelcode') {
                this._sort.sort({
                    id: 'code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'channelcode') {
                this._sort.sort({
                    id: 'code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'channelname') {
                this._sort.sort({
                    id: 'name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'channelname') {
                this._sort.sort({
                    id: 'name',
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

            // Get channels if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                    return this._channelService.getChannels(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
    sortingColumnList() {
        if ( this.selectedCoulumn === 'channelcode') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'channelname' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'channelcode' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'channelcode' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'channelname' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'channelname' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        }
    }

    createChannel(): void {
        const channel = this.ChannelAddForm.getRawValue();
        this.isLoading = false;
        this._channelService.createChnnel(channel)
            .subscribe(() => {
                this.tooglepointAddFormMode(false);
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
