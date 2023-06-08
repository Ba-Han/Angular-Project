export interface MemberLogs {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    updated_by: string;
    log_data: string;
}

export interface MemberLogsPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
