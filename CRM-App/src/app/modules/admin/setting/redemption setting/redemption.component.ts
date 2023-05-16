import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'redemption setting',
    templateUrl: './redemption.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedemptionComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
