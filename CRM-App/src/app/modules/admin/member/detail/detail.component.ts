/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FuseAlertType } from '@fuse/components/alert';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, merge, map, switchMap, Subject, takeUntil, Observable, finalize } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { Member, MemberPoint, Transaction, MemberTier, MemberInfo } from 'app/modules/admin/member/member.types';
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
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    memberPoints$: Observable<MemberPoint[]>;
    transactions$: Observable<Transaction[]>;
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
    isManagerRole: boolean = false;
    phoneValidateError : boolean = true;
    memberId: number;
    isAddressexit: boolean = true;
    recentTransactions: Transaction[];
    pointsTableColumns: string[] = ['id', 'point_type', 'reward_code', 'point', 'transaction_document_no', 'status', 'date_created'];
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['document_no', 'total_amount', 'channel_name', 'point', 'point_amount', 'point_type', 'purchase_date'];
    recentPointsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentPointsTableColumns: string[] = ['transaction_document_no', 'point_type', 'point', 'pointsInDoller'];
    searchInputControl: FormControl = new FormControl();
    selectedTier: number;
    // private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
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
        private _viewContainerRef: ViewContainerRef,
        private datePipe: DatePipe,
    )
    {
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
        this.isManagerRole = this.userRole == "CRM APP Manager" ? true : false;

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
                if ((this.member.member[0].address_line_1 == '' || this.member.member[0].address_line_1 == null) && (this.member.member[0].address_line_2 == '' || this.member.member[0].address_line_2 == null)
                    && (this.member.member[0].postal_code == "" || this.member.member[0].postal_code == null) && (this.member.member[0].city == "" || this.member.member[0].city == null)) {
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

        this._memberService.points$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((memberpoints) => {
            this.points = memberpoints;
            // Store the table data
            this.recentPointsDataSource.data = memberpoints;
        });

       //Transaction
        this._memberService.transactions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transactions) => {
                this.transactions = transactions;
                this.recentTransactionsDataSource.data = transactions;

            });

    }

     ngAfterViewInit(): void
     {
         // Make the data source sortable
         this.recentTransactionsDataSource.sort = this._recentTransactionsTableMatSort;
         this.recentPointsDataSource.sort = this._recentPointsTableMatSort;

         if (this._sort && this._paginator) {
             // Set the initial sort
             this._sort.sort({
                 id: 'document_no',
                 start: 'asc',
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
