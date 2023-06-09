import { Route } from '@angular/router';
import { MemberLogsResolver } from 'app/modules/admin/memberlogs/memberlogs.resolvers';
import { MemberLogsComponent } from 'app/modules/admin/memberlogs/memberlogs.component';
import { MemberLogsListComponent } from 'app/modules/admin/memberlogs/list/memberlogs.component';

export const memberLogsRoutes: Route[] = [
    {
        path: '',
        component: MemberLogsComponent,
        resolve: {
        },
        children: [
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
