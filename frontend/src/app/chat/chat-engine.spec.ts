import content from '../data/portfolio.json';
import { Portfolio } from '../core/portfolio.models';
import { ChatEngine, ChatReply, normalize } from './chat-engine';

const portfolio = {
  profile: {
    name: 'Ada Lovelace',
    title: 'Software Engineer',
    city: 'London, UK',
    address: 'Marylebone, London',
    birthday: '1990-12-10',
    email: 'ada@example.com',
    phone: '+44 20 0000 0000',
    freelance: 'Available',
    resumeUrl: 'assets/Resume.pdf',
    summary: 'I build reliable software.',
    socials: [{ name: 'LinkedIn', url: 'https://linkedin.com/in/ada', icon: 'bi-linkedin' }],
  },
  skillGroups: [
    { name: 'Programming Languages', icon: '', items: ['Java', 'TypeScript'] },
    { name: 'Frameworks & Libraries', icon: '', items: ['Spring Boot', 'Angular'] },
    { name: 'Development Areas', icon: '', items: ['Trade Finance (Import LC)', 'Event Sourcing & Microservices'] },
  ],
  interests: [{ name: 'Docker', icon: '', color: '' }],
  education: [{ title: 'BSc Computer Science', period: '2010 - 2014', institution: 'UCL' }],
  experience: [
    {
      role: 'Technical Consultant',
      period: '2025 - Present',
      company: 'Infotech Pvt Ltd',
      location: 'Karachi',
      highlights: ['Built microservices with Java and Spring Boot.'],
    },
    { role: 'Flutter Developer', period: '2023 - 2024', company: 'The Disrupt Labs', location: null, highlights: ['Shipped apps.'] },
  ],
  projects: [
    {
      slug: 'trade-finance-settlement',
      title: 'Trade Finance Settlement System',
      category: 'web',
      type: 'Banking',
      client: null,
      date: null,
      url: null,
      cover: null,
      images: [],
      summary: 'Event-sourced Import LC backend.',
      description: [],
      highlights: [{ title: 'Diffing', text: 'Field-level LC diffing.' }],
      tech: ['Java', 'Spring Boot', 'Angular'],
    },
    {
      slug: 'texatube',
      title: 'TexaTube',
      category: 'desktop',
      type: 'Desktop App',
      client: 'Self',
      date: '2024-06-15',
      url: 'https://github.com/example/texatube',
      cover: null,
      images: [],
      summary: 'YouTube metadata manager.',
      description: ['Built with Flutter.'],
      highlights: [],
      tech: ['Flutter'],
    },
  ],
} as unknown as Portfolio;

const engine = new ChatEngine(portfolio);
const ask = (q: string): ChatReply => engine.reply(q);
const all = (r: ChatReply) => [r.text, ...(r.items ?? []), ...(r.links ?? []).map((l) => `${l.label} ${l.url}`)].join(' | ');

describe('ChatEngine', () => {
  it('normalises punctuation and case', () => {
    expect(normalize("What's Ada's STACK?")).toBe(' whats adas stack ');
  });

  it('greets and offers suggestions', () => {
    const r = ask('Hi there');
    expect(r.text).toContain("Ada's portfolio assistant");
    expect(r.suggestions?.length).toBeGreaterThan(0);
  });

  it('introduces the person', () => {
    const r = ask('What does Ada do?');
    expect(r.text).toContain('Ada Lovelace is a Software Engineer, based in London, UK');
    expect(r.text).toContain('Currently Technical Consultant at Infotech Pvt Ltd');
  });

  it('lists skill groups', () => {
    const r = ask('What is your tech stack?');
    expect(r.items).toContain('Programming Languages: Java, TypeScript');
  });

  it('answers about a specific technology with its group, jobs and projects', () => {
    const r = ask('Does Ada know Spring Boot?');
    expect(r.text).toContain('Spring Boot is part of');
    expect(r.text).toContain('Frameworks & Libraries');
    expect(r.items).toContain('Infotech Pvt Ltd: Technical Consultant (2025 - Present)');
    expect(r.links?.map((l) => l.url)).toContain('/portfolio/trade-finance-settlement');
  });

  it('understands aliases and parts of combined skill names', () => {
    expect(ask('experience with springboot?').text).toContain('Spring Boot');
    expect(ask('any microservices work?').text).toContain('Microservices is part of');
    expect(ask('Do you do trade finance?').text).toContain('Trade Finance is part of');
  });

  it('recognises interests', () => {
    expect(ask('Docker?').text).toContain('Docker is one of the tools Ada enjoys');
  });

  it('describes a job when a company is named', () => {
    const r = ask('What did Ada do at Infotech?');
    expect(r.text).toContain('worked as Technical Consultant at Infotech Pvt Ltd in Karachi');
    expect(r.items).toEqual(['Built microservices with Java and Spring Boot.']);
  });

  it('answers the current role', () => {
    expect(ask('Where is Ada working currently?').text).toContain('currently works as Technical Consultant');
  });

  it('lists all experience', () => {
    const r = ask('Work experience');
    expect(r.items).toEqual([
      'Technical Consultant at Infotech Pvt Ltd, Karachi (2025 - Present)',
      'Flutter Developer at The Disrupt Labs (2023 - 2024)',
    ]);
  });

  it('describes a project named exactly', () => {
    const r = ask('Tell me about TexaTube');
    expect(r.text).toContain('TexaTube (Desktop App for Self): YouTube metadata manager.');
    expect(r.links).toContainEqual({ label: 'View project', url: 'https://github.com/example/texatube' });
  });

  it('prefers the skill over a partially matching project when asked about experience', () => {
    expect(ask('Tell me about your trade finance experience').text).toContain('Trade Finance is part of');
  });

  it('filters projects by category', () => {
    const r = ask('Show desktop projects');
    expect(r.text).toContain('1 desktop projects');
    expect(r.links?.at(-1)).toEqual({ label: 'All desktop projects', url: '/portfolio?category=desktop' });
  });

  it('gives contact details, resume and availability', () => {
    expect(all(ask('How can I contact Ada?'))).toContain('mailto:ada@example.com');
    expect(all(ask('Can I download the CV?'))).toContain('assets/Resume.pdf');
    expect(ask('Is Ada available for freelance?').text).toContain('available for freelance work');
  });

  it('leaves the phone out of contact details when none is set', () => {
    const noPhone = new ChatEngine({ ...portfolio, profile: { ...portfolio.profile, phone: undefined } });
    const items = noPhone.reply('What is your phone number?').items ?? [];
    expect(items).toEqual(['Email: ada@example.com', 'Location: London, UK']);
  });

  it('answers education and location', () => {
    expect(ask('Which university?').items).toEqual(['BSc Computer Science, UCL (2010 - 2014)']);
    expect(ask('Where is Ada based?').text).toContain('based in London, UK');
  });

  it('admits when it does not know', () => {
    expect(ask('What is the capital of France?').text).toContain("I'm not sure about that one");
    expect(ask('   ').text).toBe('I can tell you about:');
  });

  it('handles the real portfolio content', () => {
    const real = new ChatEngine(content as Portfolio);
    for (const q of ['Hi', 'What does Hassam do?', 'Top skills', 'Show projects', 'Work experience', 'How to contact?']) {
      expect(real.reply(q).text.length).toBeGreaterThan(10);
    }
  });
});
