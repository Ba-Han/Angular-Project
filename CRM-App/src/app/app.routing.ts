import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'memberdashboard' },

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'memberdashboard' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'tfa', loadChildren: () => import('app/modules/auth/tfa/tfa.module').then(m => m.AuthTfaModule) },
            { path: 'get-authenticator-app', loadChildren: () => import('app/modules/auth/authapp/authapp.module').then(m => m.AuthAppModule) }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule) },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            { path: 'memberdashboard', loadChildren: () => import('app/modules/admin/memberdashboard/analytics.module').then(m => m.AnalyticsModule) },
            { path: 'member', loadChildren: () => import('app/modules/admin/member/member.module').then(m => m.MemberModule) },
            { path: 'memberpoint', loadChildren: () => import('app/modules/admin/memberpoint/memberpoint.module').then(m => m.MemberPointModule) },
            { path: 'voucher', loadChildren: () => import('app/modules/admin/membervouchers/membervouchers.module').then(m => m.MemberVoucherModule) },
            { path: 'memberlog', loadChildren: () => import('app/modules/admin/memberlogs/memberlogs.module').then(m => m.MemberLogsModule) },
            { path: 'log', loadChildren: () => import('app/modules/admin/log/log.module').then(m => m.LogModule) },
            { path: 'country', loadChildren: () => import('app/modules/admin/setting/country/country.module').then(m => m.CountryModule) },
            { path: 'channel', loadChildren: () => import('app/modules/admin/setting/channel/channel.module').then(m => m.ChannelModule) },
            { path: 'store', loadChildren: () => import('app/modules/admin/setting/store/store.module').then(m => m.StoreModule) },
            { path: 'point-baskets', loadChildren: () => import('app/modules/admin/loyalty/pointbaskets/pointbaskets.module').then(m => m.PointBasketModule) },
            { path: 'point-rules', loadChildren: () => import('app/modules/admin/loyalty/pointrules/pointrules.module').then(m => m.PointRuleModule) },
            { path: 'member-tier', loadChildren: () => import('app/modules/admin/loyalty/membertier/membertier.module').then(m => m.MemberTierModule) },
            { path: 'product', loadChildren: () => import('app/modules/admin/productcatalog/product/product.module').then(m => m.ProductModule) },
            { path: 'transaction', loadChildren: () => import('app/modules/admin/Transaction/transaction.module').then(m => m.TransactionModule) },
            { path: 'manual-upload', loadChildren: () => import('app/modules/admin/setting/data Import/import.module').then(m => m.ImportModule) },
            { path: 'upload-product-exclusion', loadChildren: () => import('app/modules/admin/setting/uploadproductexclusion/uploadproduct.module').then(m => m.UploadProductModule) },
            { path: 'upload-redeem-exclusion', loadChildren: () => import('app/modules/admin/setting/uploadredemptionexclusion/uploadredemption.module').then(m => m.UploadRedemptionModule) },
            { path: 'generalsetting', loadChildren: () => import('app/modules/admin/setting/generalsetting/generalsetting.module').then(m => m.GeneralSettingModule) },
            { path: 'users', loadChildren: () => import('app/modules/admin/setting/user/user.module').then(m => m.AppUserModule) },
            { path: 'pointrangesetting', loadChildren: () => import('app/modules/admin/setting/point range setting/pointrange.module').then(m => m.PointRagneModule) },
            { path: 'redemptionsetting', loadChildren: () => import('app/modules/admin/setting/redemption setting/redemption.module').then(m => m.RedemptionModule) },
            { path: 'change-password', loadChildren: () => import('app/modules/auth/profile/change-password.module').then(m => m.AuthChangePasswordModule) },
            { path: 'profile', loadChildren: () => import('app/modules/admin/setting/profile/profile.module').then(m => m.ProfileModule) },
            { path: 'redemption', loadChildren: () => import('app/modules/admin/productcatalog/Redemption/product.module').then(m => m.ProductModule) }
        ]
    }
];
