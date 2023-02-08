/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, ReplaySubject, tap, of } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
        this._apiurl= environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    set user(value: User)
    {
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get(`${this._apiurl}/users/me`).pipe(
            switchMap((response: any) => {
                const user = response.data;
                user.avatar = response.data.avatar ? `${this._apiurl}/assets/${response.data.avatar}` : null;
                this._user.next(user);
                return of(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.get(`${this._apiurl}/users/me`).pipe(
            switchMap((response: any) => {
                const result = response.data;
                result.avatar = response.data.avatar ? `${this._apiurl}/assets/${response.data.avatar}` : null;
                this._user.next(result);
                return of(result);
            })
        );
    }
}
