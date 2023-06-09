/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberLogs, MemberLogsPagination } from 'app/modules/admin/memberlogs/memberlogs.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MemberLogsService
{
    private _memberLogs: BehaviorSubject<MemberLogs[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<MemberLogsPagination | null> = new BehaviorSubject(null);
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

    get memberLogs$(): Observable<MemberLogs[]>
    {
        return this._memberLogs.asObservable();
    }

    get pagination$(): Observable<MemberLogsPagination>
    {
         return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getMemberLogs(id: number = 0, page: number = 0, limit: number = 10, sort: string = 'date_updated', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberLogsPagination; memberlogs: MemberLogs[] }>
    {
        return this._httpClient.get(`${this._apiurl}/items/member/logs`, {
            params: {
                meta: 'filter_count',
                page: page+1,
                limit: limit,
                sort: sort ,
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
                const pagination ={
                    length    : totalLength,
                    limit     : limit,
                    page      : page,
                    lastPage  : lastPage,
                    startIndex: begin,
                    endIndex  : end - 1
                };
                this._pagination.next(pagination);
                this._memberLogs.next(response.data);
            })
        );
    }
}
