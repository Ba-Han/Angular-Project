import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/product/product.types';
import { ProductService } from 'app/modules/admin/productcatalog/product/product.service';

@Component({
    selector: 'product-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    product: Product;
    productId: number;
    isLoading: boolean = false;
    ProductEditForm: FormGroup;
    selectedChannel: Product | null = null;
    editMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _productService: ProductService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.ProductEditForm = this._formBuilder.group({
            id: [''],
            status: ['', [Validators.required]],
            item_name: ['', [Validators.required]],
            /* price: ['', [Validators.required]], */
            item_number: ['', [Validators.required]]
        });
        this._productService.product$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((product: Product) => {
                this.product = product;
                this.ProductEditForm.patchValue(product);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateProduct(): void {
        const product = this.ProductEditForm.getRawValue();
        this._productService.updateProduct(product.id, product).subscribe(() => {
            this._router.navigate(['/product'], { relativeTo: this._activatedRoute });
        });
    }
}
