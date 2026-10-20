import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Portfolio, Project } from '../../core/portfolio.models';
import { PORTFOLIO_CONTENT } from '../../core/portfolio.service';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { PortfolioComponent } from './portfolio.component';

const project = (slug: string, category: Project['category']): Project => ({
  slug,
  title: slug.toUpperCase(),
  category,
  type: 'App',
  client: null,
  date: null,
  url: null,
  cover: null,
  images: [],
  summary: '',
  description: [],
  highlights: [],
  tech: [],
});

const portfolio = {
  projects: [project('alpha', 'web'), project('beta', 'mobile'), project('gamma', 'web')],
} as unknown as Portfolio;

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: PORTFOLIO_CONTENT, useValue: portfolio }],
  });
}

function titles(element: HTMLElement): string[] {
  return [...element.querySelectorAll('h3 a')].map((a) => a.textContent!.trim());
}

describe('PortfolioComponent', () => {
  it('shows every project and a filter per category in use', async () => {
    setup();
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(titles(el)).toEqual(['ALPHA', 'BETA', 'GAMMA']);
    const filters = [...el.querySelectorAll('.filters a')].map((a) => a.textContent!.replace(/\s+/g, ' ').trim());
    expect(filters).toEqual(['All 3', 'Web 2', 'Mobile 1']);
  });

  it('filters by the category query parameter', async () => {
    setup();
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.componentRef.setInput('category', 'web');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(titles(fixture.nativeElement)).toEqual(['ALPHA', 'GAMMA']);
  });
});

describe('ProjectDetailComponent', () => {
  it('renders the project with wrap-around neighbours', async () => {
    setup();
    const fixture = TestBed.createComponent(ProjectDetailComponent);
    fixture.componentRef.setInput('slug', 'alpha');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toBe('ALPHA');
    const pager = [...el.querySelectorAll('.pager strong')].map((s) => s.textContent);
    expect(pager).toEqual(['GAMMA', 'BETA']);
  });

  it('shows a not-found message for an unknown slug', async () => {
    setup();
    const fixture = TestBed.createComponent(ProjectDetailComponent);
    fixture.componentRef.setInput('slug', 'missing');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h2')?.textContent).toBe('Project not found');
  });
});
