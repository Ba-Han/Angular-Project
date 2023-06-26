export interface PointRule {
    "member_tierFullName": any;
    "id": number;
    "status": string;
    "user_created": string;
    "date_created": string;
    "user_updated": string;
    "date_updated": string;
    "name": string;
    "description": string;
    "type": number;
    "start_date": string;
    "end_date": string;
    "point_value": number;
    "reward_code": string;
    "member_tier": number;
    "dollar_value": number;
    "point_amount": number;
    "min_expense": number;
    "point_rewarded_at": number;
    "basket_id": number;
    "point_basket": {name: string};
    "validity_type": string;
    "point_basketName": string;
    "store_selection_type": number;
    "store_codes": string;
    storeCodesArray: Store[];
    "new_member_to_earn_points": boolean;
    "new_member_point_amount": number;
    "priority": number;
    "stop_further": boolean;
    "point_rule_products": [];
    "point_rule_products_Fullname": string;
    "offer_apply": number;
    "offer_type": number;
    "no_of_orders": number;
    "offer_apply_month": number;
    "offer_apply_date": string;
}

export interface PointBasket {
    "id": number;
    "user_created": string;
    "date_created": string;
    "user_updated": string;
    "date_updated": string;
    "name": string;
    "description": string;
    "spending_type": number;
    "from_type": number;
    "from_number": number;
    "from_start_type": number;
    "from_start_date": string;
    "to_type": number;
    "to_number": number;
    "to_end_type": number;
    "to_end_date": string;
}

export interface PointBasketPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface PointRulePaginagion {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface MemberTier
{
    id: number;
    status: string;
    code: string;
    name: string;
    description?: string;
    level: string;
    condition_type: number;
    condition_period: number;
    condition_period_value: number;
    min_condition_amount: number;
    max_condition_amount: number;
    min_point: number;
    max_point: number;
    downgrade_condition_type: number;
    downgrade_condition_period: number;
    downgrade_condition_period_value: number;
    date_created: string;
    date_updated: string;
    dw_member_group: number;
    dw_member_groupName: string;
    tier_upgrade_items: [];
    tier_upgrade_Fullname: string;
}

export interface MemberTierPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface Store {
    code: string;
    status: string;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    region: string;
    country: string;
    channel_code: string;
}

export interface StorePagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface PointRuleProduct {
    id: number;
    index: number;
    product_number: string;
    extra_point_type: number;
    extra_point_value: number;
}

