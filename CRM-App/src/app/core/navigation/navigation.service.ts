import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap, switchMap, of } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _userService: UserService,)
    {
        this._apiurl= environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
        let userRole:string = ((this._userService.userRole) ? this._userService.userRole : "");
        let filter:string = '';
        //If user is admin ignor filter
        if (userRole && userRole != "52B97F10-C1FD-40E1-BC35-1A86C17794A4") {
            filter = '?fields=*,roles.*&filter[roles][directus_roles_id][_eq]='+userRole;
        }
        return this._httpClient.get(`${this._apiurl}/items/navigation${filter}`).pipe(
            switchMap((response: any) => {
                const navData= { compact: null, default: null, futuristic: null, horizontal: null};
                navData.compact = response.data;
                navData.default= response.data;
                navData.futuristic= response.data;
                navData.horizontal= response.data;
                this._navigation.next(navData);
                return of(navData);
            })
        );
    }
}
