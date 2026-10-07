import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';

import { prefersReducedMotion } from './motion';

/** Types each word, pauses, deletes it, then moves on to the next. */
@Component({
  selector: 'app-typewriter',
  template: `<span class="text">{{ text() }}</span><span class="caret" aria-hidden="true"></span>`,
  styles: `
    :host {
      white-space: nowrap;
    }
    .caret {
      display: inline-block;
      width: 2px;
      height: 1em;
      margin-left: 3px;
      vertical-align: -0.12em;
      background: var(--accent);
      animation: blink 1s steps(1) infinite;
    }
    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `,
  host: { '[attr.aria-label]': 'words().join(", ")' },
})
export class TypewriterComponent {
  readonly words = input.required<string[]>();

  protected readonly text = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));

    effect(() => {
      const words = this.words();
      clearTimeout(this.timer);
      if (!words.length) return;
      if (prefersReducedMotion()) {
        this.text.set(words[0]);
        return;
      }
      this.type(words, 0, 0, false);
    });
  }

  private type(words: string[], index: number, length: number, deleting: boolean): void {
    const word = words[index];
    this.text.set(word.slice(0, length));

    if (!deleting && length === word.length) {
      this.timer = setTimeout(() => this.type(words, index, length, true), 1800);
    } else if (deleting && length === 0) {
      this.timer = setTimeout(() => this.type(words, (index + 1) % words.length, 0, false), 300);
    } else {
      const next = deleting ? length - 1 : length + 1;
      this.timer = setTimeout(() => this.type(words, index, next, deleting), deleting ? 45 : 90);
    }
  }
}
