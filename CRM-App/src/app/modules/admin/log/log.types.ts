export interface Log {
    request_method: string;
    request_path: string;
    request_query_string: string;
    request_body: object;
    response_status_code: number;
    response_body_text: object;
    request_on: string;
    response_on: string;
    developer_message: string;
    is_error: boolean;
    login_user_name: string;
    login_user_id: number;
}

export interface LogPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
