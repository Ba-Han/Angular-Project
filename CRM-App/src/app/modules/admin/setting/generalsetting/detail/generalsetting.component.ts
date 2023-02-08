import { ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, map } from 'rxjs';
import { FuseAlertModule } from '@fuse/components/alert';
import { GeneralSetting } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import { GeneralSettingService } from 'app/modules/admin/setting/generalsetting/generalsetting.service';

@Component({
    selector: 'generalsetting',
    templateUrl: './generalsetting.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class SettingDetailComponent implements OnInit, OnDestroy {
    setting: GeneralSetting;
    isLoading: boolean = false;
    SettingEditForm: FormGroup;
    editMode: boolean = false;
    isSuccess : boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _settingService: GeneralSettingService,
        private _formBuilder: FormBuilder,
        
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.SettingEditForm = this._formBuilder.group({
            id: [''],
            transaction_rounding: ['', [Validators.required]],
            point_conversion: [''],
            
        });
        this._settingService.setting$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((setting: GeneralSetting) => {
                this.setting = setting;
                this.SettingEditForm.patchValue(setting);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    updateSetting(): void {
        this.isLoading = true;
        const setting = this.SettingEditForm.getRawValue();
        this._settingService.updateSetting(setting.id, setting).pipe(
            map(() => {
                this.isLoading = false;
                //this.isSuccess = true;
            })
        ).subscribe();
        this.isSuccess = true;
    }
}
