/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberPoint, MemberPointPagination } from 'app/modules/admin/memberpoint/memberpoint.types';
import { environment } from 'environments/environment';
import { Member } from '../member/member.types';
import { Transaction, TransactionPagination } from 'app/modules/admin/transaction/transaction.types';

@Injectable({
    providedIn: 'root'
})
export class MemberPointService
{
    private _memberPoint: BehaviorSubject<MemberPoint> = new BehaviorSubject(null);
    private _memberPoints: BehaviorSubject<MemberPoint[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<MemberPointPagination | null> = new BehaviorSubject(null);
    private _members: BehaviorSubject<Member[] | null> = new BehaviorSubject(null);
    private _transactions: BehaviorSubject<Transaction[]> = new BehaviorSubject(null);
    private _transactionpagination: BehaviorSubject<TransactionPagination | null> = new BehaviorSubject(null);
    private _fullName: string = '';
    private _pointBasketFullName: string = '';
    private _pointBasketId: number = 0;
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

    get memberPoint$(): Observable<any>
    {
        return this._memberPoint.asObservable();
    }

    get memberPoints$(): Observable<any>
    {
        return this._memberPoints.asObservable();
    }

    get pagination$(): Observable<MemberPointPagination>
    {
         return this._pagination.asObservable();
    }

    get members$(): Observable<Member[]> {
        return this._members.asObservable();
    }
    get memberFullName(): string{
        return this._fullName;
    }
    get pointBasketFullName(): string {
        return this._pointBasketFullName;
    }
    get pointBasketId(): number {
        return this._pointBasketId;
    }
    get transactions$(): Observable<Transaction[]> {
        return this._transactions.asObservable();
    }
    get transactionpagination$(): Observable<TransactionPagination> {
        return this._transactionpagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(id: number = 0, page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', status: string = 'all', search: string = ''):
        Observable<{ pagination: MemberPointPagination; channels: MemberPoint[] }>
    {
        return this._httpClient.get(`${this._apiurl}/member/${id}/points`, {
            params: {
                meta: 'filter_count',
                page: page+1,
                limit: limit,
                sort: sort ,
                order,
                status,
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
                this._memberPoints.next(response.data);
            })
        );
    }

    getMemberPointById(id: number): Observable<MemberPoint>
    {
    return this._httpClient.get<any>(`${this._apiurl}/items/member_point/${id}?fields=*,member.*,point_basket.*`)
        .pipe(
            tap((response) => {
                const memberPoint = response.data;
                this._memberPoint.next(memberPoint);
            })
        );
    }

    getTransactions(page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: TransactionPagination; pointsegments: Transaction[] }> {
        return this._httpClient.get(`${this._apiurl}/items/transaction`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort: 'name',
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
                this._transactionpagination.next(pagination);
                this._transactions.next(response.data);
            })
        );
    }

    createMemberPoint(memberPoint: MemberPoint): Observable<MemberPoint>
    {
        return this.memberPoints$.pipe(
            take(1),
            switchMap(memberPoints => this._httpClient.post<any>(`${this._apiurl}/items/member_point`, {
                'point_type': memberPoint.point_type,
                'point_type_int': memberPoint.point_type_int,
                'reward_code': memberPoint.reward_code,
                'point': memberPoint.point,
                'expiry_date': memberPoint.expiry_date,
                'member': memberPoint.member,
                'comment': memberPoint.comment,
            }).pipe(
                map((newMemberPoint) => {
                    // Update the contacts with the new contact
                    this._memberPoints.next([newMemberPoint.data, ...memberPoints]);

                    // Return the new contact
                    return newMemberPoint;
                })
            ))
        );
    }

    updateMemberPoint(id: string, memberPoint: MemberPoint): Observable<MemberPoint>
    {
        return this.memberPoints$.pipe(
            take(1),
            switchMap(memberPoints => this._httpClient.patch<MemberPoint>(`${this._apiurl}/items/member_point/${id}`, {
                'id': memberPoint.id,
                'point_type': memberPoint.point_type,
                'point_type_int': memberPoint.point_type_int,
                'reward_code': memberPoint.reward_code,
                'point': memberPoint.point,
                'earning_valid_to': memberPoint.earning_valid_to,
                'member': memberPoint.member,
                'comment': memberPoint.comment,
            }).pipe(
                map((updatedMemberPoint) => {

                    // Find the index of the updated contact
                    const index = memberPoints.findIndex(item => item.id === id);

                    // Update the contact
                    memberPoints[index] = updatedMemberPoint;

                    // Update the contacts
                    this._memberPoints.next(memberPoints);

                    // Return the updated contact
                    return updatedMemberPoint;
                }),
                switchMap(updatedMemberPoint => this.memberPoint$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._memberPoint.next(updatedMemberPoint);

                        // Return the updated contact
                        return updatedMemberPoint;
                    })
                ))
            ))
        );
    }
}
