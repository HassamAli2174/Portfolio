import { TestBed } from '@angular/core/testing';

import content from '../data/portfolio.json';
import { Portfolio } from './portfolio.models';
import { PORTFOLIO_CONTENT, PortfolioService, yearsSince } from './portfolio.service';

const portfolio = {
  profile: { name: 'Test' },
  projects: [
    { slug: 'old', date: '2023-01-01' },
    { slug: 'new', date: '2025-01-01' },
  ],
} as unknown as Portfolio;

describe('PortfolioService', () => {
  it('serves the provided content, keeping the configured project order', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PORTFOLIO_CONTENT, useValue: portfolio }] });
    const service = TestBed.inject(PortfolioService);

    expect(service.profile().name).toBe('Test');
    expect(service.projects().map((p) => p.slug)).toEqual(['old', 'new']);
    expect(service.project('old')?.date).toBe('2023-01-01');
    expect(service.project('missing')).toBeUndefined();
  });

  it('defaults to the bundled portfolio.json', () => {
    const service = TestBed.inject(PortfolioService);
    expect(service.profile().name).toBe(content.profile.name);
  });
});

describe('bundled portfolio.json', () => {
  it('has unique project slugs', () => {
    const slugs = content.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only uses known project categories', () => {
    for (const project of content.projects) {
      expect(['web', 'mobile', 'desktop']).toContain(project.category);
    }
  });
});

describe('yearsSince', () => {
  it('counts whole years, respecting the birthday', () => {
    expect(yearsSince('2002-04-04', new Date(2026, 3, 3))).toBe(23);
    expect(yearsSince('2002-04-04', new Date(2026, 3, 4))).toBe(24);
  });
});
