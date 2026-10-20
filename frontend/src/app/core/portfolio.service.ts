import { HttpClient } from '@angular/common/http';
import { InjectionToken, Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import content from '../data/portfolio.json';
import { ContactMessage, Portfolio, Project, ProjectCategory } from './portfolio.models';

/**
 * All site content, compiled into the app from src/app/data/portfolio.json.
 * Edit that file to update the portfolio; no server is involved.
 * Tests provide their own content through this token.
 */
export const PORTFOLIO_CONTENT = new InjectionToken<Portfolio>('PORTFOLIO_CONTENT', {
  providedIn: 'root',
  factory: () => content as Portfolio,
});

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);

  readonly portfolio = signal(inject(PORTFOLIO_CONTENT)).asReadonly();
  readonly profile = computed(() => this.portfolio().profile);
  readonly projects = computed(() => this.portfolio().projects);

  project(slug: string): Project | undefined {
    return this.projects().find((p) => p.slug === slug);
  }

  sendMessage(message: ContactMessage): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/api/contact`, message);
  }
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web: 'Web',
  mobile: 'Mobile',
  desktop: 'Desktop',
};

/** Whole years between an ISO date and today. */
export function yearsSince(isoDate: string, today = new Date()): number {
  // Parse the parts directly: new Date('yyyy-mm-dd') is UTC and shifts a day west of GMT.
  const [year, month, day] = isoDate.split('-').map(Number);
  let years = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) years--;
  return years;
}
