export interface MemberPoint {
    id: number;
    status: string;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    point_type: string;
    point_type_int: number;
    order_total: number;
    point_calculated_amount: number;
    reward_code: string;
    point: number;
    comment: string;
    earning_valid_from: string;
    earning_valid_to: string;
    valid_from: string;
    valid_to: string;
    spending_valid_from: string;
    spending_valid_to: string;
    transaction_document_no: string;
    member_code: string;
    member: number;
    point_basket: number;
    transaction_id: number;
    transaction: {
        "id": number;
        "real_amount": number;
        "total_amount": number;
        "vat_amount": number;
    };
}

export interface MemberPointPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
