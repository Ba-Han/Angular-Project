import { GeneralSettingExtended } from './../generalsetting.types';
import { user } from './../../../../../mock-api/common/user/data';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertModule } from '@fuse/components/alert';
import { GeneralSetting, MemberGroup, UserGroup, MemberGroupPaginagion, UserGroupPaginagion, MemberTier, MemberTierPagination } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import { GeneralSettingService } from 'app/modules/admin/setting/generalsetting/generalsetting.service';
import { MatDrawer } from '@angular/material/sidenav';
import { UserService } from 'app/core/user/user.service';



@Component({
    selector: 'generalsetting',
    templateUrl: './generalsetting.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

            .prule-grid {
                grid-template-columns: 250px 250px 200px 150px;

                @screen sm {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen md {
                    grid-template-columns: 200px 200px 150px 100px 150px;
                }

                @screen lg {
                    grid-template-columns: 250px 250px 200px 150px 150px;
                }
            }

            .tier-grid{
                grid-template-columns: 60px 100px;
                     @screen sm {
                         grid-template-columns: 60px 100px 100px;
                     }
                     @screen md {
                         grid-template-columns: 60px 150px 150px;
                     }
                     @screen lg {
                         grid-template-columns: 60px 150px 150px;
                     }
                }

            .membercustom-paging {
                   position: fixed !important;
                    bottom: 57px;
            }
            .customPoint{
                cursor: pointer;
                height: 50px;
                background: #fff;
                width: 100%;
                border: 1px solid #ccc;
                border-radius: 7px;
                padding: 15px;
             }

            .pointcross{
                float: right;
                width: 20px;
                text-align: center;
                border-radius: 10px;
                color: white;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})

export class SettingDetailComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    memberGroupOptions: MemberGroup[];
    selectedMemberGroupOptions: MemberGroup[];
    userGroupOptions: UserGroup[];
    selectedUserGroupOptions: UserGroup[];
    memberTierDefaultGroupOptions: MemberTier[];
    selectedMemberTierDefaultGroupOptions: MemberTier[];

    memberform = new FormGroup({ memberGroupCtrl: new FormControl(), });
    userform = new FormGroup({ userGroupCtrl: new FormControl(), });
    tierdefaultform = new FormGroup({ memberTierDefaultGroupCtrl: new FormControl(), });

    setting: GeneralSetting;
    isLoading: boolean = false;
    canEdit: boolean = false;
    SettingEditForm: FormGroup;
    editMode: boolean = false;
    isSuccess: boolean = false;
    drawerMode: 'side' | 'over';

    memberGroups$: Observable<MemberGroup[]>;
    memberGroupsPagination: MemberGroupPaginagion;
    memberGroupsSearchInputControl: FormControl = new FormControl();

    userGroups$: Observable<UserGroup[]>;
    userGroupsPagination: UserGroupPaginagion;
    userGroupsSearchInputControl: FormControl = new FormControl();

    memberGroups: Array<MemberGroup> = [];
    userGroups: Array<UserGroup> = [];

    memberTiers$: Observable<MemberTier[]>;
    memberTierPagination: MemberTierPagination;
    memberTierDefaultGroups: Array<MemberTier> = [];
    memberTiers: any;

    setting$: Observable<GeneralSetting>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _settingService: GeneralSettingService,
        private _formBuilder: FormBuilder,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.SettingEditForm = this._formBuilder.group({
            id: [''],
            transaction_rounding: ['', [Validators.required]],
            point_conversion: [''],
            min_point: [''],
            max_point: [''],
            member_groups: [''],
            user_groups: [''],
            default_member_tier: [''],
        });

        //Member Groups
        this._settingService.memberGroups$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((groups) => {
            this.memberGroups = groups;
        });

        //User Groups
        this._settingService.userGroups$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((groups) => {
            this.userGroups = groups;
        });

        //MemberTier Groups
        this._settingService.memberTiers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tiers) => {
                this.memberTiers = tiers;
            });

        this._settingService.setting$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((formSetting: GeneralSettingExtended) => {
                this.setting = formSetting;
                this.selectedMemberGroupOptions = [];
                this.selectedUserGroupOptions = [];
                const selectedUserGroup = formSetting.user_groups;
                const selectedMemberGroup = formSetting.member_groups;
                const selectedUserArray = selectedUserGroup.split(',');
                const selectedMemberArray = selectedMemberGroup.split(',');
                selectedMemberArray.forEach((model: any) => {
                    const selectedMemberGroupValue = this.memberGroups.find(x=>x.id===Number(model));
                    if(selectedMemberGroupValue??false) {

                        this.selectedMemberGroupOptions.push(selectedMemberGroupValue);
                    }
                    });
                selectedUserArray.forEach((model: any) => {
                    const selectedUserGroupValue = this.userGroups.find(x=>x.id===Number(model));
                    if(selectedUserGroupValue??false) {

                        this.selectedUserGroupOptions.push(selectedUserGroupValue);
                    }
                    });
                this.memberform.get('memberGroupCtrl').setValue(this.selectedMemberGroupOptions);
                this.userform.get('userGroupCtrl').setValue(this.selectedUserGroupOptions);
                this.SettingEditForm.patchValue(this.setting);
                this._changeDetectorRef.markForCheck();
            });

            this.canEdit = this._userService.getEditUserPermissionByNavId('generalsetting');
        }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    updateSetting(): void {
        this.isLoading = true;
        const setting = this.SettingEditForm.getRawValue();
        const selectedMemberGroupOptions = this.memberform.value.memberGroupCtrl;
        const selectedUserGroupOptions = this.userform.value.userGroupCtrl;
        this._settingService.updateSetting(setting.id, setting, selectedMemberGroupOptions, selectedUserGroupOptions).pipe(
            map(() => {
                this.isLoading = false;
                //this.isSuccess = true;
            })
        ).subscribe();
        this.isSuccess = true;
    }
}
