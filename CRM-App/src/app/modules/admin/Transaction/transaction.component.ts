import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'transaction',
    templateUrl: './transaction.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
