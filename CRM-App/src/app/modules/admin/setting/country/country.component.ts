import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'country',
    templateUrl    : './country.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountryComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
