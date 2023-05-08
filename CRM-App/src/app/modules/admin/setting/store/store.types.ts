export interface Store {
    code: string;
    status: string;
    user_created: string;
    date_created: string;
    user_updated: string;
    date_updated: string;
    name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    region: string;
    country: string;
    channel_code: string;
}

export interface StorePagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

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

