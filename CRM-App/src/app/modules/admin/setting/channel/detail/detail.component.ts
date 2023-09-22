import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { catchError, Subject, takeUntil, throwError, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from 'app/modules/admin/setting/channel/channel.types';
import { ChannelService } from 'app/modules/admin/setting/channel/channel.service';
import { UserService } from 'app/core/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'channel-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .channel_reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 30% !important;
                height: 32% !important;
                border-radius: 8px;
            }

            .channel_parent_popup {
                display: grid;
                align-items: center !important;
                justify-content: center !important;
                height: 27vh;
            }

            .channel_child_btn {
                display: flex;
                gap: 10px;
            }

            .channel_successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .channel_errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .channel_delete_scss {
                position: relative;
                top: 2rem;
            }

        `
    ]
})
export class ChannelDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    channel: Channel;
    channelId: number;
    isLoading: boolean = false;
    ChannelEditForm: FormGroup;
    selectedChannel: Channel | null = null;
    editMode: boolean = false;
    canEdit: boolean = false;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedCode: string | null = null;
    successMessage: string | '' = '';
    errorMessage: string | '' = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _channelService: ChannelService,
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
        this.ChannelEditForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['',Validators.required],
            name: ['',Validators.required],
        });
        this._channelService.channel$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((channel: Channel) => {
                this.channel = channel;
                this.ChannelEditForm.patchValue(channel);
                this._changeDetectorRef.markForCheck();
            });

        this.canEdit = this._userService.getEditUserPermissionByNavId('channel');
        this.canDelete = this._userService.getDeleteUserPermissionByNavId('channel');
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
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
        this._channelService.getDeleteChannel(this.selectedCode)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/channel'], { relativeTo: this._activatedRoute });
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
    DeleteDrawer(code: string): void {
        this.selectedCode = code;
        this.toogleDeleteMode(true);
        this.matDrawer.open();
        this._changeDetectorRef.markForCheck();
    }

    updateChannel(): void {
        // Get the contact object
        const channel = this.ChannelEditForm.getRawValue();
        // Update the contact on the server
        this._channelService.updateChannel(channel.code, channel).subscribe(() => {

        });
    }
}
