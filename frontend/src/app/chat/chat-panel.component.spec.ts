import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Portfolio } from '../core/portfolio.models';
import { PORTFOLIO_CONTENT } from '../core/portfolio.service';
import { ChatPanelComponent } from './chat-panel.component';

const portfolio = {
  profile: {
    name: 'Ada Lovelace',
    title: 'Engineer',
    city: 'London',
    photo: 'me.jpg',
    email: 'ada@example.com',
    phone: '1',
    freelance: 'Available',
    socials: [],
  },
  skillGroups: [{ name: 'Languages', icon: '', items: ['Java'] }],
  interests: [],
  education: [],
  experience: [],
  projects: [],
} as unknown as Portfolio;

describe('ChatPanelComponent', () => {
  let fixture: ComponentFixture<ChatPanelComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: PORTFOLIO_CONTENT, useValue: portfolio }],
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(ChatPanelComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    el = fixture.nativeElement;
    // Only the reply delay is faked; whenStable() would wait on fake timers forever.
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  const bubbles = () => [...el.querySelectorAll('.bubble:not(.typing)')].map((b) => b.textContent?.trim());

  function settle() {
    vi.runAllTimers();
    fixture.detectChanges();
  }

  it('greets the visitor with suggestions', () => {
    expect(bubbles()[0]).toContain("Ada's portfolio assistant");
    expect(el.querySelectorAll('.suggestions button').length).toBeGreaterThan(0);
  });

  it('answers a typed question after a short typing indicator', () => {
    const input = el.querySelector('input')!;
    input.value = 'Does Ada know Java?';
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(bubbles().at(-1)).toBe('Does Ada know Java?');
    expect(el.querySelector('.typing')).toBeTruthy();
    expect(input.value).toBe('');

    settle();
    expect(el.querySelector('.typing')).toBeNull();
    expect(bubbles().at(-1)).toContain('Java is part of');
  });

  it('asks a suggestion when clicked', () => {
    (el.querySelector('.suggestions button') as HTMLButtonElement).click();
    settle();
    expect(bubbles().length).toBe(3);
  });

  it('closes on Escape', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toHaveBeenCalled();
  });
});
