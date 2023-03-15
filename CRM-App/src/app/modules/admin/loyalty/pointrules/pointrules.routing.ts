import { Route } from '@angular/router';
import { PointRuleComponent } from 'app/modules/admin/loyalty/pointrules/pointrules.component';
import { PointRuleListComponent } from 'app/modules/admin/loyalty/pointrules/list/pointrules.component';
import { PointRuleDetailComponent } from 'app/modules/admin/loyalty/pointrules/detail/detail.component';
import { PointRulesResolver, PointRuleResolver, MemberTiersResolver, PointBasketResolver } from 'app/modules/admin/loyalty/pointrules/pointrules.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: PointRuleComponent,
        children: [
            {
                path: '',
                component: PointRuleListComponent,
                resolve: {
                    tasks: PointRulesResolver,
                    memberTiers: MemberTiersResolver,
                    pointBaskets: PointBasketResolver,
                }
            },
            {
                path: ':id',
                component: PointRuleDetailComponent,
                resolve: {
                    tasks: PointRuleResolver,
                    memberTiers: MemberTiersResolver,
                    pointBaskets: PointBasketResolver,
                }
            }
        ]
    }
];
