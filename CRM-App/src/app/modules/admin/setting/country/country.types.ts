export interface Country {
    code: string,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    name: string,
    calling_code: string
}

export interface CountryPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
