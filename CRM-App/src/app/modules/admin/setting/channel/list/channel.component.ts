import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map,tap, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Channel, ChannelPagination } from 'app/modules/admin/setting/channel/channel.types';
import { ChannelService } from 'app/modules/admin/setting/channel/channel.service';
import { ChannelDetailComponent } from 'app/modules/admin/setting/channel/detail/detail.component';

@Component({
    selector: 'channel-list',
    templateUrl: './channel.component.html',
    styles: [
        /* language=SCSS */
        `
            .channel-grid {
                grid-template-columns: 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 300px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 300px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 300px 150px;
                }
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ChannelListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    channels$: Observable<any[]>;
    channel$: Observable<Channel>;
    isLoading: boolean = false;
    pagination: ChannelPagination;
    code: string;
    AddMode: boolean = false;
    searchInputControl: FormControl = new FormControl();
    ChannelAddForm: FormGroup;
   
    selectedChannel: Channel | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _channelService: ChannelService,
        private _router: Router,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        
        this.ChannelAddForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['active', Validators.required],
            name: ['', Validators.required],
        });

        //this._activatedRoute.url.subscribe((param) => {
        //    if (param != null) {
        //        this.code = param[0].path;
        //    }

        //});

        // Get the pagination
        this._channelService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ChannelPagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the channels []
        this.channels$ = this._channelService.channels$;

        // search
       
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._channelService.getChannels(0, 10,'name','asc', query);
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
                id: 'name',
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

            // Get channels if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    //const sort = this._sort.direction == "desc" ? "-" + this._sort.active : this._sort.active;
                    return this._channelService.getChannels(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    tooglepointAddFormMode(AddMode: boolean | null = null): void {
        if (AddMode === null) {
            this.AddMode = !this.AddMode;
        }
        else {
            this.AddMode = AddMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    createChannel(): void {
        const channel = this.ChannelAddForm.getRawValue();
        this.isLoading = false;
        this._channelService.createChnnel(channel)
            .subscribe((channel: any) => {
                this.tooglepointAddFormMode(false);
            });
    }
}
