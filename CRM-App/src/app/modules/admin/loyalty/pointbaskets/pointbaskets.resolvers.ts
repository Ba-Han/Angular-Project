import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { PointBasketService } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.service';
import { PointBasketPagination, PointBasket} from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.types';


@Injectable({
    providedIn: 'root'
})
export class PointBasketsResolver implements Resolve<any>
{
    constructor(private _pointBasketService: PointBasketService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: PointBasketPagination; pointBaskets: PointBasket[] }> {
        return this._pointBasketService.getPointBaskets();
    }
}

@Injectable({
    providedIn: 'root'
})
export class PointBasketResolver implements Resolve<any>
{
    constructor(
        private _pointBasketService: PointBasketService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PointBasket> {
        return this._pointBasketService.getPointBasketById(Number(route.paramMap.get('id')))
            .pipe(
                // Error here means the requested country is not available
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


