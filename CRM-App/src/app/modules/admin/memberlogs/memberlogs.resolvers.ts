import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { MemberLogsService } from 'app/modules/admin/memberlogs/memberlogs.service';

@Injectable({
    providedIn: 'root'
})
export class MemberLogsResolver implements Resolve<any>
{
    constructor(private _memberLogsService: MemberLogsService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._memberLogsService.getMemberLogs(Number(route.paramMap.get('id')));
    }
}


