import { Route } from '@angular/router';
import { DataImportComponent } from 'app/modules/admin/setting/data Import/import.component';
import { ImportComponent } from 'app/modules/admin/setting/data Import/import/import.component';
/* import { ImportResolver } from 'app/modules/admin/setting/data Import/import.resolvers'; */

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: DataImportComponent,
        children: [
            {
                path: '',
                component: ImportComponent,
                resolve: {
                    //tasks: ImportResolver,
                }

            }
        ]
    }
];
