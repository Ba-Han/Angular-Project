import { Route } from '@angular/router';
import { GeneralSettingComponent } from 'app/modules/admin/setting/generalsetting/generalsetting.component';
import { SettingResolver, MemberGroupsResolver, UserGroupsResolver } from 'app/modules/admin/setting/generalsetting/generalsetting.resolvers';
import { SettingDetailComponent } from './detail/generalsetting.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: GeneralSettingComponent,
        children: [
            {
                path: '',
                component: SettingDetailComponent,
                resolve: {
                    tasks: SettingResolver,
                    memberGroups: MemberGroupsResolver,
                    userGroups: UserGroupsResolver,
                }

            }
        ]
    }
];
