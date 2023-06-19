import { Route } from '@angular/router';
import { AnalyticsComponent } from 'app/modules/admin/memberdashboard/analytics.component';
import {
    TotalMembersResolver,
    TotalRegisteredLevelResolver,
    TotalRegisterMember,
    TotalTransactionCount,
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
            totalRegisteredLevel: TotalRegisteredLevelResolver,
            totalMember: TotalRegisterMember,
            totalTransaction: TotalTransactionCount,
            stores: Stores,
            channel: Channel,
            totalActivePoints:TotalActivePoints,
            totalExpiredPoints:TotalExpiredPoints,
            totalearnPoint : TotalEarnPoint
        }
    }
];
