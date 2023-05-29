import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import * as moment from 'moment';
import { FuseDrawerModule, FuseDrawerService } from '@fuse/components/drawer';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MemberVoucherComponent } from 'app/modules/admin/membervouchers/membervouchers.component';
import { memberVoucherRoutes } from 'app/modules/admin/membervouchers/membervouchers.routing';
import { MemberVoucherListComponent } from 'app/modules/admin/membervouchers/list/list.component';
import { MemberVoucherDetailComponent } from 'app/modules/admin/membervouchers/detail/detail.component';

@NgModule({
    declarations: [
        MemberVoucherComponent,
        MemberVoucherListComponent,
        MemberVoucherDetailComponent
    ],
    imports     : [
        RouterModule.forChild(memberVoucherRoutes),
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
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        NgApexchartsModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        FuseDrawerModule
    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse  : {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput         : 'LL',
                    monthYearLabel    : 'MMM YYYY',
                    dateA11yLabel     : 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class MemberVoucherModule
{
}
