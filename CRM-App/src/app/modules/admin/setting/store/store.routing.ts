import { Route } from '@angular/router';
import { StoreComponent } from 'app/modules/admin/setting/store/store.component';
import { StoreListComponent } from 'app/modules/admin/setting/store/list/store.component';
import { StoresResolver, StoreResolver, ChannelsResolver } from 'app/modules/admin/setting/store/store.resolvers';
import { StoreDetailComponent } from './detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: StoreComponent,
        children: [
            {
                path: '',
                component: StoreListComponent,
                resolve: {
                    tasks: StoresResolver,
                    channels: ChannelsResolver
                }

            },
            {
                path: ':code',
                component: StoreDetailComponent,
                resolve: {
                    task: StoreResolver,
                    channels: ChannelsResolver
                }
            }
        ]
    }
];
