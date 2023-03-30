import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PointBasket, PointBasketPagination } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.types';
import { PointBasketService } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'pointbaskets-list',
    templateUrl: './pointbaskets.component.html',
    styles: [
        /* language=SCSS */
        `
            .pointbasket-grid {
                grid-template-columns: 250px 250px 200px 150px;

                @screen sm {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen md {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen lg {
                    grid-template-columns: 160px 160px 150px 150px 150px 150px;
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

            .reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 28% !important;
                height: 34% !important;
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

            .delete-scss {
                position: fixed;
                padding-left: 2rem;
            }

            .deletePointBasketscss {
                position: relative;
                bottom: 0.6rem;
                left: 26rem;
                margin: -2rem;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class PointBasketListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    pointBaskets$: Observable<any[]>;
    pointBasketPagination: PointBasketPagination;
    //PointBasketListMode: boolean = false;
    PointBasketAddForm: FormGroup;
    drawerMode: 'side'|'over';

    isLoading: boolean = false;
    pagination: PointBasketPagination;
    pointBasketSearchInputControl: FormControl = new FormControl();
    AddMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    name: string;
    description: string;
    spendingType: string;
    minDate: string;
    timeoutId: any;
    timeOutUpId: any;
    spendingtypeValue = 0;
    totypeValue = 0;
    toendTypeValue = 0;
    fromtypeValue = 0;
    fromstarttypeValue = 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _pointBasketService: PointBasketService,
        private _fuseConfirmationService: FuseConfirmationService,
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

        this.PointBasketAddForm = this._formBuilder.group({
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

        this._pointBasketService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: PointBasketPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.pointBaskets$ = this._pointBasketService.pointBaskets$;

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
            this.canEdit = this._userService.getViewUserPermissionByNavId('point-baskets');
            this.canDelete = this._userService.getDeleteUserPermissionByNavId('point-baskets');

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
        setTimeout(() => {
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

                merge(this._sort.sortChange, this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                        return this._pointBasketService.getPointBaskets(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 2000);
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
        this.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._pointBasketService.getDeletePointBasket(this.selectedId)
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._pointBasketService.getPointBaskets(0, 10, 'name', 'asc');
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe();
        this.isSuccess = true;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    createPointBasket(): void {
        const pointbasket = this.PointBasketAddForm.getRawValue();
        this._pointBasketService.createPointBasket(pointbasket).subscribe(() => {
            this.toogleStoreAddFormMode(false);
        });
    }
}
