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
import { PointRule, PointRulePaginagion } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
//bh test import
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
//bh test import end
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
    //bh test
    memberTiers$: Observable<MemberTier[]>;
    memberTierPagination: MemberTierPagination;
    MemberTierListMode: boolean = false;
    PointRuleAddForm: FormGroup;
    drawerMode: 'side' | 'over';
    //bh test end
    pointRules$: Observable<PointRule[]>;
    pointRule$: Observable<PointRule>;
    isLoading: boolean = false;
    pointRule: PointRule;
    pagination: PointRulePaginagion;
    searchInputControl: FormControl = new FormControl();
    memberTierSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    PointRuleEditForm: FormGroup;
    code: string;
    addedPointSegmentId: Array<any> = [];
    selectedChannel: PointRule | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _pointRuleService: PointRuleService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        //bh test 
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        //bh test end
    ) {
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
            start_date: ['', [Validators.required]],
            end_date: ['', [Validators.required]],
            member_tier: ['', [Validators.required]],
            member_tierFullName: ['', [Validators.required]],
        });

        this.pointRule$ = this._pointRuleService.pointRule$;
        this._pointRuleService.pointRule$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pointrule: PointRule) => {
                this.pointRule = pointrule;
                this.PointRuleEditForm.patchValue(pointrule);
                this._changeDetectorRef.markForCheck();
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
                    return this._pointRuleService.getMemberTiers(0, 10, 'member_code', 'asc', query);
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

        if (MemberTierListMode === null) {
            this.MemberTierListMode = !this.MemberTierListMode;
        }
        else {
            this.MemberTierListMode = MemberTierListMode;
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
    //bh test end

    updatePointRule(): void {
        const pointrule = this.PointRuleEditForm.getRawValue();
        this._pointRuleService.updatePointRule(pointrule.id,pointrule).subscribe(() => {
            this._router.navigate(['/point-rules'], { relativeTo: this._activatedRoute });
        });

    }
    //bh test
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
    //bh test end
}
