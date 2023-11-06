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
import { UploadRedemptionService } from 'app/modules/admin/setting/uploadredemptionexclusion/uploadredemption.service';
import { DatePipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'uploadredemptionexclusion-uploadredemption',
    templateUrl: './uploadredemption.component.html',
    styles: [
        `
            .hover-download_template_redemption {
                text-decoration: underline;
            }

            .upload_redeem_dropdown {
                width: 27rem;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class RedemptionUploadComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('fileInput') fileInput: ElementRef;

    fileToUpload: File;
    uploadRedeemExclusionForm: FormGroup;
    uploadRedeemSuccess: string | '' = '';
    _apiurl: string;
    isLoading: boolean = false;
    isUpload: boolean = false;
    canEdit: boolean = false;
    errorMessage: string | '' = '';
    proccedSuccessMessage: string | '' = '';
    isRedeemUploadDisabled: boolean = true;
    fileNotAcceptedErrorMessage: string | '' = '';
    isHovered: boolean;
    getProcessType: number | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _uploadRedemptionService: UploadRedemptionService,
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
        this.uploadRedeemExclusionForm = this._formBuilder.group({
            processType: ['', [Validators.required]]
        });

        this.getProcessTypeRedeemValue(this.getProcessType);
        this.canEdit = this._userService.getEditUserPermissionByNavId('upload-redeem-exclusion');
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
    onFileRedeemSelect(event) {
        if (event.target.files.length > 0) {
            this.fileToUpload = event.target.files[0];
            const fileType: string = this.fileToUpload.type;
            // Accepted file types
            const acceptedTypes: string[] = [
                'text/csv' // .csv
            ];
            // If not accepted file types, then disabled upload button
            if (acceptedTypes.includes(fileType)) {
                this.isRedeemUploadDisabled = false;
            } else {
                this.fileNotAcceptedErrorMessage = 'Only .csv file type is allowed!';
                this.isRedeemUploadDisabled = true;
            }
            this._changeDetectorRef.markForCheck();
        }
        this._changeDetectorRef.markForCheck();
    }

    clearFileToRedeemUpload(): void {
        this.fileInput.nativeElement.value = '';
        this.fileNotAcceptedErrorMessage = '';
        this.errorMessage = '';
        this.proccedSuccessMessage = '';
        this.uploadRedeemSuccess = '';
        this.isRedeemUploadDisabled = true;
        this.fileToUpload = null;
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getProcessTypeRedeemValue(selectedValue: number) {
        this.getProcessType = selectedValue;
    }

    uploadRedeemFile(): void {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);

        const apiUrl = `${this._apiurl}/manualupload/redemptionExclution?processType=${this.getProcessType}`;

        this._httpClient.post(apiUrl, formData).subscribe(
            (response: any) => {
                this.uploadRedeemSuccess = 'Upload Succcessfully.';
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
