import { PointBasketPagination } from './pointrules.types';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError, delay, catchError } from 'rxjs';
import { PointRule, PointRulePaginagion, PointBasket, MemberTier, MemberTierPagination, StorePagination, Store, PointRuleProduct, ProductType, ProductTypeSelection, ProductTypeSelectionPagination, AwardType } from 'app/modules/admin/loyalty/pointrules/pointrules.types';

@Injectable({
    providedIn: 'root'
})
export class PointRuleService {
    // Private
    private _pointRules: BehaviorSubject<PointRule[] | null> = new BehaviorSubject(null);
    private _productType: BehaviorSubject<ProductType[] | null> = new BehaviorSubject(null);
    private _awardType: BehaviorSubject<AwardType[] | null> = new BehaviorSubject(null);
    private _productTypeSelection: BehaviorSubject<ProductTypeSelection[] | null> = new BehaviorSubject(null);
    private _productTypeSelectionPagination: BehaviorSubject<ProductTypeSelectionPagination | null> = new BehaviorSubject(null);
    private _pointRule: BehaviorSubject<PointRule | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<PointRulePaginagion | null> = new BehaviorSubject(null);
    private _apiurl: string;
    private _memberTiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _pointBaskets: BehaviorSubject<PointBasket[] | null> = new BehaviorSubject(null);
    private _pointBasket: BehaviorSubject<PointBasket | null> = new BehaviorSubject(null);
    private _memberTierpagination: BehaviorSubject<MemberTierPagination | null> = new BehaviorSubject(null);
    private _pointBasketPagination: BehaviorSubject<PointBasketPagination | null> = new BehaviorSubject(null);
    private _storePagination: BehaviorSubject<StorePagination | null> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<Store[] | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pointRules$(): Observable<PointRule[]> {
        return this._pointRules.asObservable();
    }

    get productType$(): Observable<ProductType[]> {
        return this._productType.asObservable();
    }

    get awardType$(): Observable<AwardType[]> {
        return this._awardType.asObservable();
    }

    get productTypeSelection$(): Observable<ProductTypeSelection[]> {
        return this._productTypeSelection.asObservable();
    }

    get productTypeSelectionPagination$(): Observable<ProductTypeSelectionPagination> {
        return this._productTypeSelectionPagination.asObservable();
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

    get storePagination$(): Observable<StorePagination> {
        return this._storePagination.asObservable();
    }

    get stores$(): Observable<Store[]> {
        return this._stores.asObservable();
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

    getProductTypeSelection(value: string, page: number = 0, limit: number = 25, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: ProductTypeSelectionPagination; productTypeSelection: ProductTypeSelection[] }> {
        return this._httpClient.get(`${this._apiurl}/items/ecomproducts/${value}`, {
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
                this._productTypeSelectionPagination.next(pagination);
                this._productTypeSelection.next(response.data);
            })
        );
    }

    getStores(page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ storePagination: StorePagination; stores: Store[] }> {
        return this._httpClient.get(`${this._apiurl}/items/store`, {
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
                    this._storePagination.next(pagination);
                    this._stores.next(response.data);
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

    getProductType(): Observable<ProductType[]>
    {
        return this._httpClient.get<any>(`${this._apiurl}/items/point_rule/ecomproducttypes`).pipe(
            tap((response: any) => {
                this._productType.next(response);
            })
        );
    }

    getAwardType(): Observable<AwardType[]>
    {
        return this._httpClient.get<any>(`${this._apiurl}/items/point_rule/awardtypes`).pipe(
            tap((response: any) => {
                this._awardType.next(response);
            })
        );
    }

    createPointRule(pointrule: PointRule): Observable<PointRule> {
        const startDateValue = !pointrule.start_date ? null : pointrule.start_date;
        const endDateValue = !pointrule.end_date ? null : pointrule.end_date;
        const dollarValue = !pointrule.dollar_value ? 0 : pointrule.dollar_value;
        const pointValue = !pointrule.point_value ? 0 : pointrule.point_value;
        const pointAmount = !pointrule.point_amount ? 0 : pointrule.point_amount;
        const minimumExpense = !pointrule.min_expense ? 0 : pointrule.min_expense;
        const pointRewardedAt = !pointrule.point_rewarded_at ? 0 : pointrule.point_rewarded_at;
        const storeSelectionType = !pointrule.store_selection_type ? 0 : pointrule.store_selection_type;
        const storeCodes = !pointrule.store_codes ? '' : pointrule.store_codes.toString();
        const newMemberToEarnPoints = !pointrule.new_member_to_earn_points ? '' : pointrule.new_member_to_earn_points;
        const newMemberToEarnPointsValue = Boolean(newMemberToEarnPoints);
        const newMemberPointAamount = !pointrule.new_member_point_amount ? 0 : pointrule.new_member_point_amount;
        const priority = !pointrule.priority ? 0 : pointrule.priority;
        const stopFurther = !pointrule.stop_further ? '' : pointrule.stop_further;
        const stopFurtherValue = Boolean(stopFurther);
        const offerApply = !pointrule.offer_apply ? 0 : pointrule.offer_apply;
        const offerType = !pointrule.offer_type ? 0 : pointrule.offer_type;
        const offerApplyMonth = !pointrule.offer_apply_month ? 0 : pointrule.offer_apply_month;
        const offerApplyDate = !pointrule.offer_apply_date ? null : pointrule.offer_apply_date;
        const numberOfOrders = !pointrule.no_of_orders ? 0 : pointrule.no_of_orders;
        const validityType = !pointrule.validity_type ? 0 : pointrule.validity_type;
        const productType = !pointrule.product_type ? 0 : Number(pointrule.product_type);
        const productTypeSelection = !pointrule.product_type_selection ? '' : pointrule.product_type_selection;
        const productTypeSelectionText = !pointrule.product_type_selection_text ? '' : pointrule.product_type_selection_text;
        const productTypeMinExpense = !pointrule.product_type_min_expense ? 0 : pointrule.product_type_min_expense;
        const awardType = !pointrule.award_type ? 0 : Number(pointrule.award_type);

        return this.pointRules$.pipe(
            take(1),
            switchMap(pointrules => this._httpClient.post<any>(`${this._apiurl}/items/point_rule`, {
                "name": pointrule.name,
                "description": pointrule.description,
                "reward_code": pointrule.reward_code,
                "type": pointrule.type,
                "point_value": pointValue,
                "status": pointrule.status,
                "start_date": startDateValue,
                "end_date": endDateValue,
                "member_tier": pointrule.member_tier,
                "member_tierFullName": pointrule.member_tierFullName,
                "dollar_value": dollarValue,
                "point_amount": pointAmount,
                "min_expense": minimumExpense,
                "point_rewarded_at": pointRewardedAt,
                "basket_id": pointrule.basket_id,
                "point_basket": pointrule.point_basket,
                "validity_type": validityType,
                "store_selection_type": storeSelectionType,
                "store_codes": storeCodes,
                "new_member_to_earn_points": newMemberToEarnPointsValue,
                "new_member_point_amount": newMemberPointAamount,
                "priority": priority,
                "stop_further": stopFurtherValue,
                "point_rule_products": pointrule.point_rule_products,
                "offer_apply": offerApply,
                "offer_type": offerType,
                "no_of_orders": numberOfOrders,
                "offer_apply_month": offerApplyMonth,
                "offer_apply_date": offerApplyDate,
                "product_type": productType,
                "product_type_selection": productTypeSelection,
                "product_type_selection_text": productTypeSelectionText,
                "product_type_min_expense": productTypeMinExpense,
                "award_type": awardType
            }).pipe(
                map((newPointRule) => {
                    this._pointRules.next([newPointRule.data, ...pointrules]);
                    return newPointRule;
                })
            ))
        );
    }

    updatePointRule(id: number, pointrule: PointRule): Observable<PointRule> {
        const startDateValue = !pointrule.start_date ? null : pointrule.start_date;
        const endDateValue = !pointrule.end_date ? null : pointrule.end_date;
        const dollarValue = !pointrule.dollar_value ? 0 : pointrule.dollar_value;
        const pointValue = !pointrule.point_value ? 0 : pointrule.point_value;
        const pointAmount = !pointrule.point_amount ? 0 : pointrule.point_amount;
        const minimumExpense = !pointrule.min_expense ? 0 : pointrule.min_expense;
        const pointRewardedAt = !pointrule.point_rewarded_at ? 0 : pointrule.point_rewarded_at;
        const storeSelectionType = !pointrule.store_selection_type ? 0 : pointrule.store_selection_type;
        const storeCodes = !pointrule.store_codes ? '' : pointrule.store_codes.toString();
        const newMemberToEarnPoints = !pointrule.new_member_to_earn_points ? '' : pointrule.new_member_to_earn_points;
        const newMemberToEarnPointsValue = Boolean(newMemberToEarnPoints);
        const newMemberPointAamount = !pointrule.new_member_point_amount ? 0 : pointrule.new_member_point_amount;
        const priority = !pointrule.priority ? 0 : pointrule.priority;
        const stopFurther = !pointrule.stop_further ? '' : pointrule.stop_further;
        const stopFurtherValue = Boolean(stopFurther);
        const offerApply = !pointrule.offer_apply ? 0 : pointrule.offer_apply;
        const offerType = !pointrule.offer_type ? 0 : pointrule.offer_type;
        const offerApplyMonth = !pointrule.offer_apply_month ? 0 : pointrule.offer_apply_month;
        const offerApplyDate = !pointrule.offer_apply_date ? null : pointrule.offer_apply_date;
        const numberOfOrders = !pointrule.no_of_orders ? 0 : pointrule.no_of_orders;
        const validityType = !pointrule.validity_type ? 0 : pointrule.validity_type;
        const productType = !pointrule.product_type ? 0 : Number(pointrule.product_type);
        const productTypeSelection = !pointrule.product_type_selection ? '' : pointrule.product_type_selection;
        const productTypeSelectionText = !pointrule.product_type_selection_text ? '' : pointrule.product_type_selection_text;
        const productTypeMinExpense = !pointrule.product_type_min_expense ? 0 : pointrule.product_type_min_expense;
        const awardType = !pointrule.award_type ? 0 : Number(pointrule.award_type);

        return this._httpClient.patch<PointRule>(`${this._apiurl}/items/point_rule/${id}`,
            {
                "id": pointrule.id,
                "name": pointrule.name,
                "description": pointrule.description,
                "reward_code": pointrule.reward_code,
                "type": pointrule.type,
                "point_value": pointValue,
                "status": pointrule.status,
                "start_date": startDateValue,
                "end_date": endDateValue,
                "member_tier": pointrule.member_tier,
                "member_tierFullName": pointrule.member_tierFullName,
                "dollar_value": dollarValue,
                "point_amount": pointAmount,
                "min_expense": minimumExpense,
                "point_rewarded_at": pointRewardedAt,
                "basket_id": pointrule.basket_id,
                "point_basket": pointrule.point_basket,
                "validity_type": validityType,
                "store_selection_type": storeSelectionType,
                "store_codes": storeCodes,
                "new_member_to_earn_points": newMemberToEarnPointsValue,
                "new_member_point_amount": newMemberPointAamount,
                "priority": priority,
                "stop_further": stopFurtherValue,
                "point_rule_products": pointrule.point_rule_products,
                "offer_apply": offerApply,
                "offer_type": offerType,
                "no_of_orders": numberOfOrders,
                "offer_apply_month": offerApplyMonth,
                "offer_apply_date": offerApplyDate,
                "product_type": productType,
                "product_type_selection": productTypeSelection,
                "product_type_selection_text": productTypeSelectionText,
                "product_type_min_expense": productTypeMinExpense,
                "award_type": awardType
            }
        ).pipe(
            map(createPointRule => createPointRule)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeletePointRule(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/point_rule/${id}`,
        { observe: 'response' });
    };
}
