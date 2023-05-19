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
import { debounceTime, merge, map, switchMap, Subject, takeUntil, Observable, finalize } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { Member, MemberPoint, Transaction, MemberTier, MemberInfo, MemberDocument, MemberDocumentPagination } from 'app/modules/admin/member/member.types';
import { MemberService } from 'app/modules/admin/member/member.service';

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

            .sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }

            .reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 28% !important;
                height: 34% !important;
                border-radius: 8px;
            }

            .parent_popup {
                position: fixed;
                display: grid;
                justify-content: center;
                padding: 4rem;
            }

            .child_btn {
                padding-left: 1.5rem;
                position: fixed;
                margin-top: 2rem !important;
            }

            .update_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 4rem;
                font-size: 16px;
            }

            .successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .delete-scss {
                position: fixed;
                padding-left: 2rem;
            }

            .memberdocument-2-sort {
                position: static;
                width: 11rem !important;
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
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('fileInput') fileInput: ElementRef;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('comment') commentBoxRef!: ElementRef;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    memberPoints$: Observable<MemberPoint[]>;
    transactions$: Observable<Transaction[]>;
    memberDocument$: Observable<MemberDocument[]>;
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
    points: any;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    validFileMessage: string | null = null;
    invalidFileMessage: string | null = null;
    memberDocuments: any;
    memberDocument: any;
    memberDocumentsForm: FormGroup;
    fileToUpload: File;
    uploadData: any;
    uploadId: number;
    _apiurl: string;
    isManagerRole: boolean = false;
    phoneValidateError: boolean = true;
    memberId: number;
    comment: string | '' = '';
    isAddressexit: boolean = true;
    recentTransactions: Transaction[];
    pointsTableColumns: string[] = ['id', 'point_type', 'reward_code', 'point', 'transaction_document_no', 'status', 'date_created'];
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['document_no', 'total_amount', 'channel_name', 'point', 'point_type', 'purchase_date'];
    recentPointsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentPointsTableColumns: string[] = ['transaction_document_no', 'point_type', 'point'];
    memberDocumentsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    memberDocumentsTableColumns: string[] = ['document_name', 'uploaded_on', 'comment', 'file_path', 'uploaded_by_name'];
    searchInputControl: FormControl = new FormControl();
    selectedTier: number;
    isAscending: boolean = true;
    selectedCoulumn = 'uploadeddate';
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
    )
    {
        this._apiurl = environment.apiurl;
    }
    get userRole(): string {
        return localStorage.getItem('userRoleName') ?? null;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.isManagerRole = this.userRole === 'CRM APP Manager' ? true : false;

        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }

        });

        // Create the contact form
        this.memberForm = this._formBuilder.group({
            id              : [''],
            first_name      : ['', Validators.required],
            last_name       : ['', Validators.required],
            mobile_phone    : ['', Validators.required],
            gender          : [''],
            date_of_birth: ['', Validators.required],
            member_tier : [''],
            accept_email : [''],
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
                if (member.member[0].member_tier != null) {
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

        //memberDocuments
        this._memberService.memberDocument$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((memberdocuments) => {
            this.memberDocuments = memberdocuments;
            // Store the table data
            this.memberDocumentsDataSource.data = memberdocuments;
        });

        //memberDocuments in Edit Mode
        this._memberService.memberDocuments$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((memberdocument: MemberDocument[]) => {
            this.memberDocument = memberdocument;
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

         // search
         this.searchInputControl.valueChanges
         .pipe(
             takeUntil(this._unsubscribeAll),
             debounceTime(300),
             switchMap((query) => {
                 this.isLoading = true;
                 return this._memberService.getMemberDocuments(0, 10, 'uploaded_on', 'asc', query);
             }),
             map(() => {
                 this.isLoading = false;
             })
        ).subscribe();
    }

     ngAfterViewInit(): void
     {
         // Make the data source sortable
        this.recentTransactionsDataSource.sort = this._recentTransactionsTableMatSort;
        this.recentPointsDataSource.sort = this._recentPointsTableMatSort;
        this.memberDocumentsDataSource.sort = this._memberDocumentsTableMatSort;

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
                    this.isLoading = true;
                    //const sort = this._sort.direction === 'desc' ? '-' + this._sort.active : this._sort.active;
                    // eslint-disable-next-line max-len
                    return this._memberService.getMemberDocuments(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
        this._memberService.getMemberDocuments(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._memberService.getMemberDocuments(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'documentname' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'documentname' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'uploadeddate' ) {
            this.ngAfterViewInit();
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
        this.matDrawer.close();
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
                    this._router.navigate(['/member'], { relativeTo: this._activatedRoute });
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
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
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onFileSelected(event) {
        if (event.target.files.length > 0) {
            this.fileToUpload = event.target.files[0];
            this.memberDocumentsForm.get('upload').setValue(this.fileToUpload);
            this._changeDetectorRef.markForCheck();
        }
        this._changeDetectorRef.markForCheck();
    }

    clearFileToUpload(): void {
        this.fileInput.nativeElement.value = '';
        this.fileToUpload = null;
        this._changeDetectorRef.markForCheck();
    }

    uploadMemberDocumentsFile(): void {
        const formData = new FormData();
        formData.append('file', this.fileToUpload);
        formData.append('member_id', this.memberId.toString());
        formData.append('comment', this.comment);
        //const upload = this.memberDocumentsForm.getRawValue();

        this._httpClient.post(`${this._apiurl}/items/member_document`, formData).subscribe(
            (response: any) => {
                this.uploadData = response.data;
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
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
        this._memberService.checkMemberPhone(member.mobile_phone)
        .pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => {
                if(sameUserPhone){
                    this.updateMemberInfo(member.id, member);
                    this.phoneValidateError = true;
                }
                else{
                    if(this.phoneValidateError){
                        this.updateMemberInfo(member.id, member);
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

}
