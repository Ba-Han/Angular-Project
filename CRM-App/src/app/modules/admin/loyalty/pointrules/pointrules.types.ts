export interface PointRule {
    member_tierFullName: any;
    "id": number,
    "status": string,
    "user_created": string,
    "date_created": string,
    "user_updated": string,
    "date_updated": string,
    "name": string,
    "description": string,
    "type": string,
    "start_date": string,
    "end_date": string,
    "point_value": number,
    "reward_code": string,
    "member_tier": number,
}

export interface PointRulePaginagion {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
    
}
