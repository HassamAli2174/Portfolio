import { Directive, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

/**
 * Fades and slides the host in the first time it scrolls into view.
 * `revealDelay` (an index) staggers items in a list. Styles live in styles.scss.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.revealed]': 'visible()',
    '[style.--reveal-delay]': 'delay()',
  },
})
export class RevealDirective {
  /** Position in a list; each step adds a short delay. */
  readonly revealDelay = input(0);

  protected readonly visible = signal(false);
  protected readonly delay = () => `${Math.min(this.revealDelay(), 12) * 70}ms`;

  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.visible.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.visible.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      observer.observe(element);
    });
  }
}
