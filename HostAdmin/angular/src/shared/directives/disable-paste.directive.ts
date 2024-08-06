import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appDisablePaste]'
})
export class DisablePasteDirective {
    @HostListener('paste', ['$event'])
    blockPaste(event: KeyboardEvent) {
        event.preventDefault();
    }
    constructor() { }

}
