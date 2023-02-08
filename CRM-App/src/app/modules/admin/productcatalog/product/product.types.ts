export interface Product
{
    id: number,
    status: string,
    user_created: string,
    date_created: string,
    user_updated: string,
    date_updated: string,
    item_name: string,
    price: number,
    item_number: string
}

export interface ProductPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
