export interface User {
    id:string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    status: string,
    role:string
}

export interface UserPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
