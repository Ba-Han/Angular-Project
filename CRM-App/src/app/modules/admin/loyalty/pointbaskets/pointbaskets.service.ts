import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError, delay } from 'rxjs';
import { PointBasketPagination, PointBasket } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.types';

@Injectable({
    providedIn: 'root'
})
export class PointBasketService {
    // Private
    private _pointBaskets: BehaviorSubject<PointBasket[] | null> = new BehaviorSubject(null);
    private _pointBasket: BehaviorSubject<PointBasket | null> = new BehaviorSubject(null);
    private _pointBasketPagination: BehaviorSubject<PointBasketPagination | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<PointBasketPagination | null> = new BehaviorSubject(null);
    private _apiurl: string;

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pointBaskets$(): Observable<PointBasket[]> {
        return this._pointBaskets.asObservable();
    }

    get pointBasket$(): Observable<PointBasket> {
        return this._pointBasket.asObservable();
    }

    get pointBasketPagination$(): Observable<PointBasketPagination> {
        return this._pointBasketPagination.asObservable();
    }

    get pagination$(): Observable<PointBasketPagination> {
        return this._pagination.asObservable();
    }

     // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getPointBaskets(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: PointBasketPagination; pointBaskets: PointBasket[] }> {
        return this._httpClient.get(`${this._apiurl}/items/point_basket`, {
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
                const pointBasketLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), pointBasketLength);
                const lastPage = Math.max(Math.ceil(pointBasketLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: pointBasketLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._pagination.next(pagination);
                this._pointBaskets.next(response.data);
            })
        );
    }

    getPointBasketById(id: number): Observable<PointBasket> {
        return this._httpClient.get<any>(`${this._apiurl}/items/point_basket/${id}`
        ).pipe(
            tap((response) => {
                const pointbasket = response.data;
                this._pointBasket.next(pointbasket);
            })
        );
    }


    createPointBasket(pointbasket: PointBasket): Observable<PointBasket> {

        const fromType = !pointbasket.from_type ? 0 : pointbasket.from_type;
        const fromNumber = !pointbasket.from_number ? 0 : pointbasket.from_number;
        const fromStartType = !pointbasket.from_start_type ? 0 : pointbasket.from_start_type;
        const fromStartDate = !pointbasket.from_start_date ? null : pointbasket.from_start_date;
        const toType = !pointbasket.to_type ? 0 : pointbasket.to_type;
        const toEndType = !pointbasket.to_end_type ? 0 : pointbasket.to_end_type;
        const toNumber = !pointbasket.to_number ? 0 : pointbasket.to_number;
        const toEndDate = !pointbasket.to_end_date ? null : pointbasket.to_end_date;

        return this.pointBaskets$.pipe(
            take(1),
            switchMap(pointbakets => this._httpClient.post<any>(`${this._apiurl}/items/point_basket`, {
                "user_created": pointbasket.user_created,
                "date_created": pointbasket.date_created,
                "user_updated": pointbasket.user_updated,
                "date_updated": pointbasket.date_updated,
                "name": pointbasket.name,
                "description": pointbasket.description,
                "spending_type": pointbasket.spending_type,
                "from_type": fromType,
                "from_number": fromNumber,
                "from_start_type": fromStartType,
                "from_start_date": fromStartDate,
                "to_type": toType,
                "to_number": toNumber,
                "to_end_type": toEndType,
                "to_end_date": toEndDate,
            }).pipe(
                map((newPointBasket) => {
                    this._pointBaskets.next([newPointBasket.data, ...pointbakets]);
                    return newPointBasket;
                })
            ))
        );

    }

    updatePointBasket(id: number, pointbasket: PointBasket): Observable<PointBasket> {

        const fromType = !pointbasket.from_type ? 0 : pointbasket.from_type;
        const fromNumber = !pointbasket.from_number ? 0 : pointbasket.from_number;
        const fromStartType = !pointbasket.from_start_type ? 0 : pointbasket.from_start_type;
        const fromStartDate = !pointbasket.from_start_date ? null : pointbasket.from_start_date;
        const toType = !pointbasket.to_type ? 0 : pointbasket.to_type;
        const toEndType = !pointbasket.to_end_type ? 0 : pointbasket.to_end_type;
        const toNumber = !pointbasket.to_number ? 0 : pointbasket.to_number;
        const toEndDate = !pointbasket.to_end_date ? null : pointbasket.to_end_date;

        return this._httpClient.patch<PointBasket>(`${this._apiurl}/items/point_basket/${id}`, {
            "id": id,
            "user_created": pointbasket.user_created,
            "date_created": pointbasket.date_created,
            "user_updated": pointbasket.user_updated,
            "date_updated": pointbasket.date_updated,
            "name": pointbasket.name,
            "description": pointbasket.description,
            "spending_type": pointbasket.spending_type,
            "from_type": fromType,
            "from_number": fromNumber,
            "from_start_type": fromStartType,
            "from_start_date": fromStartDate,
            "to_type": toType,
            "to_number": toNumber,
            "to_end_type": toEndType,
            "to_end_date": toEndDate,
        }).pipe(
            tap((response: any) => response.data)
        );
    }

}
