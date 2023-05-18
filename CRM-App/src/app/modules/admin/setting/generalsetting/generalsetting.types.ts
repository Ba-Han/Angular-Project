export interface GeneralSetting
{
    id: number;
    transaction_rounding: string;
    member_groups: string;
    //member_groupsName: string;
    user_groups: string;
    //user_groupsName: string;
    default_member_tier: string,
    //default_member_tierName: string,
    user_updated: string;
    date_updated: string;
    memberGroupArray: MemberGroup[];
    userGroupArray: UserGroup[];
    memberTierDefaultArray: MemberTier[];
}

export interface GeneralSettingExtended extends GeneralSetting {
    memberGroupArray: MemberGroup[];
    userGroupArray: UserGroup[];
    memberTierDefaultArray: MemberTier[];
}

export interface MemberTier
{
    id: number;
    name: string;
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

export interface MemberGroup
{
    id: number;
    name: string;
}

export interface UserGroup
{
    id: number;
    name: string;
}

export interface MemberGroupPaginagion {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface UserGroupPaginagion {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
