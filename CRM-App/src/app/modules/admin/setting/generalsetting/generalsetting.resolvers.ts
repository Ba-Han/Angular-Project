import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GeneralSettingService } from 'app/modules/admin/setting/generalsetting/generalsetting.service';
import { GeneralSetting, MemberGroupPaginagion, MemberGroup, UserGroupPaginagion, UserGroup } from 'app/modules/admin/setting/generalsetting/generalsetting.types';

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

@Injectable({
    providedIn: 'root'
})
export class MemberGroupsResolver implements Resolve<any>
{
    constructor(private _settingService: GeneralSettingService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberGroupPaginagion; memberGroups: MemberGroup[] }> {
        return this._settingService.getMemberGroups();
    }
}

@Injectable({
    providedIn: 'root'
})
export class UserGroupsResolver implements Resolve<any>
{
    constructor(private _settingService: GeneralSettingService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: UserGroupPaginagion; userGroups: UserGroup[] }> {
        return this._settingService.getUserGroups();
    }
}