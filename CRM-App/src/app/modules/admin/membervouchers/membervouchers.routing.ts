import { Route } from '@angular/router';
import { MemberVoucherResolver, MemberVoucherDetailResolver } from 'app/modules/admin/membervouchers/membervouchers.resolvers';
import { MemberVoucherComponent } from 'app/modules/admin/membervouchers/membervouchers.component';
import { MemberVoucherListComponent } from 'app/modules/admin/membervouchers/list/list.component';
import { MemberVoucherDetailComponent } from 'app/modules/admin/membervouchers/detail/detail.component';

export const memberVoucherRoutes: Route[] = [
    {
        path     : '',
        component: MemberVoucherComponent,
        resolve  : {
        },
        children : [
            {
                path: ':id/voucher',
                component: MemberVoucherListComponent,
                resolve: {
                    task: MemberVoucherResolver,
                }
            },
            {
                path: ':membervoucherid',
                component: MemberVoucherDetailComponent,
                resolve: {
                    task: MemberVoucherDetailResolver,
                }
            }
        ]
    }
];
