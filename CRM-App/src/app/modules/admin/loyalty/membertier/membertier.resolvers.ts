import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { MemberTierService } from 'app/modules/admin/loyalty/membertier/membertier.service';
import { MemberTier, MemberTierPagination, PointRulePagination, PointRule, DWMemberGroupPagination, DWMemberGroup } from 'app/modules/admin/loyalty/membertier/membertier.types';

@Injectable({
    providedIn: 'root'
})
export class MemberTiersResolver implements Resolve<any>
{
    constructor(private _memberTierService: MemberTierService)
    {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }>
    {
        return this._memberTierService.getMemberTiers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberTierDetailResolver implements Resolve<any>
{
    constructor(
        private _memberTierService: MemberTierService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MemberTier> {
        return this._memberTierService.getMemberTierById(Number(route.paramMap.get('id')))
            .pipe(
                // Error here means the requested product is not available
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
export class MemberTierLevels implements Resolve<any>
{
    constructor(private _memberTierService: MemberTierService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MemberTier[]> {
        return this._memberTierService.getMemberTierLevels();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DWMemberGroupsResolver implements Resolve<any>
{
    constructor(private _memberTierService: MemberTierService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: DWMemberGroupPagination; dwMemberGroups: DWMemberGroup[] }> {
        return this._memberTierService.getDWMemberGroups();
    }
}
