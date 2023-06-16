import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ImportActivityPagination, ImportActivity } from 'app/modules/admin/setting/data Import/import.types';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ImportService {
    // Private
    private _pagination: BehaviorSubject<ImportActivityPagination | null> = new BehaviorSubject(null);
    private _activities: BehaviorSubject<ImportActivity[] | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<ImportActivityPagination> {
        return this._pagination.asObservable();
    }
    get activities$(): Observable<ImportActivity[]> {
        return this._activities.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /* getActivities(page: number = 0, limit: number = 10, sort: string = 'date', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: ImportActivityPagination; activities: ImportActivity[] }> {
        return this._httpClient.get(`${this._apiurl}/manualupload/memberpoint`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                order: 'desc',
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
                this._activities.next(response.data);
            })
        );
    } */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    proceedUploadFile(id: number): Observable<any>{
        return this._httpClient.post(`${this._apiurl}/manualupload/memberpoint/process/${id}`,
        { observe: 'response' });
    }

    /* importFile(fileid: string, name: string, date: string): Observable<any> {
        //return this._httpClient.post<any>(`${this._apiurl}/items/import_activity`, {
        //    "status": "active",
        //    "collection_name": name,
        //    "import_file": fileid,
        //    "import_date": date
        //}).pipe(

        //    tap((response) => {
        //        return this._activities.next(response.data);
        //    })

        //);

        return this.activities$.pipe(
            take(1),
            switchMap(activities => this._httpClient.post<any>(`${this._apiurl}/manualupload/memberpoint`, {
                "status": "active",
                "collection_name": name,
                "import_file": fileid,
                "import_date": date
            }).pipe(
                map((newActivity) => {

                    // Update the products with the new product
                    this._activities.next([newActivity.data, ...activities]);

                    // Return the new product
                    return newActivity.data;
                })
            ))
        );

    } */
}
