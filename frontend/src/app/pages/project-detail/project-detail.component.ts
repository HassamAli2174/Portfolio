import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { CATEGORY_LABELS, PortfolioService } from '../../core/portfolio.service';
import { LightboxComponent } from '../../shared/lightbox.component';
import { CATEGORY_ICONS, ProjectCoverComponent } from '../../shared/project-cover.component';

@Component({
  selector: 'app-project-detail',
  imports: [DatePipe, RouterLink, LightboxComponent, ProjectCoverComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  private readonly portfolioService = inject(PortfolioService);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly loaded = computed(() => !!this.portfolioService.portfolio());
  protected readonly labels = CATEGORY_LABELS;
  protected readonly icons = CATEGORY_ICONS;

  private readonly index = computed(() =>
    this.portfolioService.projects().findIndex((p) => p.slug === this.slug()),
  );
  protected readonly project = computed(() => this.portfolioService.projects()[this.index()]);

  /** Neighbours for the previous/next links, wrapping around. */
  protected readonly neighbours = computed(() => {
    const projects = this.portfolioService.projects();
    const i = this.index();
    if (i < 0 || projects.length < 2) return null;
    return {
      prev: projects[(i - 1 + projects.length) % projects.length],
      next: projects[(i + 1) % projects.length],
    };
  });

  /** Selected gallery image; resets to the first whenever the project changes. */
  protected readonly selected = linkedSignal({ source: this.project, computation: () => 0 });
  protected readonly lightboxIndex = signal<number | null>(null);

  constructor() {
    const title = inject(Title);
    effect(() => {
      const project = this.project();
      if (project) title.setTitle(`${project.title} | Hassam Arshad`);
    });
  }

  protected step(delta: number): void {
    const count = this.project()?.images.length ?? 0;
    if (count) this.selected.update((i) => (i + delta + count) % count);
  }
}
