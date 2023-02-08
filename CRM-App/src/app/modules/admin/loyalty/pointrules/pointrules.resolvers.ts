import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { PointRuleService } from 'app/modules/admin/loyalty/pointrules/pointrules.service';
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { PointRule, PointRulePaginagion } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { PointSegmentPagination, PointSegment } from '../../memberpoint/memberpoint.types';

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
//bh test
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
//bh test end
