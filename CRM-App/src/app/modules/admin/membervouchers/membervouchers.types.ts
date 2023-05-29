export interface MemberVoucher {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    voucher_code: string;
    points_used: string;
    conversion_rate: number;
    amount: number;
    status: string;
    redeemed_order: string;
    member: number;
}

export interface MemberVoucherPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
