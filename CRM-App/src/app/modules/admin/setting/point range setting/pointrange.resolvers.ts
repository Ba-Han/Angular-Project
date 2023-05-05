import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { PointRangeService } from 'app/modules/admin/setting/point range setting/pointrange.service';

@Injectable({
    providedIn: 'root'
})
export class PointRangesResolver implements Resolve<any>
{
    constructor(private _pointRangeService: PointRangeService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._pointRangeService.getPointRange();
    }
}

