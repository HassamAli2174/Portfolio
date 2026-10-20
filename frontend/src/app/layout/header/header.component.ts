import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PortfolioService } from '../../core/portfolio.service';
import { TypewriterComponent } from '../../shared/typewriter.component';
import { NAV_ITEMS } from '../nav-items';
import { HeroSceneComponent } from './hero-scene.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TypewriterComponent, HeroSceneComponent],
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

  private readonly portfolio = inject(PortfolioService).portfolio;
  protected readonly profile = computed(() => this.portfolio().profile);
  /** Up to six short skills for the 3D scene, taken from each skill group in turn. */
  protected readonly tags = computed(() => {
    const groups = this.portfolio().skillGroups.map((g) => g.items.filter((i) => i.length <= 16));
    const tags: string[] = [];
    for (let i = 0; tags.length < 6 && groups.some((g) => i < g.length); i++) {
      for (const group of groups) {
        const item = group[i];
        // Skip near-duplicates such as 'Oracle' and 'Oracle DB'.
        const first = item?.split(' ')[0].toLowerCase();
        if (item && tags.length < 6 && !tags.some((t) => t.split(' ')[0].toLowerCase() === first)) tags.push(item);
      }
    }
    return tags;
  });
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
