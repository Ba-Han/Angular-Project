import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import {
    debounceTime,
    map,
    merge,
    filter,
    fromEvent,
    Observable,
    Subject,
    switchMap,
    takeUntil,
    finalize,
    of,
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    Member,
    Country,
    MemberPagination
} from 'app/modules/admin/member/member.types';
import { MemberService } from 'app/modules/admin/member/member.service';
import { MemberTierService } from 'app/modules/admin/loyalty/membertier/membertier.service';

@Component({
    selector: 'member-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class MemberListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatExpansionModule) accordion: MatExpansionModule;

    members$: Observable<Member[]>;
    membersCount: number = 0;
    isLoading: boolean = false;
    canEdit: boolean = false;
    pagination: MemberPagination;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedMember: Member | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'membercode';
    searchFilter: string;
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';
    selectedMemberTierFilter: string | number = 'memberTier';
    getMemberTierResponse: any;
    membersData: any;
    searchFilterTierId: number | string;
    getMemberTierResponseFirstLevel: number | string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberService: MemberService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _memberTierService: MemberTierService
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.members$ = this._memberService.members$;
        this._memberService.members$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((members: Member[]) => {
                this.membersCount = members.length;
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._memberService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: MemberPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this._memberService.memberTiers
        .subscribe((response: any) => {
            this.getMemberTierResponse = response;
            this.getMemberTierResponseFirstLevel = response[0].level;

            this.searchFilterTierId = this._activatedRoute.snapshot.paramMap.get('membertierid');
            this.selectedMemberTierFilter = this.searchFilterTierId ? parseInt(this.searchFilterTierId, 10) : this.getMemberTierResponseFirstLevel;
            this._changeDetectorRef.markForCheck();
        });

        // Get the member
        this._memberService.member$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((member: Member) => {
                this.selectedMember = member;
                this._changeDetectorRef.markForCheck();
            });

        //Subscribe to search input field value changes
          this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.searchValue = query;
                    return this._memberService.getMembers(0, 10, this.getSortTitleValue, this.sortDirection, query, this.searchFilter);
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
            if (this.isAscending && this.selectedCoulumn === 'membercode') {
                this._sort.sort({
                    id: 'member_code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'membercode') {
                this._sort.sort({
                    id: 'member_code',
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
            } else if (this.isAscending && this.selectedCoulumn === 'mobile') {
                this._sort.sort({
                    id: 'mobile_phone',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'mobile') {
                this._sort.sort({
                    id: 'mobile_phone',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'createddate') {
                this._sort.sort({
                    id: 'date_created',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'createddate') {
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

            // Get member if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        if(this.isLoading === true) {
                            return this._memberService.getMembers(
                                this._paginator.pageIndex,
                                this._paginator.pageSize,
                                this._sort.active,
                                this._sort.direction,
                                this.searchValue,
                                this.searchFilter
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    memberTierFilterChange(e: any): void {
        const getMemberTierId = e.value;
        this.selectedMemberTierFilter = getMemberTierId ? getMemberTierId : '';
        if (this._paginator) {
            this._paginator.pageIndex = 0;
        }
        this.updateMemberList();
        this._changeDetectorRef.markForCheck();
    }

    updateMemberList(): void {
        const selectedIndex = this.selectedMemberTierFilter;
        const pageIndex = this._paginator?.pageIndex || 0;
        const pageSize = this._paginator?.pageSize || 10;
        const sortActive = this._sort?.active || 'member_code';
        const sortDirection = this._sort?.direction || 'asc';

        this.searchFilter = selectedIndex ? '{"member_tier":{"_eq":"' + selectedIndex + '"}}' : '';

        this._memberService.getMembers(pageIndex, pageSize, sortActive, sortDirection, this.searchValue, this.searchFilter)
        .pipe(
            switchMap(() => {
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._memberService.getMembers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction,this.searchValue, this.searchFilter);
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
    onPageChange() {
        const selectedIndex = this.selectedMemberTierFilter;
        this.searchFilter = selectedIndex ? '{"member_tier":{"_eq":"' + selectedIndex + '"}}' : '';
        // eslint-disable-next-line max-len
        this._memberService.getMembers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'asc';
                this.getSortTitleValue = this._sort?.active || 'member_code';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._memberService.getMembers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction,this.searchValue, this.searchFilter);
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
        if ( this.selectedCoulumn === 'membercode') {
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
        } else if ( this.selectedCoulumn === 'mobile' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'createddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'membercode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'membercode' ) {
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
        } else if ( this.isAscending && this.selectedCoulumn === 'mobile' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'mobile' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'createddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'createddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }
}
