import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { SharedModule } from 'app/shared/shared.module';
import { AuthChangePasswordComponent } from 'app/modules/auth/profile/change-password.component';
import { authChangePasswordRoutes } from 'app/modules/auth/profile/change-password.routing';

@NgModule({
    declarations: [
        AuthChangePasswordComponent
    ],
    imports     : [
        RouterModule.forChild(authChangePasswordRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseCardModule,
        FuseAlertModule,
        SharedModule,
        MatPasswordStrengthModule
    ]
})
export class AuthChangePasswordModule
{
}
