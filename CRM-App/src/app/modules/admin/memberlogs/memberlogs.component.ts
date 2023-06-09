import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'memberlogs',
    templateUrl  : './memberlogs.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberLogsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
