import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'uploadredemptionexclusion',
    templateUrl    : './uploadredemption.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadRedemptionComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
