import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { Portfolio } from './core/portfolio.models';

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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('renders the owner name from the API in the header', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/portfolio').flush(portfolio);
    await fixture.whenStable();

    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent).toContain('Hassam Arshad');
  });
});
