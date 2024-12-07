import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appIntoView]',
})
export class IntoViewDirective {
  @Input('appIntoView') public key: string;
  constructor(private el: ElementRef<HTMLElement>) {}

  public scrollIntoView() {
    this.el.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }
}
