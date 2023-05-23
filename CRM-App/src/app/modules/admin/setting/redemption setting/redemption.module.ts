import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import * as moment from 'moment';
import { FuseDrawerModule, FuseDrawerService } from '@fuse/components/drawer';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { FuseAlertModule } from '@fuse/components/alert';
import { RedemptionComponent } from 'app/modules/admin/setting/redemption setting/redemption.component';
import { RedemptionSettingListComponent } from 'app/modules/admin/setting/redemption setting/list/redemption.component';
import { RedemptionSettingDetailComponent } from 'app/modules/admin/setting/redemption setting/detail/detail.component';
import { ecommerceRoutes } from 'app/modules/admin/setting/redemption setting/redemption.routing';

@NgModule({
    declarations: [
        RedemptionComponent,
        RedemptionSettingListComponent,
        RedemptionSettingDetailComponent
    ],
    imports: [
        RouterModule.forChild(ecommerceRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatSlideToggleModule,
        MatTooltipModule,
        NgApexchartsModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        FuseAlertModule
    ]
})
export class RedemptionModule {
}
