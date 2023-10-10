/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Transaction, TransactionPagination } from 'app/modules/admin/transaction/transaction.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransactionService
{
    private _transactions: BehaviorSubject<Transaction[]> = new BehaviorSubject(null);
    private _transaction: BehaviorSubject<Transaction> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<TransactionPagination | null> = new BehaviorSubject(null);
    private _apiurl: string = '';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
        this._apiurl= environment.apiurl;
    }

    /**
     * Getter for data
     */
    get memberTransaction$(): Observable<any>
    {
        return this._transaction.asObservable();
    }
    get memberTransactions$(): Observable<Transaction[]>
    {
        return this._transactions.asObservable();
    }
    get pagination$(): Observable<TransactionPagination>
    {
        return this._pagination.asObservable();
    }

    getData(id: number = 0, page: number = 0, limit: number = 10, sort: string = 'transaction_date', order: 'asc' | 'desc' | '' = 'desc', search: string = ''):
        Observable<{ pagination: TransactionPagination; members: Transaction[] }>
    {
        return this._httpClient.get(`${this._apiurl}/member/${id}/transactions`, {
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
                this._transactions.next(response.data);
            })
        );
    }

    getTransactionById(id: number): Observable<Transaction>
    {
        return this._httpClient.get<any>(`${this._apiurl}/transaction/${id}?fields=*,transaction_details.*,transaction_tenders.*`)
          .pipe(
              tap((response) => {
                  const transaction = response.data;
                  this._transaction.next(transaction);
              })
          );
      }
}
