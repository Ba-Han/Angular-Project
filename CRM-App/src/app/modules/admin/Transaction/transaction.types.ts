export interface Transaction {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    member: string | number;
    document_no: string;
    purchase_date: string;
    document_type: string;
    transaction_date: string;
    real_amount: number;
    total_amount: number;
    vat_amount: number;
    vat_percent: number;
    fee_amount: number;
    discount_amount: number;
    total_quantity: number;
    delivery_amount: number;
    employee: number;
    status: string;
    referral_code: string;
    point: number;
    point_amount: number;
    point_type: string;
    point_id: number;
    transaction_channel: {
        'code': number;
        'name': string | null;
        'status': string;
    };
    store: {
        'code': number;
        'name': string | null;
    };
    transaction_details: [{
        "id": number;
        "date_created": string;
        "date_updated": string;
        "item_number": string;
        "item_name": string;
        "quantity": number;
        "unit_amount": number;
        "total_amount": number;
        "real_amount": number;
        "vat_amount": number;
        "vat_percent": number;
        "transaction": number;
    }];
    transaction_tenders: [{
        "id": 8;
        "date_created": string;
        "date_updated": string;
        "tender_type": string;
        "total_amount": number;
        "real_amount": number;
        "reference_no": string;
        "transaction": number;
    }];
}
export interface TransactionPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
