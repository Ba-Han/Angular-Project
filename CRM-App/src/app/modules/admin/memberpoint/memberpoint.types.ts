export interface MemberPoint {
    id: number,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    point_type: string,
    point_type_int: number,
    order_total: number,
    point_calculated_amount: number,
    reward_code: string,
    point: number,
    comment: string,
    earning_valid_from: string,
    earning_valid_to: string,
    spending_valid_from: string,
    spending_valid_to: string,
    transaction_document_no: string,
    member_code: string,
    member: number,
    point_basket: number,
    transaction: {
        "id": number,
        "real_amount": number,
        "total_amount": number,
        "vat_amount": number,
    }
}

export interface MemberPointPagination {
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
    date_created: string,
    date_updated: string,
    name: string,
    description: string,
    earning_from: string,
    earning_from_date: string,
    earning_from_day: number,
    earning_from_month: number,
    earning_to: string,
    earning_to_date: null,
    earning_to_day: number,
    earning_to_month: number,
    spending_from: string,
    spending_from_date: null,
    spending_from_day: number,
    spending_from_month: number,
    spending_to: string,
    spending_to_date: null,
    spending_to_day: number,
    spending_to_month: number,
    user_created: string,
    user_updated: string
}

export interface PointSegmentPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
