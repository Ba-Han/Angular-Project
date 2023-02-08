import { Route } from '@angular/router';
import { AuthAppComponent } from 'app/modules/auth/authapp/authapp.component';

export const authAppRoutes: Route[] = [
    {
        path     : '',
        component: AuthAppComponent
    }
];
