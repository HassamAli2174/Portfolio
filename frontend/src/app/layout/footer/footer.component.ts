import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioService } from '../../core/portfolio.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    @let p = profile();
    <footer class="footer">
      <div class="container inner">
        <div class="brand">
          <a routerLink="/" class="name">{{ p.name }}</a>
          <p>{{ p.title }}</p>
        </div>

        <nav aria-label="Footer">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path">{{ item.label }}</a>
          }
        </nav>

        <div class="social">
          @for (social of p.socials; track social.url) {
            <a [href]="social.url" target="_blank" rel="noopener" [attr.aria-label]="social.name" [title]="social.name">
              <i class="bi" [class]="social.icon"></i>
            </a>
          }
        </div>
      </div>

      <div class="container bottom">
        <span>© {{ year }} {{ p.name }}. All rights reserved.</span>
        <button type="button" class="top" (click)="scrollTop()" aria-label="Back to top">
          <i class="bi bi-arrow-up"></i>
        </button>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      margin-top: 40px;
      padding: 40px 0 24px;
      border-top: 1px solid var(--border);
      background: linear-gradient(180deg, transparent, rgba(24, 210, 110, 0.04));
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .name {
      display: inline-block;
      padding-block: 4px;
      font: 700 22px var(--font-display);
      color: var(--text);
    }
    .brand p {
      margin: 4px 0 0;
      color: var(--text-muted);
      font-size: 14px;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 22px;
    }
    nav a {
      display: inline-block;
      padding: 8px 0;
      color: var(--text-muted);
      font: 500 14px var(--font-display);
    }
    nav a:hover {
      color: var(--accent);
    }
    .social {
      display: flex;
      gap: 8px;
    }
    .social a,
    .top {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      color: var(--text);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      transition:
        background 0.25s,
        transform 0.25s var(--ease);
    }
    .social a:hover,
    .top:hover {
      color: #04140b;
      background: var(--accent);
      transform: translateY(-3px);
    }
    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      font-size: 13px;
    }
    .top {
      cursor: pointer;
      font-size: 16px;
    }
    /* Keep the bottom row clear of the floating chat button on phones. */
    @media (max-width: 576px) {
      .footer {
        padding-bottom: 92px;
      }
    }
  `,
})
export class FooterComponent {
  protected readonly profile = inject(PortfolioService).profile;
  protected readonly navItems = NAV_ITEMS;
  protected readonly year = new Date().getFullYear();

  protected scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
