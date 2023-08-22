import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { LogService } from 'app/modules/admin/log/log.service';
import { Log, LogPagination } from 'app/modules/admin/log/log.types';


@Injectable({
    providedIn: 'root'
})
export class LogResolver implements Resolve<any>
{
    constructor(private _logService: LogService
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const currentDate = new Date();
        const date = currentDate.toISOString().split('T')[0];
        const getLogInputData = route.paramMap.get('getLogInputData');
        const requestMethod = route.paramMap.get('requestedMethod');
        return this._logService.postWithTodayDate(getLogInputData, date, requestMethod, 0, 10, 'request_on', 'asc');
    }
}

