import { Component, computed, input } from '@angular/core';

import { Project, ProjectCategory } from '../core/portfolio.models';

export const CATEGORY_ICONS: Record<ProjectCategory, string> = {
  web: 'bi-globe2',
  mobile: 'bi-phone',
  desktop: 'bi-pc-display',
};

/** A project's cover image, or a generated placeholder when it has none. */
@Component({
  selector: 'app-project-cover',
  template: `
    @if (project().cover; as cover) {
      <img [src]="cover" [alt]="project().title" loading="lazy" />
    } @else {
      <div class="placeholder" [style.--hue]="hue()" role="img" [attr.aria-label]="project().title">
        <i class="bi" [class]="icon()"></i>
        <span>{{ project().title }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      aspect-ratio: 16 / 10;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }
    .placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
      text-align: center;
      background:
        radial-gradient(circle at 25% 20%, hsl(var(--hue) 70% 45% / 0.55), transparent 60%),
        radial-gradient(circle at 80% 90%, hsl(calc(var(--hue) + 40) 70% 40% / 0.45), transparent 55%),
        #0d0f0e;
    }
    .placeholder i {
      font-size: 44px;
      color: #fff;
      opacity: 0.9;
    }
    .placeholder span {
      font: 600 17px var(--font-display);
      color: #fff;
      max-width: 90%;
    }
  `,
})
export class ProjectCoverComponent {
  readonly project = input.required<Project>();

  protected readonly icon = computed(() => CATEGORY_ICONS[this.project().category]);

  /** Stable per-project hue in the green-to-blue range, so placeholders differ but match the theme. */
  protected readonly hue = computed(() => {
    let hash = 0;
    for (const ch of this.project().slug) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return 140 + (Math.abs(hash) % 80);
  });
}
