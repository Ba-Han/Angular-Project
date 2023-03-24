export interface User {
    id:string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    status: string;
    role:string;
    page_roles: string;
}

export interface UserPagination {
    length: number;
    limit: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface PermissionModel {
    page_id: number;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
}