import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Portfolio } from '../../core/portfolio.models';
import { ContactComponent } from './contact.component';

const portfolio = {
  profile: { address: 'Karachi', email: 'me@example.com', phone: '+92 300 0000000', socials: [] },
  projects: [],
} as unknown as Portfolio;

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    http.expectOne('/api/portfolio').flush(portfolio);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  function type(id: string, value: string) {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>('#' + id)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit() {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function fillValid() {
    type('name', 'Ada');
    type('email', 'ada@example.com');
    type('subject', 'Hello');
    type('message', 'I would like to work with you.');
  }

  it('does not send an invalid form and shows errors', async () => {
    type('email', 'nope');
    await submit();

    http.expectNone('/api/contact');
    const errors = [...el.querySelectorAll('.error')].map((e) => e.textContent?.trim());
    expect(errors).toContain('Please enter a valid email address.');
    expect(errors).toContain('This field is required.');
  });

  it('posts a valid message and confirms it was sent', async () => {
    fillValid();
    await submit();

    const request = http.expectOne('/api/contact');
    expect(request.request.body).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'I would like to work with you.',
      website: '',
    });
    request.flush({ status: 'sent' }, { status: 202, statusText: 'Accepted' });
    await fixture.whenStable();

    expect(el.querySelector('.notice.success')).toBeTruthy();
  });

  it('shows field errors returned by the server', async () => {
    fillValid();
    await submit();

    http
      .expectOne('/api/contact')
      .flush(
        { detail: 'Please check the highlighted fields.', errors: { email: 'must be a well-formed email address' } },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();

    expect(el.querySelector('.error')?.textContent?.trim()).toBe('must be a well-formed email address');
    expect(el.querySelector('.notice.failure')?.textContent).toContain('highlighted fields');
  });
});
