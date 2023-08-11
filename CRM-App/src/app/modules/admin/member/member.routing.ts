import { Route } from '@angular/router';
import { MembersMemberResolver, MemberResolver, MemberTierResolver, TransactionsRecentResolver, MemberPointsRecentResolver, MemberResolverByTier, MemberDocumentsResolver, MemberVouchersRecentResolver, GenerateMemberVouchersResolver } from 'app/modules/admin/member/member.resolvers';
import { MemberComponent } from 'app/modules/admin/member/member.component';
import { MemberListComponent } from './list/list.component';
import { MemberDetailComponent } from './detail/detail.component';
import { MemberPointListComponent } from 'app/modules/admin/memberpoint/list/list.component';
import { MemberPointDetailComponent } from 'app/modules/admin/memberpoint/detail/detail.component';
import { MemberPointResolver, MemberPointDetailResolver } from 'app/modules/admin/memberpoint/memberpoint.resolvers';
import { TransactionsResolver, TransactionDetailResolver } from 'app/modules/admin/transaction/transaction.resolvers';
import { TransactionListComponent } from 'app/modules/admin/transaction/list/list.component';
import { TransactionDetailComponent } from 'app/modules/admin/transaction/detail/detail.component';
import { MemberVoucherResolver, MemberVoucherDetailResolver } from 'app/modules/admin/membervouchers/membervouchers.resolvers';
import { MemberVoucherListComponent } from 'app/modules/admin/membervouchers/list/list.component';
import { MemberVoucherDetailComponent } from 'app/modules/admin/membervouchers/detail/detail.component';
import { MemberLogsResolver } from 'app/modules/admin/memberlogs/memberlogs.resolvers';
import { MemberLogsListComponent } from 'app/modules/admin/memberlogs/list/memberlogs.component';

export const memberRoutes: Route[] = [
    {
        path: '',
        component: MemberComponent,
        children : [
            {
                path: '',
                component: MemberListComponent,
                resolve: {
                    tasks: MemberResolver,
                }
            },
            {
                path: 'membertier/:membertierid',
                component: MemberListComponent,
                resolve: {
                    tasks: MemberResolverByTier,
                }
            },
            {
                path: ':id',
                component: MemberDetailComponent,
                resolve: {
                    task: MembersMemberResolver,
                    transaction: TransactionsRecentResolver,
                    point: MemberPointsRecentResolver,
                    memberDocument: MemberDocumentsResolver,
                    memberVouchers: MemberVouchersRecentResolver,
                    tier: MemberTierResolver,
                    generateVouchers: GenerateMemberVouchersResolver
                },
            },
            {
                path: ':id/memberpoint',
                component: MemberPointListComponent,
                resolve: {
                    task: MemberPointResolver
                }
            },
            {
                path: ':id/memberpoint/:pointid',
                component: MemberPointDetailComponent,
                resolve: {
                    task: MemberPointDetailResolver
                }
            },
            {
                path: ':id/transaction',
                component: TransactionListComponent,
                resolve: {
                    task: TransactionsResolver,
                }
            },
            {
                path: ':id/transaction/:transactionid',
                component: TransactionDetailComponent,
                resolve: {
                    task: TransactionDetailResolver,
                }
            },
            {
                path: ':id/voucher',
                component: MemberVoucherListComponent,
                resolve: {
                    task: MemberVoucherResolver,
                }
            },
            {
                path: ':id/voucher/:membervoucherid',
                component: MemberVoucherDetailComponent,
                resolve: {
                    task: MemberVoucherDetailResolver,
                }
            },
            {
                path: ':id/memberlog',
                component: MemberLogsListComponent,
                resolve: {
                    task: MemberLogsResolver,
                }
            }
        ]
    }
];
