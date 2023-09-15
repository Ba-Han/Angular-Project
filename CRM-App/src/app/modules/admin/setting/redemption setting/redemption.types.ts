export interface Redemption
{
    id: number;
    user_created: string;
    user_updated: string;
    date_created: string;
    date_updated: string;
    type: number;
    type_name: string;
    date_from: string;
    date_to: string;
    member_tier: number;
    member_tier_full_name: string;
    point_conversion: number;
    voucher_valid_days: number;
}

export interface RedemptionPagination {
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
