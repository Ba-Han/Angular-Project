import { Route } from '@angular/router';
import { UploadProductComponent } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct.component';
import { ProductUploadComponent } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct/uploadproduct.component';
export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: UploadProductComponent,
        children: [
            {
                path: '',
                component: ProductUploadComponent,
                resolve: {
                }

            }
        ]
    }
];
