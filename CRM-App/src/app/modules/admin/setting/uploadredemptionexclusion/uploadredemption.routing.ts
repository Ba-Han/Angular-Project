import { Route } from '@angular/router';
import { UploadRedemptionComponent } from 'app/modules/admin/setting/uploadredemptionexclusion/uploadredemption.component';
import { RedemptionUploadComponent } from 'app/modules/admin/setting/uploadredemptionexclusion/uploadredemption/uploadredemption.component';
export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: UploadRedemptionComponent,
        children: [
            {
                path: '',
                component: RedemptionUploadComponent,
                resolve: {
                }

            }
        ]
    }
];
