import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { PointRange, PointRangePagination } from 'app/modules/admin/setting/point range setting/pointrange.types';

@Injectable({
    providedIn: 'root'
})
export class PointRangeService {
    // Private
    private _pointranges: BehaviorSubject<PointRange | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<PointRangePagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<PointRangePagination> {
        return this._pagination.asObservable();
    }
    get pointranges$(): Observable<PointRange> {
        return this._pointranges.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getPointRange(): Observable<PointRange> {
        return this._httpClient.get<any>(`${this._apiurl}/items/pointrange_settings`)
            .pipe(
                tap((response) => {
                    const pointrange = response.data;
                    this._pointranges.next(pointrange);
                })
            );
    }

    updatePointRange(id: number, pointrange: PointRange): Observable<PointRange> {
        const pointRangeId = !pointrange.id ? 0 : pointrange.id;
        const startDayType = !pointrange.start_day_type ? 0 : pointrange.start_day_type;

        return this._httpClient.patch<any>(`${this._apiurl}/items/pointrange_settings`, {
            'id': pointRangeId,
            'start_type': pointrange.start_type,
            'start_day_type': startDayType,
            'end_type': pointrange.end_type,
            'end_day_type': pointrange.end_day_type,
            'end_day_value': pointrange.end_day_value
        }).pipe(
            map(updatePointRange => updatePointRange)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeletePointRange(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/pointrange_settings/${id}`,
        { observe: 'response' });
    };
}
