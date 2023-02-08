import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'import',
    templateUrl    : './import.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataImportComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
