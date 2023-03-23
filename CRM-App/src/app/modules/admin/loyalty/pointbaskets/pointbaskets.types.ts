export interface PointBasket {
    "id": number;
    "user_created": string;
    "date_created": string;
    "user_updated": string;
    "date_updated": string;
    "name": string;
    "description": string;
    "spending_type": number;
    "from_type": number;
    "from_number": number;
    "from_start_type": number;
    "from_start_date": string;
    "to_type": number;
    "to_number": number;
    "to_end_type": number;
    "to_end_date": string;
}

export interface PointBasketPagination
{
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
