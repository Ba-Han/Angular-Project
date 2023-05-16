import { Route } from '@angular/router';
import { AnalyticsComponent } from 'app/modules/admin/memberdashboard/analytics.component';
import {
    TotalMembersResolver,
    TotalBeInformedResolver,
    TotalBeRewardResolver,
    TotalBeWowResolver,
    TotalRegisterMember,
    TotalTransactionCount,
    MemberTiers,
    TotalActivePoints,
    TotalExpiredPoints,
    Stores,
    Channel,
    TotalEarnPoint
} from 'app/modules/admin/memberdashboard/analytics.resolvers';

export const analyticsRoutes: Route[] = [
    {
        path     : '',
        component: AnalyticsComponent,
        resolve  : {
            totalmembers: TotalMembersResolver,
            totalbeinformed: TotalBeInformedResolver,
            totalbereward: TotalBeRewardResolver,
            totalbewow: TotalBeWowResolver,
            totalMember: TotalRegisterMember,
            totalTransaction: TotalTransactionCount,
            tiers: MemberTiers,
            stores: Stores,
            channel: Channel,
            totalActivePoints:TotalActivePoints,
            totalExpiredPoints:TotalExpiredPoints,
            totalearnPoint : TotalEarnPoint
        }
    }
];
