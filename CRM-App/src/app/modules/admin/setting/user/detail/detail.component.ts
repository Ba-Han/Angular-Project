import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'app/modules/admin/setting/user/user.types';
import { UserService } from 'app/modules/admin/setting/user/user.service';

@Component({
    selector: 'user-detail',
    templateUrl: './detail.component.html',
    styles: [
        `
           .custom-layout {
               background-color:#FFF;
            }

        `
    ]
})
export class UserDetailComponent implements OnInit, OnDestroy {
    user: User;
    userId: number;
    isLoading: boolean = false;
    selectedUser: User | null = null;
    editMode: boolean = false;
    UserEditForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private passwordStrength: 0;
    roles: any;
    selectedRole:string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,

    ) {
        this.getUserRoles();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        
        this.UserEditForm = this._formBuilder.group({
            id: [''],
            status: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            role:['', Validators.required]
        });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.selectedRole = user.role;
                this.UserEditForm.patchValue(user);
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
    updateUser(): void {
        // Get the contact object
        const user = this.UserEditForm.getRawValue();
        // Update the contact on the server
        if (this.passwordStrength >= 100) {
            this._userService.updateUser(user.id, user).subscribe(() => {
                this._router.navigate(['/users'], { relativeTo: this._activatedRoute });
            });
        }
    }

    onStrengthChanged(value):void {
        this.passwordStrength = value;
    }

    getUserRoles() {
        this._userService.getUserRoles()
            .pipe(
                finalize(() => {
                    
                })
        ).subscribe(
            (response) => {
                let roles:any = ((response.data) ? response.data : []);
                let availableRoles: any = [];
                for (let i:number = 0; i < roles.length; i++) {
                    if (roles[i].name == "CRM APP User" ||
                    roles[i].name == "CRM APP Manager" || 
                    roles[i].name == "CRM Admin") {
                
                        availableRoles.push(roles[i]);
                    }
                }
                this.roles = availableRoles;
                this.ngOnInit();
            }
        );
    }
}
