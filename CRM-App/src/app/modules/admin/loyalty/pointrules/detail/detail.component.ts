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
import { PointRule, PointRulePaginagion, PointBasket, PointBasketPagination, MemberTier, MemberTierPagination, Store, StorePagination, PointRuleProduct, ProductType, ProductTypeSelection, ProductTypeSelectionPagination } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointrules-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
            .pointrule_product_grid {
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

            .pointrule_product {
                display: grid;
                grid-template-columns: repeat(2,minmax(0,1fr))!important;
                align-items: center;
                border: 1px solid #ccc;
                border-radius: 10px;
                padding: 0px !important;
                cursor: pointer;
            }

            .delete_pointrule_product_btn {
                background: #ccc !important;
                cursor: pointer;
                position: relative;
                left: 25rem;
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
    productTypeSelection$: Observable<ProductTypeSelection[]>;
    productTypeSelectionPagination: ProductTypeSelectionPagination;
    pointBasketPagination: PointBasketPagination;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointBasketListMode: boolean = false;
    ProductTypeSelectionListMode: boolean = false;
    drawerMode: 'side' | 'over';

    newSegmentModel: PointBasket;
    PointBasketForm: FormGroup;
    pointbasketMode: boolean = false;
    pointbasketEditMode: boolean = false;
    pointbasketFormMode: boolean = false;

    pointRules$: Observable<PointRule[]>;
    productType$: Observable<ProductType[]>;
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
    productTypeSelectionSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    PointRuleEditForm: FormGroup;
    canEdit: boolean = false;
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
    validitytypeValue: number;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    getStoreData: any;
    typeRuleValue: number;
    pointRewardedAtValue: number;
    priorityValue: number;
    storeSelectionTypeValue: number;
    showNewMemberPointAmount: boolean = false;
    stopFurtherValue: boolean = false;

    selectedPointRuleProduct: Array<PointRuleProduct> = [];
    editSelectedPointRuleProduct: PointRuleProduct;
    PointRuleProductForm: FormGroup;
    productName: string;
    pointRuleProductUpgradeId: number;
    pointRuleProductFormMode: boolean = false;
    DeletePointRuleProductMode: boolean = false;
    isPointRuleProductSuccess: boolean = false;
    selectedPointRuleProductIndex: number | null = null;
    pointRuleProductSccessMessage: string | '' = '';

    offerApplyValue: number;
    offerTypeValue: number;
    offerApplyMonthValue: number;
    specialDate: string;
    selectedDate: string;
    currentDate: string;
    selectedStartDateTime: string;
    selectedEndDateTime: string;
    productTypeValue: string;
    getProductTypeSelection: any;
    getSelectedProductType: any;
    selectedProductTypes: any[] = [];
    productType: any;
    awardType: any;
    awardTypeValue: any;
    pointRuleCapTypeValue: number;
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
        this.currentDate = today.toISOString().split('T')[0];
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit(): void {

        // Initialize with 12:01 AM for the start date
        const startDate = new Date();
        startDate.setHours(0, 1, 0, 0);

        // Initialize with 11:59 PM for the end date
        const endDate = new Date();
        endDate.setHours(23, 59, 0, 0);

        // Format for the dates 'yyyy-MM-ddTHH:mm' format expected by datetime-local
        this.selectedStartDateTime = this.formatDateTime(startDate);
        this.selectedEndDateTime = this.formatDateTime(endDate);

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

        this._pointRuleService.productType$
        .subscribe((response: any) => {
            this.productType = response;
            this._changeDetectorRef.markForCheck();
        });

        this._pointRuleService.awardType$
        .subscribe((response: any) => {
            this.awardType = response;
            this._changeDetectorRef.markForCheck();
        });

        this._pointRuleService.pointRule$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pointrule: PointRule) => {
            this.pointRule = pointrule;
            this.typeRuleValue = pointrule.type;
            this.pointRewardedAtValue = pointrule.point_rewarded_at;
            this.validitytypeValue = pointrule.validity_type;
            this.storeSelectionTypeValue = pointrule.store_selection_type;
            this.priorityValue = pointrule.priority;
            this.showNewMemberPointAmount = pointrule.new_member_to_earn_points;
            this.stopFurtherValue = pointrule.stop_further;
            this.offerApplyValue = pointrule.offer_apply;
            this.offerTypeValue = pointrule.offer_type;
            this.specialDate = pointrule.offer_apply_date;

            if (this.specialDate !== null) {
                this.selectedDate = this.specialDate.split('T')[0];
            }

            this.offerApplyMonthValue = pointrule.offer_apply_month;
            this.selectedStartDateTime = pointrule.start_date;
            this.selectedEndDateTime = pointrule.end_date;

            if ( this.selectedStartDateTime === null && this.selectedEndDateTime === null ) {
                        this.selectedStartDateTime = this.formatDateTime(startDate);
                        this.selectedEndDateTime = this.formatDateTime(endDate);
            }

            this.pointRule.point_basketName = pointrule.point_basket?.name;
            this.productTypeValue = pointrule.product_type.toString();
            this.getProductTypeSelection = pointrule.product_type_selection_text;
            this.selectedPointRuleProduct = pointrule.point_rule_products;
            this.awardTypeValue = pointrule.award_type.toString();
            this.pointRuleCapTypeValue = pointrule.Point_Rule_CapType;
            for( let i=0; i < this.selectedPointRuleProduct.length; i++)
                {
                    this.selectedPointRuleProduct[i].index = i;
                }
            this.PointRuleEditForm.patchValue(pointrule);
            this._changeDetectorRef.markForCheck();
        });

        this.PointRuleProductForm = this._formBuilder.group({
            id: [''],
            index: [''],
            product_number: ['', [Validators.required]],
            extra_point_type: ['', [Validators.required]],
            extra_point_value: ['', [Validators.required]],
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

        this.canEdit = this._userService.getEditUserPermissionByNavId('point-rules');
        this.canDelete = this._userService.getDeleteUserPermissionByNavId('point-rules');

        this.getProductTypeValue(this.productTypeValue);
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
    toogleDeleteMode(DeleteMode: boolean | null = null): void {
        this.MemberTierListMode = false;
        this.PointBasketListMode = false;
        this.pointRuleProductFormMode = false;
        this.ProductTypeSelectionListMode = false;
        if (DeleteMode === null) {
            this.DeleteMode = !this.DeleteMode;
        }
        else {
            this.DeleteMode = DeleteMode;
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
        this.DeleteMode = false;
        if (pointRuleProductFormMode === null) {
            this.pointRuleProductFormMode = !this.pointRuleProductFormMode;
        }
        else {
            this.pointRuleProductFormMode = pointRuleProductFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getAwardTypeValue(selectedValue: string) {
        this.awardTypeValue = selectedValue;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getProductTypeValue(selectedProductType: string) {
        this.getSelectedProductType = selectedProductType;

        if ( this.getSelectedProductType !== selectedProductType ) {
            this.selectedProductTypes = [];
            this.updateForm();
        }

        this._pointRuleService.getProductTypeSelection(this.getSelectedProductType)
          .subscribe(
            () => {
              this.closeProductTypeSelection();;
            },
            (error) => {
              console.error(error);
            }
          );
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onProductTypeChange(selectedProductTypeChange: string) {
        this.getSelectedProductType = selectedProductTypeChange;

        this.selectedProductTypes = [];
        this.updateForm();

        this._pointRuleService.getProductTypeSelection(this.getSelectedProductType)
          .subscribe(
            () => {
              this.closeProductTypeSelection();;
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onDropdownChangeValidityValue(): void {
        if( this.validitytypeValue ===  1) {
            this.PointRuleEditForm.get('start_date').setValue(null);
            this.PointRuleEditForm.get('end_date').setValue(null);
            this._changeDetectorRef.markForCheck();
        }
    }

    updatePointRule(): void {
        const pointrule = this.PointRuleEditForm.getRawValue();
        pointrule.point_rule_products = this.selectedPointRuleProduct;
        this._pointRuleService.updatePointRule(pointrule.id,pointrule).subscribe(() => {
            this._router.navigate(['/point-rules'], { relativeTo: this._activatedRoute });
            this.toogleMemberTierListMode(false);
            this.tooglePointBasketListMode(false);
            this.toogleProductTypeSelectionListMode(false);
            this.tooglePointRuleProductFormMode(false);
            this.toogleDeleteMode(false);
            this.toogleDeletePointRuleProductMode(false);
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
        const productType = this.PointRuleEditForm.getRawValue();
        productType.product_type_selection_text = this.selectedProductTypes.map(item => item.name).join(', ');
        productType.product_type_selection = this.selectedProductTypes.map(item => item.value).join(', ');
        this.PointRuleEditForm.patchValue(productType);
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
        const pointBasket = this.PointRuleEditForm.getRawValue();
        pointBasket.basket_id = id;
        pointBasket.point_basket = name;
        pointBasket.point_basketName = name;
        this.PointRuleEditForm.patchValue(pointBasket);
        this.isLoading = false;
        this.drawerTwo.close();
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

    cancelPointRuleProductPopup(): void {
        this.isPointRuleProductSuccess = false;
        this.toogleDeletePointRuleProductMode(false);
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPointRuleProductPopup(): void {
        this.selectedPointRuleProduct.splice(this.selectedPointRuleProductIndex, 1);
        this.pointRuleProductSccessMessage = 'Deleted Successfully.';
        this.isPointRuleProductSuccess = true;
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeletePointRuleProductDrawer(index: number): void {
        this.selectedPointRuleProductIndex = index;
        this.toogleDeletePointRuleProductMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
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
