import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { Redemption, RedemptionPagination } from 'app/modules/admin/setting/redemption setting/Redemption.types';

@Injectable({
    providedIn: 'root'
})
export class RedemptionService {
    // Private
    private _redemptions: BehaviorSubject<Redemption | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<RedemptionPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<RedemptionPagination> {
        return this._pagination.asObservable();
    }
    get redemptions$(): Observable<Redemption> {
        return this._redemptions.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    getRedemptions(page: number = 0, limit: number = 10, sort: string = 'item_no', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: RedemptionPagination; redemptions: Redemption[] }> {
        return this._httpClient.get(`${this._apiurl}/items/redemption_exclusion`, {
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
                this._redemptions.next(response.data);
            })
        );
    }

    updateRedemption(id: number, redemption: Redemption): Observable<Redemption> {
        return this._httpClient.patch<Redemption>(`${this._apiurl}/items/redemption_exclusion/${id}`, {
            'id': redemption.id,
            'status': redemption.status,
            'item_name': redemption.item_name,
            'item_no': redemption.item_no
        }).pipe(
            map(updateRedemption => updateRedemption)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteRedemptionSetting(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/redemption_exclusion/${id}`,
        { observe: 'response' });
    };

}
