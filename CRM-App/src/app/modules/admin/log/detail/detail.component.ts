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
import { Log } from 'app/modules/admin/log/log.types';
import { LogService } from 'app/modules/admin/log/log.service';

@Component({
    selector       : 'log-detail',
    templateUrl: './detail.component.html',
    styles:[ `
    `],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogDetailComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    memberId: number;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

      constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _logService: LogService,
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

    }

    ngAfterViewInit(): void {

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

}
