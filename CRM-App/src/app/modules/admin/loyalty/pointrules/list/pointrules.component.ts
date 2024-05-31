import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointRule, PointRulePaginagion, PointBasket, PointBasketPagination, MemberTier, MemberTierPagination, Store, StorePagination, PointRuleProduct, ProductType, ProductTypeSelection, ProductTypeSelectionPagination, AwardType } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointrules-list',
    templateUrl: './pointrules.component.html',
    styles: [
        /* language=SCSS */
        `
            .prule-grid_point_rule {
                grid-template-columns: 200px 200px 110px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 200px 200px 110px 150px 150px 150px
                }

                @screen md {
                    grid-template-columns: 200px 200px 110px 150px 150px 150px
                }

                @screen lg {
                    grid-template-columns: 200px 200px 110px 150px 150px 150px
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

            .point_rule_product_type_grid {
                grid-template-columns: 60px 100px;
                    @screen sm {
                        grid-template-columns: 60px 100px 100px;
                    }
                    @screen md {
                        grid-template-columns: 60px 150px 150px;
                    }
                    @screen lg {
                        grid-template-columns: 35px auto;
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

            .pointrule-filter {
                position: static;
                width: 13rem !important;
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

            .product_type_checkbox {
                width: 16px;
                height: 16px;
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

            .text_1xl {
                font-size: 1rem !important;
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
    productTypeSelection$: Observable<ProductTypeSelection[]>;
    stores$: Observable<Store[]>;
    pointBasketPagination: PointBasketPagination;
    productTypeSelectionPagination: ProductTypeSelectionPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    ProductTypeSelectionListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side'|'over';

    pointRules$: Observable<PointRule[]>;
    productType$: Observable<ProductType[]>;
    pointRule$: Observable<PointRule>;
    isLoading: boolean = false;
    pagination: PointRulePaginagion;
    searchInputControl: FormControl = new FormControl();
    memberTierSearchInputControl: FormControl = new FormControl();
    pointBasketSearchInputControl: FormControl = new FormControl();
    productTypeSelectionSearchInputControl: FormControl = new FormControl();
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
    selectedMemberTierFilter: string = 'memberTier';
    searchFilter: string;
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
    currentDate: string;
    validitytypeValue: number;
    selectedStartDateTime: string;
    selectedEndDateTime: string;
    productTypeValue: number;
    getSelectedProductType: any;
    selectedProductTypes: any[] = [];
    awardTypeValue: any;
    storeSelectionTypeValue: any;
    offerTypeValue: any;
    pointRewardedAtValue: any;
    offerApplyValue: any;
    awardType: any;
    getMemberTierResponse: any;
    isMaxCapFieldHidden: boolean;
    isMaxCapFieldDisabled: boolean;
    searchValue: string;
    getSortTitleValue: string;
    sortDirection: 'asc' | 'desc' | '' = 'asc';
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
        this.currentDate = today.toISOString().split('T')[0];

        // Initialize with 12:01 AM for the start date
        const startDate = new Date();
        startDate.setHours(0, 1, 0, 0);

        // Initialize with 11:59 PM for the end date
        const endDate = new Date();
        endDate.setHours(23, 59, 0, 0);

        // Format for the dates 'yyyy-MM-ddTHH:mm' format expected by datetime-local
        this.selectedStartDateTime = this.formatDateTime(startDate);
        this.selectedEndDateTime = this.formatDateTime(endDate);
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
            store_selection_type: [''],
            store_codes: [''],
            new_member_to_earn_points: [''],
            new_member_point_amount: [''],
            priority: [''],
            stop_further: [''],
            point_rule_products: new FormControl(this.selectedPointRuleProduct),
            offer_apply: [''],
            offer_type: [''],
            no_of_orders: [''],
            offer_apply_month: [''],
            offer_apply_date: [''],
            product_type: [''],
            product_type_selection: [''],
            product_type_min_expense: [''],
            product_type_selection_text: [''],
            award_type: [''],
            Point_Rule_CapType:[''],
            Point_Rule_Max_Cap: ['']
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
        this.productType$ = this._pointRuleService.productType$;

        this._pointRuleService.memberTiers$
        .subscribe((response: any) => {
            this.getMemberTierResponse = response;
            this._changeDetectorRef.markForCheck();
        });

        this._pointRuleService.awardType$
        .subscribe((response: any) => {
            this.awardType = response;
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
                this.searchValue = query;
                return this._pointRuleService.getPointRules(0, 10, this.getSortTitleValue, this.sortDirection, query, this.searchFilter);
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });

        this.canEdit = this._userService.getEditUserPermissionByNavId('point-rules');

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

        //Product Type Selection Search
        this.productTypeSelectionSearchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                // Search
                return this._pointRuleService.getProductTypeSelection(this.getSelectedProductType, 0, 25, 'name', 'asc', query);
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
            }  else if (this.isAscending && this.selectedCoulumn === 'pointamount') {
                this._sort.sort({
                    id: 'point_amount',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointamount') {
                this._sort.sort({
                    id: 'point_amount',
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

            // Get pointrules if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._pointRuleService.getPointRules(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter);
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
    tooglePointRuleAddFormMode(AddMode: boolean | null = null): void {
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        this.ProductTypeSelectionListMode = false;
        this.pointRuleProductFormMode = false;
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
        this.ProductTypeSelectionListMode = false;
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
        this.ProductTypeSelectionListMode = false;
        if (PointBasketListMode === null) {
            this.PointBasketListMode = !this.PointBasketListMode;
        }
        else {
            this.PointBasketListMode = PointBasketListMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleProductTypeSelectionListMode(ProductTypeSelectionListMode: boolean | null = null): void {
        this.MemberTierListMode = false;
        this.pointRuleProductFormMode = false;
        this.PointBasketListMode = false;
        if (ProductTypeSelectionListMode === null) {
            this.ProductTypeSelectionListMode = !this.ProductTypeSelectionListMode;
        }
        else {
            this.ProductTypeSelectionListMode = ProductTypeSelectionListMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tooglePointRuleProductFormMode(pointRuleProductFormMode: boolean | null = null) {
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        this.ProductTypeSelectionListMode = false;
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
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        this.pointRuleProductFormMode = false;
        this.ProductTypeSelectionListMode = false;
        if (DeletePointRuleProductMode === null) {
            this.DeletePointRuleProductMode = !this.DeletePointRuleProductMode;
        }
        else {
            this.DeletePointRuleProductMode = DeletePointRuleProductMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    memberTierFilterChange(e: any): void {
        const getMemberTierId = e.value;
        this.searchFilter = getMemberTierId ? '{"member_tier":{"_eq":"' + getMemberTierId + '"}}' : '';
        const pageIndex = this._paginator?.pageIndex || 0;
        const pageSize = this._paginator?.pageSize || 10;
        const sortActive = this._sort?.active || 'name';
        const sortDirection = this._sort?.direction || 'asc';

        if(this.searchFilter === '{"member_tier":{"_eq":"all"}}') {
            this.searchFilter = '';
        }

        this._pointRuleService.getPointRules(pageIndex, pageSize, sortActive, sortDirection,this.searchValue, this.searchFilter)
       .pipe(
        takeUntil(this._unsubscribeAll)
            )
            .subscribe((response: any) => {
                this._changeDetectorRef.markForCheck();
        });
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getAwardTypeValue(selectedValue: string) {
        this.awardTypeValue = selectedValue;
        if(this.awardTypeValue === '0' || this.awardTypeValue === '1' ) {
            this.PointRuleAddForm.get('dollar_value').setValue(0);
            this.PointRuleAddForm.get('point_value').setValue(0);
            this.PointRuleAddForm.get('point_amount').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getProductTypeValue(selectedProductType: string) {
        this.getSelectedProductType = selectedProductType;

        this.selectedProductTypes = [];
        this.updateForm();

        this._pointRuleService.getProductTypeSelection(this.getSelectedProductType)
          .subscribe(
            () => {
                this.closeProductTypeSelection();
            },
            (error) => {
              console.error(error);
            }
          );
        this._changeDetectorRef.markForCheck();
    }

    // Helper function to format a Date object as 'yyyy-MM-ddTHH:mm'
    formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        // eslint-disable-next-line max-len
        this._pointRuleService.getPointRules(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter).pipe(
            switchMap(() => {
                this.sortDirection = this._sort?.direction || 'asc';
                this.getSortTitleValue = this._sort?.active || 'name';
                if ( this.isLoading === true ) {
                    // eslint-disable-next-line max-len
                    return this._pointRuleService.getPointRules(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchValue, this.searchFilter);
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
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'rewardcode' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointvalue' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'membertier' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'startdate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'enddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setStoreSelectionTypeValue(selectedStoreValue: number) {
        this.storeSelectionTypeValue = selectedStoreValue;
        if(this.storeSelectionTypeValue === 0 || this.storeSelectionTypeValue === 1) {
            this.PointRuleAddForm.get('store_codes').setValue(null);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setOfferTypeValue() {
        if(this.offerTypeValue === 1 || this.offerTypeValue === 2) {
            this.PointRuleAddForm.get('point_amount').setValue(0);
            this.PointRuleAddForm.get('dollar_value').setValue(0);
            this.PointRuleAddForm.get('point_value').setValue(0);
            this.PointRuleAddForm.get('min_expense').setValue(0);
            this.PointRuleAddForm.get('no_of_orders').setValue(0);
            this.PointRuleAddForm.get('priority').setValue(1);
            this.PointRuleAddForm.get('stop_further').setValue(false);
            this.PointRuleAddForm.get('store_selection_type').setValue(0);
            this.PointRuleAddForm.get('store_codes').setValue(null);
            this.PointRuleAddForm.get('Point_Rule_CapType').setValue(0);
            this.PointRuleAddForm.get('Point_Rule_Max_Cap').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setPointRewardedAtValueValue() {
        if(this.pointRewardedAtValue === 1 || this.pointRewardedAtValue === 2) {
            this.PointRuleAddForm.get('min_expense').setValue(0);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setOfferApplyValue() {
        if(this.offerApplyValue === 1 || this.offerApplyValue === 3) {
            this.PointRuleAddForm.get('offer_apply_month').setValue(0);
            this.PointRuleAddForm.get('offer_apply_date').setValue(null);
        }
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setPriorityDefaultValue(): void {
        // eslint-disable-next-line max-len
        if(this.typeRuleValue === 0 || this.typeRuleValue === 1 || this.typeRuleValue === 2 || this.typeRuleValue === 3 || this.typeRuleValue === 4 || this.typeRuleValue === 5 || this.typeRuleValue === 6) {
            this.PointRuleAddForm.get('award_type').setValue(null);
            this.PointRuleAddForm.get('min_expense').setValue(0);
            this.PointRuleAddForm.get('no_of_orders').setValue(0);
            this.PointRuleAddForm.get('priority').setValue(1);
            this.PointRuleAddForm.get('stop_further').setValue(false);
            this.PointRuleAddForm.get('Point_Rule_CapType').setValue(0);
            this.PointRuleAddForm.get('Point_Rule_Max_Cap').setValue(0);
            this.PointRuleAddForm.get('store_selection_type').setValue(0);
            this.PointRuleAddForm.get('offer_apply').setValue(0);
            this.PointRuleAddForm.get('offer_type').setValue(0);
            this.PointRuleAddForm.get('offer_apply_month').setValue(0);
            this.PointRuleAddForm.get('point_amount').setValue(0);
            this.PointRuleAddForm.get('new_member_to_earn_points').setValue(false);
            this.PointRuleAddForm.get('new_member_point_amount').setValue(0);
            this.PointRuleAddForm.get('point_rewarded_at').setValue(0);
            this.PointRuleAddForm.get('product_type').setValue('0');
            this.PointRuleAddForm.get('product_type_selection').setValue('');
            this.PointRuleAddForm.get('product_type_selection_text').setValue('');
            this.PointRuleAddForm.get('product_type_min_expense').setValue(0);
            this.getProductTypeValue('0');
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onDropdownChangeValidityValue(): void {
        if( this.validitytypeValue ===  1) {
            this.PointRuleAddForm.get('start_date').setValue(null);
            this.PointRuleAddForm.get('end_date').setValue(null);
            this._changeDetectorRef.markForCheck();
        }
    }

    createPointRule(): void {
        const pointrule = this.PointRuleAddForm.getRawValue();
        pointrule.point_rule_products = this.selectedPointRuleProduct;
        this._pointRuleService.createPointRule(pointrule).subscribe(() => {
            this.tooglePointRuleAddFormMode(false);
            this.toogleMemberTierListMode(false);
            this.tooglePointRuleProductFormMode(false);
            this.tooglePointBasketListMode(false);
            this.toogleProductTypeSelectionListMode(false);
            this.toogleDeletePointRuleProductMode(false);
            this.PointRuleAddForm.reset();
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
            this._sort.active = 'name';
            this._sort.direction = 'asc';
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

    setProductTypeSelectionDrawer(): void {
        this.toogleProductTypeSelectionListMode(true);
        this.productTypeSelection$ = this._pointRuleService.productTypeSelection$;
        this._pointRuleService.productTypeSelectionPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductTypeSelectionPagination) => {
                this.productTypeSelectionPagination = pagination;
                this.drawerTwo.open();
                this._changeDetectorRef.markForCheck();
            });

            setTimeout(() => {
                this.pageSortAndProductTypeSelectionPaging();
            }, 2000);
        this._changeDetectorRef.markForCheck();
    }

    pageSortAndProductTypeSelectionPaging(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.active = 'name';
            this._sort.direction = 'asc';
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
                    // eslint-disable-next-line max-len
                    return this._pointRuleService.getProductTypeSelection(this.getSelectedProductType, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    // Function to check if a product type is selected
    isProductTypeSelected(value: string, name: string): boolean {
        return this.selectedProductTypes.some(item => item.value === value && item.name === name);
    }

    selectProdcutTypeSelection(value: string, name: string): void {
        const index = this.selectedProductTypes.findIndex(item => item.value === value && item.name === name);

        if (index === -1) {
          this.selectedProductTypes.push({ value, name });
        } else {
          this.selectedProductTypes.splice(index, 1);
        }

        // Update the form
        this.updateForm();
        this.isLoading = false;
        //this.closeProductTypeSelection();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateForm(): void {
        const productType = this.PointRuleAddForm.getRawValue();
        productType.product_type_selection_text = this.selectedProductTypes.map(item => item.name).join(',');
        productType.product_type_selection = this.selectedProductTypes.map(item => item.value).join(',');
        this.PointRuleAddForm.patchValue(productType);
    }

    closeProductTypeSelection(): void {
        this.ProductTypeSelectionListMode = false;
        this.drawerTwo.close();
        this._changeDetectorRef.markForCheck();
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
            this._sort.active = 'name';
            this._sort.direction = 'asc';
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onCapTypeChange() {
        const selectedCapTypeValue = this.PointRuleAddForm.get('Point_Rule_CapType')?.value;

        if (selectedCapTypeValue === 0) {
            this.isMaxCapFieldHidden = true;
            this.isMaxCapFieldDisabled = true;
            this.PointRuleAddForm.get('Point_Rule_Max_Cap')?.setValue(0);
        } else {
            this.isMaxCapFieldHidden = false;
            this.isMaxCapFieldDisabled = false;
            this.PointRuleAddForm.get('Point_Rule_Max_Cap')?.setValue(null);
        }
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
