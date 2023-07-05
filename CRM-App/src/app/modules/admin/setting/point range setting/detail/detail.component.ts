import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { PointRange, PointRangePagination } from 'app/modules/admin/setting/point range setting/pointrange.types';
import { PointRangeService } from 'app/modules/admin/setting/point range setting/pointrange.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'point range setting-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .text_1xl {
                font-size: 1rem !important;
            }
        `
    ]
})
export class PointRangeDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    pointrange: PointRange;
    isLoading: boolean = false;
    PointRangeEditForm: FormGroup;
    editMode: boolean = false;
    canEdit: boolean = false;
    isSuccess: boolean = false;
    errorMessage: string | '' = '';
    successMessage: string | '' = '';
    pointranges$: Observable<PointRange>;
    startTypeValue: number;
    startDayTypeValue: number = 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _pointRangeService: PointRangeService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.PointRangeEditForm = this._formBuilder.group({
            id: [''],
            start_type: ['', [Validators.required]],
            start_day_type: [''],
            end_type: ['', [Validators.required]],
            end_day_type: ['', [Validators.required]],
            end_day_value: ['', [Validators.required]]
        });

        this._pointRangeService.pointranges$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pointrange: PointRange) => {
                this.pointrange = pointrange;
                this.startTypeValue = pointrange.start_type;
                this.startDayTypeValue = pointrange.start_day_type;
                this.PointRangeEditForm.patchValue(pointrange);
                this._changeDetectorRef.markForCheck();
            });

        this.canEdit = this._userService.getEditUserPermissionByNavId('pointrangesetting');
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    updatePointRange(): void {
        const pointrange = this.PointRangeEditForm.getRawValue();
        this._pointRangeService.updatePointRange(pointrange.id, pointrange).subscribe(() => {
            this.successMessage = 'Update Successfully.';
            this._changeDetectorRef.markForCheck();
        },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.errorMessage = response.error.message;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
    }
}
