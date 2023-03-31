/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { MemberPoint, MemberPointPagination, PointSegment, PointSegmentPagination } from 'app/modules/admin/memberpoint/memberpoint.types';
import { environment } from 'environments/environment';
import { Member } from '../member/member.types';
import { Transaction, TransactionPagination } from 'app/modules/admin/transaction/transaction.types';
import { Dictionary } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class MemberPointService
{
    private _memberPoint: BehaviorSubject<MemberPoint> = new BehaviorSubject(null);
    private _memberPoints: BehaviorSubject<MemberPoint[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<MemberPointPagination | null> = new BehaviorSubject(null);
    private _members: BehaviorSubject<Member[] | null> = new BehaviorSubject(null);
    private _pointSegments: BehaviorSubject<PointSegment[]> = new BehaviorSubject(null);
    private _segmentpagination: BehaviorSubject<PointSegmentPagination | null> = new BehaviorSubject(null);
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
    get pointSegments$(): Observable<PointSegment[]> {
        return this._pointSegments.asObservable();
    }
    get segmentpagination$(): Observable<PointSegmentPagination> {
        return this._segmentpagination.asObservable();
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
    getData(id: number = 0, page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: MemberPointPagination; channels: MemberPoint[] }>
    {
        return this._httpClient.get(`${this._apiurl}/member/${id}/points`, {
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
                  //const fullname = memberPoint.member != null ? memberPoint.member.member_code + " : " + memberPoint.member.first_name + " " + memberPoint.member.last_name : "";
                  //const pointfullname = memberPoint.point_basket != null ? memberPoint.point_basket.name + " : " + memberPoint.point_basket.description : "";
                  //this._fullName = fullname;
                  //this._pointBasketFullName = pointfullname;
                  //this._pointBasketId = memberPoint.point_basket != null ? memberPoint.point_basket.id : "";
                 this._memberPoint.next(memberPoint);
              })
          );
      }

    getPointSegment(page: number = 0, limit: number = 10, sort: string = 'date_created', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: PointSegmentPagination; pointsegments: PointSegment[] }> {
        return this._httpClient.get(`${this._apiurl}/items/point_basket`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort: "name",
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
                this._segmentpagination.next(pagination);
                this._pointSegments.next(response.data);
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
                sort: "name",
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

    createMemberPoint(memberPoint: MemberPoint, pointconversion: number): Observable<MemberPoint>
    {
        return this.memberPoints$.pipe(
            take(1),
            switchMap(memberPoints => this._httpClient.post<any>(`${this._apiurl}/items/member_point`, {
                'point_type': memberPoint.point_type,
                'point_type_int': memberPoint.point_type_int,
                'status': memberPoint.status,
                'reward_code': memberPoint.reward_code,
                'point': memberPoint.point,
                'member': memberPoint.member,
                'comment': memberPoint.comment,
            }).pipe(
                map((newMemberPoint) => {
                    newMemberPoint.data.pointsInDoller = Math.round(newMemberPoint.data.point / pointconversion);
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
                  'status': memberPoint.status,
                  'reward_code': memberPoint.reward_code,
                  'point': memberPoint.point,
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

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteMemberPoint(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/member_point/${id}`,
        { responseType: 'text' })
        .pipe(
            map(() => true),
            catchError((error) => {
                console.error(error);
                return of(false);
            }));
    };
}
