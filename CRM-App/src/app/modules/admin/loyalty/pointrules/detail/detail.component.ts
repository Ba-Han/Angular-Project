import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointRule, PointRulePaginagion, PointBasket, PointBasketPagination, MemberTier, MemberTierPagination, Store, StorePagination } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointrules-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
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

                .pointrule_reset_popup {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 30% !important;
                    height: 32% !important;
                    border-radius: 8px;
                }

                .pointrule_parent_popup {
                    display: grid;
                    align-items: center !important;
                    justify-content: center !important;
                    height: 27vh;
                }

                .pointrule_child_btn {
                    display: flex;
                    gap: 10px;
                }

                .pointrule_successMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(0, 128, 0);
                    padding: 3rem;
                    font-size: 16px;
                }

                .pointrule_errorMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(255, 49, 49);
                    padding: 3rem;
                    font-size: 16px;
                }

                .pointrule_delete_scss {
                    position: relative;
                    top: 2rem;
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
export class PointRuleDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    //@ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    memberTiers$: Observable<MemberTier[]>;
    stores$: Observable<Store[]>;
    pointBasketPagination: PointBasketPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side' | 'over';

    newSegmentModel: PointBasket;
    PointBasketForm: FormGroup;
    pointbasketMode: boolean = false;
    pointbasketEditMode: boolean = false;
    pointbasketFormMode: boolean = false;

    pointRules$: Observable<PointRule[]>;
    pointRule$: Observable<PointRule>;
    pointBaskets$: Observable<PointBasket[]>;
    pointBasket$: Observable<PointBasket>;
    isLoading: boolean = false;
    pointRule: PointRule;
    pointBasket: PointBasket;
    pagination: PointRulePaginagion;
    searchInputControl: FormControl = new FormControl();
    memberTierSearchInputControl: FormControl = new FormControl();
    pointBasketSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    PointRuleEditForm: FormGroup;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | '' = '';
    errorMessage: string | '' = '';
    code: string;
    addedPointSegmentId: Array<any> = [];
    selectedChannel: PointRule | null = null;
    pointbasketId: number;
    name: string;
    description: string;
    spendingType: string;
    validitytypeValue: string;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    getStoreData: any;
    typeRuleValue: number;
    pointRewardedAtValue: number = 0;
    spendingtypeValue: number = 0;
    totypeValue: number = 0;
    toendTypeValue: number = 0;
    fromtypeValue: number = 0;
    fromstarttypeValue: number = 0;
    storeSelectionTypeValue: number;
    isButtonDisabled: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _pointRuleService: PointRuleService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
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
        this.PointRuleEditForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            reward_code: ['', [Validators.required]],
            type: ['', [Validators.required]],
            point_value: [''],
            status: ['', [Validators.required]],
            start_date: [''],
            end_date: [''],
            member_tier: ['', [Validators.required]],
            member_tierFullName: ['', [Validators.required]],
            dollar_value: [''],
            point_amount: [''],
            min_expense: [''],
            point_rewarded_at: [''],
            validity_type: ['', [Validators.required]],
            basket_id: [''],
            point_basket: ['', [Validators.required]],
            point_basketName: ['', [Validators.required]],
            store_selection_type: ['', [Validators.required]],
            store_codes: [''],
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

        this.pointRule$ = this._pointRuleService.pointRule$;
        this.pointBasket$ = this._pointRuleService.pointBasket$;

        this._pointRuleService.pointRule$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pointrule: PointRule) => {
            this.pointRule = pointrule;
            this.typeRuleValue = pointrule.type;
            this.pointRewardedAtValue = pointrule.point_rewarded_at;
            this.validitytypeValue = pointrule.validity_type;
            this.storeSelectionTypeValue = pointrule.store_selection_type;
            //this.pointRule.point_basket = pointrule.name;
            this.pointRule.point_basketName = pointrule.point_basket?.name;
            this.PointRuleEditForm.patchValue(pointrule);
            this._changeDetectorRef.markForCheck();
        });

        //Get the Stores []
        this._pointRuleService.stores$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((store) => {
            this.getStoreData = store;
        });

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

        this.canDelete = this._userService.getDeleteUserPermissionByNavId('point-rules');
    }

    ngAfterViewInit(): void {
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

            // Get channels if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    return this._pointRuleService.getPointRules(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toggleEditMode(MemberTierListMode: boolean | null = null): void {
        if (MemberTierListMode === null) {
        this.MemberTierListMode = !this.MemberTierListMode;
        }
        else {
        this.MemberTierListMode = MemberTierListMode;
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
        this.PointBasketListMode = false;
        if (pointbasketEditMode === null) {
            this.pointbasketEditMode = !this.pointbasketEditMode;
        }
        else {
            this.pointbasketEditMode = pointbasketEditMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleDeleteMode(DeleteMode: boolean | null = null): void {
        if (DeleteMode === null) {
            this.DeleteMode = !this.DeleteMode;
        }
        else {
            this.DeleteMode = DeleteMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    cancelPopup(): void {
        this.isSuccess = false;
        this.toogleDeleteMode(false);
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._pointRuleService.getDeletePointRule(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/point-rules'], { relativeTo: this._activatedRoute });
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    updatePointRule(): void {
        const pointrule = this.PointRuleEditForm.getRawValue();
        this._pointRuleService.updatePointRule(pointrule.id,pointrule).subscribe(() => {
            this._router.navigate(['/point-rules'], { relativeTo: this._activatedRoute });
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
            this._changeDetectorRef.markForCheck();
        }
    }

    selectTier(id, name): void {
        const memberTier = this.PointRuleEditForm.getRawValue();
        memberTier.member_tier = id;
        memberTier.member_tierFullName = name;
        this.PointRuleEditForm.patchValue(memberTier);
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
        const pointBasket = this.PointRuleEditForm.getRawValue();
        pointBasket.basket_id = id;
        pointBasket.point_basket = name;
        pointBasket.point_basketName = name;
        this.PointRuleEditForm.patchValue(pointBasket);
        this.isLoading = false;
        this.drawerTwo.close();
    }

}
