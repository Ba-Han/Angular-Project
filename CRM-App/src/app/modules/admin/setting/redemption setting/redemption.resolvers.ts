import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { RedemptionService } from 'app/modules/admin/setting/redemption setting/redemption.service';
import { Redemption, RedemptionPagination, MemberTier, MemberTierPagination } from 'app/modules/admin/setting/redemption setting/redemption.types';

@Injectable({
    providedIn: 'root'
})
export class RedemptionsResolver implements Resolve<any>
{
    constructor(private _redemptionService: RedemptionService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: RedemptionPagination; redemptions: Redemption[] }> {
        return this._redemptionService.getRedemptions();
    }
}

@Injectable({
    providedIn: 'root'
})
export class RedemptionsDetailResolver implements Resolve<any>
{
    constructor(
        private _redemptionService: RedemptionService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Redemption> {
        return this._redemptionService.getRedemptionSettingById(Number(route.paramMap.get('id')))
            .pipe(
                // Error here means the requested redemption setting is not available
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
export class MemberTierResolver implements Resolve<any>
{
    constructor(private _redemptionService: RedemptionService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }> {
        return this._redemptionService.getMemberTiers();
    }
}

