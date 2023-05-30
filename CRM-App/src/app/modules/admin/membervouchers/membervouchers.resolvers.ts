import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { MemberVoucherService } from 'app/modules/admin/membervouchers/membervouchers.service';
import { MemberVoucher } from 'app/modules/admin/membervouchers/membervouchers.types';

@Injectable({
    providedIn: 'root'
})
export class MemberVoucherResolver implements Resolve<any>
{
    constructor(private _memberVoucherService: MemberVoucherService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._memberVoucherService.getMemberVoucher(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberVoucherDetailResolver implements Resolve<any>
{
    constructor(
        private _memberVoucherService: MemberVoucherService,
        private _router: Router
    )
    {
    }
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MemberVoucher>
     {
         return this._memberVoucherService.getMemberVoucherById(Number(route.paramMap.get('membervoucherid')))
            .pipe(
                // Error here means the requested contact is not available
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

