import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ActivePoint, ExpiredPoint, DateParameter,EarnPoint,RegisteredMember } from '../memberdashboard/analytics.types';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService
{
    private _totalMembers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _beInformedMembers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _beRewardMembers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _beWowMembers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _totalRegisterMember: BehaviorSubject<any> = new BehaviorSubject(null);
    private _totalTransactionCounts: BehaviorSubject<any> = new BehaviorSubject(null);
    private _totalActivePoints:BehaviorSubject<any> = new BehaviorSubject(null);
    private _totalExpiredPoints:BehaviorSubject<any> = new BehaviorSubject(null);
    private _tiers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<any> = new BehaviorSubject(null);
    private _totalEarnPoints: BehaviorSubject<any> = new BehaviorSubject(null);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
        this._apiurl = environment.apiurl;
    }

    get totalMembers$(): Observable<any>
    {
        return this._totalMembers.asObservable();
    }
    get beInformed$(): Observable<any> {
        return this._beInformedMembers.asObservable();
    }
    get beReward$(): Observable<any> {
        return this._beRewardMembers.asObservable();
    }
    get beWow$(): Observable<any> {
        return this._beWowMembers.asObservable();
    }
    get totalRegisterMember$(): Observable<any> {
        return this._totalRegisterMember.asObservable();
    }
    get totalTransactionCounts$(): Observable<any> {
        return this._totalTransactionCounts.asObservable();
    }
    get memberTiers$(): Observable<any> {
        return this._tiers.asObservable();
    }
    get totalActivePoints$(): Observable<any> {
        return this._totalActivePoints.asObservable();
    }
    get totalExpiredPoints$(): Observable<any> {
        return this._totalExpiredPoints.asObservable();
    }
    get stores$(): Observable<any> {
        return this._stores.asObservable();
    }
    get earnPoints$(): Observable<any> {
        return this._totalEarnPoints.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getMemberTiers(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`, {
        })
            .pipe(
                tap((response) => {
                    this._tiers.next(response);
                })
            );
    }

    getTotalMember(): Observable<any>
    {
        return this._httpClient.get<any>(`${this._apiurl}/items/member?aggregate[count]=member_code`).pipe(
            tap((response: any) => {
                this._totalMembers.next(response);
            })
        );
    }
    getBeInformed(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member?fields=*,member_tier.*&filter[member_tier][level][_eq]=0&aggregate[count]=member_code`).pipe(
            tap((response: any) => {
                this._beInformedMembers.next(response);
            })
        );
    }
    getBeReward(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member?fields=*,member_tier.*&filter[member_tier][level][_eq]=1&aggregate[count]=member_code`).pipe(
            tap((response: any) => {
                this._beRewardMembers.next(response);
            })
        );
    }

    getBeWow(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member?fields=*,member_tier.*&filter[member_tier][level][_eq]=2&aggregate[count]=member_code`).pipe(
            tap((response: any) => {
                this._beWowMembers.next(response);
            })
        );
    }

    getAllStore(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/store`, {
        })
            .pipe(
                tap((response) => {
                    this._stores.next(response);
                })
            );
    }

    getTotalRegistrationMemberCount(filter : RegisteredMember): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/dashboard/getTotalRegisterMember`, {
            params: {
                type: filter.type,
                day: filter.day,
                month: filter.month,
                year: filter.year,
                startdate: filter.startdate,
                enddate: filter.enddate,
            }
        }).pipe(
            tap((response: any) => {
                this._totalRegisterMember.next(response);
            })
        );
    }

    getAllTransactoinCount(filter : DateParameter): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/dashboard/getTotalTransaction`, {
            params: {
                store: filter.store,
                type: filter.type,
                day: filter.day,
                month: filter.month,
                year: filter.year,
                startdate: filter.startdate,
                enddate: filter.enddate,
            }
        }).pipe(
            tap((response: any) => {
                this._totalTransactionCounts.next(response);
            })
        );
    }

    getTotalActivePoint(filter : ActivePoint): Observable<ActivePoint> {

        return this._httpClient.get<DateParameter>(`${this._apiurl}/dashboard/getTotalActivePoint`, {
            params: {
                type: filter.type,
                tier: filter.tier,
                day: filter.day,
                month: filter.month,
                year: filter.year,
                startdate: filter.startdate,
                enddate: filter.enddate,
            }
           
        }).pipe(
            tap((response: any) => {
                return this._totalActivePoints.next(response);
            })
        );
    }
   

    getTotalExpeiredPoint(filter : ExpiredPoint): Observable<ExpiredPoint> {

        return this._httpClient.get<DateParameter>(`${this._apiurl}/dashboard/getTotalExpiredPoint`, {
            params: {
                type: filter.type,
                tier: filter.tier,
                day: filter.day,
                month: filter.month,
                year: filter.year,
                startdate: filter.startdate,
                enddate: filter.enddate,
            }
           
        }).pipe(
            tap((response: any) => {
                return this._totalExpiredPoints.next(response);
            })
        );
    }

    getAllEarnPoint(filter : EarnPoint): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/dashboard/getTotalEarnPoint`, {
            params: {
                channel : filter.channel,
                store: filter.store,
                tier: filter.tier,
                type: filter.type,
                day: filter.day,
                month: filter.month,
                year: filter.year,
                startdate: filter.startdate,
                enddate: filter.enddate,
            }
        }).pipe(
            tap((response: any) => {
                this._totalEarnPoints.next(response);
            })
        );
    }
}
