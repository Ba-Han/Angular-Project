import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/product/product.types';
import { ProductService } from 'app/modules/admin/productcatalog/product/product.service';

@Component({
    selector: 'product-list',
    templateUrl: './product.component.html',
    styles: [
        /* language=SCSS */
        `
            .product-grid {
                grid-template-columns: 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 200px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 200px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 200px 150px 150px;
                }
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

    products$: Observable<Product[]>;
    product$: Observable<Product>;
    isLoading: boolean = false;
    pagination: ProductPagination;
    code: number;
    AddMode: boolean = false;
    searchInputControl: FormControl = new FormControl();
    ProductAddForm: FormGroup;

    selectedChannel: Product | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _productService: ProductService,
        private _router: Router,
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
            /* price: ['', [Validators.required]], */
            item_number: ['', [Validators.required]]
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
                    return this._productService.getProducts(0, 10, 'item_number', 'asc', query);
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
            this._sort.sort({
                id: 'item_number',
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

    createProduct(): void {

        const product = this.ProductAddForm.getRawValue();
        this._productService.createProduct(product).subscribe((product: any) => {
            this.tooglepointAddFormMode(false);
        });

    }
}
