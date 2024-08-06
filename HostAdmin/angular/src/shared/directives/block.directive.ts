import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    SimpleChanges,
    OnChanges
} from '@angular/core';

@Directive({
    selector: '[appBlock]'
})
export class BlockDirective implements AfterViewInit, OnChanges {
    @Input('appBlock') loading: boolean;
    $element: JQuery;

    constructor(private _element: ElementRef) { }

    ngAfterViewInit(): void {
        this.$element = $(this._element.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
        $.blockUI.defaults.overlayCSS.cursor = 'not-allowed';
        if (changes['loading'].currentValue) {
            abp.ui.block(this._element.nativeElement);
        } else {
            abp.ui.unblock(this._element.nativeElement);
        }
    }
}
