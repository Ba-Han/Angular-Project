export interface MemberVoucher {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    member_id: number;
    voucher_code: string;
    points_used: number;
    conversion_rate: number;
    amount: number;
    status: string;
    balance: number;
    redeemed_order: string;
    expire_date: string;
}

export interface MemberVoucherPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
