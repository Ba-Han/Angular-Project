/* eslint-disable @typescript-eslint/naming-convention */
export interface MemberTier
{
    id: number;
    status: string;
    code: string;
    name: string;
    description?: string;
    level: string;
    condition_type: string;
    condition_period: string;
    condition_period_value: string;
    min_condition_amount: string;
    max_condition_amount: string;
    point_rule: [];
    downgrade_condition_type: string;
    downgrade_condition_period: string;
    downgrade_condition_period_value: string;
    date_created: string,
    date_updated: string,
    point_ruleFullname: string,
    tier_upgrade_items: [],
    tier_upgrade_Fullname: string,
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

export interface PointRule {
    id: 1,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    name: string,
    description: string,
    type: string,
    start_date: string,
    end_date: string,
    point_value: number,
    reward_code: string,
    point_basket: []
}
export interface PointRulePagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface PointSegment {
    id: number,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    name: string,
    description: string,
    earning_from: string,
    earning_from_date: string,
    earning_from_day: number,
    earning_from_month: number,
    earning_to: string,
    earning_to_date: string,
    earning_to_day: number,
    earning_to_month: number,
    spending_from: string,
    spending_from_date: string,
    spending_from_day: number,
    spending_from_month: number,
    spending_to: string,
    spending_to_date: number,
    spending_to_day: number,
    spending_to_month: number
}

export interface point_segment_id {
    status: string,
    name: string,
    description: string,
    earning_from: string,
    earning_from_date: string,
    earning_from_day: number,
    earning_from_month: number,
    earning_to: string,
    earning_to_date: string,
    earning_to_day: number,
    earning_to_month: number,
    spending_from: string,
    spending_from_date: string,
    spending_from_day: number,
    spending_from_month: number,
    spending_to: string,
    spending_to_date: number,
    spending_to_day: number,
    spending_to_month: number
}

export interface MemberTierUpgrade {
    id: number,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    member_tier: number,
    item_number: string,
    price: number,
    upgrade_tier: number

}
