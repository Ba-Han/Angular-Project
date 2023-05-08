import { Route } from '@angular/router';
import { MembersMemberResolver, MemberResolver, MemberTierResolver, TransactionsRecentResolver, MemberPointsRecentResolver, SettingResolver, MemberResolverByTier, MemberDocumentsResolver } from 'app/modules/admin/member/member.resolvers';
import { MemberComponent } from 'app/modules/admin/member/member.component';
import { MemberListComponent } from './list/list.component';
import { MemberDetailComponent } from './detail/detail.component';
import { MemberPointListComponent } from 'app/modules/admin/memberpoint/list/list.component';
import { MemberPointDetailComponent } from 'app/modules/admin/memberpoint/detail/detail.component';
import { MemberPointResolver, MemberPointDetailResolver, PointSegmentResolver } from 'app/modules/admin/memberpoint/memberpoint.resolvers';
import { TransactionsResolver, TransactionDetailResolver } from 'app/modules/admin/transaction/transaction.resolvers';
import { TransactionListComponent } from 'app/modules/admin/transaction/list/list.component';
import { TransactionDetailComponent } from 'app/modules/admin/transaction/detail/detail.component';


export const memberRoutes: Route[] = [
    {
        path     : '',
        component: MemberComponent,
        children : [
            {
                path     : '',
                component: MemberListComponent,
                resolve  : {
                    tasks    : MemberResolver,
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
                    tier: MemberTierResolver
                },
            },
            {
                path: ':id/memberpoint',
                component: MemberPointListComponent,
                resolve: {
                    task: MemberPointResolver,
                    pointsegment: PointSegmentResolver,
                    setting: SettingResolver,
                }
            },
            {
                path: ':id/memberpoint/:pointid',
                component: MemberPointDetailComponent,
                resolve: {
                    task: MemberPointDetailResolver,
                    pointsegment: PointSegmentResolver,
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
            }
        ]
    }
];
