import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ImportService } from 'app/modules/admin/setting/data Import/import.service';
import { ImportActivity, ImportActivityPagination } from 'app/modules/admin/setting/data Import/import.types';

@Injectable({
    providedIn: 'root'
})
export class ImportResolver implements Resolve<any>
{
    constructor(private _importService: ImportService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: ImportActivityPagination; activities: ImportActivity[] }> {
        return this._importService.getActivities();
    }
}
