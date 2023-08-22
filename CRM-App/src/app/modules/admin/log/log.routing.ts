import { Route } from '@angular/router';
import { LogComponent } from 'app/modules/admin/log/log.component';
import { LogListComponent } from 'app/modules/admin/log/list/log.component';
import { LogDetailComponent } from 'app/modules/admin/log/detail/detail.component';
import { LogResolver } from 'app/modules/admin/log/log.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: LogComponent,
        children: [
            {
                path: '',
                component: LogListComponent,
                resolve: {
                    tasks: LogResolver,
                }

            }
        ]
    }
];
