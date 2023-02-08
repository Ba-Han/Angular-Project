import { Route } from '@angular/router';
import { TransactionsResolver, TransactionDetailResolver } from 'app/modules/admin/transaction/transaction.resolvers';
import { TransactionComponent } from 'app/modules/admin/transaction/transaction.component';
import { TransactionListComponent } from './list/list.component';
import { TransactionDetailComponent } from './detail/detail.component';

export const transactionRoutes: Route[] = [
    {
        path     : '',
        component: TransactionComponent,
        resolve  : {
        },
        children : [
            {
                path: ':id/transaction',
                component: TransactionListComponent,
                resolve: {
                    task: TransactionsResolver,
                }
            },
                {
                    path: ':transactionid',
                    component: TransactionDetailComponent,
                    resolve: {
                        task: TransactionDetailResolver,
                    }
                }
        ]
    }
];
