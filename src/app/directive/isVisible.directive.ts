import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appIsVisible]',
})
export class IsVisibleDirective implements OnInit, OnDestroy {
  @Output() appIsVisible = new EventEmitter<boolean>();

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        console.log(e, e.isIntersecting);

        this.appIsVisible.emit(e.isIntersecting);
      });
    });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
