import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ProductService } from 'app/modules/admin/productcatalog/product/product.service';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/product/product.types';


@Injectable({
    providedIn: 'root'
})
export class ProductsResolver implements Resolve<any>
{
    constructor(private _productService: ProductService
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: ProductPagination; products: Product[] }> {
        return this._productService.getProducts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProductResolver implements Resolve<any>
{
    constructor(
        private _productService: ProductService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product> {
        return this._productService.getProductById(Number(route.paramMap.get('id')))
            .pipe(
                // Error here means the requested channel is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

