import { Route } from '@angular/router';
import { ChannelComponent } from 'app/modules/admin/setting/channel/channel.component';
import { ChannelListComponent } from 'app/modules/admin/setting/channel/list/channel.component';
import { ChannelsResolver, ChannelResolver } from 'app/modules/admin/setting/channel/channel.resolvers';
import { ChannelDetailComponent } from './detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: ChannelComponent,
        children: [
            {
                path: '',
                component: ChannelListComponent,
                resolve: {
                    tasks: ChannelsResolver,
                }
            },
            {
                path: ':code',
                component: ChannelDetailComponent,
                resolve: {
                    task: ChannelResolver,
                }
            }
        ]
    }
];
