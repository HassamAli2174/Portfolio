import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { ChatPanelComponent } from './chat/chat-panel.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { installPageEffects } from './layout/page-effects';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatPanelComponent],
  template: `
    @if (!isHome()) {
      <div class="scroll-progress" aria-hidden="true"></div>
    }
    <app-header [compact]="!isHome()" />
    <main>
      <router-outlet />
    </main>
    @if (!isHome()) {
      <app-footer />
    }

    <button
      type="button"
      class="chat-launcher"
      [class.seen]="chatLoaded()"
      [attr.aria-expanded]="chatOpen()"
      [attr.aria-label]="chatOpen() ? 'Close chat' : 'Chat with my portfolio assistant'"
      (click)="toggleChat()"
    >
      <i class="bi" [class.bi-chat-dots-fill]="!chatOpen()" [class.bi-x-lg]="chatOpen()"></i>
      <span class="hint" aria-hidden="true">Ask me anything</span>
    </button>
    <!-- The chat (and its engine) only download when first opened. -->
    @defer (when chatLoaded(); prefetch on idle) {
      <app-chat-panel [open]="chatOpen()" (closed)="chatOpen.set(false)" />
    }
  `,
  styles: `
    .scroll-progress {
      position: fixed;
      inset: 0 0 auto;
      z-index: 200;
      height: 3px;
      background: var(--accent-gradient);
      transform-origin: left;
      transform: scaleX(var(--scroll, 0));
    }

    .chat-launcher {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 300;
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      border: 0;
      border-radius: 50%;
      font-size: 24px;
      color: #04140b;
      background: var(--accent-gradient);
      box-shadow: 0 14px 30px -10px rgba(24, 210, 110, 0.7);
      cursor: pointer;
      transition: transform 0.25s var(--ease);
    }

    .chat-launcher:hover {
      transform: translateY(-3px) scale(1.04);
    }

    /* Pulse until the visitor opens the chat for the first time. */
    .chat-launcher:not(.seen)::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--accent);
      z-index: -1;
      animation: launcher-pulse 2.4s ease-out infinite;
    }

    @keyframes launcher-pulse {
      0% {
        transform: scale(1);
        opacity: 0.55;
      }
      100% {
        transform: scale(1.7);
        opacity: 0;
      }
    }

    .hint {
      position: absolute;
      right: calc(100% + 12px);
      padding: 7px 14px;
      border-radius: 999px;
      white-space: nowrap;
      font: 600 13px var(--font-body);
      color: var(--text);
      background: rgba(12, 14, 13, 0.94);
      border: 1px solid var(--border);
      opacity: 0;
      transform: translateX(6px);
      pointer-events: none;
      transition:
        opacity 0.2s,
        transform 0.2s;
    }

    .chat-launcher:hover .hint {
      opacity: 1;
      transform: none;
    }

    .chat-launcher[aria-expanded='true'] .hint {
      display: none;
    }

    @media (max-width: 576px) {
      .chat-launcher {
        right: 16px;
        bottom: 16px;
        width: 54px;
        height: 54px;
      }
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  /** The hero header fills the screen only on the home route. */
  protected readonly isHome = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0] === '/'),
    ),
    { initialValue: true },
  );

  protected readonly chatOpen = signal(false);
  /** Becomes true on first open; the panel then stays mounted to keep the conversation. */
  protected readonly chatLoaded = signal(false);

  constructor() {
    installPageEffects();
  }

  protected toggleChat(): void {
    this.chatLoaded.set(true);
    this.chatOpen.update((open) => !open);
  }
}
