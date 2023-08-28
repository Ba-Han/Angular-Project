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
                grid-template-columns: 150px 250px 150px;

                @screen sm {
                    grid-template-columns: 150px 250px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 250px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 250px 150px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .redemption-2-sort {
                position: static;
                width: 10rem !important;
            }

            .redemption_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .redemption-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .redemption-search {
                width: 17rem !important;
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
    searchInputControl: FormControl = new FormControl();
    ProductAddForm: FormGroup;

    selectedChannel: Product | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'sku';
    errorMessage: string | '' = '';
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
            this.canEdit = this._userService.getEditUserPermissionByNavId('redemption');
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'sku') {
                this._sort.sort({
                    id: 'item_no',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'sku') {
                this._sort.sort({
                    id: 'item_no',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'item_name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'name') {
                this._sort.sort({
                    id: 'item_name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'status') {
                this._sort.sort({
                    id: 'status',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'status') {
                this._sort.sort({
                    id: 'status',
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'sku') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'sku' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'sku' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'name' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'status' ) {
            this.ngAfterViewInit();
        }
    }

    createProduct(): void {
        const product = this.ProductAddForm.getRawValue();
        this._productService.createProduct(product).subscribe(() => {
            this.tooglepointAddFormMode(false);
            this.ProductAddForm.reset();
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
}
