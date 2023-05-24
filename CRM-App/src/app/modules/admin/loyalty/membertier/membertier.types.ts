/* eslint-disable @typescript-eslint/naming-convention */
export interface DWMemberGroup
{
    id: number;
    name: string;
}

export interface DWMemberGroupPagination
{
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
    level: number;
    condition_type: number;
    condition_period: number;
    condition_period_value: number;
    min_condition_amount: number;
    max_condition_amount: number;
    min_point: number;
    max_point: number;
    calculation_type: number;
    total_min_amount: number;
    total_max_amount: number;
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

export interface MemberTierUpgrade {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    member_tier: number;
    item_number: string;
    price: number;
    upgrade_tier: number;

}
