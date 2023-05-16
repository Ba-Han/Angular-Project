import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { RedemptionService } from 'app/modules/admin/setting/redemption setting/redemption.service';
import { Redemption, RedemptionPagination } from 'app/modules/admin/setting/redemption setting/redemption.types';

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
