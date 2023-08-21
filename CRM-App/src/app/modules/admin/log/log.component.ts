import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'log',
    templateUrl  : './log.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
