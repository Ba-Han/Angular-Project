import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { Channel } from 'app/modules/admin/setting/channel/channel.types';
import { ChannelService } from 'app/modules/admin/setting/channel/channel.service';

@Component({
    selector: 'channel-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class ChannelDetailComponent implements OnInit, OnDestroy {
    channel: Channel;
    channelId: number;
    isLoading: boolean = false;
    ChannelEditForm: FormGroup;
    selectedChannel: Channel | null = null;
    editMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _channelService: ChannelService,
        private _formBuilder: FormBuilder,
        
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

    updateChannel(): void {
        // Get the contact object
        const channel = this.ChannelEditForm.getRawValue();
        // Update the contact on the server
        this._channelService.updateChannel(channel.code, channel).subscribe(() => {


        });
    }
}
