import { DOCUMENT, DestroyRef, afterNextRender, inject } from '@angular/core';

import { prefersReducedMotion } from '../shared/motion';

/** Maximum tilt, in degrees, at the edges of an element. */
const MAX_TILT = 8;

/**
 * Page-wide pointer/scroll effects driven by CSS variables. Plain DOM listeners
 * (not Angular event bindings), so moving the mouse or scrolling never triggers
 * change detection.
 *
 * - `--scroll` on <html>: scroll progress 0..1, used by the progress bar
 * - `--mx` / `--my` on the hovered `.card`: pointer position, used by the
 *   spotlight glow in styles.scss
 * - `--rx` / `--ry` on the hovered `.card-hover` / `.tilt`: 3D tilt angles
 */
export function installPageEffects(): void {
  const document = inject(DOCUMENT);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const root = document.documentElement;
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = root.scrollHeight - root.clientHeight;
        root.style.setProperty('--scroll', String(max > 0 ? root.scrollTop / max : 0));
      });
    };

    const tilt = !prefersReducedMotion();
    const onPointerMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const card = target?.closest?.<HTMLElement>('.card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }
      const tilted = tilt && target?.closest?.<HTMLElement>('.card-hover, .tilt');
      if (tilted) {
        const rect = tilted.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        tilted.style.setProperty('--ry', `${(x * MAX_TILT * 2).toFixed(2)}deg`);
        tilted.style.setProperty('--rx', `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    onScroll();

    destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onPointerMove);
    });
  });
}
