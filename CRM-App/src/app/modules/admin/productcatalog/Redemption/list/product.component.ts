import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/Redemption/product.types';
import { ProductService } from 'app/modules/admin/productcatalog/Redemption/product.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'product-list',
    templateUrl: './product.component.html',
    styles: [
        /* language=SCSS */
        `
            .product-redemption-grid {
                grid-template-columns: 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 250px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 250px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 250px 150px 150px;
                }
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

            .deleteRedemptionscss {
                position: relative;
                bottom: 0.6rem;
                left: 36rem;
                margin: -2rem;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    products$: Observable<Product[]>;
    product$: Observable<Product>;
    isLoading: boolean = false;
    pagination: ProductPagination;
    code: number;
    AddMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    searchInputControl: FormControl = new FormControl();
    ProductAddForm: FormGroup;

    selectedChannel: Product | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'sku';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _productService: ProductService,
        private _router: Router,
        private _userService: UserService
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {


        this.ProductAddForm = this._formBuilder.group({
            id: [''],
            status: ['', [Validators.required]],
            item_name: ['', [Validators.required]],
            /* price: [''], */
            item_no: ['', [Validators.required]]
        });

        // Get the pagination
        this._productService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductPagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.products$ = this._productService.products$;

        // search
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._productService.getProducts(0, 10, 'item_no', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
            this.canEdit = this._userService.getViewUserPermissionByNavId('redemption');
            this.canDelete = this._userService.getDeleteUserPermissionByNavId('redemption');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'item_no',
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
                    //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                    return this._productService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
    tooglepointAddFormMode(AddMode: boolean | null = null): void {
        if (AddMode === null) {
            this.AddMode = !this.AddMode;
        }
        else {
            this.AddMode = AddMode;
        }

        // Mark for check
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
        this._productService.getDeleteRedemptionProduct(this.selectedId)
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._productService.getProducts(0, 10, 'item_no', 'asc');
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'sku' ) {
            this._productService.getProducts(0, 10, 'item_no', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'sku' ) {
            this._productService.getProducts(0, 10, 'item_no', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this._productService.getProducts(0, 10, 'item_name', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this._productService.getProducts(0, 10, 'item_name', 'desc').subscribe();
        } else if ( this.isAscending && this.selectedCoulumn === 'status' ) {
            this._productService.getProducts(0, 10, 'status', 'asc').subscribe();
        } else if ( !this.isAscending && this.selectedCoulumn === 'status' ) {
            this._productService.getProducts(0, 10, 'status', 'desc').subscribe();
        }
    }

    createProduct(): void {
        const product = this.ProductAddForm.getRawValue();
        this._productService.createProduct(product).subscribe(() => {
            this.tooglepointAddFormMode(false);
        });

    }
}
