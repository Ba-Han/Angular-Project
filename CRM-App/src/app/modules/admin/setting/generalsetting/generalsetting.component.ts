import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'generalsetting',
    templateUrl: './generalsetting.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
