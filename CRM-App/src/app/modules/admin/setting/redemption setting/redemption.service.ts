import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse  } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { Redemption, RedemptionPagination, MemberTier, MemberTierPagination } from 'app/modules/admin/setting/redemption setting/Redemption.types';

@Injectable({
    providedIn: 'root'
})
export class RedemptionService {
    // Private
    private _redemptions: BehaviorSubject<Redemption[] | null> = new BehaviorSubject(null);
    private _redemption: BehaviorSubject<Redemption | null> = new BehaviorSubject(null);
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _memberTierpagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<RedemptionPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<RedemptionPagination> {
        return this._pagination.asObservable();
    }
    get redemptions$(): Observable<Redemption[]> {
        return this._redemptions.asObservable();
    }
    get redemption$(): Observable<Redemption> {
        return this._redemption.asObservable();
    }
    get memberTiers$(): Observable<MemberTier[]> {
        return this._memberTiers.asObservable();
    }
    get memberTierpagination$(): Observable<MemberTierPagination> {
        return this._memberTierpagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getRedemptions(page: number = 0, limit: number = 10, sort: string = 'type', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: RedemptionPagination; redemptions: Redemption[] }> {
        return this._httpClient.get(`${this._apiurl}/items/redemption_settings`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort: sort,
                order,
                search
            }
        }).pipe(
            tap((response: any) => {
                const totalLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), totalLength);
                const lastPage = Math.max(Math.ceil(totalLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: totalLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._pagination.next(pagination);
                this._redemptions.next(response.data);
            })
        );
    }

    getRedemptionSettingById(id: number): Observable<Redemption> {
        return this._httpClient.get(`${this._apiurl}/items/redemption_settings/${id}`
        ).pipe(
            tap((response: any) => this._redemption.next(response.data))
        );
    }

    getMemberTiers(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
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

    createRedemption(id: number, redemption: Redemption): Observable<Redemption> {
        const redemptionId = !redemption.id ? 0 : redemption.id;
        const dateFrom = !redemption.date_from ? null : redemption.date_from;
        const dateTo = !redemption.date_to ? null : redemption.date_to;

        return this.redemptions$.pipe(
            take(1),
            switchMap(redemptionsettings => this._httpClient.patch<any>(`${this._apiurl}/items/redemption_settings`, {
                'id': redemptionId,
                'type': redemption.type,
                'type_name': redemption.type_name,
                'date_from': dateFrom,
                'date_to': dateTo,
                'member_tier': redemption.member_tier,
                'member_tier_full_name': redemption.member_tier_full_name,
                'point_conversion': redemption.point_conversion
            }).pipe(
                map((newRedemptionSetting) => {
                    this._redemptions.next([newRedemptionSetting.data, ...redemptionsettings]);
                    return newRedemptionSetting;
                })
            ))
        );
    }

    updateRedemption(id: number, redemption: Redemption): Observable<Redemption> {
        const redemptionId = !redemption.id ? 0 : redemption.id;
        const dateFrom = !redemption.date_from ? null : redemption.date_from;
        const dateTo = !redemption.date_to ? null : redemption.date_to;

        return this._httpClient.patch<any>(`${this._apiurl}/items/redemption_settings`, {
            'id': redemptionId,
            'type': redemption.type,
            'type_name': redemption.type_name,
            'date_from': dateFrom,
            'date_to': dateTo,
            'member_tier': redemption.member_tier,
            'member_tier_full_name': redemption.member_tier_full_name,
            'point_conversion': redemption.point_conversion
        }).pipe(
            map(updateRedemption => updateRedemption)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteRedemptionSetting(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/redemption_settings/${id}`,
        { observe: 'response' });
    };

}
