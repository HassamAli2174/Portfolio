import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Portfolio } from './portfolio.models';
import { PortfolioService, yearsSince } from './portfolio.service';

const portfolio = {
  profile: { name: 'Test' },
  projects: [
    { slug: 'old', date: '2023-01-01' },
    { slug: 'new', date: '2025-01-01' },
  ],
} as unknown as Portfolio;

describe('PortfolioService', () => {
  let service: PortfolioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortfolioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads from the API and sorts projects newest first', () => {
    service.portfolio();
    http.expectOne('/api/portfolio').flush(portfolio);

    expect(service.projects().map((p) => p.slug)).toEqual(['new', 'old']);
    expect(service.project('old')?.date).toBe('2023-01-01');
  });

  it('falls back to the bundled JSON when the API is down', () => {
    service.portfolio();
    http.expectOne('/api/portfolio').flush(null, { status: 504, statusText: 'Gateway Timeout' });
    http.expectOne('data/portfolio.json').flush(portfolio);

    expect(service.profile()?.name).toBe('Test');
  });
});

describe('yearsSince', () => {
  it('counts whole years, respecting the birthday', () => {
    expect(yearsSince('2002-04-04', new Date(2026, 3, 3))).toBe(23);
    expect(yearsSince('2002-04-04', new Date(2026, 3, 4))).toBe(24);
  });
});
