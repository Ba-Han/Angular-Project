import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { Channel, ChannelPagination } from 'app/modules/admin/setting/channel/channel.types';

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    // Private
    private _pagination: BehaviorSubject<ChannelPagination | null> = new BehaviorSubject(null);
    private _channels: BehaviorSubject<Channel[] | null> = new BehaviorSubject(null);
    private _channel: BehaviorSubject<Channel | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }


    get pagination$(): Observable<ChannelPagination> {
        return this._pagination.asObservable();
    }
    get channels$(): Observable<Channel[]> {
        return this._channels.asObservable();
    }
    get channel$(): Observable<Channel> {
        return this._channel.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Get channels
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */

    getChannels(page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: ChannelPagination; members: Channel[] }> {
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
                this._pagination.next(pagination);
                this._channels.next(response.data);
            })
        );
    }

    /**
     * Get channel by id
     */
    getChannelByCode(code: string): Observable<Channel> {
        return this._httpClient.get<any>(`${this._apiurl}/items/channel/${code}`)
            .pipe(
                tap((response) => {
                    const memberPoint = response.data;
                    this._channel.next(memberPoint);
                })
            );
    }

    createChnnel(channel: Channel): Observable<Channel> {
       
        return this.channels$.pipe(
            take(1),
            switchMap(channels => this._httpClient.post<any>(`${this._apiurl}/items/channel`, {
                'code': channel.code,
                'name': channel.name,
                'status': channel.status,
            }).pipe(
                map((newChannel) => {
                    this._channels.next([newChannel.data, ...channels]);
                    return newChannel;
                })
            ))
        );

    }

    updateChannel(code:string,channel: Channel): Observable<Channel> {
       return this._httpClient.patch<Channel>(`${this._apiurl}/items/channel/${code}`, {
            'code': code,
            'name': channel.name,
            'status': channel.status,
        }).pipe(
        map((updateChannel) => {   
           return updateChannel;
         })
        )
    }
}
