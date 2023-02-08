import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ChannelService } from 'app/modules/admin/setting/channel/channel.service';
import { Channel, ChannelPagination } from 'app/modules/admin/setting/channel/channel.types';

@Injectable({
    providedIn: 'root'
})
export class ChannelsResolver implements Resolve<any>
{
    constructor(private _channelService: ChannelService)
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._channelService.getChannels();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChannelResolver implements Resolve<any>
{
    constructor(
        private _channelService: ChannelService,
        private _router: Router
    )
    {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Channel>
    {
        return this._channelService.getChannelByCode(route.paramMap.get('code'))
                   .pipe(
                       // Error here means the requested channel is not available
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
