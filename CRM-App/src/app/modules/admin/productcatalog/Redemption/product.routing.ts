import { Route } from '@angular/router';
import { ProductComponent } from 'app/modules/admin/productcatalog/Redemption/product.component';
import { ProductListComponent } from 'app/modules/admin/productcatalog/Redemption/list/product.component';
import { ProductDetailComponent } from 'app/modules/admin/productcatalog/Redemption/detail/detail.component';
import { ProductsResolver, ProductResolver } from 'app/modules/admin/productcatalog/Redemption/product.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: ProductComponent,
        children: [
            {
                path: '',
                component: ProductListComponent,
                resolve: {
                    tasks: ProductsResolver,
                }

            },
            {
                path: ':id',
                component: ProductDetailComponent,
                resolve: {
                    task: ProductResolver,
                }
            }
        ]
    }
];
