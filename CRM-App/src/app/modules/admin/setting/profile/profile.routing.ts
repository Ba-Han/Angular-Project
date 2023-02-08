import { Route } from '@angular/router';
import { ProfileComponent } from 'app/modules/admin/setting/profile/detail/profile.component';
import { ProfileResolver } from 'app/modules/admin/setting/profile/profile.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        component: ProfileComponent,
        
    }
];
