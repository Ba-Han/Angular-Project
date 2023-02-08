import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { MemberPointService } from 'app/modules/admin/memberpoint/memberpoint.service';
import { MemberPoint } from './memberpoint.types';
import { Member } from '../member/member.types';

@Injectable({
    providedIn: 'root'
})
export class MemberPointResolver implements Resolve<any>
{
    constructor(private _memberPointService: MemberPointService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._memberPointService.getData(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberPointDetailResolver implements Resolve<any>
{
    constructor(
        private _memberPointService: MemberPointService,
        private _router: Router
    )
    {
    }
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MemberPoint>
     {
         return this._memberPointService.getMemberPointById(Number(route.paramMap.get('pointid')))
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

@Injectable({
    providedIn: 'root'
})
export class PointSegmentResolver implements Resolve<any>
{
    constructor(private _memberPointService: MemberPointService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._memberPointService.getPointSegment();
    }
}
