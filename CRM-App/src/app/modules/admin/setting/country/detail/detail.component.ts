import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { Country } from 'app/modules/admin/setting/country/country.types';
import { CountryService } from 'app/modules/admin/setting/country/country.service';

@Component({
    selector: 'country-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class CountryDetailComponent implements OnInit, OnDestroy {
    country: Country;
    countryId: number;
    isLoading: boolean = false;
    selectedCountry: Country | null = null;
    CountryEditForm: FormGroup;
    editMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _channelService: CountryService,
        private _formBuilder: FormBuilder,

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.CountryEditForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['', Validators.required],
            name: ['', Validators.required],
            calling_code: ['']
        });

        this._channelService.country$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((country: Country) => {
                this.country = country;
                this.CountryEditForm.patchValue(country);
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
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateCountry(): void {
        // Get the contact object
        const country = this.CountryEditForm.getRawValue();
        // Update the contact on the server
        this._channelService.updateCountry(country.code, country).subscribe(() => {


        });
    }
}
