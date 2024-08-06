import { Directive, HostListener } from '@angular/core';
import { Constants } from '@app/models/constants';

@Directive({
    selector: '[appDisableDrag]'
})
export class DisableDragDirective {
    @HostListener('dragstart', ['$event'])
    blockDrag(event: KeyboardEvent) {
        this.enableDrag(event);
    }
    constructor() { }
    enableDrag(event: KeyboardEvent) {
        if (!localStorage.getItem(Constants.enableDragDirective)) {
            event.preventDefault();
        }
    }
}