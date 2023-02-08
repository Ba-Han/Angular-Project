export interface ImportActivity {
    id: number,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    import_date: string,
    import_file: string,
    remark: string,
    job_completed_date: string,
    collection_name: string
}
export interface ImportActivityPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
