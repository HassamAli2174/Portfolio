import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { Portfolio } from './core/portfolio.models';
import { PORTFOLIO_CONTENT } from './core/portfolio.service';

const portfolio = {
  profile: {
    name: 'Hassam Arshad',
    tagline: 'tagline',
    roles: ['Software Engineer'],
    resumeUrl: 'assets/Resume.pdf',
    socials: [],
  },
  projects: [],
} as unknown as Portfolio;

describe('App', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), { provide: PORTFOLIO_CONTENT, useValue: portfolio }],
    });
    await TestBed.compileComponents();
  });

  it('renders the owner name from the content in the header', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent).toContain('Hassam Arshad');
  });
});
