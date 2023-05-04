import { Route } from '@angular/router';
import { PointRangeComponent } from 'app/modules/admin/setting/point range setting/pointrange.component';
import { PointRangeDetailComponent } from 'app/modules/admin/setting/point range setting/detail/detail.component';
import { PointRangesResolver } from 'app/modules/admin/setting/point range setting/pointrange.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: PointRangeComponent,
        children: [
            {
                path: '',
                component: PointRangeDetailComponent,
                resolve: {
                    tasks: PointRangesResolver,
                }

            }
        ]
    }
];
