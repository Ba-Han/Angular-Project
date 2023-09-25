/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Transaction} from 'app/modules/admin/transaction/transaction.types';
import { TransactionService } from 'app/modules/admin/transaction/transaction.service';

@Component({
    selector       : 'transaction-details',
    templateUrl: './detail.component.html',
    styles: [
        `
            .detail_table{
                grid-template-columns: 150px 150px 150px 150px 150px;
            }
            .detaildiscount_table{
                grid-template-columns: 150px 480px 120px;
            }

            table {
                border-collapse: collapse;
                width: 100%;
            }

            .transaction-tender {
                padding: 6px;
                text-align: left;
                border-bottom: 1px solid #E2E8F0;
            }
        `

    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailComponent implements OnInit, AfterViewInit, OnDestroy
{
    transaction: Transaction;
    memberId: number;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
      constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
          private _transactionService: TransactionService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
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

        // Get the transaction
        this._transactionService.memberTransaction$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transaction: Transaction) => {
                this.transaction = transaction[0];
                this.transaction.real_amount = (transaction[0].total_amount - transaction[0].delivery_amount) - transaction[0].vat_amount;
                if( this.transaction.real_amount < 0 ) {
                    this.transaction.real_amount = 0;
                }
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
     trackByFn(index: number, item: any): any
     {
         return item.id || index;
     }

}
