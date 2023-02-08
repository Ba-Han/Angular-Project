import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'channel',
    templateUrl    : './channel.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
