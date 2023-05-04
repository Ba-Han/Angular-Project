export interface PointRange
{
    id: number;
    user_created: string;
    user_updated: string;
    date_created: string;
    date_updated: string;
    start_type: number;
    start_day_type: number;
    end_type: number;
    end_day_type: number;
    end_day_value: number;
}

export interface PointRangePagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
