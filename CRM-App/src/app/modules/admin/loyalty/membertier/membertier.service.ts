import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberTier, MemberTierPagination, MemberTierUpgrade, DWMemberGroup, DWMemberGroupPagination } from 'app/modules/admin/loyalty/membertier/membertier.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MemberTierService {
    // Private
    private _pagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _memberTier: BehaviorSubject<MemberTier | null> = new BehaviorSubject(null);
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
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
    getMemberTiers(page: number = 0, limit: number = 10, sort: string = 'level', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberTierPagination; memberTiers: MemberTier[] }> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`, {
            params: {
                meta: 'filter_count',
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

                this._pagination.next(pagination);
                this._memberTiers.next(response.data);
            })
        );
    }

    /**
     * Get memberTier by id
     */
    getMemberTierById(id: number): Observable<MemberTier> {
        return this._httpClient.get(`${this._apiurl}/items/member_tier/${id}`
        ).pipe(
            tap((response: any) => this._memberTier.next(response.data))
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

    getTierUpgradeById(id: number): Observable<MemberTierUpgrade> {
        return this._httpClient.get(`${this._apiurl}/items/member_tier_upgrade/${id}`
        ).pipe(
            tap((response: any) => response.data)
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteTierUpgradeById(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/member_tier_upgrade/${id}`,
        { responseType: 'text' })
        .pipe(
            map(() => true),
            catchError((error) => {
                console.error(error);
                return of(false);
            }));
    };

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteMemberTier(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/member_tier/${id}`,
        { observe: 'response' });
    };

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

        const conditionPeriod = !memberTier.condition_period ? 0 : memberTier.condition_period;
        const conditionPeriodValue = !memberTier.condition_period_value ? 0 : memberTier.condition_period_value;
        const minAmount = !memberTier.min_condition_amount ? 0 : memberTier.min_condition_amount;
        const maxAmount = !memberTier.max_condition_amount ? 0 : memberTier.max_condition_amount;
        const minPoint = !memberTier.min_point ? 0 : memberTier.min_point;
        const maxPoint = !memberTier.max_point ? 0 : memberTier.max_point;
        const downgradeConditionPeriod = !memberTier.downgrade_condition_period ? 0 : memberTier.downgrade_condition_period;
        const downgradeConditionPeriodValue = !memberTier.downgrade_condition_period_value ? 0 : memberTier.downgrade_condition_period_value;
        const totalMinPoint = !memberTier.total_min_amount ? 0 : memberTier.total_min_amount;
        const totalMaxPoint = !memberTier.total_max_amount ? 0 : memberTier.total_max_amount;
        const calculationType = !memberTier.calculation_type ? 0 : memberTier.calculation_type;

        return this.memberTiers$.pipe(
            take(1),
            switchMap(tiers => this._httpClient.post<any>(`${this._apiurl}/items/member_tier`, {
                "status": memberTier.status,
                "description": memberTier.description,
                "name": memberTier.name,
                "level": memberTier.level,
                "condition_type": memberTier.condition_type,
                "condition_period": conditionPeriod,
                "condition_period_value": conditionPeriodValue,
                "level_image": null,
                "code": memberTier.code,
                "min_condition_amount": minAmount,
                "max_condition_amount": maxAmount,
                "min_point": minPoint,
                "max_point": maxPoint,
                "calculation_type": calculationType,
                "total_min_amount": totalMinPoint,
                "total_max_amount": totalMaxPoint,
                "downgrade_condition_type": memberTier.downgrade_condition_type,
                "downgrade_condition_period": downgradeConditionPeriod,
                "downgrade_condition_period_value": downgradeConditionPeriodValue,
                "dw_member_group": memberTier.dw_member_group,
                "tier_upgrade_items": memberTier.tier_upgrade_items
            }).pipe(
                map((newTier) => {
                    this._memberTiers.next([newTier.data, ...tiers]);
                    return newTier;
                })
            ))
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    UpdateMemberTier(id: number, memberTier: MemberTier): Observable<MemberTier[]> {

        const conditionPeriod = !memberTier.condition_period ? 0 : memberTier.condition_period;
        const conditionPeriodValue = !memberTier.condition_period_value ? 0 : memberTier.condition_period_value;
        const minAmount = !memberTier.min_condition_amount ? 0 : memberTier.min_condition_amount;
        const maxAmount = !memberTier.max_condition_amount ? 0 : memberTier.max_condition_amount;
        const minPoint = !memberTier.min_point ? 0 : memberTier.min_point;
        const maxPoint = !memberTier.max_point ? 0 : memberTier.max_point;
        const downgradeConditionPeriod = !memberTier.downgrade_condition_period ? 0 : memberTier.downgrade_condition_period;
        const downgradeConditionPeriodValue = !memberTier.downgrade_condition_period_value ? 0 : memberTier.downgrade_condition_period_value;
        const totalMinPoint = !memberTier.total_min_amount ? 0 : memberTier.total_min_amount;
        const totalMaxPoint = !memberTier.total_max_amount ? 0 : memberTier.total_max_amount;
        const calculationType = !memberTier.calculation_type ? 0 : memberTier.calculation_type;

        return this._httpClient.patch<MemberTier>(`${this._apiurl}/items/member_tier/${id}`, {
            "id": id,
            "status": memberTier.status,
            "description": memberTier.description,
            "name": memberTier.name,
            "level": memberTier.level,
            "condition_type": memberTier.condition_type,
            "condition_period": conditionPeriod,
            "condition_period_value": conditionPeriodValue,
            "level_image": null,
            "code": memberTier.code,
            "min_condition_amount": minAmount,
            "max_condition_amount": maxAmount,
            "min_point": minPoint,
            "max_point": maxPoint,
            "calculation_type": calculationType,
            "total_min_amount": totalMinPoint,
            "total_max_amount": totalMaxPoint,
            "downgrade_condition_type": memberTier.downgrade_condition_type,
            "downgrade_condition_period": downgradeConditionPeriod,
            "downgrade_condition_period_value": downgradeConditionPeriodValue,
            "dw_member_group": memberTier.dw_member_group,
            "tier_upgrade_items": memberTier.tier_upgrade_items

        }).pipe(
            tap((response: any) => response.data)
        );
    }

    createTierUpgrade(tierupgrade: MemberTierUpgrade): Observable<MemberTierUpgrade> {
        return this._httpClient.post<MemberTierUpgrade>(`${this._apiurl}/items/member_tier_upgrade`, {
            "member_tier": tierupgrade.member_tier,
            "item_number": tierupgrade.item_number,
            "price": tierupgrade.price,
            "upgrade_tier": tierupgrade.upgrade_tier
        }).pipe(
            tap((response: any) => response.data)
        );
    }

    updateTierUpgrade(id: number,tierupgrade: MemberTierUpgrade): Observable<MemberTierUpgrade> {
        return this._httpClient.patch<MemberTierUpgrade>(`${this._apiurl}/items/member_tier_upgrade/${id}`, {
            "id": tierupgrade.id,
            "member_tier": tierupgrade.member_tier,
            "item_number": tierupgrade.item_number,
            "price": tierupgrade.price,
            "upgrade_tier": tierupgrade.upgrade_tier
        }).pipe(
            tap((response: any) => response.data)
        );
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
