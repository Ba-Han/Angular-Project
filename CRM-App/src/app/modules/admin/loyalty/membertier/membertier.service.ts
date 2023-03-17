import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberTier, MemberTierPagination, PointRule, PointRulePagination, PointSegment, MemberTierUpgrade, DWMemberGroup, DWMemberGroupPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MemberTierService {
    // Private
    private _pagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _memberTier: BehaviorSubject<MemberTier | null> = new BehaviorSubject(null);
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _pointRules: BehaviorSubject<PointRule[] | null> = new BehaviorSubject(null);
    private _pointRulePagination: BehaviorSubject<PointRulePagination | null> = new BehaviorSubject(null);
    private _tiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _dwMemberGroups: BehaviorSubject<DWMemberGroup[] | null> = new BehaviorSubject(null);
    private _dwMemberGroupspagination: BehaviorSubject<DWMemberGroupPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl= environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get memberTier$(): Observable<MemberTier> {
        return this._memberTier.asObservable();
    }

    get memberTiers$(): Observable<MemberTier[]> {
        return this._memberTiers.asObservable();
    }

    get pagination$(): Observable<MemberTierPagination> {
        return this._pagination.asObservable();
    }

    get pointRules$(): Observable<PointRule[]> {
        return this._pointRules.asObservable();
    }

    get pointrulepagination$(): Observable<PointRulePagination> {
        return this._pointRulePagination.asObservable();
    }

    get memberTierlevels(): Observable<MemberTier[]> {
        return this._tiers.asObservable();
    }

    get dwMemberGroups$(): Observable<DWMemberGroup[]> {
        return this._dwMemberGroups.asObservable();
    }

    get dwMemberGroupspagination$(): Observable<DWMemberGroupPagination> {
        return this._dwMemberGroupspagination.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get Member Tiers
     *
     *
     * @param page
     * @param limit
     * @param sort
     * @param order
     * @param search
     */
    getMemberTiers(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier?fields=*,point_rule.*`, {
            params: {
                meta: 'filter_count',
                fields: ['*.*'],
                page: page+1,
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
                const pagination ={
                    length    : memberTierLength,
                    limit     : limit,
                    page      : page,
                    lastPage  : lastPage,
                    startIndex: begin,
                    endIndex  : end - 1
                };
                //const memberTier = response.data;

                
                /* for (var i = 0; i < response.data.length; i++) {
                    if (response.data != null) {
                        response.data[i]["point_ruleFullname"] = response.data[i].point_rule.name;
                        response.data[i].point_rule = response.data[i].point_rule.id;
                    }
                    else {
                        response.data[i]["point_ruleFullname"] = "";
                        response.data[i].point_rule = "";
                    }
                    
                } */
                this._pagination.next(pagination);
                this._memberTiers.next(response.data);
            })
        );
    }

    /**
     * Get memberTier by id
     */
    getMemberTierById(id: number): Observable<MemberTier> {
        return this._httpClient.get(`${this._apiurl}/items/member_tier/${id}?fields=*,tier_upgrade_items.*,point_rule.*`
        ).pipe(
            tap((response: any) => {
                return this._memberTier.next(response.data);
            })
        );
    }

    getDWMemberGroups(page: number = 0, limit: number = 50, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: DWMemberGroupPagination; dwMemberGroups: DWMemberGroup[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier/dwmembergroups`, {
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
                const dwMemberGroupLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), dwMemberGroupLength);
                const lastPage = Math.max(Math.ceil(dwMemberGroupLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: dwMemberGroupLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._dwMemberGroupspagination.next(pagination);
                this._dwMemberGroups.next(response.data);
            })
        );
    }

    getPointRuleById(id: number, isdetail: boolean): Observable<PointRule> {
        if (isdetail) {
            return this._httpClient.get(`${this._apiurl}/items/point_rule/${id}?fields=*,point_basket.*`
            ).pipe(
                tap((response: any) => {
                    return response.data;
                })
            );
        }
        else {
            return this._httpClient.get(`${this._apiurl}/items/point_rule/${id}`
            ).pipe(
                tap((response: any) => {
                    return response.data;
                })
            );
        }
        
    }

    getPointSegmentById(id: number): Observable<PointSegment> {
        return this._httpClient.get(`${this._apiurl}/items/point_segment/${id}`
        ).pipe(
            tap((response: any) => {
                return response.data;
            })
        );
    }

    getSegmentDetailById(id: number): Observable<PointSegment> {
        return this._httpClient.get(`${this._apiurl}/items/point_segment/${id}`
        ).pipe(
            tap((response: any) => {
                return response.data;
            })
        );
    }

    getTierUpgradeById(id: number): Observable<MemberTierUpgrade> {
        return this._httpClient.get(`${this._apiurl}/items/member_tier_upgrade/${id}?fields=*,upgrade_tier.*`
        ).pipe(
            tap((response: any) => {
                return response.data;
            })
        );
    }

    getMemberTierLevels(): Observable<MemberTier[]> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`, {
            //params: { limit: 5, sort: '-date_created' }
        })
            .pipe(
                tap((response) => {
                    this._tiers.next(response.data);
                })
            );
    }

    createMemberTier(memberTier: MemberTier): Observable<MemberTier> {

        const periodValue = memberTier.downgrade_condition_period_value;

        if (periodValue === '')
        {
            return this.memberTiers$.pipe(
                take(1),
                switchMap(tiers => this._httpClient.post<any>(`${this._apiurl}/items/member_tier`, {
                    "status": memberTier.status,
                    "description": memberTier.description,
                    "name": memberTier.name,
                    "level": memberTier.level,
                    "condition_type": memberTier.condition_type,
                    "condition_period": memberTier.condition_period,
                    "condition_period_value": memberTier.condition_period_value,
                    "level_image": null,
                    "code": memberTier.code,
                    "min_condition_amount": memberTier.min_condition_amount,
                    "max_condition_amount": memberTier.max_condition_amount,
                    "downgrade_condition_type": memberTier.downgrade_condition_type,
                    "downgrade_condition_period": memberTier.downgrade_condition_period,
                    "downgrade_condition_period_value": null,
                    "dw_member_group": memberTier.dw_member_group,
                    /* "point_rule": memberTier.point_rule, */
                    "tier_upgrade_items": memberTier.tier_upgrade_items
                }).pipe(
                    map((newTier) => {
                        this._memberTiers.next([newTier.data, ...tiers]);
                        return newTier;
                    })
                ))
            );
        } else {
            return this.memberTiers$.pipe(
                take(1),
                switchMap(tiers => this._httpClient.post<any>(`${this._apiurl}/items/member_tier`, {
                    "status": memberTier.status,
                    "description": memberTier.description,
                    "name": memberTier.name,
                    "level": memberTier.level,
                    "condition_type": memberTier.condition_type,
                    "condition_period": memberTier.condition_period,
                    "condition_period_value": memberTier.condition_period_value,
                    "level_image": null,
                    "code": memberTier.code,
                    "min_condition_amount": memberTier.min_condition_amount,
                    "max_condition_amount": memberTier.max_condition_amount,
                    "downgrade_condition_type": memberTier.downgrade_condition_type,
                    "downgrade_condition_period": memberTier.downgrade_condition_period,
                    "downgrade_condition_period_value": memberTier.downgrade_condition_period_value,
                    "dw_member_group": memberTier.dw_member_group,
                    /* "point_rule": memberTier.point_rule, */
                    "tier_upgrade_items": memberTier.tier_upgrade_items
                }).pipe(
                    map((newTier) => {
                        this._memberTiers.next([newTier.data, ...tiers]);
                        return newTier;
                    })
                ))
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    UpdateMemberTier(id: number, memberTier: MemberTier): Observable<MemberTier[]> {

        const updateperiodValue = memberTier.downgrade_condition_period_value;

        if (updateperiodValue === '')
        {
            return this._httpClient.patch<MemberTier>(`${this._apiurl}/items/member_tier/${id}`, {
                "id": id,
                "status": memberTier.status,
                "description": memberTier.description,
                "name": memberTier.name,
                "level": memberTier.level,
                "condition_type": memberTier.condition_type,
                "condition_period": memberTier.condition_period,
                "condition_period_value": memberTier.condition_period_value,
                "level_image": null,
                "code": memberTier.code,
                "min_condition_amount": memberTier.min_condition_amount,
                "max_condition_amount": memberTier.max_condition_amount,
                "downgrade_condition_type": memberTier.downgrade_condition_type,
                "downgrade_condition_period": memberTier.downgrade_condition_period,
                "downgrade_condition_period_value": null,
                "dw_member_group": memberTier.dw_member_group,
                /* "point_rule": memberTier.point_rule, */
                "tier_upgrade_items": memberTier.tier_upgrade_items
    
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        } else {
            return this._httpClient.patch<MemberTier>(`${this._apiurl}/items/member_tier/${id}`, {
                "id": id,
                "status": memberTier.status,
                "description": memberTier.description,
                "name": memberTier.name,
                "level": memberTier.level,
                "condition_type": memberTier.condition_type,
                "condition_period": memberTier.condition_period,
                "condition_period_value": memberTier.condition_period_value,
                "level_image": null,
                "code": memberTier.code,
                "min_condition_amount": memberTier.min_condition_amount,
                "max_condition_amount": memberTier.max_condition_amount,
                "downgrade_condition_type": memberTier.downgrade_condition_type,
                "downgrade_condition_period": memberTier.downgrade_condition_period,
                "downgrade_condition_period_value": memberTier.downgrade_condition_period_value,
                "dw_member_group": memberTier.dw_member_group,
                /* "point_rule": memberTier.point_rule, */
                "tier_upgrade_items": memberTier.tier_upgrade_items
    
            }).pipe(
                tap((response: any) => {
                    return response.data;
                })
            )
        }
    }

    createPointSegment(pointsegment: PointSegment): Observable<PointSegment> {
        return this._httpClient.post<PointSegment>(`${this._apiurl}/items/point_segment`, {
            "status": pointsegment.status,
            "user_created": null,
            "date_created": null,
            "user_updated": null,
            "date_updated": null,
            "name": pointsegment.name,
            "description": pointsegment.description,
            "earning_from": pointsegment.earning_from,
            "earning_from_date": pointsegment.earning_from_date,
            "earning_from_day": pointsegment.earning_from_day,
            "earning_from_month": pointsegment.earning_from_month,
            "earning_to": pointsegment.earning_to,
            "earning_to_date": pointsegment.earning_to_date,
            "earning_to_day": pointsegment.earning_to_day,
            "earning_to_month": pointsegment.earning_to_month,
            "spending_from": pointsegment.spending_from,
            "spending_from_date": pointsegment.spending_from_date,
            "spending_from_day": pointsegment.spending_from_day,
            "spending_from_month": pointsegment.spending_from_month,
            "spending_to": pointsegment.spending_to,
            "spending_to_date": pointsegment.spending_to_date,
            "spending_to_day": pointsegment.spending_to_day,
            "spending_to_month": pointsegment.spending_to_month
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    UpdatePointSegment(id: number, pointsegment: PointSegment): Observable<PointSegment> {
        return this._httpClient.patch<PointSegment>(`${this._apiurl}/items/point_segment/${id}`, {
            "id": id,
            "status": pointsegment.status,
            "user_created": null,
            "date_created": null,
            "user_updated": null,
            "date_updated": null,
            "name": pointsegment.name,
            "description": pointsegment.description,
            "earning_from": pointsegment.earning_from,
            "earning_from_date": pointsegment.earning_from_date,
            "earning_from_day": pointsegment.earning_from_day,
            "earning_from_month": pointsegment.earning_from_month,
            "earning_to": pointsegment.earning_to,
            "earning_to_date": pointsegment.earning_to_date,
            "earning_to_day": pointsegment.earning_to_day,
            "earning_to_month": pointsegment.earning_to_month,
            "spending_from": pointsegment.spending_from,
            "spending_from_date": pointsegment.spending_from_date,
            "spending_from_day": pointsegment.spending_from_day,
            "spending_from_month": pointsegment.spending_from_month,
            "spending_to": pointsegment.spending_to,
            "spending_to_date": pointsegment.spending_to_date,
            "spending_to_day": pointsegment.spending_to_day,
            "spending_to_month": pointsegment.spending_to_month
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    createPointRule(pointrule: PointRule): Observable<PointRule> {
        return this._httpClient.post<PointRule>(`${this._apiurl}/items/point_rule`, {
            "status": pointrule.status,
            "user_created": pointrule.user_created,
            "date_created": pointrule.date_created,
            "user_updated": pointrule.user_updated,
            "date_updated": pointrule.date_updated,
            "name": pointrule.name,
            "description": pointrule.description,
            "type": pointrule.type,
            "start_date": pointrule.start_date,
            "end_date": pointrule.end_date,
            "point_value": pointrule.point_value,
            "reward_code": pointrule.reward_code,
            "point_basket": pointrule.point_basket
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    updatePointRule(id: number,pointrule: PointRule): Observable<PointRule> {
        return this._httpClient.patch<PointRule>(`${this._apiurl}/items/point_rule/${id}`, {
            "id": id,
            "status": pointrule.status,
            "user_created": pointrule.user_created,
            "date_created": pointrule.date_created,
            "user_updated": pointrule.user_updated,
            "date_updated": pointrule.date_updated,
            "name": pointrule.name,
            "description": pointrule.description,
            "type": pointrule.type,
            "start_date": pointrule.start_date,
            "end_date": pointrule.end_date,
            "point_value": pointrule.point_value,
            "reward_code": pointrule.reward_code,
            "point_basket": pointrule.point_basket
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    createTierUpgrade(tierupgrade: MemberTierUpgrade): Observable<MemberTierUpgrade> {
        return this._httpClient.post<MemberTierUpgrade>(`${this._apiurl}/items/member_tier_upgrade`, {
            "status": tierupgrade.status,
            "member_tier": tierupgrade.member_tier,
            "item_number": tierupgrade.item_number,
            "price": tierupgrade.price,
            "upgrade_tier": tierupgrade.upgrade_tier
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    updateTierUpgrade(id: number,tierupgrade: MemberTierUpgrade): Observable<MemberTierUpgrade> {
        return this._httpClient.patch<MemberTierUpgrade>(`${this._apiurl}/items/member_tier_upgrade/${id}`, {
            "id": tierupgrade.id,
            "status": tierupgrade.status,
            "member_tier": tierupgrade.member_tier,
            "item_number": tierupgrade.item_number,
            "price": tierupgrade.price,
            "upgrade_tier": tierupgrade.upgrade_tier
        }).pipe(
            tap((response: any) => {
                return response.data;
            })
        )
    }

    getTierList(): Observable<any> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`)
            .pipe(
                tap((response) => {
                    const tiers = response.data;
                    return tiers;
                })
            );
    }
}
