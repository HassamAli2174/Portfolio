import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactService, WEB3FORMS_ACCESS_KEY } from '../../core/contact.service';
import { Portfolio } from '../../core/portfolio.models';
import { PORTFOLIO_CONTENT } from '../../core/portfolio.service';
import { ContactComponent } from './contact.component';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

const portfolio = {
  profile: { address: 'Karachi', email: 'me@example.com', phone: '+92 300 0000000', socials: [] },
  projects: [],
} as unknown as Portfolio;

function setup(accessKey: string) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PORTFOLIO_CONTENT, useValue: portfolio },
      { provide: WEB3FORMS_ACCESS_KEY, useValue: accessKey },
    ],
  });
  const fixture = TestBed.createComponent(ContactComponent);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, http: TestBed.inject(HttpTestingController) };
}

function type(el: HTMLElement, id: string, value: string) {
  const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>('#' + id)!;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function fillValid(el: HTMLElement) {
  type(el, 'name', 'Ada');
  type(el, 'email', 'ada@example.com');
  type(el, 'subject', 'Hello');
  type(el, 'message', 'I would like to work with you.');
}

async function submit(fixture: ComponentFixture<ContactComponent>) {
  fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
  await fixture.whenStable();
}

describe('ContactComponent with Web3Forms', () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => (ctx = setup('test-key')));
  afterEach(() => ctx.http.verify());

  it('does not send an invalid form and shows errors', async () => {
    type(ctx.el, 'email', 'nope');
    await submit(ctx.fixture);

    ctx.http.expectNone(WEB3FORMS_URL);
    const errors = [...ctx.el.querySelectorAll('.error')].map((e) => e.textContent?.trim());
    expect(errors).toContain('Please enter a valid email address.');
    expect(errors).toContain('This field is required.');
  });

  it('posts the message to Web3Forms and confirms it was sent', async () => {
    fillValid(ctx.el);
    await submit(ctx.fixture);

    const request = ctx.http.expectOne(WEB3FORMS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      access_key: 'test-key',
      subject: '[Portfolio] Hello',
      from_name: 'Ada',
      name: 'Ada',
      email: 'ada@example.com',
      message: 'I would like to work with you.',
    });
    request.flush({ success: true, message: 'Email sent successfully!' });
    await ctx.fixture.whenStable();

    expect(ctx.el.querySelector('.notice.success')?.textContent).toContain('has been sent');
  });

  it('shows an error with the email address when Web3Forms rejects the message', async () => {
    fillValid(ctx.el);
    await submit(ctx.fixture);

    ctx.http.expectOne(WEB3FORMS_URL).flush({ success: false, message: 'Invalid access key' });
    await ctx.fixture.whenStable();

    const notice = ctx.el.querySelector('.notice.failure');
    expect(notice?.textContent).toContain('could not be sent');
    expect(notice?.querySelector('a')?.getAttribute('href')).toBe('mailto:me@example.com');
  });

  it('silently drops honeypot submissions', async () => {
    fillValid(ctx.el);
    type(ctx.el, 'website', 'spam.example');
    await submit(ctx.fixture);

    ctx.http.expectNone(WEB3FORMS_URL);
  });
});

describe('ContactComponent without an access key', () => {
  it('opens the email app with the message prefilled', async () => {
    const { fixture, el, http } = setup('');
    const open = vi.spyOn(TestBed.inject(ContactService), 'openMailClient').mockImplementation(() => {});

    fillValid(el);
    await submit(fixture);

    http.expectNone(WEB3FORMS_URL);
    expect(open).toHaveBeenCalledWith(
      'mailto:me@example.com?subject=Hello&body=I%20would%20like%20to%20work%20with%20you.%0A%0AAda%0Aada%40example.com',
    );
    expect(el.querySelector('.notice.success')?.textContent).toContain('email app');
  });
});
