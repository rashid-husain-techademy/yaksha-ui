import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appDisableSelect]'
})
export class DisableSelectDirective {
    @HostListener('selectstart', ['$event'])
    blockDrag(event: KeyboardEvent) {
        event.preventDefault();
    }
    constructor() { }
}