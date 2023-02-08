import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { TransactionService } from 'app/modules/admin/transaction/transaction.service';
import { Transaction } from './transaction.types';

@Injectable({
    providedIn: 'root'
})
export class TransactionsResolver implements Resolve<any>
{
    constructor(private _transactionService: TransactionService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._transactionService.getData(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class TransactionDetailResolver implements Resolve<any>
{
    constructor(
        private _transactionService: TransactionService,
        private _router: Router
    )
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Transaction>
     {
        return this._transactionService.getTransactionById(Number(route.paramMap.get('transactionid')))
            .pipe(
                // Error here means the requested contact is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
     }
 }
