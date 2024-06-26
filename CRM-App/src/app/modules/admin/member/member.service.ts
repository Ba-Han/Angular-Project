import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Member, MemberPagination, Transaction, MemberInfo, MemberTier, MemberDocument, MemberDocumentPagination, MemberVoucher } from 'app/modules/admin/member/member.types';
import { MemberPoint} from 'app/modules/admin/member/member.types';
import { environment } from 'environments/environment';

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
    private _memberVouchers: BehaviorSubject<MemberVoucher[] | null> = new BehaviorSubject(null);
    private _generateVouchers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _points: BehaviorSubject<any> = new BehaviorSubject(null);
    private _memberDocuments: BehaviorSubject<MemberDocument[] | null> = new BehaviorSubject(null);
    private _memberDocumentpagination: BehaviorSubject<MemberDocumentPagination | null> = new BehaviorSubject(null);
    private _memberPoint: BehaviorSubject<MemberPoint> = new BehaviorSubject(null);
    private _memberPoints: BehaviorSubject<MemberPoint[]> = new BehaviorSubject(null);

    private _isAddressexit: boolean = true;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    datePipe: any;

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

    get generateVouchers$(): Observable<any>
    {
        return this._generateVouchers.asObservable();
    }

    get memberVouchers$(): Observable<any>
    {
        return this._memberVouchers.asObservable();
    }

    get points$(): Observable<any>
    {
        return this._points.asObservable();
    }

    get memberDocuments$(): Observable<MemberDocument[]>
    {
        return this._memberDocuments.asObservable();
    }

    get memberDocumentpagination$(): Observable<MemberDocumentPagination>
    {
         return this._memberDocumentpagination.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // eslint-disable-next-line max-len, @typescript-eslint/no-shadow
    getMembers(page: number = 0, limit: number = 10, sort: string = 'member_code', order: 'asc' | 'desc' | '' = 'asc', search: string = '', filter: string = '', fields: string = ''):
        Observable<{ pagination: MemberPagination; members: Member[] }>
    {
        return this._httpClient.get<any>(`${this._apiurl}/items/member`, {
            params: {
                meta: 'filter_count',
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
                    member.member_tier = (member.member_tier && member.member_tier.name) ? member.member_tier.name : '';
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
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                member.earning = member.earning != null ? member.earning : { totalPoint: 0, earning_valid_from: '', earning_valid_to: '' , spending_valid_from: '', spending_valid_to: '' };
                member.earning.earning_valid_from = member.earning.earning_valid_from ? new Date(member.earning.earning_valid_from).toDateString() : '';
                member.earning.earning_valid_to = member.earning.earning_valid_to ? new Date(member.earning.earning_valid_to).toDateString() : '';
                member.earning.spending_valid_from = member.earning.spending_valid_from ? new Date(member.earning.spending_valid_from).toDateString() : '';
                member.earning.spending_valid_to = member.earning.spending_valid_to ? new Date(member.earning.spending_valid_to).toDateString() : '';
                // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                member.spending = member.spending != null ? member.spending : { totalPoint: 0, earning_valid_from: '', earning_valid_to: '' , spending_valid_from: '', spending_valid_to: '' };
                member.spending.earning_valid_from = member.spending.earning_valid_from ? new Date(member.spending.earning_valid_from).toDateString() : '';
                member.spending.earning_valid_to = member.spending.earning_valid_to ? new Date(member.spending.earning_valid_to).toDateString() : '';
                member.spending.spending_valid_from = member.spending.spending_valid_from ? new Date(member.spending.spending_valid_from).toDateString() : '';
                member.spending.spending_valid_to = member.spending.spending_valid_to ? new Date(member.spending.spending_valid_to).toDateString() : '';
                this._member.next(response);
            })
        );
    }

    getGenerateMemberVouchersById(id: number): Observable<MemberVoucher> {
        return this._httpClient.get<any>(`${this._apiurl}/items/voucher/getpointrate?memberid=${id}`, {
        })
            .pipe(
                tap((response) => {
                    this._generateVouchers.next(response);
                })
            );
    }

    getRecentMemberVouchersById(id: number): Observable<MemberVoucher[]> {
        return this._httpClient.get<any>(`${this._apiurl}/items/voucher/memberid/${id}`, {
            params: { limit: 5, sort: 'voucher_code' }
        })
            .pipe(
                tap((response) => {
                    this._memberVouchers.next(response.data);
                })
            );
    }

    getRecentTransactionsById(id: number): Observable<Transaction> {
        return this._httpClient.get<any>(`${this._apiurl}/member/${id}/transactions`, {
            params: { limit: 5, sort: 'purchase_date', order: 'desc' }
        })
            .pipe(
                tap((response) => {
                    this._transactions.next(response.data);
                })
            );
    }

    getRecentPointsById(id: number): Observable<MemberPoint> {
        return this._httpClient.get<any>(`${this._apiurl}/member/${id}/points`, {
            params: { limit: 5, sort: 'date_created', order: 'desc' }
        })
            .pipe(
                tap((response) => {
                    this._points.next(response.data);
                })
            );
    }

    getMemberDocuments(id: number, page: number = 0, limit: number = 5, sort: string = 'uploaded_on', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ memberDocumentpagination: MemberDocumentPagination; memberDocuments: MemberDocument[] }> {
            return this._httpClient.get(`${this._apiurl}/member/${id}/documents`, {
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

    checkMemberPhone(phno: string, memberId: number): Observable<any>{
        return this._httpClient.get<any>(`${this._apiurl}/utility/checkmobile`, {
            params: { mobile : phno,
                      member : memberId
                    }
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
            "member_tier_id": member.member_tier_id,
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

    getBase64BarCodeImageData(id: number): Observable<any>
    {
        return this._httpClient.get<any>(`${this._apiurl}/api/barcodebyid?memberid=${id}`, {
        })
        .pipe(
            map((response) => {
                const res = response.data;
                return res;
            })
        );
    }

    getBase64QRCodeImageData(id: number): Observable<any>
    {
        return this._httpClient.get<any>(`${this._apiurl}/api/qrcodebyid?memberid=${id}`, {
        })
        .pipe(
            map((response) => {
                const res = response.data;
                return res;
            })
        );
    }

    createGenerateVoucher(memberVoucher: MemberVoucher): Observable<MemberVoucher>
    {
        const voucherCode = !memberVoucher.voucher_code ? '' : memberVoucher.voucher_code;

        return this.memberVouchers$.pipe(
            take(1),
            switchMap(memberVouchers => this._httpClient.post<any>(`${this._apiurl}/items/voucher`, {
                'voucher_code': voucherCode,
                'points_used': memberVoucher.points_used,
                'conversion_rate': memberVoucher.conversion_rate,
                'amount': memberVoucher.amount,
                'member_id': memberVoucher.member_id
            }).pipe(
                map((newMemberVoucher) => {
                    // Update the contacts with the new contact
                    this._memberVouchers.next([newMemberVoucher.data, ...memberVouchers]);

                    // Return the new contact
                    return newMemberVoucher;
                })
            ))
        );
    }
}
