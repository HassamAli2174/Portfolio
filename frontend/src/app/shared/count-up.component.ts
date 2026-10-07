import { Component, DestroyRef, inject, input, signal } from '@angular/core';

import { InViewDirective } from './in-view.directive';
import { prefersReducedMotion } from './motion';

/** Counts from 0 to `value` once visible. Replaces the template's PureCounter. */
@Component({
  selector: 'app-count-up',
  imports: [InViewDirective],
  template: `<span (appInView)="start()">{{ current() }}</span>`,
})
export class CountUpComponent {
  readonly value = input.required<number>();
  readonly duration = input(1200);

  protected readonly current = signal(0);
  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  protected start(): void {
    const target = this.value();
    if (prefersReducedMotion()) {
      this.current.set(target);
      return;
    }
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / this.duration(), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.current.set(Math.round(target * eased));
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}
