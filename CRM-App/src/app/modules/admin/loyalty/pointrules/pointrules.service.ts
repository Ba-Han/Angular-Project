import { PointBasketPagination } from './pointrules.types';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError, delay } from 'rxjs';
import { PointRule, PointRulePaginagion, PointBasket } from 'app/modules/admin/loyalty/pointrules/pointrules.types';
import { MemberTier, MemberTierPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';

@Injectable({
    providedIn: 'root'
})
export class PointRuleService {
    // Private
    private _pointRules: BehaviorSubject<PointRule[] | null> = new BehaviorSubject(null);
    private _pointRule: BehaviorSubject<PointRule | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<PointRulePaginagion | null> = new BehaviorSubject(null);
    private _apiurl: string;
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _pointBaskets: BehaviorSubject<PointBasket[] | null> = new BehaviorSubject(null);
    private _pointBasket: BehaviorSubject<PointBasket | null> = new BehaviorSubject(null);
    private _memberTierpagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _pointBasketPagination: BehaviorSubject<PointBasketPagination | null> = new BehaviorSubject(null);
 
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pointRules$(): Observable<PointRule[]> {
        return this._pointRules.asObservable();
    }

    get pointRule$(): Observable<PointRule> {
        return this._pointRule.asObservable();
    }

    get pointBasket$(): Observable<PointBasket> {
        return this._pointBasket.asObservable();
    }

    get pagination$(): Observable<PointRulePaginagion> {
        return this._pagination.asObservable();
    }

     get memberTiers$(): Observable<MemberTier[]> {
        return this._memberTiers.asObservable();
    }

    get pointBaskets$(): Observable<PointBasket[]> {
        return this._pointBaskets.asObservable();
    }

    get pointBasketPagination$(): Observable<PointBasketPagination> {
        return this._pointBasketPagination.asObservable();
    }

    get memberTierpagination$(): Observable<PointRulePaginagion> {
        return this._memberTierpagination.asObservable();
    }
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

    getPointBaskets(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: PointBasketPagination; pointBaskets: PointBasket[] }> {
        return this._httpClient.get(`${this._apiurl}/items/point_basket`, {
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
                const pointBasketLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), pointBasketLength);
                const lastPage = Math.max(Math.ceil(pointBasketLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: pointBasketLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._pointBasketPagination.next(pagination);
                this._pointBaskets.next(response.data);
            })
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

    getPointRuleById(id: number): Observable<PointRule> {
        return this._httpClient.get<any>(`${this._apiurl}/items/point_rule/${id}`)
            .pipe(
                tap((response) => {
                    const pointrule = response.data;
                    this._pointRule.next(pointrule);
                })
            );
    }

    getPointBasketById(id: number): Observable<PointBasket> {
        return this._httpClient.get(`${this._apiurl}/items/point_basket/${id}`
        ).pipe(
            tap((response: any) => {
                return response.data;
            })
        );
    }

    getBasketDetailById(id: number): Observable<PointBasket> {
        return this._httpClient.get(`${this._apiurl}/items/point_basket/${id}`
        ).pipe(
            tap((response: any) => {
                return response.data;
            })
        );
    }

    createPointBasket(pointbasket: PointBasket): Observable<PointBasket> {

        const fromNumber = pointbasket.from_number;
        const fromStartType = pointbasket.from_start_type;
        const fromType = pointbasket.from_type;

        const toNumber = pointbasket.to_number;
        const toEndType = pointbasket.to_end_type;
        const toType = pointbasket.to_type;

        if(fromNumber === null || fromStartType === null || fromType=== null || toNumber === null || toEndType === null || toType === null) {
            return this._httpClient.post<PointBasket>(`${this._apiurl}/items/point_basket`, {
                "user_created": pointbasket.user_created,
                "date_created": pointbasket.date_created,
                "user_updated": pointbasket.user_updated,
                "date_updated": pointbasket.date_updated,
                "name": pointbasket.name,
                "description": pointbasket.description,
                "spending_type": pointbasket.spending_type,
                //"from_type": pointbasket.from_type,
                //"from_number": pointbasket.from_number,
                //"from_start_type": pointbasket.from_start_type,
                "from_start_date": pointbasket.from_start_date,
                //"to_type": pointbasket.to_type,
                //"to_number": pointbasket.to_number,
                //"to_end_type": pointbasket.to_end_type,
                "to_end_date": pointbasket.to_end_date,
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        } else {
            return this._httpClient.post<PointBasket>(`${this._apiurl}/items/point_basket`, {
                "user_created": pointbasket.user_created,
                "date_created": pointbasket.date_created,
                "user_updated": pointbasket.user_updated,
                "date_updated": pointbasket.date_updated,
                "name": pointbasket.name,
                "description": pointbasket.description,
                "spending_type": pointbasket.spending_type,
                "from_type": pointbasket.from_type,
                "from_number": pointbasket.from_number,
                "from_start_type": pointbasket.from_start_type,
                "from_start_date": pointbasket.from_start_date,
                "to_type": pointbasket.to_type,
                "to_number": pointbasket.to_number,
                "to_end_type": pointbasket.to_end_type,
                "to_end_date": pointbasket.to_end_date,
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        }
    }

    updatePointBasket(id: number, pointbasket: PointBasket): Observable<PointBasket> {

        const fromNumber = pointbasket.from_number;
        const fromStartType = pointbasket.from_start_type;
        const fromType = pointbasket.from_type;

        const toNumber = pointbasket.to_number;
        const toEndType = pointbasket.to_end_type;
        const toType = pointbasket.to_type;

        if(fromNumber === null || fromStartType === null || fromType=== null || toNumber === null || toEndType === null || toType === null) {
            return this._httpClient.post<PointBasket>(`${this._apiurl}/items/point_basket/${id}`, {
                "id": id,
                "user_created": pointbasket.user_created,
                "date_created": pointbasket.date_created,
                "user_updated": pointbasket.user_updated,
                "date_updated": pointbasket.date_updated,
                "name": pointbasket.name,
                "description": pointbasket.description,
                "spending_type": pointbasket.spending_type,
                //"from_type": pointbasket.from_type,
                //"from_number": pointbasket.from_number,
                //"from_start_type": pointbasket.from_start_type,
                "from_start_date": pointbasket.from_start_date,
                //"to_type": pointbasket.to_type,
                //"to_number": pointbasket.to_number,
                //"to_end_type": pointbasket.to_end_type,
                "to_end_date": pointbasket.to_end_date,
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        } else {
            return this._httpClient.post<PointBasket>(`${this._apiurl}/items/point_basket/${id}`, {
                "id": id,
                "user_created": pointbasket.user_created,
                "date_created": pointbasket.date_created,
                "user_updated": pointbasket.user_updated,
                "date_updated": pointbasket.date_updated,
                "name": pointbasket.name,
                "description": pointbasket.description,
                "spending_type": pointbasket.spending_type,
                "from_type": pointbasket.from_type,
                "from_number": pointbasket.from_number,
                "from_start_type": pointbasket.from_start_type,
                "from_start_date": pointbasket.from_start_date,
                "to_type": pointbasket.to_type,
                "to_number": pointbasket.to_number,
                "to_end_type": pointbasket.to_end_type,
                "to_end_date": pointbasket.to_end_date,
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        }
    }

    createPointRule(pointrule: PointRule): Observable<PointRule> {
        /**
         * Fix date issue in derectus. 
         * Need to add time greater than 12.00 PM.
         */
        const dateValue = pointrule.start_date;
        const parsedDate = Date.parse(dateValue);

        const dateValue1 = pointrule.end_date;
        const parseEndDate = Date.parse(dateValue1);
        if (isNaN(parsedDate) && isNaN(parseEndDate))
        {
            return this.pointRules$.pipe(
                take(1),
                switchMap(pointrules => this._httpClient.post<any>(`${this._apiurl}/items/point_rule`, {
                    "name": pointrule.name,
                    "description": pointrule.description,
                    "reward_code": pointrule.reward_code,
                    "type": pointrule.type,
                    "point_value": pointrule.point_value,
                    "status": pointrule.status,
                    "start_date": null,
                    "end_date": null,
                    "member_tier": pointrule.member_tier,
                    "member_tierFullName": pointrule.member_tierFullName,
                    "dollar_value": pointrule.dollar_value,
                    "basket_id": pointrule.basket_id,
                    "point_basketName": pointrule.point_basketName,
                    "validity_type": pointrule.validity_type,
                }).pipe(
                    map((newPointRule) => {
                        this._pointRules.next([newPointRule.data, ...pointrules]);
                        return newPointRule;
                    })
                ))
            );
        }
        else
        {
            /* let startDate:any = new Date(pointrule.start_date);

            // startDate.setMinutes(800);
            startDate.setHours(startDate.getHours() - 8);
            startDate.setMinutes(startDate.getMinutes() - 0o0);
            let startDateFormat = startDate.getFullYear() + "-" +  (startDate.getMonth()+1) + "-" + startDate.getDate() + "T" + startDate.getHours() + ":" + startDate.getMinutes() + ":00";


            let endDate:any = new Date(pointrule.end_date);
            // endDate.setMinutes(800);
            endDate.setHours(endDate.getHours() - 8);
            endDate.setMinutes(endDate.getMinutes() - 0o0);
            let endDateFormat = endDate.getFullYear() + "-" +  (endDate.getMonth()+1) + "-" + endDate.getDate() + "T" + endDate.getHours() + ":" + endDate.getMinutes() + ":00"; */

            return this.pointRules$.pipe(
                take(1),
                switchMap(pointrules => this._httpClient.post<any>(`${this._apiurl}/items/point_rule`, {
                    "name": pointrule.name,
                    "description": pointrule.description,
                    "reward_code": pointrule.reward_code,
                    "type": pointrule.type,
                    "point_value": pointrule.point_value,
                    "status": pointrule.status,
                    "start_date": pointrule.start_date,
                    "end_date": pointrule.end_date,
                    "member_tier": pointrule.member_tier,
                    "member_tierFullName": pointrule.member_tierFullName,
                    "dollar_value": pointrule.dollar_value,
                    "basket_id": pointrule.basket_id,
                    "point_basket": pointrule.point_basket,
                    "validity_type": pointrule.validity_type,
                }).pipe(
                    map((newPointRule) => {
                        this._pointRules.next([newPointRule.data, ...pointrules]);
                        return newPointRule;
                    })
                ))
            );
        }
    }

    updatePointRule(id: number, pointrule: PointRule): Observable<PointRule> {
        /**
         * Fix date issue in derectus. 
         * Need to add time greater than 12.00 PM.
         */

        const dateValue = pointrule.start_date;
        const parsedDate = Date.parse(dateValue);

        const dateValue1 = pointrule.end_date;
        const parseEndDate = Date.parse(dateValue1);

        if (isNaN(parsedDate) && isNaN(parseEndDate))
        {
            return this._httpClient.patch<PointRule>(`${this._apiurl}/items/point_rule/${id}`,
            {
                "id": pointrule.id,
                "name": pointrule.name,
                "description": pointrule.description,
                "reward_code": pointrule.reward_code,
                "type": pointrule.type,
                "point_value": pointrule.point_value,
                "status": pointrule.status,
                "start_date": null,
                "end_date": null,
                "member_tier": pointrule.member_tier,
                "member_tierFullName": pointrule.member_tierFullName,
                "dollar_value": pointrule.dollar_value,
                "basket_id": pointrule.basket_id,
                "point_basket": pointrule.point_basket,
                "validity_type": pointrule.validity_type,
            }
        ).pipe(
            map((createPointRule) => {
                return createPointRule;
            })
        )
        }
        else {
            /* let startDate:any = new Date(pointrule.start_date);
            // startDate.setMinutes(800);
            
            startDate.setHours(startDate.getHours() - 8);
            startDate.setMinutes(startDate.getMinutes() - 0o0);
            let startDateFormat = startDate.getFullYear() + "-" +  (startDate.getMonth()+1) + "-" + startDate.getDate() + "T" + startDate.getHours() + ":" + startDate.getMinutes() + ":00";

            let endDate:any = new Date(pointrule.end_date);
            // endDate.setMinutes(800);

            endDate.setHours(endDate.getHours() - 8);
            endDate.setMinutes(endDate.getMinutes() - 0o0);
            let endDateFormat = endDate.getFullYear() + "-" +  (endDate.getMonth()+1) + "-" + endDate.getDate() + "T" + endDate.getHours() + ":" + endDate.getMinutes() + ":00"; */
        
            return this._httpClient.patch<PointRule>(`${this._apiurl}/items/point_rule/${id}`,
                {
                    "id": pointrule.id,
                    "name": pointrule.name,
                    "description": pointrule.description,
                    "reward_code": pointrule.reward_code,
                    "type": pointrule.type,
                    "point_value": pointrule.point_value,
                    "status": pointrule.status,
                    "start_date": pointrule.start_date,
                    "end_date": pointrule.end_date,
                    "member_tier": pointrule.member_tier,
                    "member_tierFullName": pointrule.member_tierFullName,
                    "dollar_value": pointrule.dollar_value,
                    "basket_id": pointrule.basket_id,
                    "point_basket": pointrule.point_basket,
                    "validity_type": pointrule.validity_type,
                }
            ).pipe(
                map((createPointRule) => {
                    return createPointRule;
                })
            )
        }
    }
}
