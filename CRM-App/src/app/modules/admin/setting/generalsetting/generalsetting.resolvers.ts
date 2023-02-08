import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GeneralSettingService } from 'app/modules/admin/setting/generalsetting/generalsetting.service';
import { GeneralSetting } from 'app/modules/admin/setting/generalsetting/generalsetting.types';

@Injectable({
    providedIn: 'root'
})
export class SettingResolver implements Resolve<any>
{
    constructor(private _settingService: GeneralSettingService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._settingService.getSetting();
    }
}
