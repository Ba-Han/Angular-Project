import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { Store } from 'app/modules/admin/setting/store/store.types';
import { StoreService } from 'app/modules/admin/setting/store/store.service';

@Component({
    selector: 'store-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class StoreDetailComponent implements OnInit, OnDestroy {
    store: Store;
    storeId: number;
    isLoading: boolean = false;
    selectedCountry: Store | null = null;
    editMode: boolean = false;
    StoreEditForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _storeService: StoreService,
        private _formBuilder: FormBuilder,

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.StoreEditForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['', Validators.required],
            name: ['', Validators.required],
            address_line_1: [''],
            address_line_2: [''],
            city: [''],
            state: [''],
            postal_code: [''],
            region: [''],
            country: ['', Validators.required],
        });

        this._storeService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((store: Store) => {
                this.store = store;
                this.StoreEditForm.patchValue(store);
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
    updateStore(): void {
        // Get the contact object
        const store = this.StoreEditForm.getRawValue();
        // Update the contact on the server
        this._storeService.updateStore(store.code, store).subscribe(() => {


        });
    }
}
