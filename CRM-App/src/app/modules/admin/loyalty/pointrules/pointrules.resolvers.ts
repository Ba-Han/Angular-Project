import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { PointRule, PointRulePaginagion, PointBasketPagination, PointBasket, MemberTier, MemberTierPagination, StorePagination, Store, ProductType, ProductTypeSelection, ProductTypeSelectionPagination, AwardType } from 'app/modules/admin/loyalty/pointrules/pointrules.types';

@Injectable({
    providedIn: 'root'
})
export class PointRulesResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: PointRulePaginagion; pointrules: PointRule[] }> {
        return this._pointRuleService.getPointRules();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProductTypeResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductType[]> {
        return this._pointRuleService.getProductType();
    }
}

@Injectable({
    providedIn: 'root'
})
export class AwardTypeResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AwardType[]> {
        return this._pointRuleService.getAwardType();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProductTypeSelectionResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: ProductTypeSelectionPagination; productTypeSelection: ProductTypeSelection[] }> {
        const getProductTypeValue = route.paramMap.get('productTypeValue');
        return this._pointRuleService.getProductTypeSelection(getProductTypeValue);
    }
}

@Injectable({
    providedIn: 'root'
})
export class PointRuleResolver implements Resolve<any>
{
    constructor(
        private _pointRuleService: PointRuleService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PointRule> {
        return this._pointRuleService.getPointRuleById(Number(route.paramMap.get('id')))
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

@Injectable({
    providedIn: 'root'
})
export class StoresResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Store[]> {
        return this._pointRuleService.getStores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberTiersResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }> {
        return this._pointRuleService.getMemberTiers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class PointBasketResolver implements Resolve<any>
{
    constructor(private _pointRuleService: PointRuleService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: PointBasketPagination; pointBaskets: PointBasket[] }> {
        return this._pointRuleService.getPointBaskets();
    }
}
