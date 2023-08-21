/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Log, LogPagination } from 'app/modules/admin/log/log.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LogService
{
    private _log: BehaviorSubject<Log[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<LogPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
        this._apiurl= environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get Log$(): Observable<Log[]>
    {
        return this._log.asObservable();
    }

    get Pagination$(): Observable<LogPagination>
    {
         return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    // eslint-disable-next-line max-len
    postWithTodayDate(date: string = '', method: string, page: number = 0, limit: number = 10, sort: string = 'request_on', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: LogPagination; log: Log[] }>
    {
        const requestMethod = method;
        if(requestMethod !== null) {
            return this._httpClient.post(`${this._apiurl}/utility/logs/${date}?limit=${limit}&order=${order}&sort=request_on&page=${page + 1}`, {
                'request_method': requestMethod
            }).pipe(
                tap((response: any) => {
                    const totalLength = response.filter_count;
                    const begin = page * limit;
                    const end = Math.min((limit * (page + 1)), totalLength);
                    const lastPage = Math.max(Math.ceil(totalLength / limit), 1);

                    // Prepare the pagination object
                    const pagination ={
                        length    : totalLength,
                        limit     : limit,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                    // eslint-disable-next-line guard-for-in
                    const logData = response.data;
                    for(const data of logData){
                        if( data.request_body !== null ||  data.response_body_text !== null ) {
                                data.request_body = JSON.stringify(data.request_body);
                                data.response_body_text = JSON.stringify(data.response_body_text);
                        }
                    }
                    this._pagination.next(pagination);
                    this._log.next(response.data);
                })
            );
        } else {
            return null;
        }
    }
}
