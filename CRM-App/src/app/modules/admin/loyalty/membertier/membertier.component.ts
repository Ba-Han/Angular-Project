import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'membertier',
    templateUrl    : './membertier.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberTierComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
