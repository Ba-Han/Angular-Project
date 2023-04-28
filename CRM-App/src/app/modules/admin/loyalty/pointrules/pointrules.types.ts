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
    "dollar_value": number,
    "point_amount": number,
    "min_expense": number,
    "point_rewarded_at": number,
    "basket_id": number,
    "point_basket": {name: string},
    "validity_type": string,
    "point_basketName": string,
}

export interface PointBasket {
    "id": number,
    "user_created": string,
    "date_created": string,
    "user_updated": string,
    "date_updated": string,
    "name": string,
    "description": string,
    "spending_type": number,
    "from_type": number,
    "from_number": number,
    "from_start_type": number,
    "from_start_date": string,
    "to_type": number,
    "to_number": number,
    "to_end_type": number,
    "to_end_date": string,
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

