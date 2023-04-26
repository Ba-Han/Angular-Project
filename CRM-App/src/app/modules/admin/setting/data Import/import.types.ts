export interface ImportActivity {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id: number;
    member_code: string;
    name: string;
    email: string;
    member_tier_id: number;
    member_tier: string;
    date: string;
    points: number;
    expirydate: string;
    comment: string;
    reward_code: string;
    point_basket: string;
    document_no: string;
    point_rule: string;
}
export interface ImportActivityPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
