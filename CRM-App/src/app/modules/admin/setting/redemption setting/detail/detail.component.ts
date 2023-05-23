/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Redemption, RedemptionPagination,  MemberTier} from 'app/modules/admin/setting/redemption setting/redemption.types';
import { RedemptionService } from 'app/modules/admin/setting/redemption setting/redemption.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'redemption setting-detail',
    templateUrl: './detail.component.html',
    styles: [
        /* language=SCSS */
        `
            .redemptionsetting-grid {
                grid-template-columns: 150px 150px 150px 150px 150px;

                @screen sm {
                    grid-template-columns: 150px 150px 150px 150px 150px;
                }

                @screen md {
                    grid-template-columns: 150px 150px 150px 150px 150px;
                }

                @screen lg {
                    grid-template-columns: 150px 150px 150px 150px 150px;
                }
            }

            .reset_popup {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 28% !important;
                height: 34% !important;
                border-radius: 8px;
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

            .successMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(0, 128, 0);
                padding: 3rem;
                font-size: 16px;
            }

            .errorMessage_scss {
                position: unset;
                text-align: center;
                color: rgb(255, 49, 49);
                padding: 3rem;
                font-size: 16px;
            }

            .delete-scss {
                position: fixed;
                padding-left: 2rem;
            }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class RedemptionSettingDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerOne', { static: true }) drawerOne: MatDrawer;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('drawerTwo', { static: true }) drawerTwo: MatDrawer;

    drawerMode: 'side' | 'over';
    isLoading: boolean = false;
    redemption: Redemption;
    editMode: boolean = false;
    RedemptionSettingEditForm: FormGroup;
    canDelete: boolean = false;
    DeleteMode: boolean = false;
    isSuccess: boolean = false;
    selectedId: number | null = null;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    popupErrorMessage: string | null = null;
    minDate: string;
    typeValue: number;
    memberTiers: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _redemptionService: RedemptionService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        //Member Tier Edit Form
        this.RedemptionSettingEditForm = this._formBuilder.group({
            id: [''],
            type: ['', [Validators.required]],
            date_from: [''],
            date_to: [''],
            member_tier: ['', [Validators.required]],
            point_conversion: ['', [Validators.required]]
        });

        this._redemptionService.redemption$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((redemption: Redemption) => {
            this.redemption = redemption;
            this.typeValue = redemption.type;
            this.RedemptionSettingEditForm.patchValue(redemption);
            this._changeDetectorRef.markForCheck();
        });

        //Member Tiers Groups
        this._redemptionService.memberTiers$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((tier) => {
            this.memberTiers = tier;
        });

        this.canDelete = this._userService.getDeleteUserPermissionByNavId('redemptionsetting');
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
        this.drawerOne.close();
        this._changeDetectorRef.markForCheck();
    }

    proceedPopup(): void {
        this._redemptionService.getDeleteRedemptionSetting(this.selectedId)
        .subscribe(() => {
            },
            (response) => {
                if (response.status === 200) {
                    // Successful response
                    this.successMessage = 'Deleted Successfully.';
                    this._router.navigate(['/redemptionsetting'], { relativeTo: this._activatedRoute });
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                } else {
                    // Error response
                    this.popupErrorMessage = response.error.message;
                    this.isSuccess = true;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeleteDrawer(id: number): void {
        this.selectedId = id;
        this.toogleDeleteMode(true);
        this.drawerOne.open();
        this._changeDetectorRef.markForCheck();
    }

    updateRedemption(): void {
        const redemption = this.RedemptionSettingEditForm.getRawValue();
        this._redemptionService.updateRedemption(redemption.id, redemption).subscribe(() => {
            this._router.navigate(['/redemptionsetting'], { relativeTo: this._activatedRoute });
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
        this._changeDetectorRef.markForCheck();
    }
}
