import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AnalyticsService } from 'app/modules/admin/memberdashboard/analytics.service';
import { DateParameter,EarnPoint } from '../memberdashboard/analytics.types';

@Injectable({
    providedIn: 'root'
})
export class TotalMembersResolver implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._analyticsService.getTotalMember();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TotalBeInformedResolver implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getBeInformed();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TotalBeRewardResolver implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getBeReward();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TotalBeWowResolver implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getBeWow();
    }
}


@Injectable({
    providedIn: 'root'
})
export class TotalRegisterMember implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const currentYear = date.getFullYear();
        const filter: any = {
            type: 'month',
            month: currentMonth,
            year: currentYear,
        } ;
        return this._analyticsService.getTotalRegistrationMemberCount(filter);
    }
}

@Injectable({
    providedIn: 'root'
})
export class TotalTransactionCount implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const dateParameter = {
            store : 'allstore',
            type: 'all',
            tier: '',
            day: 0,
            month: 0,
            year: 0,
            startdate: '',
            enddate: '',
        };
        return this._analyticsService.getAllTransactoinCount(dateParameter);
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberTiers implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getMemberTiers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class Stores implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getAllStore();
    }
}

@Injectable({
    providedIn: 'root'
})
export class Channel implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._analyticsService.getAllChannel();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TotalActivePoints implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const date = new Date();
        const currentday = date.getDate();
        const currentMonth = date.getMonth() + 1;
        const currentYear = date.getFullYear();
        const dateParameter = {
            type: 'all',
            tier: 'alltier',
            day: currentday,
            month: currentMonth,
            year: currentYear,
            startdate: '',
            enddate: '',
        };
        return this._analyticsService.getTotalActivePoint(dateParameter);
    }
}



@Injectable({
    providedIn: 'root'
})
export class TotalExpiredPoints implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const date = new Date();
        const currentday = date.getDate();
        const currentMonth = date.getMonth() + 1;
        const currentYear = date.getFullYear();
        const dateParameter = {
            type: 'all',
            tier: 'alltier',
            day: currentday,
            month: currentMonth,
            year: currentYear,
            startdate: '',
            enddate: '',
        };
        return this._analyticsService.getTotalExpeiredPoint(dateParameter);
    }
}



@Injectable({
    providedIn: 'root'
})
export class TotalEarnPoint implements Resolve<any>
{
    constructor(private _analyticsService: AnalyticsService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const filter: any = {
            channel : 'all',
            store : 'allstore',
            type : 'all',
            tier : 'all'
        };
        return this._analyticsService.getAllEarnPoint(filter);
    }
}
