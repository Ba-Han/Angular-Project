import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { StoreService } from 'app/modules/admin/setting/store/store.service';
import { Store, StorePagination } from 'app/modules/admin/setting/store/store.types';

@Injectable({
    providedIn: 'root'
})
export class StoresResolver implements Resolve<any>
{
    constructor(private _storeService: StoreService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: StorePagination; stores: Store[] }> {
        return this._storeService.getStores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoreResolver implements Resolve<any>
{
    constructor(
        private _storeService: StoreService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Store> {
        return this._storeService.getStoreById(route.paramMap.get('code'))
            .pipe(
                // Error here means the requested store is not available
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
