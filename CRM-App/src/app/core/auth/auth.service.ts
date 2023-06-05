/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { dateInputsHaveChanged } from '@angular/material/datepicker/datepicker-input-base';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private _apiurl: string = '';
    private _appUrl: string = '';
    private _router: ActivatedRoute;
    _tfaEnableInApp: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private router: ActivatedRoute
    ) {
        this._apiurl = environment.apiurl;
        this._appUrl = window.location.origin;
        this._router = router;
        this._tfaEnableInApp = environment.tfaEnable;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for otp auth url
     */
    set otpAuthUrl(url: string) {
        localStorage.setItem('otpAuthUrl', url);
    }

    get otpAuthUrl(): string {
        return localStorage.getItem('otpAuthUrl') ?? '';
    }

    /**
     * Setter & getter foraccess token
     */
    set accessTokenTfa(token: string) {
        localStorage.setItem('accessTokenTfa', token);
    }

    get accessTokenTfa(): string {
        return localStorage.getItem('accessTokenTfa') ?? '';
    }

    /**
     * Setter & getter for secret
     */
    set tfaSecret(secret: string) {
        localStorage.setItem('tfaSecret', secret);
    }

    get tfaSecret(): string {
        return localStorage.getItem('tfaSecret') ?? '';
    }

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     */
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    /**
     * Setter & getter for token expire
     */
    set tokenExpires(expires: Date) {
        localStorage.setItem('tokenExpires', expires.toString());
    }

    get tokenExpires(): Date {
        return new Date(localStorage.getItem('tokenExpires')) ?? null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${this._apiurl}/auth/password/request`, {
            email: email,
            reset_url: `${this._appUrl}/reset-password`,
        });
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        const accessToken: string =
            this.router.snapshot.queryParamMap.get('token');
        return this._httpClient.post(`${this._apiurl}/auth/password/reset`, {
            token: accessToken,
            password: password,
        });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: {
        email: string;
        password: string;
        otp: string;
    }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${this._apiurl}/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    if (response.data) {
                        if (this._tfaEnableInApp && !credentials.otp) {
                            this.accessTokenTfa = ((response.data && response.data.access_token) ? response.data.access_token : '');
                            return of(response);
                        } else {
                            // Store the access token in the local storage
                            this.accessTokenTfa = ((response.data && response.data.access_token) ? response.data.access_token : '');
                            this.accessToken = response.data.access_token;
                            this.refreshToken = response.data.refresh_token;
                            const expires = new Date();
                            expires.setMilliseconds(
                                expires.getMilliseconds() +
                                    response.data.expires
                            );
                            this.tokenExpires = expires;

                            // Set the authenticated flag to true
                            this._authenticated = true;
                            // Store the user on the user service
                            this._userService.user = response.user;

                            // Return a new observable with the response
                            return of(response);
                        }
                    }
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient
            .post(`${this._apiurl}/auth/refresh`, {
                refresh_token: this.refreshToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = ((response.data) ? response.data.access_token : '');
                    this.refreshToken = ((response.data) ? response.data.refresh_token : '');
                    const expires = new Date();
                    expires.setMilliseconds(
                        expires.getMilliseconds() + ((response.data) ? response.data.expires :0)
                    );
                    this.tokenExpires = expires;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');

        // Set the authenticated flag to false
        this._authenticated = false;

        return this._httpClient.post(`${this._apiurl}/auth/logout`, {
            refresh_token: this.refreshToken,
        });

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    // signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    // {
    //     return this._httpClient.post('api/auth/sign-up', user);
    // }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient
            .post(`${this._apiurl}/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.data.access_token;
                    this.refreshToken = response.data.refresh_token;
                    const expires = new Date();
                    expires.setMilliseconds(
                        expires.getMilliseconds() + response.data.expires
                    );
                    this.tokenExpires = expires;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }
        const now = new Date();
        // Check the access token expire date
        if (this.tokenExpires < now) {
            return this.signInUsingToken();
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
    /**
     *
     * @param token
     * @param password
     * @returns
     */
    generateTwoFactorSecret(token: string, password: string): Observable<any> {
        const headers = { Authorization: 'Bearer ' + token };
        const body = {
            password: password,
        };

        return this._httpClient
            .post(`${this._apiurl}/users/me/tfa/generate`, body, { headers })
            .pipe(
                switchMap((response: any) => {
                    if (response.data) {
                        // Return a new observable with the response
                        this.tfaSecret =
                            response.data && response.data.secret
                                ? response.data.secret
                                : '';
                        this.otpAuthUrl = response.data.otpauth_url
                            ? response.data.otpauth_url
                            : '';
                        return of(response);
                    }
                })
            );
    }

    /**
     *
     * @param otp
     * @param secret
     * @returns
     */
    enableTFA(otp: string, secret: string): Observable<any> {
        const headers = { Authorization: 'Bearer ' + this.accessTokenTfa };
        const body = {
            otp: otp,
            secret: secret,
        };
        return this._httpClient.post(
            `${this._apiurl}/users/me/tfa/enable`,
            body,
            { headers }
        );
    }

    sendQRCodeLink(email: string): Observable<any> {
        const headers = { Authorization: 'Bearer ' + '5dutgiMfxSRfLfd8WehnT9-Qf7_H0fQC' };
        return this._httpClient.post(`${this._apiurl}/utility/send-tfa-mail`, {
            email: email,
            qrCodeUrl: `${this._appUrl}/get-authenticator-app`,
        });
    }
    //getrefreshToken(): Observable<any>{
    //    // Renew token
    //    return this._httpClient.post(`${this._apiurl}/auth/refresh`, {
    //        refresh_token: this.refreshToken
    //    }).pipe(
    //        catchError(() =>

    //            // Return false
    //            of(false)
    //        ),
    //        switchMap((response: any) => {

    //            // Store the access token in the local storage
    //            this.accessToken = response.data.access_token;
    //            this.refreshToken = response.data.refresh_token;
    //            const expires = new Date();
    //            expires.setMilliseconds(expires.getMilliseconds() + response.data.expires);
    //            this.tokenExpires = expires;

    //            // Set the authenticated flag to true
    //            this._authenticated = true;

    //            // Store the user on the user service
    //            this._userService.user = response.user;

    //            return this.accessToken;
    //        })
    //    );
    //}
}
