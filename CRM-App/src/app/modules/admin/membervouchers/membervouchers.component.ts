import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'membervouchers',
    templateUrl  : './membervouchers.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberVoucherComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
