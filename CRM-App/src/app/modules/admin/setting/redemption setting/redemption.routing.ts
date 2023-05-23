import { Route } from '@angular/router';
import { RedemptionComponent } from 'app/modules/admin/setting/redemption setting/redemption.component';
import { RedemptionsResolver, RedemptionsDetailResolver, MemberTierResolver } from 'app/modules/admin/setting/redemption setting/redemption.resolvers';
import { RedemptionSettingListComponent } from 'app/modules/admin/setting/redemption setting/list/redemption.component';
import { RedemptionSettingDetailComponent } from 'app/modules/admin/setting/redemption setting/detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: RedemptionComponent,
        children: [
            {
                path: '',
                component: RedemptionSettingListComponent,
                resolve: {
                    tasks: RedemptionsResolver,
                    memberTier: MemberTierResolver
                }

            },
            {
                path: ':id',
                component: RedemptionSettingDetailComponent,
                resolve: {
                    tasks: RedemptionsDetailResolver,
                    memberTier: MemberTierResolver
                }
            }
        ]
    }
];
