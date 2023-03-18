import { Route } from '@angular/router';
import { PointBasketComponent } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.component';
import { PointBasketListComponent } from 'app/modules/admin/loyalty/pointbaskets/list/pointbaskets.component';
import { PointBasketDetailComponent } from 'app/modules/admin/loyalty/pointbaskets/detail/detail.component';
import { PointBasketsResolver, PointBasketResolver } from 'app/modules/admin/loyalty/pointbaskets/pointbaskets.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: PointBasketComponent,
        children: [
            {
                path: '',
                component: PointBasketListComponent,
                resolve: {
                    pointBaskets: PointBasketsResolver,
                }
            },
            {
                path: ':id',
                component: PointBasketDetailComponent,
                resolve: {
                    pointBaskets: PointBasketResolver,
                }
            }
        ]
    }
];
