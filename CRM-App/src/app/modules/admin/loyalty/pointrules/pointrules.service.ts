import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { PointRule, PointRulePaginagion } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
//bh test 
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
//bh test end
@Injectable({
    providedIn: 'root'
})
export class PointRuleService {
    // Private
    private _pointRules: BehaviorSubject<PointRule[] | null> = new BehaviorSubject(null);
    private _pointRule: BehaviorSubject<PointRule | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<PointRulePaginagion | null> = new BehaviorSubject(null);
    private _apiurl: string;
  //bh test 
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _memberTierpagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
  //bh test end
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

  
    get pointRules$(): Observable<PointRule[]> {
        return this._pointRules.asObservable();
    }

    get pointRule$(): Observable<PointRule> {
        return this._pointRule.asObservable();
    }

    get pagination$(): Observable<PointRulePaginagion> {
        return this._pagination.asObservable();
    }
     //bh test
     get memberTiers$(): Observable<MemberTier[]> {
        return this._memberTiers.asObservable();
    }
    get memberTierpagination$(): Observable<PointRulePaginagion> {
        return this._memberTierpagination.asObservable();
    }
    //bh test end

     // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    getPointRules(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: PointRulePaginagion; pointrules: PointRule[] }> {
        return this._httpClient.get(`${this._apiurl}/items/point_rule`, {
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
                this._pointRules.next(response.data);
            })
        );
    }
    //bh test
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
                //bh test
                // const memberTier = response.data;

                // for (var i = 0; i < response.data.length; i++) {
                //    response.data[i]["point_ruleFullname"] = response.data[i].point_rule.name;
                //    response.data[i].point_rule = response.data[i].point_rule.id;

                // }
                //bh test end
                this._memberTierpagination.next(pagination);
                this._memberTiers.next(response.data);
            })
        );
    }
    //bh test end
    getPointRuleById(id: number): Observable<PointRule> {
        return this._httpClient.get<any>(`${this._apiurl}/items/point_rule/${id}`)
            .pipe(
                tap((response) => {
                    const pointrule = response.data;
                    this._pointRule.next(pointrule);
                })
            );
    }

    createPointRule(pointrule: PointRule): Observable<PointRule> {
        /**
         * Fix date issue in derectus. 
         * Need to add time greater than 12.00 PM.
         */
        let startDate:any = new Date(pointrule.start_date);
        // startDate.setMinutes(800);
        
        //Implement for get client's time zone and offset
        // let offSet = new Date().getTimezoneOffset();
        // let offSetMinutes = Math.abs(offSet);
        // let hours = Math.floor(offSetMinutes / 60);
        // let minutes = Math.floor(offSetMinutes % 60);

        startDate.setHours(startDate.getHours() - 8);
        startDate.setMinutes(startDate.getMinutes() - 0o0);
        let startDateFormat = startDate.getFullYear() + "-" +  (startDate.getMonth()+1) + "-" + startDate.getDate() + "T" + startDate.getHours() + ":" + startDate.getMinutes() + ":00";

        let endDate:any = new Date(pointrule.end_date);
        // endDate.setMinutes(800);
        
        endDate.setHours(endDate.getHours() - 8);
        endDate.setMinutes(endDate.getMinutes() - 0o0);
        let endDateFormat = endDate.getFullYear() + "-" +  (endDate.getMonth()+1) + "-" + endDate.getDate() + "T" + endDate.getHours() + ":" + endDate.getMinutes() + ":00";
        
        return this.pointRules$.pipe(
            take(1),
            switchMap(pointrules => this._httpClient.post<any>(`${this._apiurl}/items/point_rule`, {
                "name": pointrule.name,
                "description": pointrule.description,
                "reward_code": pointrule.reward_code,
                "type": pointrule.type,
                "point_value": pointrule.point_value,
                "status": pointrule.status,
                "start_date": startDateFormat,
                "end_date": endDateFormat,
                "member_tier": pointrule.member_tier,
                "member_tierFullName": pointrule.member_tierFullName,
            }).pipe(
                map((newPointRule) => {
                    this._pointRules.next([newPointRule.data, ...pointrules]);
                    return newPointRule;
                })
            ))
        );
    }

    updatePointRule(id: number, pointrule: PointRule): Observable<PointRule> {
        /**
         * Fix date issue in derectus. 
         * Need to add time greater than 12.00 PM.
         */
        let startDate:any = new Date(pointrule.start_date);
        // startDate.setMinutes(800);
        
        //Implement for get client's time zone and offset
        // let offSet = new Date().getTimezoneOffset();
        // let offSetMinutes = Math.abs(offSet);
        // let hours = Math.floor(offSetMinutes / 60);
        // let minutes = Math.floor(offSetMinutes % 60);
        
        startDate.setHours(startDate.getHours() - 8);
        startDate.setMinutes(startDate.getMinutes() - 0o0);
        let startDateFormat = startDate.getFullYear() + "-" +  (startDate.getMonth()+1) + "-" + startDate.getDate() + "T" + startDate.getHours() + ":" + startDate.getMinutes() + ":00";

        let endDate:any = new Date(pointrule.end_date);
        // endDate.setMinutes(800);

        endDate.setHours(endDate.getHours() - 8);
        endDate.setMinutes(endDate.getMinutes() - 0o0);
        let endDateFormat = endDate.getFullYear() + "-" +  (endDate.getMonth()+1) + "-" + endDate.getDate() + "T" + endDate.getHours() + ":" + endDate.getMinutes() + ":00";
      
        return this._httpClient.patch<PointRule>(`${this._apiurl}/items/point_rule/${id}`, 
            {
                "id": pointrule.id,
                "name": pointrule.name,
                "description": pointrule.description,
                "reward_code": pointrule.reward_code,
                "type": pointrule.type,
                "point_value": pointrule.point_value,
                "status": pointrule.status,
                "start_date": startDateFormat,
                "end_date": endDateFormat,
                "member_tier": pointrule.member_tier,
                "member_tierFullName": pointrule.member_tierFullName,
            }
        ).pipe(
            map((createPointRule) => {
                return createPointRule;
            })
        )
    }
    
}
