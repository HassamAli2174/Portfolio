import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProjectCategory } from '../../core/portfolio.models';
import { CATEGORY_LABELS, PortfolioService } from '../../core/portfolio.service';
import { LightboxComponent } from '../../shared/lightbox.component';
import { CATEGORY_ICONS, ProjectCoverComponent } from '../../shared/project-cover.component';

interface Filter {
  id: ProjectCategory | null;
  label: string;
  count: number;
}

@Component({
  selector: 'app-portfolio',
  imports: [RouterLink, LightboxComponent, ProjectCoverComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  private readonly portfolioService = inject(PortfolioService);

  /** Bound from the `?category=` query parameter. */
  readonly category = input<string>();

  protected readonly loaded = computed(() => !!this.portfolioService.portfolio());
  protected readonly labels = CATEGORY_LABELS;
  protected readonly icons = CATEGORY_ICONS;

  protected readonly activeCategory = computed<ProjectCategory | null>(() => {
    const value = this.category();
    return value && value in CATEGORY_LABELS ? (value as ProjectCategory) : null;
  });

  protected readonly filters = computed<Filter[]>(() => {
    const projects = this.portfolioService.projects();
    const categories = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
    return [
      { id: null, label: 'All', count: projects.length },
      ...categories.map((id) => ({
        id,
        label: CATEGORY_LABELS[id],
        count: projects.filter((p) => p.category === id).length,
      })),
    ].filter((f) => f.count > 0);
  });

  protected readonly visible = computed(() => {
    const category = this.activeCategory();
    return this.portfolioService.projects().filter((p) => !category || p.category === category);
  });

  /** Lightbox shows the covers of the visible projects that have one. */
  protected readonly covers = computed(() =>
    this.visible()
      .map((p) => p.cover)
      .filter((c): c is string => !!c),
  );
  protected readonly lightboxIndex = signal<number | null>(null);

  protected zoom(cover: string): void {
    this.lightboxIndex.set(this.covers().indexOf(cover));
  }
}
