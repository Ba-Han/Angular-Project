import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { GeneralSetting } from 'app/modules/admin/setting/generalsetting/generalsetting.types';
import { set } from 'lodash-es';

@Injectable({
    providedIn: 'root'
})
export class GeneralSettingService {
    // Private
    private _setting: BehaviorSubject<GeneralSetting | null> = new BehaviorSubject(null);
    private _apiurl: string = '';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        this._apiurl = environment.apiurl;
    }

    get setting$(): Observable<GeneralSetting> {
        return this._setting.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getSetting(): Observable<GeneralSetting> {
        return this._httpClient.get<any>(`${this._apiurl}/items/general_settings`)
            .pipe(
                tap((response) => {
                    const setting = response.data;
                    this._setting.next(setting);
                })
            );
    }

    updateSetting(id: number, setting: GeneralSetting): Observable<GeneralSetting> {
        return this._httpClient.patch<any>(`${this._apiurl}/items/general_settings`, {
            'id': setting.id,
            'transaction_rounding': setting.transaction_rounding,
            'point_conversion': setting.point_conversion,
        }).pipe(
            map((updateSetting) => {
                return updateSetting;
            })
        )
    }
   
}
