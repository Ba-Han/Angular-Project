import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Country, CountryPagination } from 'app/modules/admin/setting/country/country.types';
import { CountryService } from 'app/modules/admin/setting/country/country.service';
import { CountryDetailComponent } from 'app/modules/admin/setting/country/detail/detail.component';

@Component({
    selector: 'country-list',
    templateUrl: './country.component.html',
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
export class CountryListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    countries$: Observable<Country[]>;
    country$: Observable<Country>;
    isLoading: boolean = false;
    pagination: CountryPagination;
    searchInputControl: FormControl = new FormControl();
    selectedChannel: Country | null = null;
    code: string;
    AddMode: boolean = false;
    CountryAddForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _countryService: CountryService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.CountryAddForm = this._formBuilder.group({
            code: ['', Validators.required],
            status: ['active', Validators.required],
            name: ['', Validators.required],
            calling_code: ['']
        });

        // Get the pagination
        this._countryService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CountryPagination) => {
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries []
        this.countries$ = this._countryService.countries$;

        // search

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._countryService.getCountries("",0, 10, 'name', 'asc', query);
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
                    return this._countryService.getCountries("",this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

    createCountry(): void {

        const country = this.CountryAddForm.getRawValue();
        this._countryService.createCountry(country).subscribe(() => {
            this.tooglepointAddFormMode(false);
        });

    }
}
