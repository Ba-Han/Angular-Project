import { Route } from '@angular/router';
import { UserComponent } from 'app/modules/admin/setting/user/user.component';
import { UserListComponent } from 'app/modules/admin/setting/user/list/user.component';
import { UsersResolver, UserResolver } from 'app/modules/admin/setting/user/user.resolvers';
import { UserDetailComponent } from 'app/modules/admin/setting/user/detail/detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: UserComponent,
        children: [
            {
                path: '',
                component: UserListComponent,
                resolve: {
                    tasks: UsersResolver,
                }

            },
            {
                path: ':id',
                component: UserDetailComponent,
                resolve: {
                    task: UserResolver,
                }
            }
        ]
    }
];
