import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Store, StorePagination, Channel, ChannelPagination } from 'app/modules/admin/setting/store/store.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    // Private
    private _pagination: BehaviorSubject<StorePagination | null> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<Store[] | null> = new BehaviorSubject(null);
    private _store: BehaviorSubject<Store | null> = new BehaviorSubject(null);
    private _channelPagination: BehaviorSubject<ChannelPagination | null> = new BehaviorSubject(null);
    private _channels: BehaviorSubject<Channel[] | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get pagination$(): Observable<StorePagination> {
        return this._pagination.asObservable();
    }
    get stores$(): Observable<Store[]> {
        return this._stores.asObservable();
    }
    get store$(): Observable<Store> {
        return this._store.asObservable();
    }
    get channels$(): Observable<Channel[]> {
        return this._channels.asObservable();
    }
    get channelPagination$(): Observable<ChannelPagination> {
        return this._channelPagination.asObservable();
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
    getStores(page: number = 0, limit: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: StorePagination; stores: Store[] }> {
        return this._httpClient.get(`${this._apiurl}/items/store`, {
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
                    this._stores.next(response.data);
                })
            );
    }

    getChannels(page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ channelPagination: ChannelPagination; members: Channel[] }> {
        return this._httpClient.get(`${this._apiurl}/items/channel`, {
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
                this._channelPagination.next(pagination);
                this._channels.next(response.data);
            })
        );
    }

    /**
     * Get store by id
     */
    getStoreById(code: string): Observable<Store> {
        return this._httpClient.get<any>(`${this._apiurl}/items/store/${code}`)
            .pipe(
                tap((response) => {
                    const store = response.data;
                    this._store.next(store);
                })
            );
    }

    createStore(store: Store): Observable<Store> {

        const addressLine1 = store.address_line_1 === null ? '' : store.address_line_1;
        const addressLine2 = store.address_line_2 === null ? '' : store.address_line_2;
        const city = store.city === null ? '' : store.city;
        const state = store.state === null ? '' : store.state;
        const postalCode = store.postal_code === null ? '' : store.postal_code;
        const region = store.region === null ? '' : store.region;

        return this.stores$.pipe(
            take(1),
            switchMap(stores => this._httpClient.post<any>(`${this._apiurl}/items/store`, {
                "code": store.code,
                "status": store.status,
                "name": store.name,
                "address_line_1": addressLine1,
                "address_line_2": addressLine2,
                "city": city,
                "state": state,
                "postal_code": postalCode,
                "region": region,
                "country": store.country,
                "channel_code": store.channel_code
            }).pipe(
                map((newStore) => {
                    this._stores.next([newStore.data, ...stores]);
                    return newStore;
                })
            ))
        );

    }

    updateStore(code: string, store: Store): Observable<Store> {

        const addressLine1 = store.address_line_1 === null ? '' : store.address_line_1;
        const addressLine2 = store.address_line_2 === null ? '' : store.address_line_2;
        const city = store.city === null ? '' : store.city;
        const state = store.state === null ? '' : store.state;
        const postalCode = store.postal_code === null ? '' : store.postal_code;
        const region = store.region === null ? '' : store.region;

        return this._httpClient.patch<Store>(`${this._apiurl}/items/store/${code}`, {
            'code': code,
            'name': store.name,
            'status': store.status,
            'address_line_1': addressLine1,
            'address_line_2': addressLine2,
            'city': city,
            'state': state,
            'postal_code': postalCode,
            'region': region,
            'country': store.country,
            'channel_code': store.channel_code
        }).pipe(
            map(updateStore => updateStore)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteStore(code: string){
        return this._httpClient.delete(`${this._apiurl}/items/store/${code}`,
        { observe: 'response' });
    };
}
