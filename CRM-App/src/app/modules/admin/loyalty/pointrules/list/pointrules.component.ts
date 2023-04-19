import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointRule, PointRulePaginagion, PointBasket, PointBasketPagination } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointrules-list',
    templateUrl: './pointrules.component.html',
    styles: [
        /* language=SCSS */
        `
            .prule-grid_point_rule {
                grid-template-columns: 250px 250px 200px 150px;

                @screen sm {
                    grid-template-columns: 160px 160px 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 160px 160px 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 160px 160px 110px 150px 150px 150px;
                }
            }

            .point_rule_tier_grid {
                grid-template-columns: 60px 100px;
                     @screen sm {
                         grid-template-columns: 60px 100px 100px;
                     }
                     @screen md {
                         grid-template-columns: 60px 150px 150px;
                     }
                     @screen lg {
                         grid-template-columns: 35px 200px 200px;
                     }
                }

            .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
            }
            .customPoint{
                cursor: pointer;
                height: 50px;
                background: #fff;
                width: 100%;
                border: 1px solid #ccc;
                border-radius: 7px;
                padding: 15px;
             }

            .pointcross{
                float: right;
                width: 20px;
                text-align: center;
                border-radius: 10px;
                color: white;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .pointrule-2-sort {
                position: static;
                width: 10rem !important;
            }

            .sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .mat-paginator-container {
                margin-left: 0 !important;
            }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointRuleListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    //@ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    memberTiers$: Observable<MemberTier[]>;
    pointBaskets$: Observable<PointBasket[]>;
    pointBasketPagination: PointBasketPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side'|'over';

    newSegmentModel: PointBasket;
    PointBasketForm: FormGroup;
    pointbasketMode: boolean = false;
    pointbasketEditMode: boolean = false;
    pointbasketFormMode: boolean = false;

    pointRules$: Observable<PointRule[]>;
    pointRule$: Observable<PointRule>;
    isLoading: boolean = false;
    pagination: PointRulePaginagion;
    searchInputControl: FormControl = new FormControl();
    memberTierSearchInputControl: FormControl = new FormControl();
    pointBasketSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    canEdit: boolean = false;
    code: string;
    selectedChannel: PointRule | null = null;
    pointbasketId: number;
    name: string;
    description: string;
    spendingType: string;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    spendingtypeValue = 0;
    totypeValue = 0;
    toendTypeValue = 0;
    fromtypeValue = 0;
    fromstarttypeValue = 0;
    isButtonDisabled: boolean = true;
    isAscending: boolean = true;
    selectedCoulumn = 'name';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _pointRuleService: PointRuleService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService
    ) {
        const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------


    ngOnInit(): void {

        this.PointRuleAddForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            reward_code: ['', [Validators.required]],
            type: ['', [Validators.required]],
            point_value: ['', [Validators.required]],
            status: ['', [Validators.required]],
            start_date: [''],
            end_date: [''],
            member_tier: ['', [Validators.required]],
            member_tierFullName: ['', [Validators.required]],
            dollar_value: ['', [Validators.required]],
            validity_type: ['', [Validators.required]],
            basket_id: [''],
            point_basket: ['', [Validators.required]],
            point_basketName: ['', [Validators.required]],
        });

        this.PointBasketForm = this._formBuilder.group({
            id: [''],
            name: ['',[Validators.required]],
            description: ['',[Validators.required]],
            spending_type: ['',[Validators.required]],
            from_type: [''],
            from_number: [''],
            from_start_type: [''],
            from_start_date: [''],
            to_type: [''],
            to_number: [''],
            to_end_type: [''],
            to_end_date: [''],
        });


        this._pointRuleService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointRulePaginagion) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.pointRules$ = this._pointRuleService.pointRules$;
        this.pointBaskets$ = this._pointRuleService.pointBaskets$;

        // search Point Rules
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._pointRuleService.getPointRules(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
            this.canEdit = this._userService.getEditUserPermissionByNavId('point-rules');

        //Drawer Mode
        this.drawerTwo.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contact when drawer closed
                //this.selectedMember = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        //Member Tier Search
        this.memberTierSearchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    // Search
                    return this._pointRuleService.getMemberTiers(0, 10, 'name', 'asc', query);
                    this.drawerTwo.open();
                }),
                map(() => {
                    this.isLoading = false;
                    this.drawerTwo.open();
                })
            )
            .subscribe();

        //Point Basket Search
        this.pointBasketSearchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    // Search
                    return this._pointRuleService.getPointBaskets(0, 10, 'name', 'asc', query);
                    this.drawerTwo.open();
                }),
                map(() => {
                    this.isLoading = false;
                    this.drawerTwo.open();
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this._sort && this._paginator) {
                // Set the initial sort
                this._sort.sort({
                    id: 'name',
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

                merge(this._sort.sortChange, this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                        return this._pointRuleService.getPointRules(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 2000);
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
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleMemberTierListMode(MemberTierListMode: boolean | null = null): void {
        this.pointbasketMode = false;
        this.PointBasketListMode = false;
        if (MemberTierListMode === null) {
            this.MemberTierListMode = !this.MemberTierListMode;
        }
        else {
            this.MemberTierListMode = MemberTierListMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    tooglePointBasketListMode(PointBasketListMode: boolean | null = null): void {
        this.pointbasketMode = false;
        this.MemberTierListMode = false;
        if (PointBasketListMode === null) {
            this.PointBasketListMode = !this.PointBasketListMode;
        }
        else {
            this.PointBasketListMode = PointBasketListMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    tooglepointBasketAddFormMode(pointbasketMode: boolean | null = null): void {
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        if (pointbasketMode === null) {
            this.pointbasketMode = !this.pointbasketMode;
        }
        else {
            this.pointbasketMode = pointbasketMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    tooglepointBasketEditFormMode(pointbasketEditMode: boolean | null = null): void {
        this.MemberTierListMode = false;
        if (pointbasketEditMode === null) {
            this.pointbasketEditMode = !this.pointbasketEditMode;
        }
        else {
            this.pointbasketEditMode = pointbasketEditMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this._pointRuleService.getPointRules(0, 10, 'name', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this._pointRuleService.getPointRules(0, 10, 'name', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this._pointRuleService.getPointRules(0, 10, 'reward_code', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this._pointRuleService.getPointRules(0, 10, 'reward_code', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this._pointRuleService.getPointRules(0, 10, 'point_value', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this._pointRuleService.getPointRules(0, 10, 'point_value', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this._pointRuleService.getPointRules(0, 10, 'member_tierFullName', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this._pointRuleService.getPointRules(0, 10, 'member_tierFullName', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this._pointRuleService.getPointRules(0, 10, 'start_date', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this._pointRuleService.getPointRules(0, 10, 'start_date', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this._pointRuleService.getPointRules(0, 10, 'end_date', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this._pointRuleService.getPointRules(0, 10, 'end_date', 'desc').subscribe();
        }
    }

    createPointRule(): void {
        const pointrule = this.PointRuleAddForm.getRawValue();
        this._pointRuleService.createPointRule(pointrule).subscribe(() => {
            this.toogleStoreAddFormMode(false);
        });
    }

    setMemberTierDrawer(): void {
        this.toogleMemberTierListMode(true);
        this.memberTiers$ = this._pointRuleService.memberTiers$;
        this._pointRuleService.memberTierpagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: MemberTierPagination) => {
                this.memberTierPagination = pagination;
                this.drawerTwo.open();
                this._changeDetectorRef.markForCheck();
            });

        if (this.timeOutUpId) {
            this.timeOutUpId = setTimeout(() => {
                this.pageSortAndPaging();
            }, 1000);
            //clearTimeout(this.timeOutUpId);
        } else {
            this.timeOutUpId = setTimeout(() => {
                this.pageSortAndPaging();
            }, 1000);
        }
        this._changeDetectorRef.markForCheck();
    }

    pageSortAndPaging(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            /* this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            }); */
            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                    this.drawerTwo.open();
                });
            this._changeDetectorRef.markForCheck();

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.drawerTwo.open();
                    this.isLoading = true;
                    return this._pointRuleService.getMemberTiers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                    this.drawerTwo.open();
                })
            ).subscribe();
            this.drawerTwo.open();
        }
    }

    selectTier(id, name): void {
        const memberTier = this.PointRuleAddForm.getRawValue();
        memberTier.member_tier = id;
        memberTier.member_tierFullName = name;
        this.PointRuleAddForm.patchValue(memberTier);
        this.isLoading = false;
        this.drawerTwo.close();
    }

    setPointBasketDrawer(): void {
        this.tooglePointBasketListMode(true);
        this.pointBaskets$ = this._pointRuleService.pointBaskets$;
        this._pointRuleService.pointBasketPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointBasketPagination) => {
                this.pointBasketPagination = pagination;
                this.drawerTwo.open();
                this._changeDetectorRef.markForCheck();
            });
        if (this.timeoutId) {
            this.timeoutId = setTimeout(() => {
                this.pageSortAndBasketPaging();
            }, 1000);
            //clearTimeout(this.timeoutId);
            } else {
            this.timeoutId = setTimeout(() => {
                this.pageSortAndBasketPaging();
            }, 1000);
            }
        this._changeDetectorRef.markForCheck();
    }

    pageSortAndBasketPaging(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            /* this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            }); */
            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                    this.drawerTwo.open();
                });
            this._changeDetectorRef.markForCheck();

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.drawerTwo.open();
                    this.isLoading = true;
                    return this._pointRuleService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                    this.drawerTwo.open();
                })
            ).subscribe();
            this.drawerTwo.open();
            this._changeDetectorRef.markForCheck();
        }
    }

    selectPointBasket(id, name): void {
        const pointBasket = this.PointRuleAddForm.getRawValue();
        pointBasket.basket_id = id;
        pointBasket.point_basket = name;
        pointBasket.point_basketName = name;
        this.PointRuleAddForm.patchValue(pointBasket);
        this.isLoading = false;
        this.drawerTwo.close();
    }

}
