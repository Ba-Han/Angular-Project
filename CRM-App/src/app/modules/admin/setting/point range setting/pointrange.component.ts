import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'point range setting',
    templateUrl    : './pointrange.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointRangeComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
