import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/product/product.types';
import { ProductService } from 'app/modules/admin/productcatalog/product/product.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'product-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
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
    ]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    product: Product;
    productId: number;
    isLoading: boolean = false;
    ProductEditForm: FormGroup;
    selectedChannel: Product | null = null;
    editMode: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _productService: ProductService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService
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

        this.canDelete = this._userService.getDeleteUserPermissionByNavId('product');
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
        this._productService.getDeleteExclusionProduct(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/product'], { relativeTo: this._activatedRoute });
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
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    updateProduct(): void {
        const product = this.ProductEditForm.getRawValue();
        this._productService.updateProduct(product.id, product).subscribe(() => {
            this._router.navigate(['/product'], { relativeTo: this._activatedRoute });
        });
    }
}
