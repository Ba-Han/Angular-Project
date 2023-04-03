/* eslint-disable @typescript-eslint/naming-convention */

export interface User
{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    language: string;
    avatar?: string;
    status?: string;
}

export interface page_roles
{
    id: number;
    sort: number;
    nav_id: string;
    title: string;
    type: string,
    link: string,
    parent_id: number,
    can_view: boolean,
    can_edit: boolean,
    can_delete: boolean
}
