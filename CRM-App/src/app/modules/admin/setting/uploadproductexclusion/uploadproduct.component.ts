import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'uploadproductexclusion',
    templateUrl    : './uploadproduct.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadProductComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
