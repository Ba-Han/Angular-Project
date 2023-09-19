/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { FuseAlertType } from '@fuse/components/alert';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, merge, map, switchMap, Subject, takeUntil, Observable, finalize, of } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { Member, MemberPoint, Transaction, MemberTier, MemberInfo, MemberDocument, MemberDocumentPagination, MemberVoucher } from 'app/modules/admin/member/member.types';
import { MemberService } from 'app/modules/admin/member/member.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector       : 'member-details',
    templateUrl: './detail.component.html',
    styles: [
        `
            .memberdetail-grid{
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;

                @screen sm {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }

                @screen md {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }

                @screen lg {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
            }

            .memberdocument-grid {
                grid-template-columns: 200px 150px auto 100px 100px;

                @screen sm {
                    grid-template-columns: 200px 150px auto 100px 100px;
                }

                @screen md {
                    grid-template-columns: 200px 150px auto 100px 100px;
                }

                @screen lg {
                    grid-template-columns: 200px 150px auto 100px 100px;
                }
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .memberdetail-sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .memberdocument_reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 30% !important;
                height: 32% !important;
                border-radius: 8px;
            }

            .memberdocument_parent_popup {
                display: grid;
                align-items: center !important;
                justify-content: center !important;
                height: 27vh;
            }

            .memberdocument_child_btn {
                display: flex;
                gap: 10px;
            }

            .memberdocument_successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .memberdocument_errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .memberdocument_delete_scss {
                position: relative;
                top: 2rem;
            }

            .memberdocument-2-sort {
                position: static;
                width: 13rem !important;
            }

            .memberdocument_sort_by {
                display: grid;
                grid-template-columns: max-content;
                font-weight: 600;
                position: relative;
                margin-left: -5px;
                margin-right: 5px;
            }

            .base64QrCodeImageData {
                height: 5rem !important;
            }

            .base64BarCodeImageData {
                height: 4rem !important;
            }

            .imageCode {
                gap: 1rem;
                position: absolute;
                padding-left: 27rem;
                justify-content: space-between;
                align-items: center;
            }

            .text_danger {
                position: relative;
                color: red;
                left: 1rem;
            }

            .success_text_danger {
                position: relative;
                color: green;
                left: 1rem;
            }

            .see_all_member_log {
                justify-content: end;
                align-items: end;
            }

            .icon_image__size {
                min-width: 3rem !Important;
                min-height: 3rem !important;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class MemberDetailComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('recentTransactionsTable', {read: MatSort}) private _recentTransactionsTableMatSort: MatSort;
    @ViewChild('recentPointsTable', { read: MatSort }) private _recentPointsTableMatSort: MatSort;
    @ViewChild(' memberDocumentsTable', { read: MatSort }) private _memberDocumentsTableMatSort: MatSort;
    @ViewChild(' recentMemberVouchersTable', { read: MatSort }) private _memberVouchersTableMatSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('fileInput') fileInput: ElementRef;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('comment') commentBoxRef!: ElementRef;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    memberPoints$: Observable<MemberPoint[]>;
    transactions$: Observable<Transaction[]>;
    memberDocuments$: Observable<MemberDocument[]>;
    memberDocumentPagination: MemberDocumentPagination;
    memberPoint: MemberPoint;
    memberPointsCount: number = 0;
    editMode: boolean = false;
    pointlistMode: boolean = false;
    pointDetailMode: boolean = false;
    pointDetailEditMode: boolean = false;
    pointDetailViewMode: boolean = false;
    transactionlistMode: boolean = false;
    pointDetailAddMode: boolean = false;
    transactionDetailMode: boolean = false;
    isLoading: boolean = false;
    memberTiers: any;
    tagsEditMode: boolean = false;
    member: Member;
    memberForm: FormGroup;
    members: Member[];
    transactions: any;
    memberVouchers: any;
    points: any;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | '' = '';
    errorMessage: string | '' = '';
    voucherErrorMessage: string | '' = '';
    deleteErrorMessage: string | '' = '';
    validFileMessage: string | '' = '';
    invalidFileMessage: string | '' = '';
    memberDocument: any;
    memberDocumentsForm: FormGroup;
    GenerateVoucherForm: FormGroup;
    generateVoucherFormMode: boolean = false;
    fileToUpload: File[] = [];
    uploadData: any;
    uploadId: number;
    _apiurl: string;
    phoneValidateError: boolean = true;
    memberId: number;
    comment: string | '' = '';
    isAddressexit: boolean = true;
    recentTransactions: Transaction[];
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['document_no', 'total_amount', 'channel_name', 'point', 'point_type', 'purchase_date'];
    recentPointsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentPointsTableColumns: string[] = ['transaction_document_no', 'point_type', 'point', 'balance', 'spending_valid_to'];
    memberDocumentsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    memberDocumentsTableColumns: string[] = ['document_name', 'uploaded_on', 'comment', 'file_path', 'uploaded_by_name'];
    recentMemberVouchersDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentMemberVouchersTableColumns: string[] = ['voucher_code', 'points_used', 'conversion_rate', 'amount', 'balance'];
    searchInputControl: FormControl = new FormControl();
    selectedTier: number;
    isAscending: boolean = true;
    selectedCoulumn = 'uploadeddate';
    qrCodeImageData: string | '' = '';
    barCodeImageData: string | '' = '';
    generateVoucher: MemberVoucher;
    getAvailablePoints: number;
    getPointValue: number;
    getPointToConvert: any;
    getVoucherAmount: any;
    inputPointValue: number = 0;
    formattedNumber: string;
    createGeneateVoucherSuccessfully: string | '' = '';
    getPointConversionRate: any;
    isUploadDisabled: boolean = true;
    fileNotAcceptedErrorMessage: string | '' = '';
    fileAcceptedSuccessMessage: string | '' = '';
    canEdit: boolean = false;
    showClearButton: boolean = false;
    // private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberService: MemberService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _httpClient: HttpClient,
        private _viewContainerRef: ViewContainerRef,
        private datePipe: DatePipe,
        private _userService: UserService,
        private decimalPipe: DecimalPipe
    )
    {
        this._apiurl = environment.apiurl;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }

        });

        //Barcode base64 image
        this._memberService.getBase64BarCodeImageData(this.memberId).subscribe(
            (res: any) => {
              this.barCodeImageData = res;
              this._changeDetectorRef.markForCheck();
            },
            (error) => {
              console.error('Failed to retrieve image data:', error);
            }
        );

        //Qrcode base64 image
        this._memberService.getBase64QRCodeImageData(this.memberId).subscribe(
            (res: any) => {
              this.qrCodeImageData = res;
              this._changeDetectorRef.markForCheck();
            },
            (error) => {
              console.error('Failed to retrieve image data:', error);
            }
        );

        // Create the contact form
        this.memberForm = this._formBuilder.group({
            id              : [''],
            first_name      : ['', Validators.required],
            last_name       : ['', Validators.required],
            mobile_phone    : ['', Validators.required],
            gender          : [''],
            date_of_birth   : ['', Validators.required],
            member_tier_id  : [''],
            member_tier     : [''],
            accept_email    : [''],
            accept_mobile_sms : ['']
        });

        // Create the memberDocumentsUploadForm form
        this.memberDocumentsForm = this._formBuilder.group({
            id: [''],
            upload: [''],
            comment: [''],
            member_id: this.memberId
        });

        // Get the contacts
        this._memberService.members$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((members: Member[]) => {
                this.members = members;
                this._changeDetectorRef.markForCheck();
            });

        //Member Tiers
        this._memberService.memberTiers
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tiers) => {
                this.memberTiers = tiers;
            });

        // Get the contact
        this._memberService.member$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((member: Member) => {
                // Get the contact
                this.member = member;
                this.member.earning = member.earning;
                this.member.spending = member.spending;
                this.member.soonExpiredPoint = member.soonExpiredPoint;
                // eslint-disable-next-line max-len
                if ((this.member.member[0].address_line_1 === '' || this.member.member[0].address_line_1 == null) && (this.member.member[0].address_line_2 === '' || this.member.member[0].address_line_2 == null)
                    // eslint-disable-next-line max-len
                    && (this.member.member[0].postal_code === '' || this.member.member[0].postal_code == null) && (this.member.member[0].city === '' || this.member.member[0].city == null)) {
                    this.isAddressexit = false;
                }

                // Patch values to the form
                this.memberForm.patchValue(member.member[0]);
                if (member.member[0].member_tier !== null) {
                    const tierId = this.memberTiers.find(x => x.id === member.member[0].member_tier_id);
                    this.memberForm.get('member_tier').setValue(tierId);
                }
                    this._changeDetectorRef.markForCheck();
            });

        //memberPoints
        this._memberService.points$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((memberpoints) => {
            this.points = memberpoints;
            // Store the table data
            this.recentPointsDataSource.data = memberpoints;
        });

       //Transactions
        this._memberService.transactions$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((transactions) => {
            this.transactions = transactions;
            this.recentTransactionsDataSource.data = transactions;
        });

        //Member Vouchers
        this._memberService.memberVouchers$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((membervouchers) => {
            this.memberVouchers = membervouchers;
            this.recentMemberVouchersDataSource.data = membervouchers;
        });

        //Member Documents
        this._memberService.memberDocuments$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((memberdocument: MemberDocument[]) => {
            this.memberDocument = memberdocument;
            this.memberDocumentsDataSource.data = memberdocument;
            this._changeDetectorRef.markForCheck();
        });

         // Get the memberDocumentpagination
         this._memberService.memberDocumentpagination$
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe((pagination: MemberDocumentPagination) => {
             this.memberDocumentPagination = pagination;
             // Mark for check
             this._changeDetectorRef.markForCheck();
         });

        // Get Point Rate for Generate Vouchers
        this._memberService.generateVouchers$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((generatevouchers) => {
            this.getPointConversionRate = generatevouchers;
        });

        this.canEdit = this._userService.getEditUserPermissionByNavId('member');
    }

     ngAfterViewInit(): void
     {
         // Make the data source sortable
        this.recentTransactionsDataSource.sort = this._recentTransactionsTableMatSort;
        this.recentPointsDataSource.sort = this._recentPointsTableMatSort;
        this.memberDocumentsDataSource.sort = this._memberDocumentsTableMatSort;
        this.recentMemberVouchersDataSource.sort = this._memberVouchersTableMatSort;

        if (this._sort && this._paginator) {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'documentname') {
                this._sort.sort({
                    id: 'document_name',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'documentname') {
                this._sort.sort({
                    id: 'document_name',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'uploadeddate') {
                this._sort.sort({
                    id: 'uploaded_on',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'uploadeddate') {
                this._sort.sort({
                    id: 'uploaded_on',
                    start: 'desc',
                    disableClear: true
                });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._paginator.pageIndex = 0;
            });

            // Get memberDocuments if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    if(this.isLoading === true) {
                        // eslint-disable-next-line max-len
                        return this._memberService.getMemberDocuments(this.memberId, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                    } else {
                        return of(null);
                    }
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
     }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return null;
    }

    viewMemberPoints(id: number): void
    {
        this._router.navigate([`./memberpoint/${id}`], {relativeTo: this._activatedRoute});
    }

    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleTagsEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onPageChange() {
        this._memberService.getMemberDocuments(this.memberId, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                if( this.isLoading === true) {
                    // eslint-disable-next-line max-len
                    return this._memberService.getMemberDocuments(this.memberId, this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                } else {
                    return of(null);
                }
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    fistUploadFileToTable() {
        this._memberService.getMemberDocuments(this.memberId).pipe(
            switchMap(() => {
                if(this.isLoading === true) {
                    // eslint-disable-next-line max-len
                    return this._memberService.getMemberDocuments(this.memberId);
                } else {
                    return of(null);
                }
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'documentname') {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.selectedCoulumn === 'uploadeddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'documentname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'documentname' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( this.isAscending && this.selectedCoulumn === 'uploadeddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        } else if ( !this.isAscending && this.selectedCoulumn === 'uploadeddate' ) {
            this.ngAfterViewInit();
            this.onPageChange();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    downloadFile(fileUrl: string) {
        const url = `${this._apiurl}/${fileUrl}`;
        window.open(url, '_blank');
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    toogleDeleteMode(DeleteMode: boolean | null = null): void {
        if (DeleteMode === null) {
            this.DeleteMode = !this.DeleteMode;
        }
        else {
            this.DeleteMode = DeleteMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    cancelPopup(): void {
        this.isSuccess = false;
        this.toogleDeleteMode(false);
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._memberService.getDeleteCRMDocuments(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this.onPageChange();
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.deleteErrorMessage = response.error.message;
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onFileSelected(event: Event) {
        const inputElement = event.target as HTMLInputElement;

        if (inputElement.files && inputElement.files.length > 0) {
          const files: FileList = inputElement.files;

          // List of accepted file types
          const acceptedTypes: string[] = [
            'text/csv', // .csv
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/pdf', // .pdf
            'image/jpeg', // .jpg, .jpeg
            'image/png', // .png
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
          ];

          // Check if any of the selected files are not of an accepted type
          const invalidFiles: File[] = Array.from(files).filter(file => !acceptedTypes.includes(file.type));

          if (invalidFiles.length > 0) {
            this.fileNotAcceptedErrorMessage = 'Invalid file types: ' + invalidFiles.map(file => file.name).join(', ');
            this.showClearButton = true;
            this.isUploadDisabled = true;
            this._changeDetectorRef.markForCheck();
          } else {
            // Store the selected files in an array
            this.fileToUpload = Array.from(files);
            this.showClearButton = true;
            this.isUploadDisabled = false;
            this._changeDetectorRef.markForCheck();
          }
          this._changeDetectorRef.markForCheck();
        }
    }

    clearFileToUpload(): void {
        this.fileInput.nativeElement.value = '';
        this.uploadData = '';
        this.fileNotAcceptedErrorMessage = '';
        this.fileAcceptedSuccessMessage = '';
        this.isUploadDisabled = true;
        this.showClearButton = false;
        this.fileToUpload = null;
        this._changeDetectorRef.markForCheck();
    }

    uploadMemberDocumentsFile(): void {
        const formData = new FormData();
        // Append all selected files to the FormData
        for (const file of this.fileToUpload) {
            formData.append('file', file);
        }
        formData.append('member_id', this.memberId.toString());
        formData.append('comment', this.comment);

        this._httpClient.post(`${this._apiurl}/items/member_document`, formData).subscribe(
            (response: any) => {
                this.uploadData = response.data;
                this.fistUploadFileToTable();
                this.comment = '';
                this.fileAcceptedSuccessMessage = 'Upload Successfully.';
                this._changeDetectorRef.markForCheck();
            },
            (error) => {
                this.errorMessage = error.error.message;
                this._changeDetectorRef.markForCheck();
              }
        );
        this._changeDetectorRef.markForCheck();
    }

    updateMember(): void {
        this.showAlert = false;
        const member = this.memberForm.getRawValue();
        member.date_of_birth = this.datePipe.transform(member.date_of_birth, 'yyyy-MM-dd');
        const sameUserPhone = member.mobile_phone === this.member.member[0].mobile_phone ? true : false;
        //let showHideError = this.phoneValidateError ? false : true;
        this._memberService.checkMemberPhone(member.mobile_phone, this.memberId)
        .pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => {
                if(sameUserPhone){
                    this.updateMemberInfo(member.id, member);
                    this.phoneValidateError = true;
                    this._changeDetectorRef.markForCheck();
                }
                else{
                    if(this.phoneValidateError){
                        this.updateMemberInfo(member.id, member);
                        this._changeDetectorRef.markForCheck();
                    }
                    else{
                        this.phoneValidateError = false;
                    }
                }
                this._changeDetectorRef.markForCheck();
             })
        )
        .subscribe((response) => {
            this.phoneValidateError = response ? response.success : false;
            }
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateMemberInfo(id: number, member: MemberInfo){
        this._memberService.updateMember(id, member)
            .pipe(
                finalize(() => {
                    //this.showAlert = true;
                })
            )
            .subscribe(
                (response: any) => {
                    //this.updateMemberDw(member.id, member);
                    this.alert = {
                        type: 'success',
                        message: 'Update Successfully.'
                    };
                    this.member.earning = this.member.earning;
                    this.member.spending = this.member.spending;
                    const bathDatestring = response.data[0] != null ? response.data[0].date_of_birth : '';
                    const date = new Date(bathDatestring);
                    const modifyBirthDate = new Date(date.setDate(date.getDate() + Number(1)));
                    //const modifyBirthDate = new Date(date.setDate(date.getDate()));
                    //response.data[0].member_tier = this.memberTiers.find(x => x.id === response.data[0].member_tier.name);
                    response.data.member_tier = this.memberTiers.find(x => x.id === response.data[0].member_tier.name);
                    response.data[0].date_of_birth = modifyBirthDate;
                    this.member.member[0] = response.data[0];
                    // eslint-disable-next-line eqeqeq
                    if ((response.data.address_line_1 == '' || response.data.address_line_1 == null) && (response.data.address_line_2 == '' || response.data.address_line_2 == null)
                        // eslint-disable-next-line eqeqeq
                        && (response.data.postal_code == '' || response.data.postal_code == null) && (response.data.city == '' || response.data.city == null)) {
                        this.isAddressexit = false;
                    }
                    else {
                        this.isAddressexit = true;
                    }
                    this.toggleEditMode(false);
                },
                (response) => {
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.'
                    };
                }
            );
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    updateMemberDw(id: Number, member: any): void {
        this._memberService.updateMemberDw(id, member).subscribe((response: any) =>
            // Set the alert
             response
        ,
        (response) => {
            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Somthing went wrong!'
            };
            return response;
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toogleGenerateVoucherFormMode(generateVoucherFormMode: boolean | null = null) {
        if (generateVoucherFormMode === null) {
            this.generateVoucherFormMode = !this.generateVoucherFormMode;
        }
        else {
            this.generateVoucherFormMode = generateVoucherFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    openGernerateVoucherForm(): void {
        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }
        });

        this.getAvailablePoints = this.member.spending.totalPoint;
        this.getPointToConvert = this.inputPointValue;
        this.getVoucherAmount = this.getPointToConvert / this.getPointConversionRate;
        this.formattedNumber = this.getVoucherAmount.toFixed(2);

         // Create the generate voucher form
         this.GenerateVoucherForm = this._formBuilder.group({
            id: [''],
            available_points: [this.getAvailablePoints],
            voucher_code: [''],
            member_id: this.memberId,
            points_used: [this.getPointToConvert, [Validators.required, Validators.max(this.getAvailablePoints)]],
            conversion_rate: [this.getPointConversionRate],
            amount: [this.formattedNumber],
        });

        this.toogleGenerateVoucherFormMode(true);
        this.drawerTwo.open();
        this._changeDetectorRef.markForCheck();
    }

    createGenerateVoucher(): void
    {
        const generateVoucher = this.GenerateVoucherForm.getRawValue();
        this._memberService.createGenerateVoucher(generateVoucher).subscribe(() => {
            this.createGeneateVoucherSuccessfully = 'Generate Voucher Successfully!';
            this.toogleGenerateVoucherFormMode(true);
            this.GenerateVoucherForm.reset();
            this._changeDetectorRef.markForCheck();
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.voucherErrorMessage = response.error.message;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
    }

    closeGenerateVoucherForm(): void
    {
        this.createGeneateVoucherSuccessfully = '';
        this.toogleGenerateVoucherFormMode(false);
        this.drawerTwo.close();
        this._changeDetectorRef.markForCheck();
    }
}
