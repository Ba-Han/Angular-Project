import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Member, MemberPagination, Transaction, MemberInfo, MemberTier, MemberDocument, MemberDocumentPagination } from 'app/modules/admin/member/member.types';
import { MemberPoint} from 'app/modules/admin/member/member.types';
import { environment } from 'environments/environment';
import { GeneralSetting } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})

export class MemberService
{
    // Private
    private _member: BehaviorSubject<Member | null> = new BehaviorSubject(null);
    private _members: BehaviorSubject<Member[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<MemberPagination | null> = new BehaviorSubject(null);
    private _tiers: BehaviorSubject<MemberTier[] | null> = new BehaviorSubject(null);
    private _apiurl: string = '';
    private _transactions: BehaviorSubject<any> = new BehaviorSubject(null);
    private _transaction: BehaviorSubject<any> = new BehaviorSubject(null);
    private _membertransactions: BehaviorSubject<any> = new BehaviorSubject(null);
    private _points: BehaviorSubject<any> = new BehaviorSubject(null);
    private _memberDocuments: BehaviorSubject<MemberDocument[] | null> = new BehaviorSubject(null);
    private _memberDocument: BehaviorSubject<any> = new BehaviorSubject(null);
    private _memberDocumentpagination: BehaviorSubject<MemberDocumentPagination | null> = new BehaviorSubject(null);
    private _memberPoint: BehaviorSubject<MemberPoint> = new BehaviorSubject(null);
    private _memberPoints: BehaviorSubject<MemberPoint[]> = new BehaviorSubject(null);
    private _setting: BehaviorSubject<GeneralSetting | null> = new BehaviorSubject(null);

    private _isAddressexit: boolean = true;

     constructor(private _httpClient: HttpClient)
     {
        this._apiurl= environment.apiurl;
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get member$(): Observable<Member>
    {
         return this._member.asObservable();
    }

    get members$(): Observable<Member[]>
    {
        return this._members.asObservable();
    }

    get pagination$(): Observable<MemberPagination>
    {
         return this._pagination.asObservable();
    }

    get memberTiers(): Observable<MemberTier[]>{
        return this._tiers.asObservable();
    }

    get transactions$(): Observable<any>
    {
        return this._transactions.asObservable();
    }

    get points$(): Observable<any>
    {
        return this._points.asObservable();
    }

    get memberDocuments$(): Observable<MemberDocument[]>
    {
        return this._memberDocuments.asObservable();
    }

    get memberDocument$(): Observable<any>
    {
        return this._memberDocument.asObservable();
    }

    get memberDocumentpagination$(): Observable<MemberDocumentPagination>
    {
         return this._memberDocumentpagination.asObservable();
    }

    get setting$(): Observable<GeneralSetting> {
        return this._setting.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // eslint-disable-next-line max-len, @typescript-eslint/no-shadow
    getMembers(page: number = 0, limit: number = 10, sort: string = 'member_code', order: 'asc' | 'desc' | '' = 'asc', search: string = '', filter: string = '', fields: string = ''):
        Observable<{ pagination: MemberPagination; members: Member[] }>
    {
        const fullurl = fields === '' ?  'items/member' : 'member/0/memberLists';
        return this._httpClient.get<any>(`${this._apiurl}/${fullurl}`, {
            params: {
                meta: 'filter_count',
                // eslint-disable-next-line max-len
                fields: fields === '' ?'id,member_code,first_name,last_name,email,mobile_phone,registration_date, member_tier.name, accept_email,accept_mobile_sms, available_points, referral_code ,total_points, total_redeemed_points,expiredTotalPoints,dollerValueEarningExpired'
                :'m.id,mt.name as member_tier, member_code,first_name,last_name,email,mobile_phone,registration_date,accept_email,accept_mobile_sms',
                filter:filter,
                page: page+1,
                limit: limit,
                sort: sort,
                search,
                order
            }

        }).pipe(
            tap((response) => {
                const memberLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), memberLength);
                const lastPage = Math.max(Math.ceil(memberLength / limit), 1);

                // Prepare the pagination object
                const pagination ={
                    length    : memberLength,
                    limit     : limit,
                    page      : page,
                    lastPage  : lastPage,
                    startIndex: begin,
                    endIndex  : end - 1
                };

                this._pagination.next(pagination);

                const members = response.data;
                const memberIds = [];
                for(const member of members){
                    memberIds.push(member.id);
                    if(fields === 'custom'){
                        member.member_tier = member ? member.member_tier : '';
                    }
                    else{
                        member.member_tier = (member.member_tier && member.member_tier.name) ? member.member_tier.name : '';
                    }
                    member.totalPoint = 0;
                    member.redeemTotalPoint = 0;
                }
                this._members.next(members);
            })
        );
    }

    getMemberById(id: number): Observable<Member>
    {
        return this._httpClient.get<any>(`${this._apiurl}/member/${id}`,{
            params: {limit: 5}
        })
        .pipe(
            tap((response) => {
                const member = response;
                const bathDatestring = member.member != null ? member.member[0].date_of_birth : '';
                const date = new Date(bathDatestring);
                //const modifyBirthDate = new Date(date.setDate(date.getDate() + Number(1)));
                const modifyBirthDate = new Date(date.setDate(date.getDate()));
                member.member[0].date_of_birth = modifyBirthDate;
                // eslint-disable-next-line max-len
                member.earning = member.earning != null ? member.earning : { totalPoint: 0, earning_valid_from: '', earning_valid_to: '' , spending_valid_from: '', spending_valid_to: '' };
                member.earning.earning_valid_from = member.earning.earning_valid_from ? new Date(member.earning.earning_valid_from).toDateString() : '';
                member.earning.earning_valid_to = member.earning.earning_valid_to ? new Date(member.earning.earning_valid_to).toDateString() : '';
                member.earning.spending_valid_from = member.earning.spending_valid_from ? new Date(member.earning.spending_valid_from).toDateString() : '';
                member.earning.spending_valid_to = member.earning.spending_valid_to ? new Date(member.earning.spending_valid_to).toDateString() : '';
                // eslint-disable-next-line max-len
                member.spending = member.spending != null ? member.spending : { totalPoint: 0, earning_valid_from: '', earning_valid_to: '' , spending_valid_from: '', spending_valid_to: '' };
                member.spending.earning_valid_from = member.spending.earning_valid_from ? new Date(member.spending.earning_valid_from).toDateString() : '';
                member.spending.earning_valid_to = member.spending.earning_valid_to ? new Date(member.spending.earning_valid_to).toDateString() : '';
                member.spending.spending_valid_from = member.spending.spending_valid_from ? new Date(member.spending.spending_valid_from).toDateString() : '';
                member.spending.spending_valid_to = member.spending.spending_valid_to ? new Date(member.spending.spending_valid_to).toDateString() : '';
                this._member.next(response);
            })
        );
    }

    getRecentTransactionsById(id: number): Observable<Transaction> {
        return this._httpClient.get<any>(`${this._apiurl}/member/${id}/transactions`, {
            params: { limit: 5, sort: 'date_created' }
        })
            .pipe(
                tap((response) => {
                    this._transactions.next(response.data);
                })
            );
    }

    getRecentPointsById(id: number): Observable<MemberPoint> {
        return this._httpClient.get<any>(`${this._apiurl}/member/${id}/points`, {
            params: { limit: 5, sort: 'date_created' }
        })
            .pipe(
                tap((response) => {
                    this._points.next(response.data);
                })
            );
    }

    getMemberDocumentsById(): Observable<MemberDocument> {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_document`, {
            params: { limit: 5, sort: 'uploaded_on', order: 'desc' }
        })
            .pipe(
                tap((response) => {
                    this._memberDocument.next(response.data);
                })
            );
    }

    getMemberDocuments(page: number = 0, limit: number = 10, sort: string = 'uploaded_on', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ memberDocumentpagination: MemberDocumentPagination; memberDocuments: MemberDocument[] }> {
            return this._httpClient.get(`${this._apiurl}/items/member_document`, {
            params: {
                meta: 'filter_count',
                page: page + 1,
                limit: limit,
                sort: sort,
                order,
                search
            }
        }).pipe(
            tap((response: any) => {
                const totalLength = response.meta.filter_count;
                const begin = page * limit;
                const end = Math.min((limit * (page + 1)), totalLength);
                const lastPage = Math.max(Math.ceil(totalLength / limit), 1);

                // Prepare the pagination object
                const pagination = {
                    length: totalLength,
                    limit: limit,
                    page: page,
                    lastPage: lastPage,
                    startIndex: begin,
                    endIndex: end - 1
                };
                this._memberDocumentpagination.next(pagination);
                this._memberDocuments.next(response.data);
            })
        );
    }

    getSetting(): Observable<GeneralSetting> {
        return this._httpClient.get<any>(`${this._apiurl}/items/general_settings`)
            .pipe(
                tap((response) => {
                    const setting = response.data;
                    this._setting.next(setting);
                })
            );
    }

    getMemberTiers(): Observable<MemberTier[]>
    {
        return this._httpClient.get<any>(`${this._apiurl}/items/member_tier`, {
            //params: { limit: 5, sort: '-date_created' }
        })
        .pipe(
            tap((response) => {
                this._tiers.next(response.data);
            })
        );
    }

    checkMemberPhone(phno: string): Observable<any>{
        return this._httpClient.get<any>(`${this._apiurl}/utility/checkmobile`, {
            params: { mobile : phno}
        })
        .pipe(
            tap(response => response)
        );
    }

    updateMember(id: number,member: MemberInfo): Observable<Member> {
        return this._httpClient.patch<Member>(`${this._apiurl}/items/member/${id}`, {
            "id": id,
            "first_name": member.first_name,
            "last_name": member.last_name,
            "mobile_phone": member.mobile_phone,
            "gender": member.gender,
            "date_of_birth": member.date_of_birth,
            //"address_line_1": member.address_line_1,
            //"address_line_2": member.address_line_2,
            //"postal_code": member.postal_code,
            //"city": member.city,
            "member_tier": member.member_tier,
            "accept_email": member.accept_email,
            "accept_mobile_sms": member.accept_mobile_sms
        }).pipe(
            map(updateMember => updateMember)
        );
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    updateMemberDw(id: Number, member: MemberInfo): Observable<Member> {
        return this._httpClient.post<Member>(`${this._apiurl}/membership/${id}/update-dw/`, {
            "id": id,
            "first_name": member.first_name,
            "last_name": member.last_name,
            "mobile_phone": member.mobile_phone,
            "gender": member.gender,
            "date_of_birth": member.date_of_birth,
            //"address_line_1": member.address_line_1,
            //"address_line_2": member.address_line_2,
            //"postal_code": member.postal_code,
            //"city": member.city,
            "member_tier": member.member_tier,
            "accept_email": member.accept_email,
            "accept_mobile_sms": member.accept_mobile_sms
        }).pipe(
            map(updateMember => updateMember)
        );
    }

    // Delete API method
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getDeleteCRMDocuments(id: number){
        return this._httpClient.delete(`${this._apiurl}/items/member_document/${id}`,
        { observe: 'response' });
    };
}
