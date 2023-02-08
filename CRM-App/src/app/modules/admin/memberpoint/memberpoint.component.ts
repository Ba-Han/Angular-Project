import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'memberpoint',
    templateUrl  : './memberpoint.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberPointComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
