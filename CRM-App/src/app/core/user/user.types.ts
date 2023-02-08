/* eslint-disable @typescript-eslint/naming-convention */

export interface User
{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    language: string;
    avatar?: string;
    status?: string;
}
