/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MemberTier, MemberTierPagination, MemberTierUpgrade, DWMemberGroup } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { MemberTierService } from 'app/modules/admin/loyalty/membertier/membertier.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'membertier-list',
    templateUrl: './membertier.component.html',
    styles: [
        /* language=SCSS */
        `
            .membertier-list-grid {
                grid-template-columns: 150px 150px 150px auto;

                @screen sm {
                    grid-template-columns: 150px 150px 150px auto;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px auto;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px auto;
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
           .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .membertier-2-sort {
                position: static;
                width: 10rem !important;
            }

            .sort-btn-01 {
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
export class MemberTierListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    memberTiers$: Observable<MemberTier[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    canEdit: boolean = false;
    pagination: MemberTierPagination;
    searchInputControl: FormControl = new FormControl();
    selectedMemberTier: MemberTier | null = null;
    memberTierAddForm: FormGroup;
    drawerMode: 'side' | 'over';
    pointAddFormMode: boolean = false;
    tierUpgradeFormMode: boolean = false;
    TierUpgradeForm: FormGroup;
    selectedUpgradeItem: Array<MemberTierUpgrade> = [];
    itemName: string;
    tierUpgradeId: number;
    memberTierPagination: MemberTierPagination;
    MemberListMode: boolean = false;
    memberTiers: any;
    dwMemberGroups: any;
    pointruleId: number;
    isAscending: boolean = true;
    selectedCoulumn = 'level';
    errorMessage: string | '' = '';
    conditionPeriodValue: number = 0;
    downgradeConditionPeriodTypeValue: number = 0;
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
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

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
            tier_upgrade_items: new FormControl(this.selectedUpgradeItem)
        });

        this.TierUpgradeForm = this._formBuilder.group({
            id: [''],
            item_number: ['', [Validators.required]],
            price: ['', [Validators.required]],
            upgrade_tier: ['', [Validators.required]],
        });

        // Get the pagination
        this._memberTierService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: MemberTierPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the member Tier
        this.memberTiers$ = this._memberTierService.memberTiers$;

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._memberTierService.getMemberTiers(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
            this.canEdit = this._userService.getEditUserPermissionByNavId('member-tier');

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
            } else if (this.isAscending && this.selectedCoulumn === 'code') {
                this._sort.sort({
                    id: 'code',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'code') {
                this._sort.sort({
                    id: 'code',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'level') {
                this._sort.sort({
                    id: 'level',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'level') {
                this._sort.sort({
                    id: 'level',
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

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'name') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'code' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'level' ) {
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
        } else if ( this.isAscending && this.selectedCoulumn === 'code' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'code' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'level' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'level' ) {
            this.ngAfterViewInit();
        }
    }

    createMemberTier(): void {
        const memberTier = this.memberTierAddForm.getRawValue();
        memberTier.tier_upgrade_items = this.selectedUpgradeItem;
        this._memberTierService.createMemberTier(memberTier)
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

    openTierUpgradeForm(): void {
        this.TierUpgradeForm.reset();
        this.toogleTierUpgradeFormMode(true);
        this.drawerTwo.open();
    }

    createTierUpgrade(): void {
        this.isLoading = true;
        const tierupgrade = this.TierUpgradeForm.getRawValue();
        if (tierupgrade.id > 0) {
            this._memberTierService.updateTierUpgrade(tierupgrade.id,tierupgrade)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tier: any) => {
                    const index = this.selectedUpgradeItem.findIndex(x => x.id === tier.data.id);
                    this.selectedUpgradeItem[(index)] = tier.data;
                    //this.selectedUpgradeItem.push(tier.data);
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

    closeMemberListMode(): void {
        this.toogleMemberListMode(false);
        this.toogleTierUpgradeFormMode(true);
    }

    setTierUpgradeEditForm(id): void {
        if (Number(id) > 0) {
            this.isLoading = true;
            this._memberTierService.getTierUpgradeById(id)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tierupgrade: any) => {
                    const edittier = tierupgrade.data;
                    edittier.upgrade_tier = tierupgrade.data.upgrade_tier.id;
                    this.TierUpgradeForm.patchValue(edittier);
                    this.isLoading = false;
                    this.toogleTierUpgradeFormMode(true);
                    this.drawerTwo.open();
                });
        }

    }
}
