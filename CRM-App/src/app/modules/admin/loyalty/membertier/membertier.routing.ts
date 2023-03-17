import { Route } from '@angular/router';
import { MemberTierComponent } from 'app/modules/admin/loyalty/membertier/membertier.component';
import { MemberTierListComponent } from 'app/modules/admin/loyalty/membertier/list/membertier.component';
import { MemberTiersResolver, MemberTierDetailResolver, MemberTierLevels, DWMemberGroupsResolver } from 'app/modules/admin/loyalty/membertier/membertier.resolvers';
import { MemberTierDetailComponent } from './detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: MemberTierComponent,
        children: [
            {
                path: '',
                component: MemberTierListComponent,
                resolve: {
                    tasks: MemberTiersResolver,
                    tiers: MemberTierLevels,
                    dwMemberGroups: DWMemberGroupsResolver,
                }
            },
            {
                path: ':id',
                component: MemberTierDetailComponent,
                resolve: {
                    tasks: MemberTierDetailResolver,
                    tiers: MemberTierLevels,
                    dwMemberGroups: DWMemberGroupsResolver,
                }
            }
        ]
    }
];
