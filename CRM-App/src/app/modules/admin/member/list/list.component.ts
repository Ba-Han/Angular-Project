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
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    Member,
    Country,
    MemberPagination,
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
    @ViewChild(MatExpansionModule) accordion: MatExpansionModule;

    members$: Observable<Member[]>;
    membersCount: number = 0;
    membersTableColumns: string[] = [
        'member_code',
        'member_tier.name',
        'first_name',
        'last_name',
        'mobile_phone',
        'email',
    ];
    countries: Country[];
    isLoading: boolean = false;
    pagination: MemberPagination;
    drawerMode: 'side' | 'over';
    searchValue: string;
    searchOption: string;
    searchField: string;
    searchText: string;
    searchFilter: string;
    selectTier: boolean;
    selectTierType : string;
    memberTiers: any;
    optionList: any;
    searchInputControl: FormControl = new FormControl();
    selectedMember: Member | null = null;
    selectedProductForm: FormGroup;
    searchForm: FormGroup;
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
        this.getTierList();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        let searchFilterTierId = this._activatedRoute.snapshot.paramMap.get('membertierid');
        this.searchFilter = searchFilterTierId ? '{"member_tier":{"_eq":"' + searchFilterTierId + '"}}' : "";
        this.selectTier = false;
        this.searchForm = this._formBuilder.group({
            field: [''],
            option: [''],
            searchValue: [''],
            searchTierValue: [''],
        });
        this.optionList = this.getOptionList();
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

                    // Search
                    this.searchValue = query;
                    return this._memberService.getMembers(0, 10, 'member_code', 'asc', query,this.searchFilter);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'member_code',
                start: 'asc',
                disableClear: true,
            });

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
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        const sort =
                            this._sort.direction == 'desc' && this.searchField != "full_name"
                                ? '-' + this._sort.active
                                : this._sort.active;
                        return this._memberService.getMembers(
                            this._paginator.pageIndex,
                            this._paginator.pageSize,
                            sort,
                            this._sort.direction,
                            this.searchValue,
                            this.searchFilter,
                            this.searchField == "full_name" ? 'custom' : '',
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

    advanceSearch() {
        let searchOption =
            this.searchForm.value.option && this.searchForm.value.option != ''
                ? this.searchForm.value.option
                : 'member_code';
        let searchField =
            this.searchForm.value.field && this.searchForm.value.field != ''
                ? this.searchForm.value.field
                : '_eq';
        let searchText = this.searchForm.value.searchValue;
        let filter = '';
        if (this.selectTier) {
            searchText = this.searchForm.value.searchTierValue;
        }
        searchText = searchText === null ? "" : searchText;
        if ( searchText !== "") {
            filter =
                '{"' +
                searchField +
                '":{"' +
                searchOption +
                '":"' +
                searchText +
                '"}}';  
        }
        this.searchFilter = filter;
        this.searchField = searchField;
        //const fields = searchField == "full_name" ? 'custom' : '';
        // this.searchForm.value.searchValue = "mahesh";

        return this._memberService
            .getMembers(0, 10, 'member_code', 'asc', this.searchValue, filter,  this.searchField == "full_name" ? 'custom' : '')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tier: any) => {});
    }

    clearSearch() {
        this.searchForm.reset();
    }

    fieldChange(e) {
        this.selectTier = false;
        this.optionList = this.getOptionList();
        if (e.value == 'member_tier' || e.value == 'status') {
            this.selectTierType = e.value;
            this.selectTier = true;
            this.optionList = [
                { value: '_eq', name: 'Equals' },
                { value: '_neq', name: 'Not Equals' },
            ];
        }
    }

    getTierList() {
        this._memberTierService
            .getTierList()
            .pipe(finalize(() => {}))
            .subscribe((response) => {
                let tiers: any = response.data ? response.data : [];
                this.memberTiers = tiers;
                this.ngOnInit();
            });
    }

    getOptionList() {
        let optionList: any = [
            { value: '_eq', name: 'Equals' },
            { value: '_neq', name: 'Not Equals' },
            { value: '_contains', name: 'Contain' },
            { value: '_ncontains', name: "Doesn't contain" },
            { value: '_starts_with', name: 'Starts with' },
            { value: '_ends_with', name: 'Ends with' },
        ];
        return optionList;
    }

    openAdvancedSearch(panel: MatExpansionPanel) {
        panel.open();
    }
    closeAdvancedSearch(panel: MatExpansionPanel) {
        panel.close();
    }
}
