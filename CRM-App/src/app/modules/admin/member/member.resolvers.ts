import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { MemberService } from 'app/modules/admin/member/member.service';
import { Member, MemberPagination, MemberPoint, Transaction, MemberTier, MemberDocument, MemberDocumentPagination } from 'app/modules/admin/member/member.types';

@Injectable({
    providedIn: 'root'
})
export class MemberResolver implements Resolve<any>
{

    constructor(private _memberService: MemberService)
    {
    }

     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberPagination; members: Member[] }>
     {
        return this._memberService.getMembers();
     }
}

@Injectable({
    providedIn: 'root'
})
export class MemberResolverByTier implements Resolve<any>
{

    constructor(private _memberService: MemberService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: MemberPagination; members: Member[] }> {
        const searchFilterTierId = route.paramMap.get('membertierid');
        const searchFilter = '{"member_tier":{"_eq":"' + searchFilterTierId + '"}}';

        return this._memberService.getMembers(0, 10, 'member_code', 'asc', '', searchFilter);
    }
}

@Injectable({
    providedIn: 'root'
})
export class MembersMemberResolver implements Resolve<any>
{
    constructor(
        private _memberService: MemberService,
        private _router: Router
    )
    {
    }
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Member>
     {
         return this._memberService.getMemberById(Number(route.paramMap.get('id')))
                    .pipe(
                        // Error here means the requested contact is not available
                        catchError((error) => {

                            // Log the error
                            console.error(error);

                            // Get the parent url
                            const parentUrl = state.url.split('/').slice(0, -1).join('/');

                            // Navigate to there
                            this._router.navigateByUrl(parentUrl);

                            // Throw an error
                            return throwError(error);
                        })
                    );
     }
 }

@Injectable({
    providedIn: 'root'
})
export class MemberTierResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MemberTier[]>
    {
        return this._memberService.getMemberTiers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberVouchersRecentResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._memberService.getRecentMemberVouchersById(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class GenerateMemberVouchersResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._memberService.getGenerateMemberVouchersById(Number(route.paramMap.get('id')));
    }
}


@Injectable({
    providedIn: 'root'
})
export class TransactionsRecentResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._memberService.getRecentTransactionsById(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberPointsRecentResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._memberService.getRecentPointsById(Number(route.paramMap.get('id')));
    }
}

@Injectable({
    providedIn: 'root'
})
export class MemberDocumentsResolver implements Resolve<any>
{
    constructor(private _memberService: MemberService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._memberService.getMemberDocuments(Number(route.paramMap.get('id')));
    }
}

