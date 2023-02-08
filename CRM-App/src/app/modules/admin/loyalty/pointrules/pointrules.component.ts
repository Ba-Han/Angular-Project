import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'pointrules',
    templateUrl: './pointrules.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointRuleComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
