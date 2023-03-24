import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { debounceTime, map,tap, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ImportActivity, ImportActivityPagination } from 'app/modules/admin/setting/data Import/import.types';
import { ImportService } from 'app/modules/admin/setting/data Import/import.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'import-list',
    templateUrl: './import.component.html',
    styles: [
        `
            .import-grid{
                 grid-template-columns: 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 150px;
                }

            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ImportComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    searchInputControl: FormControl = new FormControl();
    code: string;
    activities$: Observable<ImportActivity[]>;
    MemberMode: boolean = false;
    MemberListMode: boolean = false;
    ProductExclusionMode: boolean = false;
    CountryAddForm: FormGroup;
    fileToUpload: File;
    memberUploadForm: FormGroup;
    importId: string;
    createDate: string;
    _apiurl: string;
    isLoading: boolean = false;
    isDisable: boolean = true;
    isUpload: boolean = false;
    pagination: ImportActivityPagination;
    memberList$: Observable<ImportActivity[]>;
    exclusion$: Observable<ImportActivity[]>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _importService: ImportService,
        private _formBuilder: FormBuilder,
        private _httpClient: HttpClient,
        private datePipe: DatePipe,
    ) {
        this._apiurl = environment.apiurl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.memberUploadForm = this._formBuilder.group({
            upload: ['']
        });

        //Get member import job List
        this._importService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ImportActivityPagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        
        this.activities$ = this._importService.activities$;

        // search

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._importService.getActivities(0, 10, 'import_date', 'desc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'import_date',
                start: 'desc',
                disableClear: true
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                });

            // Get channels if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    return this._importService.getActivities(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    toogleMember(MemberMode: boolean | null = null): void {
        if (MemberMode === null) {
            this.MemberMode = !this.MemberMode;
        }
        else {
            this.MemberMode = MemberMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    toogleProductExclusion(MemberListMode: boolean | null = null): void {
        if (MemberListMode === null) {
            this.MemberListMode = !this.MemberListMode;
        }
        else {
            this.MemberListMode = MemberListMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    toogleMemberList(ProductExclusionMode: boolean | null = null): void {
        if (ProductExclusionMode === null) {
            this.ProductExclusionMode = !this.ProductExclusionMode;
        }
        else {
            this.ProductExclusionMode = ProductExclusionMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileSelect(event) {
        if (event.target.files.length > 0) {
            this.fileToUpload = event.target.files[0];
            this.memberUploadForm.get('upload').setValue(this.fileToUpload);
        }
    }

    uploadFile(): void {
        const formData = new FormData();
        //const upload = this.memberUploadForm.getRawValue();
        formData.append('file', this.fileToUpload);
        this._httpClient.post<any>(`${this._apiurl}/files`, formData).subscribe(
            (res) => {
                this.importId = res.data.id;
                this.isDisable = false;
                this.uploadButton(false);
                console.log("check" + this.isUpload);
            },
            (err) => console.log(err)
        );
    }

    importFile(collection): void {
        this.isLoading = true;
        let date = new Date();
        this.createDate = this.datePipe.transform(date, 'yyyy-MM-ddThh:mm:ss');
        this._importService.importFile(this.importId, collection, this.createDate)
            //.pipe(
            //    tap(() => {
            //        this.activities$ = this._importService.activities$;
            //        this.isLoading = false;
            //    })

            .subscribe();

    }
    uploadButton(isUpload: boolean | null = null): void {
        if (isUpload === null) {
            this.isUpload = !this.isUpload;
        }
        else {
            this.isUpload = isUpload;
        }
        this._changeDetectorRef.markForCheck();
    }
}
