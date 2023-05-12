import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MemberPointService } from 'app/modules/admin/memberpoint/memberpoint.service';
import { MemberService } from 'app/modules/admin/member/member.service';
import { MemberPoint, MemberPointPagination } from 'app/modules/admin/memberpoint/memberpoint.types';
import { GeneralSetting } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector       : 'memberpoint-list',
    templateUrl    : './list.component.html',
    styles         : [
        `
            .memberpoint-grid {
                grid-template-columns: 150px 150px 100px 100px 150px 180px;

                @screen sm {
                    grid-template-columns: 150px 150px 100px 100px 150px 180px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 100px 100px 150px 180px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 100px 100px 150px 180px;
                }
            }
            .membercustom-paging {
                position: fixed !important;
                bottom: 57px;
            }

            .reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 28% !important;
                height: 34% !important;
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

            .delete-scss {
                position: fixed;
                padding-left: 2rem;
            }

            .deleteMemberPointscss {
                position: relative;
                bottom: 0.6rem;
                left: 62rem;
                margin: -2rem;
            }

            .sort-asc::after {
                content: '\u2191';
              }

            .sort-desc::after {
                content: '\u2193';
            }

            .memberpoint-2-sort {
                position: static;
                width: 10rem !important;
            }

            .sort-btn-01 {
                border-radius: 3px !important;
                padding: 12px !important;
                min-width: 5px !important;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class MemberPointListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    memberPoints$: Observable<MemberPoint[]>;
    memberPointsCount: number = 0;
    isLoading: boolean = false;
    pagination: MemberPointPagination;
    setting: GeneralSetting;
    minDate: string;
    memberId: number;
    pointAddFormMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    memberPointAddForm: FormGroup;
    pointsTableColumns: string[] = ['id', 'point_type', 'reward_code', 'point', 'transaction_document_no', 'status', 'date_created', 'pointsInDoller', 'real_amount', 'vat_amount', 'total_amount'];
    searchInputControl: FormControl = new FormControl();
    transactionSearchInputControl: FormControl = new FormControl();
    selectedMemberPoint: MemberPoint | null = null;
    isAscending: boolean = true;
    selectedCoulumn = 'documentno';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor( private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberPointService: MemberPointService,
        private _memberservice: MemberService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _userService: UserService
    )
    {
        const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void
    {
        this._activatedRoute.url.subscribe((param) => {
            if (param != null) {
                this.memberId = Number(param[0].path);
            }

        });

        this.memberPointAddForm = this._formBuilder.group({
            id: 0,
            member: this.memberId,
            point_type: ['adjustment', [Validators.required]],
            point_type_int: ['', [Validators.required]],
            reward_code: ['', [Validators.required]],
            point: ['', [Validators.required]],
            expiry_date: ['', [Validators.required]],
            /* expiry_date: ['', [Validators.required]], */
            /* status: ['', [Validators.required]], */
            comment: ['', [Validators.required]],
        });

        // Get the data
        this.memberPoints$ = this._memberPointService.memberPoints$;
        this._memberPointService.memberPoints$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberPoints: MemberPoint[]) => {
                this.memberPointsCount = memberPoints.length;
                 this._changeDetectorRef.markForCheck();

            });
        this._memberservice.setting$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((setting: GeneralSetting) => {
                this.setting = setting;
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._memberPointService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: MemberPointPagination) => {
            this.pagination = pagination;
            this._changeDetectorRef.markForCheck();
        });

         // search
         this.searchInputControl.valueChanges
         .pipe(
             takeUntil(this._unsubscribeAll),
             debounceTime(300),
             switchMap((query) => {
                 this.isLoading = true;
                 return this._memberPointService.getData(Number(this.memberId),0, 10, 'date_created', 'desc', query);
             }),
             map(() => {
                 this.isLoading = false;
             })
         ).subscribe();

        this.canEdit = this._userService.getEditUserPermissionByNavId('member');
        this.canDelete = this._userService.getDeleteUserPermissionByNavId('member');
    }

    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            if (this.isAscending && this.selectedCoulumn === 'documentno') {
                this._sort.sort({
                    id: 'transaction_document_no',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'documentno') {
                this._sort.sort({
                    id: 'transaction_document_no',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'pointtype') {
                this._sort.sort({
                    id: 'point_type',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'pointtype') {
                this._sort.sort({
                    id: 'point_type',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'points') {
                this._sort.sort({
                    id: 'point',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'points') {
                this._sort.sort({
                    id: 'point',
                    start: 'desc',
                    disableClear: true
                });
            } else if (this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'date_created',
                    start: 'asc',
                    disableClear: true
                });
            } else if (!this.isAscending && this.selectedCoulumn === 'date') {
                this._sort.sort({
                    id: 'date_created',
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
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                });

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    return this._memberPointService.getData(Number(this.memberId),this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    onBackdropClicked(): void
     {
         this._router.navigate(['./'], {relativeTo: this._activatedRoute});
         this._changeDetectorRef.markForCheck();
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
        this._memberPointService.getDeleteMemberPoint(this.selectedId)
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.isLoading = true;
                return this._memberPointService.getData(Number(this.memberId),0, 10, 'date_created', '');
            }),
            map(() => {
                this.isLoading = false;
            })
        )
        .subscribe();
        this.isSuccess = true;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingColumnList() {
        if ( this.selectedCoulumn === 'documentno') {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
        } else if ( this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sortingPageList() {
        this.isAscending = !this.isAscending;
        if ( this.isAscending && this.selectedCoulumn === 'documentno' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'documentno' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'pointtype' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'points' ) {
            this.ngAfterViewInit();
        } else if ( this.isAscending && this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
        } else if ( !this.isAscending && this.selectedCoulumn === 'date' ) {
            this.ngAfterViewInit();
        }
    }

    createMemberPoint(): void
    {
        const newmemberPoint = this.memberPointAddForm.getRawValue();
        this._memberPointService.createMemberPoint(newmemberPoint, Number(this.setting.point_conversion)).subscribe(() => {
            this.tooglepointAddFormMode(false);
            this._changeDetectorRef.markForCheck();
        });
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    tooglepointAddFormMode(pointAddFormMode: boolean | null = null): void {
        if (pointAddFormMode === null) {
            this.pointAddFormMode = !this.pointAddFormMode;
        }
        else {
            this.pointAddFormMode = pointAddFormMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    AddFormclose(): void {
        this.tooglepointAddFormMode(false);
    }
}
