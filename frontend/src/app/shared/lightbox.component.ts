import { Component, DestroyRef, computed, effect, inject, input, model, output } from '@angular/core';

/**
 * Full-screen image viewer. Open it by setting `index` to a number; it emits
 * `closed` and resets `index` to null. Replaces the template's GLightbox.
 */
@Component({
  selector: 'app-lightbox',
  template: `
    @if (current(); as src) {
      <div class="backdrop" role="dialog" aria-modal="true" [attr.aria-label]="label()" (click)="close()">
        <figure (click)="$event.stopPropagation()">
          <img [src]="src" [alt]="label() + ' — image ' + (index()! + 1)" />
          @if (images().length > 1) {
            <figcaption>{{ index()! + 1 }} / {{ images().length }}</figcaption>
          }
        </figure>

        <button type="button" class="close" aria-label="Close" (click)="close()"><i class="bi bi-x-lg"></i></button>
        @if (images().length > 1) {
          <button type="button" class="nav prev" aria-label="Previous image" (click)="step(-1, $event)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button type="button" class="nav next" aria-label="Next image" (click)="step(1, $event)">
            <i class="bi bi-chevron-right"></i>
          </button>
        }
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 60px 16px;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(6px);
      animation: fade 0.25s ease both;
    }
    figure {
      margin: 0;
      text-align: center;
    }
    img {
      max-width: min(1200px, 100%);
      max-height: calc(100vh - 140px);
      border-radius: 10px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
      animation: zoom 0.3s var(--ease) both;
    }
    figcaption {
      margin-top: 12px;
      color: var(--text-muted);
      font-size: 14px;
    }
    button {
      position: absolute;
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border: 1px solid var(--border);
      border-radius: 50%;
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
      font-size: 20px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: var(--accent);
      color: #04140b;
    }
    .close {
      top: 16px;
      right: 16px;
    }
    .nav {
      top: 50%;
      translate: 0 -50%;
    }
    .prev {
      left: 16px;
    }
    .next {
      right: 16px;
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes zoom {
      from {
        opacity: 0;
        transform: scale(0.94);
      }
    }
  `,
  host: { '(document:keydown)': 'onKey($event)' },
})
export class LightboxComponent {
  readonly images = input.required<string[]>();
  readonly label = input('Image');
  readonly index = model<number | null>(null);
  readonly closed = output<void>();

  protected readonly current = computed(() => {
    const i = this.index();
    return i === null ? null : this.images()[i];
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
    // Stop the page behind the viewer from scrolling.
    effect(() => {
      document.body.style.overflow = this.current() ? 'hidden' : '';
    });
  }

  protected close(): void {
    this.index.set(null);
    this.closed.emit();
  }

  protected step(delta: number, event?: Event): void {
    event?.stopPropagation();
    const count = this.images().length;
    this.index.update((i) => (i === null ? null : (i + delta + count) % count));
  }

  protected onKey(event: KeyboardEvent): void {
    if (this.index() === null) return;
    if (event.key === 'Escape') this.close();
    else if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
  }
}
