import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'member',
    templateUrl  : './member.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
