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
import { MemberTier, MemberTierPagination, PointRule, PointRulePagination, PointSegment, point_segment_id, MemberTierUpgrade } from 'app/modules/admin/loyalty/membertier/membertier.types';
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

                .reset_popup {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 28% !important;
                    height: 34% !important;
                    border-radius: 8px;
                }

                .parent_popup {
                    position: fixed;
                    display: grid;
                    justify-content: center;
                    padding: 4rem;
                }

                .child_btn {
                    padding-left: 1.5rem;
                    position: fixed;
                    margin-top: 2rem !important;
                }

                .update_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(0, 128, 0);
                    padding: 4rem;
                    font-size: 16px;
                }

                .successMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(0, 128, 0);
                    padding: 3rem;
                    font-size: 16px;
                }

                .errorMessage_scss {
                    position: unset;
                    text-align: center;
                    color: rgb(255, 49, 49);
                    padding: 3rem;
                    font-size: 16px;
                }

                .delete-scss {
                    position: fixed;
                    padding-left: 2rem;
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
    //@ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    //@ViewChild('matDrawer', { static: true }) matDrawer2: MatDrawer;
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
    successMessage: string | null = null;
    errorMessage: string | null = null;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pointsegmentMode: boolean = false;
    pagination: MemberTierPagination;
    pointrulepagination: PointRulePagination;
    searchInputControl: FormControl = new FormControl();
    selectedMemberTier: MemberTier | null = null;
    memberTierAddForm: FormGroup;
    PointSegmentForm: FormGroup;
    newSegmentModel: PointSegment;
    addedPointSegment: Array<PointSegment> = [];
    addedPointSegmentId: Array<point_segment_id> = [];
    drawerMode: 'side' | 'over';
    PointRuleForm: FormGroup;
    TierUpgradeForm: FormGroup;
    pointRules$: Observable<PointRule[]>;
    pointAddFormMode: boolean = false;
    pointsegmentEditMode: boolean = false;
    tierUpgradeFormMode: boolean = false;
    MemberListMode: boolean = false;
    downgradeconditionValue: string;
    selectedValue: string;
    earningToValue: string;
    spendingFromValue: string;
    spendingToValue: string;
    itemName: string;
    tierUpgradeId: number;
    memberTiers: any;
    dwMemberGroups: any;
    memberTierPagination: MemberTierPagination;
    selectedUpgradeItem: Array<MemberTierUpgrade> = [];
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
            condition_period: ['', [Validators.required]],
            condition_period_value: ['', [Validators.required]],
            min_condition_amount: ['', [Validators.required]],
            max_condition_amount: ['', [Validators.required]],
            downgrade_condition_type: ['', [Validators.required]],
            downgrade_condition_period: [''],
            downgrade_condition_period_value: [''],
            dw_member_group: ['', [Validators.required]],
            tier_upgrade_Fullname: [this.itemName],
            tier_upgrade_items: new FormControl(this.selectedUpgradeItem)
        });

        this.PointRuleForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            reward_code: ['', [Validators.required]],
            type: ['', [Validators.required]],
            point_value: ['', [Validators.required]],
            status: ['', [Validators.required]],
            point_basket: new FormControl(this.addedPointSegmentId),
        });

        this.PointSegmentForm = this._formBuilder.group({
            id: [''],
            status: ['', [Validators.required]],
            name: ['', [Validators.required]],
            description: [''],
            earning_from: ['', [Validators.required]],
            earning_from_date: [''],
            earning_from_day: [''],
            earning_from_month: [''],
            earning_to: ['', [Validators.required]],
            earning_to_date: [''],
            earning_to_day: [''],
            earning_to_month: [''],
            spending_from: ['', [Validators.required]],
            spending_from_date: [''],
            spending_from_day: [''],
            spending_from_month: [''],
            spending_to: ['', [Validators.required]],
            spending_to_date: [''],
            spending_to_day: [''],
            spending_to_month: ['']
        });

        this.TierUpgradeForm = this._formBuilder.group({
            id: [''],
            /* status: ['', [Validators.required]], */
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
                //this.memberTier.point_ruleFullname = tier.point_rule.name;
                //this.memberTier.tier_upgrade_Fullname =
                //this.tierUpgradeId =;
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

    tooglepointSegmentAddFormMode(pointsegmentMode: boolean | null = null): void {
        if (pointsegmentMode === null) {
            this.pointsegmentMode = !this.pointsegmentMode;
        }
        else {
            this.pointsegmentMode = pointsegmentMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    tooglepointSegmentEditFormMode(pointsegmentEditMode: boolean | null = null): void {
        if (pointsegmentEditMode === null) {
            this.pointsegmentEditMode = !this.pointsegmentEditMode;
        }
        else {
            this.pointsegmentEditMode = pointsegmentEditMode;
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

    selectPointRule(id, name): void {
        const memberTier = this.memberTierAddForm.getRawValue();
        memberTier.point_rule = id;
        memberTier.point_ruleFullname = name;
        this.memberTierAddForm.patchValue(memberTier);
        this.isLoading = false;
        this.drawerOne.close();
    }

    /* openPointRuleForm(id): void {
        this.addedPointSegment = [];
        this.addedPointSegmentId = [];
        this.isLoading = true;
        this._memberTierService.getPointRuleById(id, true)
            .pipe(
                takeUntil(this._unsubscribeAll),
                
                map((pointrules: any) => {
                    const baskets = pointrules.data.point_basket;
                    //take segement
                    for (var i = 0; i < baskets.length; i++) {
                        this._memberTierService.getPointSegmentById(baskets[i].point_segment_id)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((pointsegment: any) => {
                                let index = this.addedPointSegment.findIndex(x => x.id === pointsegment.data.id || x.name === pointsegment.data.name);
                                if (index > -1) {
                                    this.addedPointSegment[(index)] = pointsegment.data;
                                }
                                else {
                                    this.addedPointSegment.push(pointsegment.data);
                                }

                            });
                        let index1 = this.addedPointSegmentId.findIndex(x => x === baskets[i].point_segment_id);
                        if (index1 > -1) {
                            this.addedPointSegmentId[(index1)] = baskets[i].id;
                        }
                        else {
                            this.addedPointSegmentId.push(baskets[i].id);
                        }
                    }
                    this.PointRuleForm.patchValue(pointrules.data);
                    this.isLoading = false;
                    this.toogleTierUpgradeFormMode(false);
                    this.tooglepointAddFormMode(true);
                    this.matDrawer.open();
                })
            )
            .subscribe();
        
    } */

    /* updatePointRule(): void {
        const pointrule = this.PointRuleForm.getRawValue();
        pointrule.point_basket = this.addedPointSegmentId;
        this._memberTierService.updatePointRule(pointrule.id,pointrule)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tier: any) => {
                const membertier = this.memberTierAddForm.getRawValue();
                membertier.point_rule = tier.data.id;
                membertier.point_ruleFullname = tier.data.name;
                this.memberTierAddForm.patchValue(membertier);
                this.matDrawer.close();
                this.addedPointSegment = [];
                this.addedPointSegmentId = [];
            });
    } */

    /* createNewPointSegment(): void {
        this.PointSegmentForm.reset();
        this.tooglepointSegmentAddFormMode(true);
    } */

    /* closeSegmentForm(): void {
        this.tooglepointSegmentAddFormMode(false);
    } */

    /* createUpdateSegmentPoint(): void {
        this.isLoading = true;
        const segment = this.PointSegmentForm.getRawValue();
        if (Number(segment.id) > 0) {
            this.isLoading = true;
            this._memberTierService.UpdatePointSegment(segment.id, segment)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pointsegment: any) => {
                    let index = this.addedPointSegment.findIndex(x => x.id === pointsegment.data.id);
                    this.addedPointSegment[(index)] = segment;
                    this.isLoading = false;
                    this.tooglepointSegmentAddFormMode(false);
                });
        }
        else {
            //this._memberTierService.createPointSegment(segment)
            //    .pipe(takeUntil(this._unsubscribeAll))
            //    .subscribe((pointsegment: any) => {
                   
            //    });

            var point_segment_id = this.convertToPointSegmentIdObject(segment);
            let index1 = this.addedPointSegment.findIndex(x => x.id === null);
            if (index1 > -1) {
                this.addedPointSegment[(index1)] = segment;
            }
            else {
                this.addedPointSegment.push(segment);
            }
            let index = this.addedPointSegmentId.findIndex(x => typeof x === 'object');
            if (index > -1) {
                this.addedPointSegmentId[(index1)] = point_segment_id;
            }
            else {
                this.addedPointSegmentId.push(point_segment_id);
            }
            this.isLoading = false;
            this.tooglepointSegmentAddFormMode(false);
        }


    } */

    /* convertToPointSegmentIdObject(pointsegment: PointSegment): any {
        var point_segment_id = {
            "point_segment_id": {
                "status": pointsegment.status,
                "name": pointsegment.name,
                "description": pointsegment.description,
                "earning_from": pointsegment.earning_from,
                "earning_from_date": pointsegment.earning_from_date,
                "earning_from_day": pointsegment.earning_from_day,
                "earning_from_month": pointsegment.earning_from_month,
                "earning_to": pointsegment.earning_to,
                "earning_to_date": pointsegment.earning_to_date,
                "earning_to_day": pointsegment.earning_to_day,
                "earning_to_month": pointsegment.earning_to_month,
                "spending_from": pointsegment.spending_from,
                "spending_from_date": pointsegment.spending_from_date,
                "spending_from_day": pointsegment.spending_from_day,
                "spending_from_month": pointsegment.spending_from_month,
                "spending_to": pointsegment.spending_to,
                "spending_to_date": pointsegment.spending_to_date,
                "spending_to_day": pointsegment.spending_to_day,
                "spending_to_month": pointsegment.spending_to_month
            }
        }
        return point_segment_id;
    } */

    /* editForm(pointsegment: PointSegment): void {
        this.tooglepointSegmentAddFormMode(false);
        this.isLoading = true;
        //this._memberTierService.getPointSegmentById(id)
        //    .pipe(takeUntil(this._unsubscribeAll))
        //    .subscribe((pointsegment: any) => {

        //    });
        //const editsegment = pointsegment;
        //pointsegment = PointSegment;
        //pointsegment = this.addedPointSegment.filter(x => x.id != null ? x.id === id : x.name === name);
        this.selectedValue = pointsegment.earning_from;
        this.earningToValue = pointsegment.earning_to;
        this.spendingFromValue = pointsegment.spending_from;
        this.spendingToValue = pointsegment.spending_to;
        this.PointSegmentForm.patchValue(pointsegment);
        this.isLoading = false;
        this.tooglepointSegmentAddFormMode(true);
    } */

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
            .subscribe((tier: any) => {
                this._router.navigate(['/member-tier'], { relativeTo: this._activatedRoute });
            });
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
