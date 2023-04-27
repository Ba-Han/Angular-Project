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
import { MemberPoint, PointSegment, PointSegmentPagination } from 'app/modules/admin/memberpoint/memberpoint.types';
import { MemberPointService } from 'app/modules/admin/memberpoint/memberpoint.service';

@Component({
    selector       : 'memberpoint-details',
    templateUrl: './detail.component.html',
    styles:[ `
                .members-grid {
                    grid-template-columns: 60px 100px 100px 100px 100px;

                    @screen sm {
                        grid-template-columns: 60px 100px 100px 100px 100px;
                    }

                    @screen md {
                        grid-template-columns: 60px 150px 150px 150px 150px;
                    }

                    @screen lg {
                        grid-template-columns: 60px 150px 150px 150px 150px;
                    }
                }
                .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
                }
                .pointsegment-grid{
                   grid-template-columns: 60px 100px auto;

                    @screen sm {
                        grid-template-columns: 60px 100px auto;
                    }

                    @screen md {
                        grid-template-columns: 60px 150px auto;
                    }

                    @screen lg {
                        grid-template-columns: 60px 150px auto;
                    }
                }
            `],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberPointDetailComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    editMode: boolean = false;
    memberPoint: MemberPoint;
    memberPointEditForm: FormGroup;
    memberPoints: MemberPoint[];
    memberId: number;
    pointType: boolean = false;
    minDate: string;
    searchInputControl: FormControl = new FormControl();
    adjustmentType: number;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


      constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _memberPointService: MemberPointService,
        private _formBuilder: FormBuilder,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
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

        //this.selectedMember = this._memberPointService.memberFullName;
        //this.selectedPointBasket = this._memberPointService.pointBasketFullName;
        //this.basketId = this._memberPointService.pointBasketId;

        //MemberPointEditForm
        this.memberPointEditForm = this._formBuilder.group({
            id: [''],
            member: this.memberId,
            point_type: ['adjustment', [Validators.required]],
            point_type_int: ['', [Validators.required]],
            reward_code: ['', [Validators.required]],
            point: ['', [Validators.required]],
            earning_valid_to: ['', [Validators.required]],
            /* expiry_date: ['', [Validators.required]], */
            /* status: ['', [Validators.required]], */
            comment: ['', [Validators.required]],
        });

        this._memberPointService.memberPoint$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((memberPoint: MemberPoint) => {
                this.memberPoint = memberPoint;
                this.pointType = memberPoint.point_type.toString().toLowerCase() === 'adjustment' ? true : false;
                this.adjustmentType = memberPoint.point_type_int;
                // Patch values to the form
                this.memberPointEditForm.patchValue(memberPoint);
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

    updateMemberPoint(): void
    {
        const memberPoint = this.memberPointEditForm.getRawValue();
        this._memberPointService.updateMemberPoint(memberPoint.id, memberPoint).subscribe(() => {
            this._router.navigate(['/member/', this.memberId, 'memberpoint'], { relativeTo: this._activatedRoute });
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

    tooglepointEditFormMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    EditFormclose(): void {
        this.tooglepointEditFormMode(false);
    }

}
