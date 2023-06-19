/* eslint-disable max-len */
import { TotalRegisterMember } from './analytics.resolvers';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, Injectable, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable, tap, finalize, debounceTime} from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import moment from 'moment';
import { Stores, Channel, Tiers, ActivePoint, ExpiredPoint, DateParameter, EarnPoint , RegisteredMember, RegisteredLevel} from 'app/modules/admin/memberdashboard/analytics.types';
import { AnalyticsService } from 'app/modules/admin/memberdashboard/analytics.service';

@Component({
    selector       : 'analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['/analytics.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    chartAge: ApexOptions;
    totalMembers: number;
    getRegisteredLevel: RegisteredLevel;
    startDate = new Date();
    startYear = new Date();
    registerMember: number;
    stores$: Stores;
    channel$: Channel;
    filterDate: string;
    isLoading: boolean = false;
    filterStartDate: string;
    filterEndDate: string;
    filterYear: string;
    selectedButton: string;
    transactionCount: number;
    transactionCountByStore: number;
    selectedValue: string;
    activePointSelectedValue: string;
    expiredSelectedValue: string;
    totalAmount: number;
    transactionAmountByStore: number;
    totalActivePoint: number;
    totalActiveDollar: number;
    totalExpiredPoint: number;
    totalExpiredDollar: number;
    activePointFilterType: string;
    expiredPointFilterType: string;
    activefilterDate: string;
    expiredFilterDate: string;
    activefilterStartDate: string;
    activefilterEndDate: string;
    expiredfilterStartDate: string;
    expiredfilterEndDate: string;
    todayDate = moment();
    transactionObject: any;
    filterRegister: RegisteredMember = {
        type: 'all',
        day: 0,
        month: 0,
        year: 0,
        startdate: '',
        enddate: '',
    };
    filterActivePoint: ActivePoint = {
        tier : 'alltier',
        type: 'all',
        day: 0,
        month: 0,
        year: 0,
        startdate: '',
        enddate: '',
    };
    filterExpiredPoint: ExpiredPoint = {
        tier : 'alltier',
        type: 'all',
        day: 0,
        month: 0,
        year: 0,
        startdate: '',
        enddate: '',
    };
    filterTrans: DateParameter = {
        store : 'allstore',
        type: 'all',
        tier : 'alltier',
        day: 0,
        month: 0,
        year: 0,
        startdate: '',
        enddate: '',
    };
    earnPoint: EarnPoint = {
        totalEarnPoint: 0,
        totalEarnDolarValue: 0,
        filterShowDate: '',
        filterShowStartDate: '',
        filterShowEndDate: '',
        channel: 'all',
        store: 'all',
        type:'all',
        day: 0,
        month: 0,
        year: 0,
        startdate: '',
        enddate: '',
        tier: 'all'
    };
    colors = ['linear-gradient(60deg,#ffa726,#fb8c00)', 'linear-gradient(60deg,#26c6da,#00acc1)', 'linear-gradient(60deg,#66bb6a,#43a047)', 'linear-gradient(60deg, #F50057, #FF8A80)', 'linear-gradient(60deg, #FFD700, #FFCA29)'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private readonly onDestroy = new Subject<void>();

    constructor(
        private _analyticsService: AnalyticsService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
    )
    {
    }

    ngOnInit(): void {
        // Get the data
        this._analyticsService.channel$
        .subscribe((response: any) => {
            this.channel$ = response.data ? response.data : '';
        });
        this._analyticsService.stores$
            .subscribe((response: any) => {
                this.stores$ = response.data ? response.data : '';
            });
        this._analyticsService.totalMembers$
            .subscribe((response: any) => {
                this.totalMembers = response.data ? response.data[0].count.member_code : 0;
            });
        this._analyticsService.getRegisteredLevel$
        .subscribe((response: any) => {
            this.getRegisteredLevel = response.data ? response.data : null;
        });
        this._analyticsService.totalRegisterMember$
            .subscribe((response: any) => {
                const date = new Date();
                this.registerMember = response ? response.totalRegisterMember ? response.totalRegisterMember : 0 : 0;
                this.filterDate = date.toString();
                this.selectedButton = 'month';

            });
        this._analyticsService.totalTransactionCounts$
            .subscribe((response: any) => {
               this.transactionObject = response;
            });

        this._analyticsService.totalActivePoints$
            .subscribe((response: any) => {
                this.totalActivePoint = response ? response.totalActivePoint ? response.totalActivePoint : 0 : 0;
                this.totalActiveDollar = response ? response.totalActiveDollar ? response.totalActiveDollar : 0 : 0;
        });

        this._analyticsService.totalExpiredPoints$
        .subscribe((response: any) => {
            this.totalExpiredPoint = response ? response.totalExpiredPoint ? response.totalExpiredPoint : 0 : 0;
            this.totalExpiredDollar = response ? response.totalExpiredDollar ? response.totalExpiredDollar : 0 : 0;
        });

        this._analyticsService.earnPoints$
            .subscribe((response: any) => {
                this.earnPoint.totalEarnPoint = response ? response.totalEarnPoint ? response.totalEarnPoint : 0 : 0;
                this.earnPoint.totalEarnDolarValue = response ? response.totalEarnDolarValue ? response.totalEarnDolarValue : 0 : 0;
            });
        this._prepareChartData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this.onDestroy.next();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     *
     * @param pickmonth
     * @param datepicker
     */

     // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
     registeredMemberByDate(type: string, filterDate: Moment, datepicker: MatDatepicker<Moment>){
        this.isLoading = true;
        this.filterRegister.type = type;
        this.filterRegister.day = filterDate.date();
        this.filterRegister.month = filterDate.month() + 1;
        this.filterRegister.year = filterDate.year();

        this._analyticsService.getTotalRegistrationMemberCount(this.filterRegister)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.registerMember = response ? response.totalRegisterMember ? response.totalRegisterMember : 0 : 0;
            this.filterDate = this.filterRegister.year + '-' + this.filterRegister.month + '-' + this.filterRegister.day;
            this.selectedButton = type;
            this.isLoading = false;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    registeredMemberByDateRange(rangestart: string, rangeend: string, datepicker: MatDateRangePicker<Moment>) {
        this.isLoading = true;
        const startdate = moment(rangestart);
        const enddate = moment(rangeend);
        this.filterRegister.type = 'range';
        this.filterRegister.startdate = startdate.format('YYYY-MM-DD');
        this.filterRegister.enddate = enddate.add(1, 'days').format('YYYY-MM-DD');

        this._analyticsService.getTotalRegistrationMemberCount(this.filterRegister)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.registerMember = response ? response.totalRegisterMember ? response.totalRegisterMember : 0 : 0;
            //this.filterDate = this.filterRegister.year + "-" + this.filterRegister.month + "-" + this.filterActivePoint.day;
            this.selectedButton = 'daterange';
            this.filterStartDate = moment(rangestart).format('YYYY-MM-DD');
            this.filterEndDate = moment(rangeend).format('YYYY-MM-DD');
            this.isLoading = false;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    memberList(): void {
        this._router.navigate(['/member']);
    }

    detailTierList(id: any): void {
        this._router.navigate(['/member/membertier', id]);
    }

    /**
     * Transaction
     */

     // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
     fieldChange(e: any) {
        this.filterTrans.store = e.value;
          this._analyticsService.getAllTransactoinCount(this.filterTrans)
             .pipe(
                 takeUntil(this._unsubscribeAll),
                 finalize(() => {
                     this._prepareChartData();
                  })
             )
             .subscribe((response) => {
                 this.transactionObject = response ? response : 0;
                 this._changeDetectorRef.markForCheck();
           });
     }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionByDate(type: string, filterDate: Moment, datepicker: MatDatepicker<Moment>){
        this.isLoading = true;
        this.filterTrans.type = type;
        this.filterTrans.day = filterDate.date();
        this.filterTrans.month = filterDate.month() + 1;
        this.filterTrans.year = filterDate.year();

        this._analyticsService.getAllTransactoinCount(this.filterTrans)
        .pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => {
                this._prepareChartData();
             })
        )
        .subscribe((response: any) => {
            this.transactionObject = response ? response : 0;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionByRange(rangestart: string, rangeend: string, datepicker: MatDateRangePicker<Moment>){
        this.isLoading = true;
        const startdate = moment(rangestart);
        const enddate = moment(rangeend);
        this.filterTrans.type = 'range';
        this.filterTrans.startdate = startdate.format('YYYY-MM-DD');
        this.filterTrans.enddate = enddate.add(1, 'days').format('YYYY-MM-DD');

        this._analyticsService.getAllTransactoinCount(this.filterTrans)
        .pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => {
                this._prepareChartData();
             })
        )
        .subscribe((response: any) => {
            this.transactionObject = response ? response : 0;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }
    private _prepareChartData(): void {
        const multicolor = ['#1CB7D6','#E4B031', '#569DD2','#569D79', '#E57438','#3B36B9', '#CAD93F','#D61CAE','#00CC99'];
        const twocolor = ['#DD6B20', '#F6AD55'];
        const colorseries = this.filterTrans.store === 'allstore' ? multicolor : twocolor;
        this.chartAge = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: true
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: colorseries,
            labels: this.transactionObject.StoreSeries,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: true,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: this.transactionObject.TransactionPercentageSeries,
            dataLabels: this.transactionObject.TransactionAmountSeries,
            states: {
                hover: {
                    filter: {
                        type: 'block'
                    }
                },
                active: {
                    filter: {
                        type: 'block'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                </div>
                                <div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                    <div class="ml-2 text-md leading-none">Transactions : ${this.transactionObject.TransactionCountSeries[seriesIndex]}</div>
                                </div>
                                <div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                <div class="ml-2 text-md leading-none">Total Purchase Amount : $ ${(Math.round((this.transactionObject.TransactionAmountSeries[seriesIndex]) * 100) / 100).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}</div>
                                </div>
                                <div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                    <div class="ml-2 text-md leading-none">Average Transactions : ${(Math.round((this.transactionObject.TransactionAmountSeries[seriesIndex]/this.transactionObject.TransactionCountSeries[seriesIndex]) * 100) / 100).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}</div>
                                </div>`
            }
        };

    };

    /*
    * Total Active Point
    */

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    activePointfieldChange(e: any) {
        this.filterActivePoint.tier = e.value;
        this._analyticsService.getTotalActivePoint(this.filterActivePoint)
        .pipe(
            takeUntil(this._unsubscribeAll)
        )
        .subscribe((response: any) => {
            this.totalActivePoint = response ? response.totalActivePoint ? response.totalActivePoint : 0 : 0;
            this.totalActiveDollar = response ? response.totalActiveDollar ? response.totalActiveDollar : 0 : 0;
            this._changeDetectorRef.markForCheck();
      });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    totalActivePointByDate(type: string, filterDate: Moment, datepicker: MatDatepicker<Moment>) {
        this.isLoading = true;
        this.filterActivePoint.type = type;
        this.filterActivePoint.day = filterDate.date();
        this.filterActivePoint.month = filterDate.month() + 1;
        this.filterActivePoint.year = filterDate.year();

        this._analyticsService.getTotalActivePoint(this.filterActivePoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.totalActivePoint = response ? response.totalActivePoint ? response.totalActivePoint : 0 : 0;
            this.totalActiveDollar = response ? response.totalActiveDollar ? response.totalActiveDollar : 0 : 0;
            this.activePointSelectedValue = type;
            this.activefilterDate = this.filterActivePoint.year + '-' + this.filterActivePoint.month + '-' + this.filterActivePoint.day;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    totalActivePointByDateRange(rangestart: string, rangeend: string, datepicker: MatDateRangePicker<Moment>) {
        this.isLoading = true;
        const startdate = moment(rangestart);
        const enddate = moment(rangeend);
        this.filterActivePoint.type = 'range';
        this.filterActivePoint.startdate = startdate.format('YYYY-MM-DD');
        this.filterActivePoint.enddate = enddate.add(1, 'days').format('YYYY-MM-DD');

        this._analyticsService.getTotalActivePoint(this.filterActivePoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.totalActivePoint = response ? response.totalActivePoint ? response.totalActivePoint : 0 : 0;
            this.totalActiveDollar = response ? response.totalActiveDollar ? response.totalActiveDollar : 0 : 0;
            this.activefilterStartDate = moment(rangestart).format('YYYY-MM-DD');
            this.activefilterEndDate = moment(rangeend).format('YYYY-MM-DD');
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    /*
    * Total Expired Point
    */
    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    expiredPointfieldChange(e: any) {
        this.filterExpiredPoint.tier = e.value;
        this._analyticsService.getTotalExpeiredPoint(this.filterExpiredPoint)
        .pipe(
            takeUntil(this._unsubscribeAll)
        )
        .subscribe((response: any) => {
            this.totalExpiredPoint = response ? response.totalExpiredPoint ? response.totalExpiredPoint : 0 : 0;
            this.totalExpiredDollar = response ? response.totalExpiredDollar ? response.totalExpiredDollar : 0 : 0;
            this._changeDetectorRef.markForCheck();
      });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    totalExpiredPointByDate(type: string, filterDate: Moment, datepicker: MatDatepicker<Moment>) {
        this.isLoading = true;
        this.filterExpiredPoint.type = type;
        this.filterExpiredPoint.day = filterDate.date();
        this.filterExpiredPoint.month = filterDate.month() + 1;
        this.filterExpiredPoint.year = filterDate.year();

        this._analyticsService.getTotalExpeiredPoint(this.filterExpiredPoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.totalExpiredPoint = response ? response.totalExpiredPoint ? response.totalExpiredPoint : 0 : 0;
            this.totalExpiredDollar = response ? response.totalExpiredDollar ? response.totalExpiredDollar : 0 : 0;
            this.expiredSelectedValue = type;
            this.expiredFilterDate =  this.filterExpiredPoint.year + '-' +  this.filterExpiredPoint.month + '-' +  this.filterExpiredPoint.day;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    totalExpiredPointByDateRange(rangestart: string, rangeend: string, datepicker: MatDateRangePicker<Moment>) {
        this.isLoading = true;
        const startdate = moment(rangestart);
        const enddate = moment(rangeend);
        this.filterExpiredPoint.type = 'range';
        this.filterExpiredPoint.startdate = startdate.format('YYYY-MM-DD');
        this.filterExpiredPoint.enddate = enddate.add(1, 'days').format('YYYY-MM-DD');

        this._analyticsService.getTotalExpeiredPoint(this.filterExpiredPoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.totalExpiredPoint = response ? response.totalExpiredPoint ? response.totalExpiredPoint : 0 : 0;
            this.totalExpiredDollar = response ? response.totalExpiredDollar ? response.totalExpiredDollar : 0 : 0;
            this.expiredSelectedValue = 'range';
            this.expiredfilterStartDate = moment(rangestart).format('YYYY-MM-DD');
            this.expiredfilterEndDate = moment(rangeend).format('YYYY-MM-DD');
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Total Earn Point by Channel
     */
     // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
     earnPointTierfieldChange(e: any) {
        this.earnPoint.tier = e.value;
          this._analyticsService.getAllEarnPoint(this.earnPoint)
             .pipe(
                 takeUntil(this._unsubscribeAll)
             )
             .subscribe((response) => {
                 this.earnPoint.totalEarnPoint = response ? response.totalEarnPoint ? response.totalEarnPoint : 0 : 0;
                 this.earnPoint.totalEarnDolarValue = response ? response.totalEarnDolarValue ? response.totalEarnDolarValue : 0 : 0;
                 this._changeDetectorRef.markForCheck();
           });
     }

     // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
     earnPointfieldChange(store: string, channel: string) {
       this.earnPoint.store = store;
       this.earnPoint.channel = channel;
         this._analyticsService.getAllEarnPoint(this.earnPoint)
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((response) => {
                this.earnPoint.totalEarnPoint = response ? response.totalEarnPoint ? response.totalEarnPoint : 0 : 0;
                this.earnPoint.totalEarnDolarValue = response ? response.totalEarnDolarValue ? response.totalEarnDolarValue : 0 : 0;
                this._changeDetectorRef.markForCheck();
          });
    }

     // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
     totalEarnedPointByDate(type: string, filterDate: Moment, datepicker: MatDatepicker<Moment>) {
        this.isLoading = true;
        this.earnPoint.type = type;
        this.earnPoint.day = filterDate.date();
        this.earnPoint.month = filterDate.month() + 1;
        this.earnPoint.year = filterDate.year();

        this._analyticsService.getAllEarnPoint(this.earnPoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.earnPoint.totalEarnPoint = response ? response.totalEarnPoint ? response.totalEarnPoint : 0 : 0;
            this.earnPoint.totalEarnDolarValue = response ? response.totalEarnDolarValue ? response.totalEarnDolarValue : 0 : 0;
            this.earnPoint.filterShowDate = this.earnPoint.year + '-' + this.earnPoint.month + '-' + this.earnPoint.day;
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/explicit-function-return-type
    totalEarnedPointByDateRange(rangestart: string, rangeend: string, datepicker: MatDateRangePicker<Moment>) {
        this.isLoading = true;
        const startdate = moment(rangestart);
        const enddate = moment(rangeend);
        this.earnPoint.type = 'range';
        this.earnPoint.startdate = startdate.format('YYYY-MM-DD');
        this.earnPoint.enddate = enddate.add(1, 'days').format('YYYY-MM-DD');

        this._analyticsService.getAllEarnPoint(this.earnPoint)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            this.earnPoint.totalEarnPoint = response ? response.totalEarnPoint ? response.totalEarnPoint : 0 : 0;
            this.earnPoint.totalEarnDolarValue = response ? response.totalEarnDolarValue ? response.totalEarnDolarValue : 0 : 0;
            this.earnPoint.filterShowStartDate = moment(rangestart).format('YYYY-MM-DD');
            this.earnPoint.filterShowEndDate = moment(rangeend).format('YYYY-MM-DD');
            datepicker.close();
            this._changeDetectorRef.markForCheck();
        });
    }
}
