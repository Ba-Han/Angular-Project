import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { debounceTime, map,tap, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UploadProductService } from 'app/modules/admin/setting/uploadproductexclusion/uploadproduct.service';
import { DatePipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'uploadproductexclusion-uploadproduct',
    templateUrl: './uploadproduct.component.html',
    styles: [
        `
            .hover-download_template_product {
                text-decoration: underline;
            }

            .upload_product_dropdown {
                width: 27rem;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ProductUploadComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('fileInput') fileInput: ElementRef;

    fileToUpload: File;
    uploadProductExclusionForm: FormGroup;
    uploadProductSuccess: string | '' = '';
    _apiurl: string;
    isLoading: boolean = false;
    isUpload: boolean = false;
    canEdit: boolean = false;
    errorMessage: string | '' = '';
    proccedSuccessMessage: string | '' = '';
    isUploadProductDisabled: boolean = true;
    fileNotAcceptedErrorMessage: string | '' = '';
    isHovered: boolean;
    getProcessType: number | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _uploadProductService: UploadProductService,
        private _formBuilder: FormBuilder,
        private _httpClient: HttpClient,
        private datePipe: DatePipe,
        private _userService: UserService
    ) {
        this._apiurl = environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.uploadProductExclusionForm = this._formBuilder.group({
            processType: ['', [Validators.required]]
        });

        this.getProcessTypeProductValue(this.getProcessType);
        this.canEdit = this._userService.getEditUserPermissionByNavId('upload-product-exclusion');
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onFileProductSelect(event) {
        if (event.target.files.length > 0) {
            this.fileToUpload = event.target.files[0];
            const fileType: string = this.fileToUpload.type;
            // Accepted file types
            const acceptedTypes: string[] = [
                'text/csv' // .csv
            ];
            // If not accepted file types, then disabled upload button
            if (acceptedTypes.includes(fileType)) {
                this.isUploadProductDisabled = false;
            } else {
                this.fileNotAcceptedErrorMessage = 'Only .csv file type is allowed!';
                this.isUploadProductDisabled = true;
            }
            this._changeDetectorRef.markForCheck();
        }
        this._changeDetectorRef.markForCheck();
    }

    clearFileToProductUpload(): void {
        this.fileInput.nativeElement.value = '';
        this.fileNotAcceptedErrorMessage = '';
        this.errorMessage = '';
        this.proccedSuccessMessage = '';
        this.uploadProductSuccess = '';
        this.isUploadProductDisabled = true;
        this.fileToUpload = null;
        this.uploadProductExclusionForm.get('processType').setValue(null);
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getProcessTypeProductValue(selectedValue: number) {
        this.getProcessType = selectedValue;
    }

    uploadProductFile(): void {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);

        const apiUrl = `${this._apiurl}/manualupload/productExclution?processType=${this.getProcessType}`;

        this._httpClient.post(apiUrl, formData).subscribe(
            (response: any) => {
                this.uploadProductSuccess = 'Upload Successfully.';
                this.getProcessType = null;

                const fileInput = this.fileInput.nativeElement;
                fileInput.value = '';
                this._changeDetectorRef.markForCheck();
            },
            (error) => {
                this.errorMessage = error.error.message;
                this._changeDetectorRef.markForCheck();
              }
        );
        this._changeDetectorRef.markForCheck();
    }
}
