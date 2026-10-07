import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PortfolioService } from '../../core/portfolio.service';
import { TypewriterComponent } from '../../shared/typewriter.component';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TypewriterComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    '[class.compact]': 'compact()',
    '[class.menu-open]': 'menuOpen()',
  },
})
export class HeaderComponent {
  /** Collapsed top bar (a section is open) vs. full-screen hero (home). */
  readonly compact = input(false);

  protected readonly profile = inject(PortfolioService).profile;
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
