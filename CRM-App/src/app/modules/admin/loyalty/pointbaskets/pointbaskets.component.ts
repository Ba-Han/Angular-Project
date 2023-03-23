import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'pointbaskets',
    templateUrl: './pointbaskets.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointBasketComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
