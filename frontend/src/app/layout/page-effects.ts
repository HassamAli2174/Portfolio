import { DOCUMENT, DestroyRef, afterNextRender, inject } from '@angular/core';

/**
 * Page-wide pointer/scroll effects driven by CSS variables. Plain DOM listeners
 * (not Angular event bindings), so moving the mouse or scrolling never triggers
 * change detection.
 *
 * - `--scroll` on <html>: scroll progress 0..1, used by the progress bar
 * - `--mx` / `--my` on the hovered `.card`: pointer position, used by the
 *   spotlight glow in styles.scss
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

    const onPointerMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
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
