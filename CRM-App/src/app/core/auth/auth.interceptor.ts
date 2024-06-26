import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError, switchMap, tap} from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { environment } from 'environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    private _apiurl: string = '';
    constructor(private _httpClient: HttpClient,private _authService: AuthService)
    {
        this._apiurl = environment.apiurl;
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        // Clone the request object
        let newReq = req.clone();

        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
       
        let av = this._authService.accessToken;
        if (this._authService.accessToken != "" && AuthUtils.isTokenExpired(this._authService.accessToken)) {
            this._authService.signOut();
            location.reload();
            //newReq = req.clone();
            //this._authService.accessToken = "";
        }
        if (this._authService.accessToken && !AuthUtils.isTokenExpired(this._authService.accessToken)) {
            newReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
            });
        }
       

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {

                // Catch "401 Unauthorized" responses
                if ( error instanceof HttpErrorResponse && error.status === 401 )
                {
                    // Sign out
                    //this._authService.signOut();

                    //// Reload the app
                    //location.reload();
                }

                return throwError(error);
            })
        );
    }
}
