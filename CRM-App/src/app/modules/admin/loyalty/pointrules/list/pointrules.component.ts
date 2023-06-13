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
import { PointRule, PointRulePaginagion, PointBasket, PointBasketPagination, MemberTier, MemberTierPagination, Store, StorePagination, PointRuleProduct } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
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

            .pointrule_product_scss {
                grid-template-columns: 150px 150px 150px 100px 100px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 100px 100px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 100px 100px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 100px 100px;
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
                width: 12rem !important;
            }

            .pointrule_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .pointrule-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .mat-paginator-container {
                margin-left: 0;
            }

            .new_checkbox_00 {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .new_checkbox_01 {
                width: 24px;
                height: 24px;
            }

            .pointrule_product_reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 30% !important;
                height: 32% !important;
                border-radius: 8px;
            }

            .pointrule_product_parent_popup {
                display: grid;
                align-items: center !important;
                justify-content: center !important;
                height: 27vh;
            }

            .pointrule_product_child_btn {
                display: flex;
                gap: 10px;
            }

            .pointrule_product_successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .pointrule_product_delete_scss {
                position: relative;
                top: 2rem;
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
    stores$: Observable<Store[]>;
    pointBasketPagination: PointBasketPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side'|'over';

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
    getStoreData: any;
    isAscending: boolean = true;
    selectedCoulumn: string = 'name';
    errorMessage: string | '' = '';
    typeRuleValue: number = 0;
    showNewMemberPointAmount: boolean = false;

    selectedPointRuleProduct: Array<PointRuleProduct> = [];
    editSelectedPointRuleProduct: PointRuleProduct;
    PointRuleProductForm: FormGroup;
    productName: string;
    pointRuleProductUpgradeId: number;
    pointRuleProductFormMode: boolean = false;
    DeletePointRuleProductMode: boolean = false;
    isSuccess: boolean = false;
    selectedPointRuleProductIndex: number | null = null;
    pointRuleProductSccessMessage: string | '' = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _pointRuleService: PointRuleService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
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
            new_member_to_earn_points: [''],
            new_member_point_amount: [''],
            priority: [''],
            stop_further: [''],
            point_rule_products: new FormControl(this.selectedPointRuleProduct)
        });

        this.PointRuleProductForm = this._formBuilder.group({
            id: [''],
            index: [''],
            product_number: ['', [Validators.required]],
            extra_point_type: ['', [Validators.required]],
            extra_point_value: ['', [Validators.required]],
        });

        this._pointRuleService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointRulePaginagion) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.pointRules$ = this._pointRuleService.pointRules$;

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
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'rewardcode') {
                this._sort.sort({
                    id: 'reward_code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'rewardcode') {
                this._sort.sort({
                    id: 'reward_code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'pointvalue') {
                this._sort.sort({
                    id: 'point_value',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointvalue') {
                this._sort.sort({
                    id: 'point_value',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'membertier') {
                this._sort.sort({
                    id: 'member_tierFullName',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'membertier') {
                this._sort.sort({
                    id: 'member_tierFullName',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'startdate') {
                this._sort.sort({
                    id: 'start_date',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'startdate') {
                this._sort.sort({
                    id: 'start_date',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'enddate') {
                this._sort.sort({
                    id: 'end_date',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'enddate') {
                this._sort.sort({
                    id: 'end_date',
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
    tooglePointRuleAddFormMode(AddMode: boolean | null = null): void {
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
        this.PointBasketListMode = false;
        this.pointRuleProductFormMode = false;
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
        this.MemberTierListMode = false;
        this.pointRuleProductFormMode = false;
        if (PointBasketListMode === null) {
            this.PointBasketListMode = !this.PointBasketListMode;
        }
        else {
            this.PointBasketListMode = PointBasketListMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tooglePointRuleProductFormMode(pointRuleProductFormMode: boolean | null = null) {
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        if (pointRuleProductFormMode === null) {
            this.pointRuleProductFormMode = !this.pointRuleProductFormMode;
        }
        else {
            this.pointRuleProductFormMode = pointRuleProductFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleDeletePointRuleProductMode(DeletePointRuleProductMode: boolean | null = null): void {
        if (DeletePointRuleProductMode === null) {
            this.DeletePointRuleProductMode = !this.DeletePointRuleProductMode;
        }
        else {
            this.DeletePointRuleProductMode = DeletePointRuleProductMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    cancelPopup(): void {
        this.isSuccess = false;
        this.toogleDeletePointRuleProductMode(false);
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this.selectedPointRuleProduct.splice(this.selectedPointRuleProductIndex, 1);
        this.pointRuleProductSccessMessage = 'Deleted Successfully.';
        this.isSuccess = true;
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeletePointRuleProductDrawer(index: number): void {
        this.selectedPointRuleProductIndex = index;
        this.toogleDeletePointRuleProductMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'name') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'membertier' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
        }
    }

    createPointRule(): void {
        const pointrule = this.PointRuleAddForm.getRawValue();
        pointrule.point_rule_products = this.selectedPointRuleProduct;
        this._pointRuleService.createPointRule(pointrule).subscribe(() => {
            this.tooglePointRuleAddFormMode(false);
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

    openPointRuleProductForm(): void {
        this.PointRuleProductForm.reset();
        this.tooglePointRuleProductFormMode(true);
        this.drawerTwo.open();
    }

    createPointRuleProduct(): void {
        const pointRuleProduct = this.PointRuleProductForm.getRawValue();
        const isNew = pointRuleProduct.index === null ? true: false;
        pointRuleProduct.id = !pointRuleProduct.id ? 0: pointRuleProduct.id;
        pointRuleProduct.index = !pointRuleProduct.index ? 0: pointRuleProduct.index;
        let index = 0;
        if( this.selectedPointRuleProduct.length > 0 ) {
            if ( isNew ) {
                index = this.selectedPointRuleProduct.length;
            } else {
                index = this.selectedPointRuleProduct.findIndex(x => x.index === pointRuleProduct.index);
            }
        }
        pointRuleProduct.index = index;
        this.selectedPointRuleProduct[(index)] = pointRuleProduct;
        if( this.selectedPointRuleProduct.length > 0 ) {
            this.selectedPointRuleProduct = this.selectedPointRuleProduct.sort((a,b) => a.product_number.localeCompare(b.product_number));
        }
        this.drawerTwo.close();
        this._changeDetectorRef.markForCheck();
    }

    setPointRuleProductEditForm(id, productNumber, pointType, pointValue, index): void {
        const data: PointRuleProduct = {
            id: id,
            index: index,
            product_number: productNumber,
            extra_point_type: pointType,
            extra_point_value: pointValue,
        };
        this.PointRuleProductForm.patchValue(data);
        this.tooglePointRuleProductFormMode(true);
        this.drawerTwo.open();
        this._changeDetectorRef.markForCheck();
    }

}
