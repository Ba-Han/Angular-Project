import { Route } from '@angular/router';
import { MemberPointResolver, MemberPointDetailResolver } from 'app/modules/admin/memberpoint/memberpoint.resolvers';
import { MemberPointComponent } from 'app/modules/admin/memberpoint/memberpoint.component';
import { MemberPointListComponent } from './list/list.component';
import { MemberPointDetailComponent } from './detail/detail.component';

export const memberPointRoutes: Route[] = [
    {
        path     : '',
        component: MemberPointComponent,
        resolve  : {
        },
        children : [
            {
                path: ':id/memberpoint',
                component: MemberPointListComponent,
                resolve: {
                    task: MemberPointResolver,
                }
            },
            {
                path: ':pointid',
                component: MemberPointDetailComponent,
                resolve: {
                    task: MemberPointDetailResolver,
                }
            }
        ]
    }
];
