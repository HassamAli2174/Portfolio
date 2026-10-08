import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, shareReplay, timeout } from 'rxjs';

import { environment } from '../../environments/environment';
import { ContactMessage, Portfolio, Project, ProjectCategory } from './portfolio.models';

/** How long to wait for the API before using the bundled content. */
export const API_TIMEOUT_MS = 4000;

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);

  /**
   * Loaded once from the API. If the API is unreachable or slow (a free-tier host
   * waking from sleep can take ~a minute) we fall back to the copy of the same
   * JSON bundled at build time. The request still wakes the API for the contact form.
   */
  private readonly portfolio$: Observable<Portfolio> = this.http
    .get<Portfolio>(`${environment.apiUrl}/api/portfolio`)
    .pipe(
      timeout(API_TIMEOUT_MS),
      catchError(() => this.http.get<Portfolio>('data/portfolio.json')),
      shareReplay(1),
    );

  readonly portfolio = toSignal(this.portfolio$);
  readonly profile = computed(() => this.portfolio()?.profile);
  readonly projects = computed(() => this.portfolio()?.projects ?? []);

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
