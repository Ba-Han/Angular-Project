import { Route } from '@angular/router';
import { RedemptionComponent } from 'app/modules/admin/setting/redemption setting/redemption.component';
import { RedemptionsResolver, MemberTierResolver } from 'app/modules/admin/setting/redemption setting/redemption.resolvers';
import { RedemptionDetailComponent } from 'app/modules/admin/setting/redemption setting/detail/redemption.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: RedemptionComponent,
        children: [
            {
                path: '',
                component: RedemptionDetailComponent,
                resolve: {
                    tasks: RedemptionsResolver,
                    memberTier: MemberTierResolver
                }

            }
        ]
    }
];
