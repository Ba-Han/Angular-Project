/* eslint-disable @typescript-eslint/naming-convention */
export interface Member
{
    member: [{
        'accept_email': boolean;
        'accept_marketing': boolean;
        'accept_mobile_sms': boolean;
        'accept_terms': boolean;
        'address_building': string;
        'address_line_1': string;
        'address_line_2': string;
        'address_unit': string;
        'birth_month': string;
        'city': string;
        'company_name': string;
        'country': string;
        'date_created': string;
        'date_of_birth': string;
        'date_updated': string;
        'email': string;
        'first_name': string;
        'gender': string;
        'id': number;
        'last_name': string;
        'member_card': string;
        'member_code': string;
        'member_photo': string;
        'member_tier': string;
        'member_tier_id': number;
        'mobile_phone': string;
        'postal_code': string;
        'referral_code': string;
        'region': null;
        'registration_channel': string;
        'registration_date': string;
        'state': string;
        'status': string;
        'store': string;
        'tax_identification_no': string;
        'user_created': string;
        'user_updated': string;
        'point_conversion': number;
    }];
    earning: {
        'totalPoint': number;
        'expiredTotalPoints': number;
        'dollerValueEarningExpired': number;
        'earning_valid_from': string;
        'earning_valid_to': string;
        'spending_valid_from': string;
        'spending_valid_to': string;
    };
    spending: {
        'totalPoint': number;
        'expiredTotalPoints': number;
        'dollerValueSpendingExpired': number;
        'earning_valid_from': string;
        'earning_valid_to': string;
        'spending_valid_from': string;
        'spending_valid_to': string;
    };
    soonExpiredPoint: {
        'soonExpiredPoints': number;
        'soonExpiredDollars': number;
        'soonExpiredDate': string;
    };
}

export interface MemberPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface Country
{
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag
{
    id?: string;
    title?: string;
}

export interface MemberDocument {
    id: number;
    uploaded_by: number;
    uploaded_on: string;
    member_id: number;
    member_code: string;
    document_name: string;
    comment: string;
    file_path: string;
    uploaded_by_name: string;
}

export interface MemberDocumentPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface MemberPoint {
    id: number;
    status: string;
    point_type: string;
    reward_code: string;
    point: number;
    transaction_document_no: string;
    member: string;
    date_created: string;
    comment: string;
    spending_valid_to: string;
    spending_valid_from: string;
    earning_valid_to: string;
    earning_valid_from: string;
}

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
    real_amount: string;
    total_amount: string;
    vat_amount: string;
    vat_percent: string;
    fee_amount: string;
    discount_amount: string;
    total_quantity: string;
    delivery_amount: string;
    store: null;
    employee: null;
    status: string;
    transaction_channel: {
        'id': number;
        'status': string;
        'user_created': string;
        'date_created': string;
        'user_updated': string | null;
        'date_updated': string | null;
        'channel_code': string;
        'channel_name': string;
    };
}

export interface MemberInfo {
    'accept_email': boolean;
    'accept_marketing': boolean;
    'accept_mobile_sms': boolean;
    'accept_terms': boolean;
    'address_building': string;
    'address_line_1': string;
    'address_line_2': string;
    'address_unit': string;
    'birth_month': string;
    'city': string;
    'company_name': string;
    'country': string;
    'date_created': string;
    'date_of_birth': string;
    'date_updated': string;
    'email': string;
    'first_name': string;
    'gender': string;
    'id': number;
    'last_name': string;
    'member_card': string;
    'member_code': string;
    'member_photo': string;
    'member_tier': number;
    'mobile_phone': string;
    'postal_code': string;
    'referral_code': string;
    'region': null;
    'registration_channel': string;
    'registration_date': string;
    'state': string;
    'status': string;
    'store': string;
    'tax_identification_no': string;
    'user_created': string;
    'user_updated': string;
}

export interface MemberTier {
    id: number;
    name?: string;
}

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
}

export interface MemberLogs {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    updated_by: string;
    log_data: string;
}


