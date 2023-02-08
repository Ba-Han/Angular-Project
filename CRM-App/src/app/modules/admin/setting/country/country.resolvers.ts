import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { CountryService } from 'app/modules/admin/setting/country/country.service';
import { Country, CountryPagination } from 'app/modules/admin/setting/country/country.types';

@Injectable({
    providedIn: 'root'
})
export class CountriesResolver implements Resolve<any>
{
    constructor(private _countryService: CountryService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: CountryPagination; countries: Country[] }> {
        return this._countryService.getCountries();
    }
}

@Injectable({
    providedIn: 'root'
})
export class CountryResolver implements Resolve<any>
{
    constructor(
        private _countryService: CountryService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country> {
        return this._countryService.getCountryByCode(route.paramMap.get('code'))
            .pipe(
                // Error here means the requested country is not available
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
