/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, ReplaySubject, tap, of } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    /**
     * Setter & getter for user role
     */
    set userRole(role: string) {
        localStorage.setItem('userRole', role);
    }
    set userRoleName(rolename: string) {
        localStorage.setItem('userRoleName', rolename);
    }
    get userRole(): string {
        return localStorage.getItem('userRole') ?? null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get(`${this._apiurl}/users/me?fields=*,role.*`).pipe(
            switchMap((response: any) => {
                const user = response.data;
                this.userRole = user.role.id;
                this.userRoleName = user.role.name;
                user.avatar = response.data.avatar
                    ? `${this._apiurl}/assets/${response.data.avatar}`
                    : null;
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
    update(user: User): Observable<any> {
        return this._httpClient.get(`${this._apiurl}/users/me`).pipe(
            switchMap((response: any) => {
                const result = response.data;
                result.avatar = response.data.avatar
                    ? `${this._apiurl}/assets/${response.data.avatar}`
                    : null;
                this._user.next(result);
                return of(result);
            })
        );
    }

    updateProfile(user: User): Observable<any> {
        return this._httpClient
            .patch<User>(`${this._apiurl}/users/me`, {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            })
            .pipe(
                map((updateUser) => {
                    return updateUser;
                })
            );
    }
    changePassword(pass: string): Observable<any> {
        return this._httpClient
            .patch<User>(`${this._apiurl}/users/me`, {
                password: pass,
            })
            .pipe(
                map((updatePass) => {
                    return updatePass;
                })
            );
    }
    checkCurrentPass(pass: string, email: string): Observable<any> {
        return this._httpClient
            .post<User>(`${this._apiurl}/auth/login`, {
                email: email,
                password: pass,
            })
            .pipe(
                map((updatePass) => {
                    return updatePass;
                })
            );
    }

    getUser(): Observable<User> {
        return this._httpClient.get<any>(`${this._apiurl}/users/me`)
            .pipe(
                tap((response) => {
                    const user = response.data;
                    this.userRole = user.role;
                    this._user.next(user);
                })
            );
    }

    updateOptAuthUrl(url: string): Observable<any> {
        return this._httpClient
            .patch<User>(`${this._apiurl}/users/me`, {
                tfa_url: url,
            })
            .pipe(
                map((updateUser) => {
                    return updateUser;
                })
            );
    }
    
}
