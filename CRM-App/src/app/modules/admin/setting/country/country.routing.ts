import { Route } from '@angular/router';
import { CountryComponent } from 'app/modules/admin/setting/country/country.component';
import { CountryListComponent } from 'app/modules/admin/setting/country/list/country.component';
import { CountriesResolver, CountryResolver } from 'app/modules/admin/setting/country/country.resolvers';
import { CountryDetailComponent } from './detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: CountryComponent,
        children: [
            {
                path: '',
                component: CountryListComponent,
                resolve: {
                    tasks: CountriesResolver,
                }

            },
            {
                path: ':code',
                component: CountryDetailComponent,
                resolve: {
                    task: CountryResolver,
                }
            }
        ]
    }
];
