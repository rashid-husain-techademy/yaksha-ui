import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableCopy]'
})
export class DisableCopyDirective {
  @HostListener('copy', ['$event'])
  blockCopy(event: KeyboardEvent) {
    event.preventDefault();
  }
  constructor() { }

}
