export interface GeneralSetting
{
    id: number;
    transaction_rounding: string;
    point_conversion: string;
    member_groups: string;
    //member_groupsName: string;
    user_groups: string;
    //user_groupsName: string;
    user_updated: string;
    date_updated: string;
    memberGroupArray: MemberGroup[];
    userGroupArray: UserGroup[];
}

export interface GeneralSettingExtended extends GeneralSetting {
    memberGroupArray: MemberGroup[];
    userGroupArray: UserGroup[];
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
