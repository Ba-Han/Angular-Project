import { Route } from '@angular/router';
import { AuthChangePasswordComponent } from 'app/modules/auth/profile/change-password.component';

export const authChangePasswordRoutes: Route[] = [
    {
        path     : '',
        component: AuthChangePasswordComponent
    }
];
