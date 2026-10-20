import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioService } from '../core/portfolio.service';
import { prefersReducedMotion } from '../shared/motion';
import { ChatEngine, ChatLink, ChatReply } from './chat-engine';

interface Message {
  from: 'bot' | 'user';
  text?: string;
  reply?: ChatReply;
}

@Component({
  selector: 'app-chat-panel',
  imports: [RouterLink],
  templateUrl: './chat-panel.component.html',
  styleUrl: './chat-panel.component.scss',
  host: {
    '[class.open]': 'open()',
    '[attr.aria-hidden]': '!open()',
    '(document:keydown.escape)': 'open() && closed.emit()',
  },
})
export class ChatPanelComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly profile = inject(PortfolioService).profile;
  private readonly engine = new ChatEngine(inject(PortfolioService).portfolio());

  protected readonly messages = signal<Message[]>([{ from: 'bot', reply: this.engine.greeting() }]);
  protected readonly typing = signal(false);

  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));

    // Keep the newest message in view.
    afterRenderEffect(() => {
      this.messages();
      this.typing();
      const el = this.list().nativeElement;
      el.scrollTop = el.scrollHeight;
    });

    // Put the cursor in the input whenever the panel opens.
    afterRenderEffect(() => {
      if (this.open()) this.box().nativeElement.focus({ preventScroll: true });
    });
  }

  protected send(event: Event): void {
    event.preventDefault();
    const input = this.box().nativeElement;
    const question = input.value.trim();
    if (!question || this.typing()) return;
    input.value = '';
    this.ask(question);
  }

  protected ask(question: string): void {
    if (this.typing()) return;
    this.messages.update((m) => [...m, { from: 'user', text: question }]);
    this.typing.set(true);

    const reply = this.engine.reply(question);
    // A short pause reads as "thinking" and keeps the conversation calm.
    const delay = prefersReducedMotion() ? 0 : 450 + Math.min(reply.text.length * 4, 500);
    this.timer = setTimeout(() => {
      this.typing.set(false);
      this.messages.update((m) => [...m, { from: 'bot', reply }]);
    }, delay);
  }

  protected isInternal(link: ChatLink): boolean {
    return link.url.startsWith('/');
  }

  protected isLast(index: number): boolean {
    return index === this.messages().length - 1;
  }

  /** Splits "/portfolio?category=web" into a path and query params for routerLink. */
  protected route(link: ChatLink): { path: string; query: Record<string, string> } {
    const [path, search = ''] = link.url.split('?');
    return { path, query: Object.fromEntries(new URLSearchParams(search)) };
  }
}
