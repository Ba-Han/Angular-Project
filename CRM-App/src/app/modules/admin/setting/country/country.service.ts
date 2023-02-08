import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Country, CountryPagination } from 'app/modules/admin/setting/country/country.types';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    // Private
    private _pagination: BehaviorSubject<CountryPagination | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _country: BehaviorSubject<Country | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<CountryPagination> {
        return this._pagination.asObservable();
    }
    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }
    get country$(): Observable<Country> {
        return this._country.asObservable();
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
    getCountries(code: string = "", page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: CountryPagination; countries: Country[] }> {
        return this._httpClient.get(`${this._apiurl}/items/country`, {
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
                this._countries.next(response.data);
            })
        );
    }

    /**
     * Get country by id
     */
    getCountryByCode(code: string): Observable<Country> {
        return this._httpClient.get<any>(`${this._apiurl}/items/country/${code}`)
            .pipe(
                tap((response) => {
                    const country = response.data;
                    this._country.next(country);
                })
            );
    }

    createCountry(country: Country): Observable<Country> {
        return this.countries$.pipe(
            take(1),
            switchMap(countries => this._httpClient.post<any>(`${this._apiurl}/items/country`, {
                "code": country.code,
                "status": country.status,
                "user_created": null,
                "date_created": null,
                "user_updated": null,
                "date_updated": null,
                "name": country.name,
                "calling_code": country.calling_code,
            }).pipe(
                map((newCountry) => {
                    this._countries.next([newCountry.data, ...countries]);
                    return newCountry;
                })
            ))
        );
    }

    updateCountry(code: string, country: Country): Observable<Country> {
        return this._httpClient.patch<Country>(`${this._apiurl}/items/country/${code}`, {
            "code": code,
            "status": country.status,
            "user_created": null,
            "date_created": null,
            "user_updated": null,
            "date_updated": null,
            "name": country.name,
            "calling_code": country.calling_code
        }).pipe(
            map((updateCountry) => {
                return updateCountry;
            })
        )
    }
}
