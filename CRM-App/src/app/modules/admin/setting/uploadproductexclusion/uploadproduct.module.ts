import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { UploadProductComponent } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct.component';
import { ProductUploadComponent } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct/uploadproduct.component';
import { ecommerceRoutes } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct.routing';

@NgModule({
    declarations: [
        UploadProductComponent,
        ProductUploadComponent
    ],
    imports: [
        RouterModule.forChild(ecommerceRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTabsModule,
        SharedModule,
        MatCardModule
    ],
    providers: [
        DatePipe
    ]
})
export class UploadProductModule {
}
