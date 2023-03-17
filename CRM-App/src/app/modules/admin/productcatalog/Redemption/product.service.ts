import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { Product, ProductPagination } from 'app/modules/admin/productcatalog/Redemption/product.types';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    // Private
    private _products: BehaviorSubject<Product[] | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<Product | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<ProductPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<ProductPagination> {
        return this._pagination.asObservable();
    }
    get products$(): Observable<Product[]> {
        return this._products.asObservable();
    }
    get product$(): Observable<Product> {
        return this._product.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    getProducts(page: number = 0, limit: number = 10, sort: string = 'item_no', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: ProductPagination; products: Product[] }> {
        return this._httpClient.get(`${this._apiurl}/items/redemption_exclusion`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort: sort,
                order,
                search
            }
        }).pipe(
            tap((response: any) => {
                const totalLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), totalLength);
                const lastPage = Math.max(Math.ceil(totalLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: totalLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._pagination.next(pagination);
                this._products.next(response.data);
            })
        );
    }

    /**
     * Get channel by id
     */
    getProductById(id: number): Observable<Product> {
        return this._httpClient.get<any>(`${this._apiurl}/items/redemption_exclusion/${id}`)
            .pipe(
                tap((response) => {
                    const product = response.data;
                    this._product.next(product);
                })
            );
    }

    createProduct(product: Product): Observable<Product> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.post<any>(`${this._apiurl}/items/redemption_exclusion`, {
                'status': product.status,
                'item_name': product.item_name,
                /* 'price': product.price ? product.price : null, */
                'item_no': product.item_no
            }).pipe(
                map((newProduct) => {
                    this._products.next([newProduct.data, ...products]);
                    return newProduct;
                })
            ))
        );
    }

    updateProduct(id: number, product: Product): Observable<Product> {
        return this._httpClient.patch<Product>(`${this._apiurl}/items/redemption_exclusion/${id}`, {
            'id': product.id,
            'status': product.status,
            'item_name': product.item_name,
            /* 'price': product.price ? product.price : null, */
            'item_no': product.item_no
        }).pipe(
            map((updateProduct) => {
                return updateProduct;
            })
        )
    }
}
