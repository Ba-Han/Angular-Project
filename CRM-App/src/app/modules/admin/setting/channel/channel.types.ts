export interface Channel
{
    code: string;
    status?: string;
    user_created?: string;
    date_created?: string;
    user_updated?: string;
    date_updated?: string;
    name?: string;
}

export interface ChannelPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
