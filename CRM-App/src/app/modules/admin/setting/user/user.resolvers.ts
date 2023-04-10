import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { CRMUserService } from 'app/modules/admin/setting/user/user.service';
import { User, UserPagination } from 'app/modules/admin/setting/user/user.types';

@Injectable({
    providedIn: 'root'
})
export class UsersResolver implements Resolve<any>
{
    constructor(private _crmUserService: CRMUserService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: UserPagination; users: User[] }> {
        return this._crmUserService.getAppUsers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class UserResolver implements Resolve<any>
{
    constructor(
        private _crmUserService: CRMUserService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        return this._crmUserService.getUserById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested store is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}
