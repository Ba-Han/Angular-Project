import { Route } from '@angular/router';
import { ProductComponent } from 'app/modules/admin/productcatalog/product/product.component';
import { ProductListComponent } from 'app/modules/admin/productcatalog/product/list/product.component';
import { ProductDetailComponent } from 'app/modules/admin/productcatalog/product/detail/detail.component';
import { ProductsResolver, ProductResolver } from 'app/modules/admin/productcatalog/product/product.resolvers';

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
