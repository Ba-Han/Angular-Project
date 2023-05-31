/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MemberTier, MemberTierPagination, MemberTierUpgrade } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { MemberTierService } from 'app/modules/admin/loyalty/membertier/membertier.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'membertier-detail',
    templateUrl: './detail.component.html',
    styles: [
        /* language=SCSS */
        `
            .membertier-grid {
                grid-template-columns: 150px 150px 200px auto;

                @screen sm {
                    grid-template-columns: 150px 150px 200px auto;
                }

                @screen md {
                    grid-template-columns: 150px 150px 200px auto;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 200px auto;
                }
            }

            .pointrule-grid{
               grid-template-columns: 60px 100px;

                    @screen sm {
                        grid-template-columns: 60px 100px 100px;
                    }

                    @screen md {
                        grid-template-columns: 60px 150px 150px;
                    }

                    @screen lg {
                        grid-template-columns: 60px 150px 150px;
                    }
           }

           .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
            }

            .tier-grid{
               grid-template-columns: 60px 100px;

                    @screen sm {
                        grid-template-columns: 60px 100px 100px;
                    }

                    @screen md {
                        grid-template-columns: 60px 150px 150px;
                    }

                    @screen lg {
                        grid-template-columns: 60px 150px 150px;
                    }
                }

                .membertier_reset_popup {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 30% !important;
                    height: 32% !important;
                    border-radius: 8px;
                }

                .membertier_parent_popup {
                    display: grid;
                    align-items: center !important;
                    justify-content: center !important;
                    height: 27vh;
                }

                .membertier_child_btn {
                    display: flex;
                    gap: 10px;
                }

                .membertier_successMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(0, 128, 0);
                    padding: 3rem;
                    font-size: 16px;
                }

                .membertier_errorMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(255, 49, 49);
                    padding: 3rem;
                    font-size: 16px;
                }

                .membertier_delete_scss {
                    position: relative;
                    top: 2rem;
                }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class MemberTierDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    memberTiers$: Observable<MemberTier[]>;
    memberTier: MemberTier;
    memberTierId: number;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | '' = '';
    errorMessage: string | '' = '';
    catchErrorMessage: string | '' = '';
    isLoading: boolean = false;
    pagination: MemberTierPagination;
    searchInputControl: FormControl = new FormControl();
    selectedMemberTier: MemberTier | null = null;
    memberTierAddForm: FormGroup;
    drawerMode: 'side' | 'over';
    TierUpgradeForm: FormGroup;
    pointAddFormMode: boolean = false;
    tierUpgradeFormMode: boolean = false;
    MemberListMode: boolean = false;
    downgradeconditionValue: number;
    conditionTypeValue: number;
    selectedValue: string;
    earningToValue: string;
    spendingFromValue: string;
    spendingToValue: string;
    itemName: string;
    tierUpgradeId: number;
    memberTiers: any;
    dwMemberGroups: any;
    conditionPeriodValue: number = 0;
    downgradeConditionPeriodTypeValue: number = 0;
    memberTierPagination: MemberTierPagination;
    selectedUpgradeItem: Array<MemberTierUpgrade> = [];
    readonly = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _memberTierService: MemberTierService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        //Member Tier Edit Form
        this.memberTierAddForm = this._formBuilder.group({
            id: [''],
            status: ['', [Validators.required]],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            description: [''],
            level: ['', [Validators.required]],
            condition_type: ['', [Validators.required]],
            condition_period: [''],
            condition_period_value: [''],
            min_condition_amount: [''],
            max_condition_amount: [''],
            calculation_type: [''],
            total_min_amount: [''],
            total_max_amount: [''],
            min_point: [''],
            max_point: [''],
            downgrade_condition_type: ['', [Validators.required]],
            downgrade_condition_period: [''],
            downgrade_condition_period_value: [''],
            dw_member_group: ['', [Validators.required]],
            tier_upgrade_Fullname: [this.itemName],
            tier_upgrade_items: new FormControl(this.selectedUpgradeItem)
        });

        this.TierUpgradeForm = this._formBuilder.group({
            id: [''],
            item_number: ['', [Validators.required]],
            price: ['', [Validators.required]],
            upgrade_tier: ['', [Validators.required]],
            tier_FullName:[''],
        });

        this._memberTierService.memberTier$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tier: any) => {
                this.memberTier = tier;
                this.selectedUpgradeItem = tier.tier_upgrade_items;
                this.conditionTypeValue = tier.condition_type;
                this.downgradeConditionPeriodTypeValue = tier.downgrade_condition_period;
                this.conditionPeriodValue = tier.condition_period;
                this.downgradeconditionValue = tier.downgrade_condition_type;
                this.memberTierAddForm.patchValue(this.memberTier);
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.drawerTwo.openedChange.subscribe((opened) => {
            if (!opened) {
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }
                this._changeDetectorRef.markForCheck();
            });

        //Member Tiers
        this._memberTierService.memberTierlevels
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((tiers) => {
            this.memberTiers = tiers;
        });

        //DW Member Groups
        this._memberTierService.dwMemberGroups$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((dw) => {
            this.dwMemberGroups = dw;
        });

        this.canDelete = this._userService.getDeleteUserPermissionByNavId('member-tier');
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
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                });

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    return this._memberTierService.getMemberTiers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    tooglepointAddFormMode(pointAddFormMode: boolean | null = null): void {
        if (pointAddFormMode === null) {
            this.pointAddFormMode = !this.pointAddFormMode;
        }
        else {
            this.pointAddFormMode = pointAddFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toogleTierUpgradeFormMode(tierUpgradeFormMode: boolean | null = null) {
        if (tierUpgradeFormMode === null) {
            this.tierUpgradeFormMode = !this.tierUpgradeFormMode;
        }
        else {
            this.tierUpgradeFormMode = tierUpgradeFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toogleMemberListMode(MemberListMode: boolean | null = null) {
        if (MemberListMode === null) {
            this.MemberListMode = !this.MemberListMode;
        }
        else {
            this.MemberListMode = MemberListMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    AddFormclose(): void {
        this.tooglepointAddFormMode(false);
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
        this._memberTierService.getDeleteMemberTier(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/member-tier'], { relativeTo: this._activatedRoute });
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

    updateMemberTier(): void {
        const memberTier = this.memberTierAddForm.getRawValue();
        memberTier.tier_upgrade_items = this.selectedUpgradeItem;
        this._memberTierService.UpdateMemberTier(memberTier.id, memberTier)
            .subscribe(() => {
                this._router.navigate(['/member-tier'], { relativeTo: this._activatedRoute });
            },
                (response) => {
                    if (response.status === 200) {
                        // Successful response
                        this._changeDetectorRef.markForCheck();
                    } else {
                        // Error response
                        this.catchErrorMessage = response.error.message;
                        this._changeDetectorRef.markForCheck();
                    }
                }
            );
    }

    openTierUpgradeForm(): void {
        this.TierUpgradeForm.reset();
        this.toogleTierUpgradeFormMode(true);
        this.drawerTwo.open();
    }

    createTierUpgrade(): void {
        this.isLoading = true;
        const tierupgrade = this.TierUpgradeForm.getRawValue();
        if (tierupgrade.id > 0) {
            this._memberTierService.updateTierUpgrade(tierupgrade.id, tierupgrade)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tier: any) => {
                    //this.selectedUpgradeItem.push(tier.data.id);
                    const index = this.selectedUpgradeItem.findIndex(x => x.id === tier.data.id);
                    this.selectedUpgradeItem[(index)] = tier.data;
                    this.itemName = tier.data.item_number;
                    const memberTier = this.memberTierAddForm.getRawValue();
                    this.tierUpgradeId = tier.data.id;
                    memberTier.tier_upgrade_items = this.selectedUpgradeItem;
                    memberTier.tier_upgrade_Fullname = tier.data.item_number;
                    this.memberTierAddForm.patchValue(memberTier);
                    this.isLoading = false;
                    this.drawerTwo.close();
                });
        }
        else {
            this._memberTierService.createTierUpgrade(tierupgrade)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tier: any) => {
                    this.selectedUpgradeItem.push(tier.data);
                    this.itemName = tier.data.item_number;
                    const memberTier = this.memberTierAddForm.getRawValue();
                    this.tierUpgradeId = tier.data.id;
                    memberTier.tier_upgrade_items = this.selectedUpgradeItem;
                    memberTier.tier_upgrade_Fullname = tier.data.item_number;
                    this.memberTierAddForm.patchValue(memberTier);
                    this.isLoading = false;
                    this.drawerTwo.close();
                });
        }

    }

    closeMemberListMode(): void{
        this.toogleMemberListMode(false);
        this.toogleTierUpgradeFormMode(true);
    }

    //delete function
    deleteTierUpgradeItem(id: number): void {
        if (Number(id) > 0) {
            this.isLoading = true;
            this._memberTierService.getDeleteTierUpgradeById(id)
                .subscribe(() => {
                    this._router.navigate(['/member-tier/'] , { relativeTo: this._activatedRoute });
                });
        }
    }

    setTierUpgradeEditForm(id): void {
        if (Number(id) > 0) {
            this.isLoading = true;
            this._memberTierService.getTierUpgradeById(id)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tierupgrade: any) => {
                    const edittier = tierupgrade.data;
                    edittier.upgrade_tier = edittier.upgrade_tier.id;
                    this.TierUpgradeForm.patchValue(edittier);
                    this.isLoading = false;
                    this.toogleTierUpgradeFormMode(true);
                    this.drawerTwo.open();
                });
        }
    }
}
