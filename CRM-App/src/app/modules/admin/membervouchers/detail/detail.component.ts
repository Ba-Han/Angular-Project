/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, Subject, takeUntil, Observable, map, merge, switchMap } from 'rxjs';
import { MemberVoucher } from 'app/modules/admin/membervouchers/membervouchers.types';
import { MemberVoucherService } from 'app/modules/admin/membervouchers/membervouchers.service';

@Component({
    selector       : 'memberpoint-details',
    templateUrl: './detail.component.html',
    styles:[ `
                .membervoucher-grid {
                    grid-template-columns: 150px 150px 150px 100px 100px 100px;

                    @screen sm {
                        grid-template-columns: 150px 150px 150px 100px 100px 100px;
                    }

                    @screen md {
                        grid-template-columns: 150px 150px 150px 100px 100px 100px;
                    }

                    @screen lg {
                        grid-template-columns: 150px 150px 150px 100px 100px 100px;
                    }
                }
                .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
                }
            `],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberVoucherDetailComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    editMode: boolean = false;
    memberVoucher: MemberVoucher;
    memberVoucherEditForm: FormGroup;
    memberId: number;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

      constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberVoucherService: MemberVoucherService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
    )
    {
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

        //MemberVoucherEditForm
        this.memberVoucherEditForm = this._formBuilder.group({
            id: [''],
            member_id: this.memberId,
            voucher_code: ['', [Validators.required]],
            points_used: ['', [Validators.required]],
            conversion_rate: ['', [Validators.required]],
            amount: ['', [Validators.required]]
        });

        this._memberVoucherService.memberVoucher$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberVoucher: MemberVoucher) => {
                this.memberVoucher = memberVoucher;
                // Patch values to the form
                this.memberVoucherEditForm.patchValue(memberVoucher);
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

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

         // Mark for check
         this._changeDetectorRef.markForCheck();
     }

    updateMemberVoucher(): void
    {
        const memberVoucher = this.memberVoucherEditForm.getRawValue();
        this._memberVoucherService.updateMemberVoucher(memberVoucher.id, memberVoucher).subscribe(() => {
            this._router.navigate(['/member/', this.memberId, 'voucher'], { relativeTo: this._activatedRoute });
        });
    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

    }

    trackByFn(index: number, item: any): any
    {
         return item.id || index;
    }

    toogleVoucherEditFormMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    EditFormclose(): void {
        this.toogleVoucherEditFormMode(false);
    }
}
