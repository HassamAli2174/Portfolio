import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { installPageEffects } from './layout/page-effects';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
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

  constructor() {
    installPageEffects();
  }
}
