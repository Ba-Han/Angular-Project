import { Route } from '@angular/router';
import { AuthTfaComponent } from 'app/modules/auth/tfa/tfa.component';

export const authTfaRoutes: Route[] = [
    {
        path     : '',
        component: AuthTfaComponent
    }
];
