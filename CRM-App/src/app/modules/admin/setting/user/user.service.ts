import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { User, UserPagination } from 'app/modules/admin/setting/user/user.types';
import { environment } from 'environments/environment';


@Injectable({
    providedIn: 'root'
})
export class CRMUserService {
    // Private
    private _pagination: BehaviorSubject<UserPagination | null> = new BehaviorSubject(null);
    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    private _user: BehaviorSubject<User | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<UserPagination> {
        return this._pagination.asObservable();
    }
    get users$(): Observable<User[]> {
        return this._users.asObservable();
    }
    get user$(): Observable<User> {
        return this._user.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Get countries
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getAppUsers(page: number = 0, limit: number = 10, sort: string = 'username', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: UserPagination; users: User[] }> {
        return this._httpClient.get(`${this._apiurl}/users`, {
                params: {
                    meta: 'filter_count',
                    page: page + 1,
                    limit: limit,
                    sort: sort,
                    order,
                    search
                }
            }).pipe(
                tap((response: any) => {
                    const totalLength = response.meta.filter_count;
                    const begin = page * limit;
                    const end = Math.min((limit * (page + 1)), totalLength);
                    const lastPage = Math.max(Math.ceil(totalLength / limit), 1);

                    // Prepare the pagination object
                    const pagination = {
                        length: totalLength,
                        limit: limit,
                        page: page,
                        lastPage: lastPage,
                        startIndex: begin,
                        endIndex: end - 1
                    };
                    this._pagination.next(pagination);
                    this._users.next(response.data);
                })
            );
    }

    /**
     * Get user by id
     */
    getUserById(id: string): Observable<User> {
        return this._httpClient.get<any>(`${this._apiurl}/users/${id}`)
            .pipe(
                tap((response) => {
                    const user = response.data;
                    this._user.next(user);
                })
            );
    }

    createUser(user: User): Observable<User> {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.post<any>(`${this._apiurl}/users`, {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "password": user.password,
                "status": user.status,
                "role": user.role
            }).pipe(
                map((newUser) => {
                    this._users.next([newUser.data, ...users]);
                    return newUser;
                })
            ))
        );
    }

    updateQRCode(id: string): Observable<any> {
        return this._httpClient.patch(`${this._apiurl}/users/resetqrcode/${id}`, {
        }, {observe: 'response'});
    }

    updatePermission(id: string, updatedPagePermission: any): Observable<any> {
        return this._httpClient.patch(`${this._apiurl}/users/updatepermission/${id}`, {
            'page_roles': updatedPagePermission
        }, {observe: 'response'});
    }
}
