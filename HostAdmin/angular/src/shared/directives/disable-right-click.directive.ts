import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appDisableRightClick]'
})
export class DisableRightClickDirective {
    @HostListener('contextmenu', ['$event'])
    blockRightClick(event: KeyboardEvent) {
        event.preventDefault();
    }
    constructor() { }

}
