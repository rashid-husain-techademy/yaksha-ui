import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    SimpleChanges,
    OnChanges
} from '@angular/core';

@Directive({
    selector: '[appBusy]'
})

export class BusyDirective implements AfterViewInit, OnChanges {
    @Input('appBusy') loading: boolean;
    $element: JQuery;

    constructor(private _element: ElementRef) { }

    ngAfterViewInit(): void {
        this.$element = $(this._element.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['loading'].currentValue) {
            abp.ui.setBusy(this._element.nativeElement);
        } else {
            abp.ui.clearBusy(this._element.nativeElement);
        }
    }
}
