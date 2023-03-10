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
import { PointRule, PointRulePaginagion, PointBasket, point_basket_id, PointBasketPagination } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';

@Component({
    selector: 'pointrules-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointRuleDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    
    memberTiers$: Observable<MemberTier[]>;
    pointBasketPagination: PointBasketPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side' | 'over';

    newSegmentModel: PointBasket;
    PointBasketEditForm: FormGroup;
    pointbasketMode: boolean = false;
    pointbasketEditMode: boolean = false;
    addedPointBasket: Array<PointBasket> = [];
    addedPointBasketId: Array<point_basket_id> = [];
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
    AddMode: boolean = false;
    PointRuleEditForm: FormGroup;
    code: string;
    addedPointSegmentId: Array<any> = [];
    selectedChannel: PointRule | null = null;
    pointbasketId: number;
    name: string;
    description: string;
    spendingType: string;
    validitytypeValue: string;
    minDate: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _pointRuleService: PointRuleService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
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
            point_basketName: [''],
        });

        this.PointBasketEditForm = this._formBuilder.group({
            id: [''],
            name: ['',[Validators.required]],
            description: [''],
            spending_type: [''],
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
        //this.pointBasket$ = this._pointRuleService.pointBasket$;
        //this.pointBaskets$ = this._pointRuleService.pointBaskets$;
        //this.selectedUpgradeItem = tier.tier_upgrade_items;
        //this.memberTier.point_ruleFullname = tier.point_rule.name;

        this._pointRuleService.pointRule$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pointrule: PointRule) => {
                this.pointRule = pointrule;
                this.validitytypeValue = pointrule.validity_type;
                //this.pointRule.point_basket = pointrule.name;
                this.pointRule.point_basketName = pointrule.point_basket?.name;
                this.PointRuleEditForm.patchValue(pointrule);
                this._changeDetectorRef.markForCheck();
            });

        /* this._pointRuleService.pointBasket$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pointbasket: PointBasket) => {
            this.pointBasket = pointbasket;
            this.PointBasketEditForm.patchValue(pointbasket);
            this._changeDetectorRef.markForCheck();
        }); */

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

            //bh test 
            //Drawer Mode
        this.matDrawer.openedChange.subscribe((opened) => {
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
                    this.matDrawer.open();
                }),
                map(() => {
                    this.isLoading = false;
                    this.matDrawer.open();
                })
            )
            .subscribe();
            //bh test end
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

    toogleStoreAddFormMode(AddMode: boolean | null = null): void {
        if (AddMode === null) {
            this.AddMode = !this.AddMode;
        }
        else {
            this.AddMode = AddMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    //bh test
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

    toggleEditMode(MemberTierListMode: boolean | null = null): void {
        if (MemberTierListMode === null) {
            this.MemberTierListMode = !this.MemberTierListMode;
        }
        else {
            this.MemberTierListMode = MemberTierListMode;
        }
        this._changeDetectorRef.markForCheck();
    }
    
    openPointBasketForm(id = 0): void {
        if (Number(id) > 0) {
            this.addedPointBasket = [];
            this.addedPointBasketId = [];
            this.isLoading = true;
            this._pointRuleService.getBasketDetailById(id)
                .pipe(
                    takeUntil(this._unsubscribeAll),

                    map((pointbaskets: any) => {
                        /* const baskets = pointrules.data.point_basket;
                        //take segement
                        for (var i = 0; i < baskets.length; i++) {
                            this._memberTierService.getPointSegmentById(baskets[i].point_segment_id)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((pointsegment: any) => {
                                    let index = this.addedPointBasket.findIndex(x => x.id === pointsegment.data.id || x.name === pointsegment.data.name);
                                    if (index > -1) {
                                        this.addedPointBasket[(index)] = pointsegment.data;
                                    }
                                    else {
                                        this.addedPointBasket.push(pointsegment.data);
                                    }

                                });
                            let index1 = this.addedPointSegmentId.findIndex(x => x === baskets[i].point_segment_id);
                            if (index1 > -1) {
                                this.addedPointSegmentId[(index1)] = baskets[i].id;
                            }
                            else {
                                this.addedPointSegmentId.push(baskets[i].id);
                            }
                        } */
                        this.PointBasketEditForm.patchValue(pointbaskets.data);
                        this.isLoading = false;
                        this.tooglePointBasketListMode(true);
                        this.matDrawer.open();
                    })
                )
                .subscribe();
        }
        else {
            this.tooglePointBasketListMode(true);
            this.matDrawer.open();
        }
    }

    /* setPointBasketDrawer(): void {
        this.tooglePointBasketListMode(true);
        this.pointBaskets$ = this._pointRuleService.pointBaskets$;
        this._pointRuleService.pointBasketPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointBasketPagination) => {
                this.pointBasketPagination = pagination;
                this.matDrawer.open();
                this._changeDetectorRef.markForCheck();
            });

        setTimeout(() => {
            this.pageSortAndBasketPaging();
        }, 2000);
        //this.tooglePointBasketMode(false);
    } */

    /* pageSortAndBasketPaging(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            });
            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                    this.matDrawer.open();
                });

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.matDrawer.open();
                    this.isLoading = true;
                    return this._pointRuleService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                    this.matDrawer.open();
                })
            ).subscribe();
            this.matDrawer.open();
        }
    } */

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
                this.matDrawer.open();
                this._changeDetectorRef.markForCheck();
            });

        setTimeout(() => {
            this.pageSortAndPaging();
        }, 2000);
        //this.tooglePointBasketMode(false);
    }

    pageSortAndPaging(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            });
            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                    this.matDrawer.open();
                });

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.matDrawer.open();
                    this.isLoading = true;
                    return this._pointRuleService.getMemberTiers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                    this.matDrawer.open();
                })
            ).subscribe();
            this.matDrawer.open();
        }
    }

    selectTier(id, name): void {
        const memberTier = this.PointRuleEditForm.getRawValue();
        memberTier.member_tier = id;
        memberTier.member_tierFullName = name;
        this.PointRuleEditForm.patchValue(memberTier);
        this.isLoading = false;
        this.matDrawer.close();
    }

    updatePointBasket(): void {
        const pointbasket = this.PointBasketEditForm.getRawValue();
        pointbasket.point_basket = this.addedPointBasketId;
        this._pointRuleService.updatePointBasket(pointbasket.id,pointbasket)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((basket: any) => {
                const pointrule = this.PointRuleEditForm.getRawValue();
                pointrule.basket_id = basket.data.id;
                //pointrule.point_basket = basket.data.name;
                pointrule.point_basketName = basket.data.name;
                this.PointRuleEditForm.patchValue(pointrule);
                this.matDrawer.close();
                this.addedPointBasket = [];
                this.addedPointBasketId = [];
            });
    }

    createUpdateBasketPoint(): void {
        this.isLoading = true;
        const basket = this.PointBasketEditForm.getRawValue();
        if (Number(basket.id) > 0) {
            this.isLoading = true;
            this._pointRuleService.updatePointBasket(basket.id, basket)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pointbasket: any) => {
                    let index = this.addedPointBasket.findIndex(x => x.id === pointbasket.data.id);
                    this.addedPointBasket[(index)] = basket;
                    this.isLoading = false;
                    this.tooglepointBasketAddFormMode(false);
                    this.tooglePointBasketListMode(true);
                });
           
        }
        else {
            //this._memberTierService.createPointSegment(segment)
            //    .pipe(takeUntil(this._unsubscribeAll))
            //    .subscribe((pointsegment: any) => {
                   
            //    });

            var point_basket_id = this.convertToPointBasketIdObject(basket);
            let index1 = this.addedPointBasket.findIndex(x => x.id === null);
            if (index1 > -1) {
                this.addedPointBasket[(index1)] = basket;
            }
            else {
                this.addedPointBasket.push(basket);
            }
            let index = this.addedPointBasketId.findIndex(x => typeof x === 'object');
            if (index > -1) {
                this.addedPointBasketId[(index1)] = point_basket_id;
            }
            else {
                this.addedPointBasketId.push(point_basket_id);
            }
            this.isLoading = false;
            this.tooglepointBasketAddFormMode(false);
            this.tooglePointBasketListMode(true);
        }

    }

    convertToPointBasketIdObject(pointbasket: PointBasket): any {
        var point_basket_id = {
            "point_basket_id": {
            "user_created": pointbasket.user_created,
            "date_created": pointbasket.date_created,
            "user_updated": pointbasket.user_updated,
            "date_updated": pointbasket.date_updated,
            "name": pointbasket.name,
            "description": pointbasket.description,
            "spending_type": pointbasket.spending_type,
            "from_type": pointbasket.from_type,
            "from_number": pointbasket.from_number,
            "from_start_type": pointbasket.from_start_type,
            "from_start_date": pointbasket.from_start_date,
            "to_type": pointbasket.to_type,
            "to_number": pointbasket.to_number,
            "to_end_type": pointbasket.to_end_type,
            "to_end_date": pointbasket.to_end_date,
            }
        }
        return point_basket_id;
    }

    editForm(pointbasket: PointBasket): void {
        this.tooglepointBasketAddFormMode(true);
        this.isLoading = false;
        //this._memberTierService.getPointSegmentById(id)
        //    .pipe(takeUntil(this._unsubscribeAll))
        //    .subscribe((pointsegment: any) => {
                
        //    });
        //const editsegment = pointsegment;
        //pointsegment = PointSegment;
        //pointsegment = this.addedPointSegment.filter(x => x.id != null ? x.id === id : x.name === name);
      
        this.name = pointbasket.name;
        this.description = pointbasket.description;
        this.spendingType = pointbasket.spending_type;
        this.PointBasketEditForm.patchValue(pointbasket);
        this.isLoading = false;
        this.tooglepointBasketAddFormMode(false);
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

    createNewPointBasket(): void {
        this.PointBasketEditForm.reset();
        this.tooglepointBasketAddFormMode(true);
    }

    closeBasketForm(): void {
        this.tooglePointBasketListMode(true);
    }
}
