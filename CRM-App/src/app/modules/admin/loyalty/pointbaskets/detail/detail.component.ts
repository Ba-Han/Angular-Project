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
import { PointBasket, PointBasketPagination } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.types';
import { PointBasketService } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.service';

@Component({
    selector: 'pointbaskets-detail',
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
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointBasketDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    newSegmentModel: PointBasket;
    pointBaskets$: Observable<PointBasket[]>;
    pointBasketPagination: PointBasketPagination;
    pointBasket$: Observable<PointBasket>;
    isLoading: boolean = false;
    pointBasket: PointBasket;
    pagination: PointBasketPagination;
    pointBasketSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    PointBasketEditForm: FormGroup;
    code: string;
    name: string;
    description: string;
    spendingType: string;
    validitytypeValue: string;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    selectedId: number;
    spendingtypeValue = 0;
    totypeValue = 0;
    toendTypeValue = 0;
    fromtypeValue = 0;
    fromstarttypeValue = 0;
    isButtonDisabled: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _pointBasketService: PointBasketService,
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
        this.PointBasketEditForm = this._formBuilder.group({
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

        this.pointBasket$ = this._pointBasketService.pointBasket$;

        this._pointBasketService.pointBasket$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pointbasket: PointBasket) => {
                this.pointBasket = pointbasket;
                //this.validitytypeValue = pointrule.validity_type;
                //this.pointRule.point_basket = pointrule.name;
                //this.pointRule.point_basketName = pointrule.point_basket?.name;
                this.PointBasketEditForm.patchValue(pointbasket);
                this._changeDetectorRef.markForCheck();
            });

        // search Point Rules
        this.pointBasketSearchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._pointBasketService.getPointBaskets(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

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
                    return this._pointBasketService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    updatePointBasket(): void {
        const pointbasket = this.PointBasketEditForm.getRawValue();
        this._pointBasketService.updatePointBasket(pointbasket.id,pointbasket).subscribe(() => {
            this._router.navigate(['/point-baskets'], { relativeTo: this._activatedRoute });
        });

    }
}

