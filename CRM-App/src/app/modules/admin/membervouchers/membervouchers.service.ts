/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberVoucher, MemberVoucherPagination } from 'app/modules/admin/membervouchers/membervouchers.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MemberVoucherService
{
    private _memberVouchers: BehaviorSubject<MemberVoucher[]> = new BehaviorSubject(null);
    private _memberVoucher: BehaviorSubject<MemberVoucher> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<MemberVoucherPagination | null> = new BehaviorSubject(null);
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

    get memberVouchers$(): Observable<MemberVoucher[]>
    {
        return this._memberVouchers.asObservable();
    }

    get memberVoucher$(): Observable<MemberVoucher>
    {
        return this._memberVoucher.asObservable();
    }

    get pagination$(): Observable<MemberVoucherPagination>
    {
         return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getMemberVoucher(id: number = 0, page: number = 0, limit: number = 10, sort: string = 'voucher_code', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberVoucherPagination; membervouchers: MemberVoucher[] }>
    {
        return this._httpClient.get(`${this._apiurl}/items/voucher/memberid/${id}`, {
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
                this._memberVouchers.next(response.data);
            })
        );
    }

    getMemberVoucherById(id: number): Observable<MemberVoucher>
    {
    return this._httpClient.get<any>(`${this._apiurl}/items/voucher/${id}`)
        .pipe(
            tap((response) => {
                const memberVoucher = response.data;
                this._memberVoucher.next(memberVoucher);
            })
        );
    }

    createMemberVoucher(memberVoucher: MemberVoucher): Observable<MemberVoucher>
    {
        return this.memberVouchers$.pipe(
            take(1),
            switchMap(memberVouchers => this._httpClient.post<any>(`${this._apiurl}/items/voucher`, {
                'voucher_code': memberVoucher.voucher_code,
                'points_used': memberVoucher.points_used,
                'conversion_rate': memberVoucher.conversion_rate,
                'amount': memberVoucher.amount,
                'member_id': memberVoucher.member_id
            }).pipe(
                map((newMemberVoucher) => {
                    // Update the contacts with the new contact
                    this._memberVouchers.next([newMemberVoucher.data, ...memberVouchers]);

                    // Return the new contact
                    return newMemberVoucher;
                })
            ))
        );
    }

    updateMemberVoucher(id: number, memberVoucher: MemberVoucher): Observable<MemberVoucher> {
        return this._httpClient.post<MemberVoucher>(`${this._apiurl}/items/voucher/${id}`, {
            'id': memberVoucher.id,
            'voucher_code': memberVoucher.voucher_code,
            'points_used': memberVoucher.points_used,
            'conversion_rate': memberVoucher.conversion_rate,
            'amount': memberVoucher.amount,
            'member_id': memberVoucher.member_id
        }).pipe(
            map(updateMemberVoucher => updateMemberVoucher)
        );
    }
}
