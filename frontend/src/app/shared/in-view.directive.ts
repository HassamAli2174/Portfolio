import { Directive, ElementRef, afterNextRender, inject, output, signal } from '@angular/core';

/**
 * Adds the `in-view` class (and emits once) the first time the host scrolls
 * into view. Replaces the template's Waypoints dependency.
 */
@Directive({
  selector: '[appInView]',
  host: { '[class.in-view]': 'visible()' },
})
export class InViewDirective {
  readonly appInView = output<void>();
  protected readonly visible = signal(false);

  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.show();
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.show();
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(element);
    });
  }

  private show(): void {
    this.visible.set(true);
    this.appInView.emit();
  }
}
