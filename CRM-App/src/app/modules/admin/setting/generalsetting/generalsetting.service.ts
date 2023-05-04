import { settings } from './../../../../mock-api/apps/mailbox/data';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { GeneralSetting, MemberGroupPaginagion, MemberGroup, UserGroup, UserGroupPaginagion, MemberTier, MemberTierPagination } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import { set } from 'lodash-es';

@Injectable({
    providedIn: 'root'
})
export class GeneralSettingService {
    // Private
    private _setting: BehaviorSubject<GeneralSetting | null> = new BehaviorSubject(null);
    private _memberGroups: BehaviorSubject<MemberGroup[] | null> = new BehaviorSubject(null);
    private _memberGroupspagination: BehaviorSubject<MemberGroupPaginagion | null> = new BehaviorSubject(null);
    private _userGroups: BehaviorSubject<UserGroup[] | null> = new BehaviorSubject(null);
    private _userGroupspagination: BehaviorSubject<UserGroupPaginagion | null> = new BehaviorSubject(null);
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _memberTierpagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _tiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get setting$(): Observable<GeneralSetting> {
        return this._setting.asObservable();
    }

    get memberGroups$(): Observable<MemberGroup[]> {
        return this._memberGroups.asObservable();
    }

    get memberGroupspagination$(): Observable<MemberGroupPaginagion> {
        return this._memberGroupspagination.asObservable();
    }

    get userGroups$(): Observable<UserGroup[]> {
        return this._userGroups.asObservable();
    }

    get userGroupspagination$(): Observable<UserGroupPaginagion> {
        return this._userGroupspagination.asObservable();
    }

    get memberTiers$(): Observable<MemberTier[]> {
        return this._memberTiers.asObservable();
    }

    get memberTierpagination$(): Observable<MemberTierPagination> {
        return this._memberTierpagination.asObservable();
    }

    get memberTierlevels(): Observable<MemberTier[]> {
        return this._tiers.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getSetting(): Observable<GeneralSetting> {
        return this._httpClient.get<any>(`${this._apiurl}/items/general_settings`)
            .pipe(
                tap((response) => {
                    const setting = response.data;
                    this._setting.next(setting);
                })
            );
    }

    getMemberGroups(page: number = 0, limit: number = 50, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberGroupPaginagion; memberGroups: MemberGroup[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/usergroup`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                const memberGroupLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), memberGroupLength);
                const lastPage = Math.max(Math.ceil(memberGroupLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: memberGroupLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                //bh test
                // const memberTier = response.data;

                // for (var i = 0; i < response.data.length; i++) {
                //    response.data[i]["point_ruleFullname"] = response.data[i].point_rule.name;
                //    response.data[i].point_rule = response.data[i].point_rule.id;

                // }
                //bh test end
                this._memberGroupspagination.next(pagination);
                this._memberGroups.next(response.data);
            })
        );
    }

    getUserGroups(page: number = 0, limit: number = 50, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: UserGroupPaginagion; userGroups: UserGroup[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/usergroup`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                const userGroupLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), userGroupLength);
                const lastPage = Math.max(Math.ceil(userGroupLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: userGroupLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                //bh test
                // const memberTier = response.data;

                // for (var i = 0; i < response.data.length; i++) {
                //    response.data[i]["point_ruleFullname"] = response.data[i].point_rule.name;
                //    response.data[i].point_rule = response.data[i].point_rule.id;

                // }
                //bh test end
                this._userGroupspagination.next(pagination);
                this._userGroups.next(response.data);
            })
        );
    }


    getMemberTiers(page: number = 0, limit: number = 50, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                const memberTierLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), memberTierLength);
                const lastPage = Math.max(Math.ceil(memberTierLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: memberTierLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._memberTierpagination.next(pagination);
                this._memberTiers.next(response.data);
            })
        );
    }

    updateSetting(id: number, setting: GeneralSetting, selectedMemberGroupValue: MemberGroup[], selectedUserGroupValue: UserGroup[]): Observable<GeneralSetting> {
        //let memberGroup = setting.member_groups;
        let strMemberGroup = selectedMemberGroupValue.map(x=>x.id).join(',');

        //let userGroup = setting.user_groups;
        let strUserGroup = selectedUserGroupValue.map(x=>x.id).join(',');

        if ((strMemberGroup) && (strUserGroup)) {
            return this._httpClient.patch<any>(`${this._apiurl}/items/general_settings`, {
                'id': setting.id,
                'transaction_rounding': setting.transaction_rounding,
                'point_conversion': setting.point_conversion,
                'min_point': setting.min_point,
                'max_point': setting.max_point,
                'member_groups': strMemberGroup,
                'user_groups': strUserGroup,
                'default_member_tier': setting.default_member_tier,
            }).pipe(
                map(updateSetting => updateSetting)
            );
        }
    }

}
